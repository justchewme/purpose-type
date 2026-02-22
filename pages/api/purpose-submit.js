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
const RATING_LABEL = ['','Struggling','Difficult','Okay','Good','Thriving']

// NOTE: Resend free tier only allows sending to the verified account email.
// To also notify elearning@equippedministries.org, verify the equippedministries.org
// domain at resend.com/domains and update the `from` address accordingly.
const NOTIFY_EMAILS = [
  'justchewme@gmail.com',
]

const QUESTION_LABELS = {
  q1: 'As a child, what did you dream of becoming?',
  q2: 'What activity makes you completely lose track of time?',
  q3: 'When you see suffering or injustice, your first instinct?',
  q4: 'In your circle, people usually come to you when they need…',
  q6: 'Alone and quiet in prayer — what do you feel most strongly?',
  q7: '"I wish God would show me…"',
}

function row(label, value, last = false) {
  if (!value) return ''
  return `
  <tr>
    <td style="padding:10px 14px;background:#F9FAFB;border-bottom:${last ? 'none' : '1px solid #E5E7EB'};${last ? 'border-radius:0 0 8px 8px;' : ''}vertical-align:top;width:38%;">
      <p style="margin:0;font-size:11px;color:#6B7280;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">${label}</p>
    </td>
    <td style="padding:10px 14px;background:#fff;border-bottom:${last ? 'none' : '1px solid #E5E7EB'};${last ? 'border-radius:0 0 8px 8px;' : ''}vertical-align:top;">
      <p style="margin:0;font-size:14px;color:#111827;line-height:1.5;">${value}</p>
    </td>
  </tr>`
}

