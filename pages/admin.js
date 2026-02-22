import { useState } from 'react'
import Head from 'next/head'

const C = {
  navy: '#0F2167', navyDark: '#091548', gold: '#C9972B',
  white: '#FFFFFF', text: '#1A1A2E', muted: '#6B7280',
  border: '#E5E7EB', red: '#DC2626', green: '#16A34A',
  bg: '#F8F9FC',
}

const TYPE_EMOJI = {
  BUILDER: '🏗️', HEALER: '💚', SEEKER: '🔍', SHEPHERD: '🌿',
  CATALYST: '🔥', CREATOR: '✨', ANCHOR: '⚓',
}

const FAITH_LABELS = [
  { match: 'thriving', emoji: '🌱', short: 'Thriving' },
  { match: 'stuck',    emoji: '😐', short: 'Stuck' },
  { match: 'questions', emoji: '❓', short: 'Questions' },
  { match: 'stepped away', emoji: '🚶', short: 'Away from church' },
  { match: 'explore',  emoji: '🔎', short: 'Exploring' },
]

const CHURCH_LABELS = [
  { match: 'Actively involved', emoji: '⛪', short: 'Active' },
  { match: 'occasionally',      emoji: '🕍', short: 'Occasional' },
  { match: 'Looking for',       emoji: '🔍', short: 'Looking' },
  { match: 'Not attending, but open', emoji: '🚶', short: 'Away, open' },
  { match: 'Not currently',     emoji: '🚫', short: 'Not attending' },
]

function faithLabel(val) {
  if (!val) return val
  const found = FAITH_LABELS.find(f => val.toLowerCase().includes(f.match.toLowerCase()))
  return found ? `${found.emoji} ${found.short}` : val
}

function churchLabel(val) {
  if (!val) return val
  const found = CHURCH_LABELS.find(f => val.toLowerCase().includes(f.match.toLowerCase()))
  return found ? `${found.emoji} ${found.short}` : val
}

