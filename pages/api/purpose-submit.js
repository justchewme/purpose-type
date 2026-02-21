// /api/purpose-submit
// Stores Biblical Purpose quiz leads in memory and notifies admin via Telegram.
//
// POST /api/purpose-submit  — save a new lead
// GET  /api/purpose-submit  — retrieve all leads (requires x-admin-token header)
//
// Required env vars:
//   TELEGRAM_BOT_TOKEN        — for instant admin notifications
//   TELEGRAM_ADMIN_CHAT_ID    — your personal Telegram chat ID
//   ADMIN_PASSWORD            — password for the admin panel

const leads = [] // In-memory store — survives warm serverless instances

async function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) return

  const meetIcon = { yes: '✅', maybe: '🤔', online: '💬', no: '❌' }[lead.openToMeet] || '❓'
  const churchIcon = { active: '⛪', occasional: '🕍', looking: '🔍', away_open: '🚶', away_closed: '🚫' }[lead.churchStatus] || '❓'
  const faithIcon = { thriving: '🌱', stuck: '😐', questions: '❓', away: '🚶', exploring: '🔎' }[lead.faithJourney] || '❓'

  const text = [
    `🎯 *New Purpose Lead!*`,
    ``,
    `👤 *Name:* ${lead.name}`,
    `📱 *WhatsApp:* ${lead.wa}`,
    lead.email ? `📧 *Email:* ${lead.email}` : null,
    ``,
    `✝️ *Type:* ${lead.purposeType}`,
    `${faithIcon} *Faith:* ${lead.faithJourney}`,
    `${churchIcon} *Church:* ${lead.churchStatus}`,
    `${meetIcon} *Open to Meet:* ${lead.openToMeet}`,
    `🕐 *Available:* ${(lead.availability || []).join(', ') || 'Not specified'}`,
    lead.encounterRequested ? `🕊️ *REQUESTED SPIRITUAL ENCOUNTER* ← Contact first!` : null,
    ``,
    `💭 *"I wish God would show me..."*`,
    lead.answers?.q7 ? `_"${lead.answers.q7}"_` : '_Not answered_',
    ``,
    `🌟 *"What would make life meaningful?"*`,
    lead.answers?.q8 ? `_"${lead.answers.q8}"_` : '_Not answered_',
    ``,
    `📊 *Life Satisfaction:*`,
    `Career ${lead.ratings?.career || 0}/5 · Relationships ${lead.ratings?.relationships || 0}/5 · Faith ${lead.ratings?.faith || 0}/5 · Peace ${lead.ratings?.peace || 0}/5`,
    ``,
    `🕒 ${new Date(lead.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })} SGT`,
    ``,
    `📲 [Message on WhatsApp](https://wa.me/${lead.wa.replace('+', '')})`,
  ].filter(Boolean).join('\n')

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    })
  } catch (e) {
    console.warn('Telegram notification failed:', e.message)
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  return res.status(405).json({ error: 'Method not allowed' })
}

async function handlePost(req, res) {
  const body = req.body || {}

  // Handle encounter request update (no new lead, just flag existing one)
  if (body.updateEncounter && body.wa) {
    const existing = leads.find(l => l.wa === body.wa)
    if (existing) {
      existing.encounterRequested = true
      await notifyTelegram({ ...existing, encounterRequested: true })
      return res.status(200).json({ ok: true })
    }
    // If not found in memory (e.g. after cold start), create a minimal record
  }

  const { name, wa, email, faithJourney, churchStatus, openToMeet, availability, purposeType, ratings, answers } = body

  if (!name || !wa || !purposeType) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  const lead = {
    id: `PT-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    name: String(name).trim().slice(0, 100),
    wa: String(wa).trim().slice(0, 20),
    email: email ? String(email).trim().slice(0, 200) : null,
    faithJourney: faithJourney || null,
    churchStatus: churchStatus || null,
    openToMeet: openToMeet || null,
    availability: Array.isArray(availability) ? availability : [],
    purposeType: String(purposeType),
    ratings: ratings || {},
    answers: answers || {},
    encounterRequested: Boolean(body.encounterRequested),
    submittedAt: new Date().toISOString(),
    read: false,
  }

  leads.unshift(lead)
  if (leads.length > 1000) leads.pop()

  notifyTelegram(lead).catch(() => {})

  return res.status(200).json({ ok: true, id: lead.id })
}

async function handleGet(req, res) {
  const adminToken = req.headers['x-admin-token']
  if (!adminToken || adminToken !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  leads.forEach(l => { l.read = true })
  return res.status(200).json({ leads })
}