async function notifyEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const time = new Date(lead.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
  const typeName = TYPE_NAMES[lead.purposeType] || lead.purposeType
  const waLink = `https://wa.me/${lead.wa.replace(/\D/g,'')}`
  const r = lead.ratings || {}
  const a = lead.answers || {}

  // Build quiz answer rows
  const quizRows = Object.entries(QUESTION_LABELS).map(([key, label], i, arr) => {
    const val = a[key]
    if (!val) return ''
    const isLast = i === arr.length - 1
    return row(label, key === 'q7' ? `"${val}"` : val, isLast)
  }).join('')

  // Build ratings block
  const ratingItems = [
    { label: '💼 Career & Purpose', key: 'career' },
    { label: '❤️ Relationships',    key: 'relationships' },
    { label: '✝️ Faith',            key: 'faith' },
    { label: '🕊️ Inner Peace',      key: 'peace' },
  ].map(({ label, key }) => {
    const v = r[key] || 0
    return `<tr>
      <td style="padding:8px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;color:#374151;">${label}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:700;color:#111827;">${v}/5 ${RATING_EMOJI[v] || ''} ${RATING_LABEL[v] || ''}</td>
    </tr>`
  }).join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:580px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0A1628 0%,#0F2167 100%);padding:26px 28px;text-align:center;">
    <p style="color:#F59E0B;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 5px;">New MyPurpose Submission · ${time} SGT</p>
    <h1 style="color:#fff;font-size:26px;font-weight:900;margin:0 0 3px;">${lead.name}</h1>
    <p style="color:#F59E0B;font-size:17px;font-weight:700;margin:0;">${typeName}</p>
  </div>

  <div style="padding:24px 28px 28px;">

    <!-- CONTACT -->
    <p style="font-size:11px;font-weight:700;color:#6B7280;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">📋 Contact</p>
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #E5E7EB;margin-bottom:22px;">
      <tr>
        <td style="padding:10px 14px;background:#F9FAFB;border-bottom:1px solid #E5E7EB;width:38%;vertical-align:top;">
          <p style="margin:0;font-size:11px;color:#6B7280;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">WhatsApp</p>
        </td>
        <td style="padding:10px 14px;background:#fff;border-bottom:1px solid #E5E7EB;vertical-align:top;">
          <a href="${waLink}" style="color:#059669;font-size:14px;font-weight:700;text-decoration:none;">💬 ${lead.wa} — Tap to open chat</a>
        </td>
      </tr>
      ${lead.email ? row('Email', `<a href="mailto:${lead.email}" style="color:#0F2167;">${lead.email}</a>`) : ''}
      ${row('Open to Meet', lead.openToMeet, !lead.availability?.length)}
      ${lead.availability?.length ? row('Availability', lead.availability.join(' · '), true) : ''}
    </table>

    <!-- FAITH PROFILE -->
    <p style="font-size:11px;font-weight:700;color:#6B7280;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">✝️ Faith Profile</p>
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #E5E7EB;margin-bottom:22px;">
      ${row('Faith Journey', lead.faithJourney)}
      ${row('Church Status', lead.churchStatus, true)}
    </table>

    <!-- QUIZ ANSWERS -->
    <p style="font-size:11px;font-weight:700;color:#6B7280;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">🎯 Quiz Answers</p>
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #E5E7EB;margin-bottom:22px;">
      ${quizRows}
    </table>

    <!-- LIFE RATINGS -->
    <p style="font-size:11px;font-weight:700;color:#6B7280;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">📊 Life Ratings (1–5)</p>
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #E5E7EB;margin-bottom:22px;">
      ${ratingItems}
    </table>

    <!-- CTA -->
    <div style="text-align:center;padding-top:4px;">
      <a href="${waLink}" style="display:inline-block;background:#25D366;color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;box-shadow:0 4px 16px rgba(37,211,102,0.35);">
        💬 WhatsApp ${lead.name} Now
      </a>
    </div>

  </div>

  <div style="padding:14px 28px;border-top:1px solid #E5E7EB;text-align:center;background:#F9FAFB;">
    <p style="margin:0;font-size:11px;color:#9CA3AF;">MyPurpose · mypurpose.vercel.app · ID: ${lead.id}</p>
  </div>
</div>
</body>
</html>`

  await resend.emails.send({
    from: 'MyPurpose <onboarding@resend.dev>',
    to: NOTIFY_EMAILS,
    subject: `New MyPurpose Submission — ${lead.name} (${typeName})`,
    html,
  })
}

// ─── AIRTABLE (optional, silent fail if not configured) ───────────────────────
// Env vars: AIRTABLE_PAT, AIRTABLE_BASE_ID
// PAT scopes needed: data.records:write  +  schema.bases:write

const AIRTABLE_TABLE = 'Submissions'

const AIRTABLE_FIELDS = [
  { name: 'Name',                       type: 'singleLineText' },
  { name: 'WhatsApp',                   type: 'singleLineText' },
  { name: 'Email',                      type: 'email' },
  { name: 'Blueprint',                  type: 'singleLineText' },
  { name: 'Faith Journey',              type: 'singleLineText' },
  { name: 'Church Status',              type: 'singleLineText' },
  { name: 'Open to Meet',               type: 'singleLineText' },
  { name: 'Availability',               type: 'singleLineText' },
  { name: 'Career /5',                  type: 'number', options: { precision: 0 } },
  { name: 'Relationships /5',           type: 'number', options: { precision: 0 } },
  { name: 'Faith /5',                   type: 'number', options: { precision: 0 } },
  { name: 'Peace /5',                   type: 'number', options: { precision: 0 } },
  { name: 'Q1 — Childhood Dream',       type: 'singleLineText' },
  { name: 'Q2 — Loses Track of Time',   type: 'singleLineText' },
  { name: 'Q3 — Injustice Instinct',    type: 'singleLineText' },
  { name: 'Q4 — People Come to Me For', type: 'singleLineText' },
  { name: 'Q6 — In Prayer',             type: 'singleLineText' },
  { name: 'I wish God would show me',   type: 'multilineText' },
  { name: 'Submitted At (SGT)',          type: 'singleLineText' },
]

async function ensureAirtableTable(baseId, headers) {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, { headers })
  if (!res.ok) return false
  const data = await res.json()
  const exists = data.tables?.some(t => t.name === AIRTABLE_TABLE)
  if (exists) return true
  // Create table with all fields
  const create = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    method: 'POST', headers,
    body: JSON.stringify({ name: AIRTABLE_TABLE, fields: AIRTABLE_FIELDS }),
  })
  return create.ok
}

async function appendToAirtable(lead) {
  const pat    = process.env.AIRTABLE_PAT
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!pat || !baseId) return

  const headers = { 'Authorization': `Bearer ${pat}`, 'Content-Type': 'application/json' }
  const a = lead.answers || {}
  const r = lead.ratings || {}

  await ensureAirtableTable(baseId, headers)

  const fields = {
    'Name':                       lead.name,
    'WhatsApp':                   lead.wa,
    'Email':                      lead.email || '',
    'Blueprint':                  lead.purposeType,
    'Faith Journey':              lead.faithJourney || '',
    'Church Status':              lead.churchStatus || '',
    'Open to Meet':               lead.openToMeet || '',
    'Availability':               (lead.availability || []).join(', '),
    'Career /5':                  r.career  || 0,
    'Relationships /5':           r.relationships || 0,
    'Faith /5':                   r.faith   || 0,
    'Peace /5':                   r.peace   || 0,
    'Q1 — Childhood Dream':       a.q1 || '',
    'Q2 — Loses Track of Time':   a.q2 || '',
    'Q3 — Injustice Instinct':    a.q3 || '',
    'Q4 — People Come to Me For': a.q4 || '',
    'Q6 — In Prayer':             a.q6 || '',
    'I wish God would show me':   a.q7 || '',
    'Submitted At (SGT)':         new Date(lead.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
  }

  // Remove empty-string email to avoid Airtable validation error
  if (!fields['Email']) delete fields['Email']

  await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(AIRTABLE_TABLE)}`, {
    method: 'POST', headers,
    body: JSON.stringify({ fields }),
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

  // Fire-and-forget: email + Airtable + optional Google Sheet
  notifyEmail(lead).catch(() => {})
  appendToAirtable(lead).catch(() => {})
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
