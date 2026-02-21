// /api/purpose-submit
// Stores Biblical Purpose quiz leads in memory AND appends to Google Sheets.
//
// POST /api/purpose-submit  — save a new lead
// GET  /api/purpose-submit  — retrieve all leads (requires x-admin-token header)
//
// Required env vars:
//   ADMIN_PASSWORD              — password for the admin panel
//   GOOGLE_SHEET_ID             — the ID from your Google Sheet URL
//   GOOGLE_SERVICE_ACCOUNT_JSON — full JSON string of the service account key

import { google } from 'googleapis'

const leads = [] // In-memory store — survives warm serverless instances

const SHEET_HEADERS = [
  'ID', 'Submitted At (SGT)', 'Name', 'WhatsApp', 'Email',
  'Purpose Type', 'Faith Journey', 'Church Status', 'Open to Meet',
  'Availability', 'Encounter Requested',
  'Career /5', 'Relationships /5', 'Faith /5', 'Peace /5',
  'I wish God would show me...', 'What would make life meaningful?',
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
  // Check if row 1 has headers; if not, insert them
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:Q1',
    })
    const row = res.data.values?.[0]
    if (!row || row.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [SHEET_HEADERS] },
      })
    }
  } catch (e) {
    console.warn('Could not check/set sheet headers:', e.message)
  }
}

async function appendToSheet(lead) {
  const client = getSheetClient()
  if (!client) return
  const { sheets, sheetId } = client

  await ensureHeaders(sheets, sheetId)

  const row = [
    lead.id,
    new Date(lead.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
    lead.name,
    lead.wa,
    lead.email || '',
    lead.purposeType,
    lead.faithJourney || '',
    lead.churchStatus || '',
    lead.openToMeet || '',
    (lead.availability || []).join(', '),
    lead.encounterRequested ? 'YES' : 'no',
    lead.ratings?.career || 0,
    lead.ratings?.relationships || 0,
    lead.ratings?.faith || 0,
    lead.ratings?.peace || 0,
    lead.answers?.q7 || '',
    lead.answers?.q8 || '',
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })
}

async function updateEncounterInSheet(wa) {
  const client = getSheetClient()
  if (!client) return
  const { sheets, sheetId } = client

  try {
    // Read column D (WhatsApp) to find the matching row
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!D:D',
    })
    const rows = res.data.values || []
    const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === wa) // skip header row
    if (rowIndex === -1) return

    const sheetRow = rowIndex + 1 // 1-indexed
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Sheet1!K${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['YES']] },
    })
  } catch (e) {
    console.warn('Could not update encounter in sheet:', e.message)
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  return res.status(405).json({ error: 'Method not allowed' })
}

async function handlePost(req, res) {
  const body = req.body || {}

  // Handle encounter request update (flag existing lead, update sheet)
  if (body.updateEncounter && body.wa) {
    const existing = leads.find(l => l.wa === body.wa)
    if (existing) {
      existing.encounterRequested = true
    }
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

  // Fire-and-forget: append to Google Sheet (silent fail)
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
