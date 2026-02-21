// /api/purpose-submit
// Stores Biblical Blueprint quiz leads in memory AND emails on each submission.
//
// POST /api/purpose-submit  — save a new lead
// GET  /api/purpose-submit  — retrieve all leads (requires x-admin-token header)
//
// Required env vars:
//   ADMIN_PASSWORD  — password for the admin panel
//   RESEND_API_KEY  — from resend.com (free)
//   NOTIFY_EMAIL    — email address to receive notifications
//
// Optional env vars (Google Sheets — can be added later):
//   GOOGLE_SHEET_ID             — the ID from your Google Sheet URL
//   GOOGLE_SERVICE_ACCOUNT_JSON — full JSON string of the service account key

import { Resend } from 'resend'
import { google } from 'googleapis'

const leads = [] // In-memory store — survives warm serverless instances

// ─── EMAIL NOTIFICATION ───────────────────────────────────────────────────────
const TYPE_NAMES = {
  BUILDER:'🏗️ The Builder', HEALER:'💚 The Healer', SEEKER:'🔍 The Seeker',
  SHEPHERD:'🌿 The Shepherd', CATALYST:'🔥 The Catalyst',
  CREATOR:'✨ The Creator', ANCHOR:'⚓ The Anchor',
}

const RATING_EMOJI = ['','😔','😕','😐','🙂','😄']

const NOTIFY_EMAILS = [
  'elearning@equippedministries.org',
  'justchewme@gmail.com',
]

async function notifyEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const time = new Date(lead.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
  const typeName = TYPE_NAMES[lead.purposeType] || lead.purposeType
  const waLink = `https://wa.me/${lead.wa.replace(/\D/g,'')}`
  const r = lead.ratings || {}

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0A1628 0%,#0F2167 100%);padding:28px 28px 22px;text-align:center;">
      <p style="color:#F59E0B;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 6px;">New Blueprint Submission</p>
      <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 4px;">${lead.name}</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">${time} (SGT)</p>
    </div>

    <!-- Blueprint type badge -->
    <div style="background:#FFFBEB;border-bottom:2px solid #FDE68A;padding:16px 28px;text-align:center;">
      <p style="font-size:28px;margin:0 0 4px;">${typeName}</p>
      <p style="color:#92400E;font-size:13px;font-weight:700;margin:0;letter-spacing:0.5px;">BIBLICAL BLUEPRINT</p>
    </div>

    <div style="padding:24px 28px;">

      <!-- Contact -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:10px 14px;background:#F9FAFB;border-radius:8px 8px 0 0;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">WhatsApp</p>
            <a href="${waLink}" style="color:#0F2167;font-size:16px;font-weight:700;text-decoration:none;">${lead.wa} 💬 Tap to open</a>
          </td>
        </tr>
        ${lead.email ? `
        <tr>
          <td style="padding:10px 14px;background:#F9FAFB;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Email</p>
            <p style="margin:0;font-size:15px;color:#111827;">${lead.email}</p>
          </td>
        </tr>` : ''}
        ${lead.faithJourney ? `
        <tr>
          <td style="padding:10px 14px;background:#F9FAFB;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Faith Journey</p>
            <p style="margin:0;font-size:15px;color:#111827;">${lead.faithJourney}</p>
          </td>
        </tr>` : ''}
        ${lead.churchStatus ? `
        <tr>
          <td style="padding:10px 14px;background:#F9FAFB;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Church Status</p>
            <p style="margin:0;font-size:15px;color:#111827;">${lead.churchStatus}</p>
          </td>
        </tr>` : ''}
        ${lead.openToMeet ? `
        <tr>
          <td style="padding:10px 14px;background:#F9FAFB;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Open to Meet?</p>
            <p style="margin:0;font-size:15px;color:#111827;">${lead.openToMeet}</p>
          </td>
        </tr>` : ''}
        ${lead.availability?.length ? `
        <tr>
          <td style="padding:10px 14px;background:#F9FAFB;border-radius:0 0 8px 8px;">
            <p style="margin:0;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Availability</p>
            <p style="margin:0;font-size:15px;color:#111827;">${lead.availability.join(', ')}</p>
          </td>
        </tr>` : ''}
      </table>

      <!-- Life ratings -->
      ${(r.career||r.relationships||r.faith||r.peace) ? `
      <div style="background:#F9FAFB;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 10px;font-size:12px;color:#6B7280;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Life Ratings</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div>💼 Career <strong>${r.career||'—'}/5</strong> ${RATING_EMOJI[r.career]||''}</div>
          <div>❤️ Relationships <strong>${r.relationships||'—'}/5</strong> ${RATING_EMOJI[r.relationships]||''}</div>
          <div>✝️ Faith <strong>${r.faith||'—'}/5</strong> ${RATING_EMOJI[r.faith]||''}</div>
          <div>🕊️ Peace <strong>${r.peace||'—'}/5</strong> ${RATING_EMOJI[r.peace]||''}</div>
        </div>
      </div>` : ''}

      <!-- Q7 -->
      ${lead.answers?.q7 ? `
      <div style="background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:0 10px 10px 0;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0 0 6px;font-size:12px;color:#92400E;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">I wish God would show me…</p>
        <p style="margin:0;font-size:15px;color:#111827;font-style:italic;line-height:1.6;">"${lead.answers.q7}"</p>
      </div>` : ''}

      <!-- WhatsApp CTA -->
      <div style="text-align:center;margin-top:24px;">
        <a href="${waLink}" style="display:inline-block;background:#25D366;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
          💬 WhatsApp ${lead.name} Now
        </a>
      </div>

    </div>

    <div style="padding:16px 28px;border-top:1px solid #E5E7EB;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9CA3AF;">Purpose Blueprint · purpose-type.vercel.app · Lead ID: ${lead.id}</p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: 'Blueprint Quiz <onboarding@resend.dev>',
    to: NOTIFY_EMAILS,
    subject: `New Form Signed Up - Justin GSN's App — ${lead.name} (${typeName})`,
    html,
  })
}