function isSeeking(faithJourney) {
  if (!faithJourney) return false
  const s = faithJourney.toLowerCase()
  return s.includes('stuck') || s.includes('questions') || s.includes('stepped away') || s.includes('explore')
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const login = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/purpose-submit', {
        headers: { 'x-admin-token': password },
      })
      if (res.status === 401) { setError('Wrong password.'); setLoading(false); return }
      const data = await res.json()
      setLeads(data.leads || [])
      setAuthed(true)
    } catch {
      setError('Failed to connect.')
    }
    setLoading(false)
  }

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/purpose-submit', {
        headers: { 'x-admin-token': password },
      })
      const data = await res.json()
      setLeads(data.leads || [])
    } catch { /* silent */ }
    setLoading(false)
  }

  const filtered = leads.filter(l => {
    if (filter === 'encounter') return l.encounterRequested
    if (filter === 'evening') return l.availability?.includes('evenings')
    if (filter === 'seeking') return isSeeking(l.faithJourney)
    if (filter === 'open') return ['yes', 'maybe'].includes(l.openToMeet)
    return true
  })

  const encounterCount = leads.filter(l => l.encounterRequested).length
  const eveningCount = leads.filter(l => l.availability?.includes('evenings')).length
  const seekingCount = leads.filter(l => isSeeking(l.faithJourney)).length
  const openCount = leads.filter(l => ['yes', 'maybe'].includes(l.openToMeet)).length

  const exportCSV = () => {
    const rows = [
      ['ID', 'Name', 'WhatsApp', 'Email', 'Type', 'Faith', 'Church', 'Open to Meet', 'Available', 'Encounter', 'Q7 - Wish God showed', 'Career', 'Relationships', 'Faith Rating', 'Peace', 'Submitted'],
      ...filtered.map(l => [
        l.id, l.name, l.wa, l.email || '',
        l.purposeType, l.faithJourney, l.churchStatus, l.openToMeet,
        (l.availability || []).join(' | '),
        l.encounterRequested ? 'YES' : 'no',
        l.answers?.q7 || '',
        l.ratings?.career || 0, l.ratings?.relationships || 0,
        l.ratings?.faith || 0, l.ratings?.peace || 0,
        new Date(l.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'purpose-leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Head><title>Admin — Purpose Type</title></Head>
      <div style={{ background: C.white, borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✝️</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: '0 0 4px' }}>Purpose Type Admin</h1>
        <p style={{ fontSize: 14, color: C.muted, margin: '0 0 28px' }}>Enter admin password to view leads</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Admin password"
          style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', fontSize: 15, border: `2px solid ${C.border}`, borderRadius: 10, marginBottom: 12, outline: 'none', fontFamily: 'inherit' }}
        />
        {error && <p style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button
          onClick={login}
          disabled={loading || !password}
          style={{ width: '100%', padding: '14px', background: C.navy, color: C.white, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
      </div>
    </div>
  )

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Head><title>Admin — Purpose Type ({leads.length} leads)</title></Head>

      {/* Header */}
      <div style={{ background: C.navy, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>✝️</span>
          <span style={{ color: C.white, fontSize: 17, fontWeight: 700 }}>Purpose Type Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={refresh} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.15)', color: C.white, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
          <button onClick={exportCSV} style={{ padding: '8px 14px', background: C.gold, color: '#1A1A2E', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Leads', value: leads.length, color: C.navy },
            { label: '🕊️ Encounter', value: encounterCount, color: '#C9972B' },
            { label: '☕ Open to Meet', value: openCount, color: C.green },
            { label: '🌙 Evening Free', value: eveningCount, color: '#5B21B6' },
            { label: '🔍 Seeking', value: seekingCount, color: C.red },
          ].map(stat => (
            <div key={stat.label} style={{ background: C.white, borderRadius: 10, padding: '14px 16px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { v: 'all', label: `All (${leads.length})` },
            { v: 'encounter', label: `🕊️ Encounter (${encounterCount})` },
            { v: 'open', label: `☕ Open to Meet (${openCount})` },
            { v: 'evening', label: `🌙 Evening (${eveningCount})` },
            { v: 'seeking', label: `🔍 Seeking (${seekingCount})` },
          ].map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 20,
                background: filter === v ? C.navy : C.white,
                color: filter === v ? C.white : C.text,
                border: `1px solid ${filter === v ? C.navy : C.border}`,
                cursor: 'pointer',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Lead cards */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>No leads yet.</div>
        )}
        {filtered.map(lead => {
          const isPriority = lead.encounterRequested
          const isOpen = ['yes', 'maybe'].includes(lead.openToMeet) && lead.availability?.includes('evenings')
          const isExpanded = expanded === lead.id

          return (
            <div
              key={lead.id}
              style={{
                background: C.white,
                borderRadius: 12,
                marginBottom: 10,
                border: `1px solid ${isPriority ? '#C9972B' : C.border}`,
                boxShadow: isPriority ? '0 2px 8px rgba(201,151,43,0.15)' : 'none',
                overflow: 'hidden',
              }}
            >
              {/* Lead header */}
              <div
                onClick={() => setExpanded(isExpanded ? null : lead.id)}
                style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
              >
                <span style={{ fontSize: 22 }}>{TYPE_EMOJI[lead.purposeType] || '✝️'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{lead.name}</span>
                    {isPriority && <span style={{ fontSize: 11, fontWeight: 700, background: '#C9972B', color: C.white, padding: '2px 8px', borderRadius: 20 }}>🕊️ ENCOUNTER</span>}
                    {isOpen && !isPriority && <span style={{ fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: C.green, padding: '2px 8px', borderRadius: 20 }}>⭐ PRIORITY</span>}
                    <span style={{ fontSize: 12, color: C.muted }}>{lead.purposeType}</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                    {faithLabel(lead.faithJourney)} · {churchLabel(lead.churchStatus)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <a
                    href={`https://wa.me/${lead.wa.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      padding: '7px 12px', background: '#25D366', color: C.white,
                      borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📲 WhatsApp
                  </a>
                  <span style={{ fontSize: 18, color: C.muted }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 16px 20px', background: '#FAFAFA' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact</div>
                      <div style={{ fontSize: 14, color: C.text }}>{lead.wa}</div>
                      {lead.email && <div style={{ fontSize: 13, color: C.muted }}>{lead.email}</div>}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Availability</div>
                      <div style={{ fontSize: 14, color: C.text }}>{(lead.availability || []).join(', ') || 'Not specified'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Open to Meet</div>
                      <div style={{ fontSize: 14, color: C.text }}>{lead.openToMeet}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Submitted</div>
                      <div style={{ fontSize: 13, color: C.text }}>{new Date(lead.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}</div>
                    </div>
                  </div>

                  {/* Life ratings */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      { k: 'career', label: '💼 Career' },
                      { k: 'relationships', label: '❤️ Relationships' },
                      { k: 'faith', label: '✝️ Faith' },
                      { k: 'peace', label: '🕊️ Peace' },
                    ].map(({ k, label }) => {
                      const v = lead.ratings?.[k] || 0
                      const color = v <= 2 ? C.red : v === 3 ? C.gold : C.green
                      return (
                        <div key={k} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color }}>{v}/5</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Open text answers */}
                  {lead.answers?.q7 && (
                    <div style={{ background: '#FDF6E3', borderRadius: 8, padding: '12px 14px', marginBottom: 10, border: '1px solid #F3D99A' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#92600A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>I wish God would show me...</div>
                      <div style={{ fontSize: 14, color: C.text, fontStyle: 'italic', lineHeight: 1.6 }}>"{lead.answers.q7}"</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