// ─── GOOGLE SHEETS (optional, silent fail if not configured) ──────────────────
const SHEET_HEADERS = [
  'ID', 'Submitted At (SGT)', 'Name', 'WhatsApp', 'Email',
  'Blueprint', 'Faith Journey', 'Church Status', 'Open to Meet',
  'Availability', 'Encounter Requested',
  'Career /5', 'Relationships /5', 'Faith /5', 'Peace /5',
  'I wish God would show me...',
]

function getSheetClient() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!json || !sheetId) return null
  try {
    const creds = JSON.parse(json)
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    return { sheets, sheetId }
  } catch (e) {
    console.warn('Google Sheets config error:', e.message)
    return null
  }
}

async function ensureHeaders(sheets, sheetId) {
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Sheet1!A1:P1' })
    const row = res.data.values?.[0]
    if (!row || row.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId, range: 'Sheet1!A1', valueInputOption: 'RAW',
        requestBody: { values: [SHEET_HEADERS] },
      })
    }
  } catch (e) { console.warn('Could not check/set sheet headers:', e.message) }
}

async function appendToSheet(lead) {
  const client = getSheetClient()
  if (!client) return
  const { sheets, sheetId } = client
  await ensureHeaders(sheets, sheetId)
  const row = [
    lead.id,
    new Date(lead.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
    lead.name, lead.wa, lead.email || '',
    lead.purposeType, lead.faithJourney || '', lead.churchStatus || '',
    lead.openToMeet || '', (lead.availability || []).join(', '),
    lead.encounterRequested ? 'YES' : 'no',
    lead.ratings?.career || 0, lead.ratings?.relationships || 0,
    lead.ratings?.faith || 0, lead.ratings?.peace || 0,
    lead.answers?.q7 || '',
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId, range: 'Sheet1!A1',
    valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })
}

async function updateEncounterInSheet(wa) {
  const client = getSheetClient()
  if (!client) return
  const { sheets, sheetId } = client
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Sheet1!D:D' })
    const rows = res.data.values || []
    const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === wa)
    if (rowIndex === -1) return
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId, range: `Sheet1!K${rowIndex + 1}`,
      valueInputOption: 'RAW', requestBody: { values: [['YES']] },
    })
  } catch (e) { console.warn('Could not update encounter in sheet:', e.message) }
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  return res.status(405).json({ error: 'Method not allowed' })
}

async function handlePost(req, res) {
  const body = req.body || {}

  // Handle encounter request update
  if (body.updateEncounter && body.wa) {
    const existing = leads.find(l => l.wa === body.wa)
    if (existing) existing.encounterRequested = true
    updateEncounterInSheet(body.wa).catch(() => {})
    return res.status(200).json({ ok: true })
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

  // Fire-and-forget: email notification + optional Google Sheet
  notifyEmail(lead).catch(() => {})
  appendToSheet(lead).catch(() => {})

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
