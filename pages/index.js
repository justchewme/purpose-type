import { useState } from 'react'
import Head from 'next/head'

// ─── COLOUR PALETTE ──────────────────────────────────────────────────────────
const C = {
  navy:    '#0F2167',
  navyDark:'#091548',
  gold:    '#C9972B',
  goldLight:'#FDF6E3',
  cream:   '#FFFDF7',
  white:   '#FFFFFF',
  text:    '#1A1A2E',
  muted:   '#6B7280',
  border:  '#E5E7EB',
  red:     '#DC2626',
  green:   '#16A34A',
  overlay: 'rgba(15,33,103,0.96)',
}

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────
const TYPES = {
  BUILDER: {
    id: 'BUILDER', name: 'The Builder', subtitle: 'Like Nehemiah',
    emoji: '🏗️', color: '#92400E', bg: '#FEF3C7', rarity: 18,
    verse: 'Nehemiah 6:3',
    verseText: '"I am doing a great work and cannot come down."',
    description: (name) => `${name}, you are called to build — not just with your hands, but with vision, strategy, and faithfulness. Like Nehemiah, who rebuilt Jerusalem's walls while opposition surrounded him, you see what could be and refuse to settle for what is. You carry a divine blueprint for something that hasn't been built yet. People follow your clarity because they sense God is in it.`,
    growthEdge: `Builders can get so focused on the work that they forget to rest in the One behind all things. Your next growth edge is learning to build from a place of rest, not striving — to receive from God before you give to others.`,
  },
  HEALER: {
    id: 'HEALER', name: 'The Healer', subtitle: 'Like Luke',
    emoji: '💚', color: '#166534', bg: '#DCFCE7', rarity: 16,
    verse: 'Isaiah 61:1',
    verseText: '"He has sent me to bind up the brokenhearted."',
    description: (name) => `${name}, you are called to restore what is broken. Like Luke the physician, you notice pain that others walk past. Where others see problems, you see people. Your presence alone brings comfort — and your calling is to be a channel of God's healing grace in a world full of wounds. That tenderness in you is not weakness. It is your anointing.`,
    growthEdge: `Healers often pour out for others while neglecting their own soul. Your growth edge is allowing God — and others — to minister to you first. You cannot give from an empty well.`,
  },
  SEEKER: {
    id: 'SEEKER', name: 'The Seeker', subtitle: 'Like Solomon',
    emoji: '🔍', color: '#1E3A8A', bg: '#DBEAFE', rarity: 14,
    verse: 'Proverbs 25:2',
    verseText: '"It is the glory of God to conceal a matter; to search it out is the glory of kings."',
    description: (name) => `${name}, you are called to pursue wisdom — to ask the questions others are afraid to ask and find answers that change lives. Like Solomon, you have a hunger for truth that goes beyond the surface. You're not satisfied with easy answers, and that holy restlessness is a gift. The questions that keep you up at night are exactly what God wants you to carry.`,
    growthEdge: `Seekers can wander alone in their questions. Your growth edge is finding a community to seek alongside — truth is sharpest when it's shared, and your questions deserve real conversation with people who won't flinch.`,
  },
  SHEPHERD: {
    id: 'SHEPHERD', name: 'The Shepherd', subtitle: 'Like David',
    emoji: '🌿', color: '#5B21B6', bg: '#EDE9FE', rarity: 15,
    verse: 'Psalm 23:1',
    verseText: '"The Lord is my shepherd; I shall not want."',
    description: (name) => `${name}, you are called to lead with love. Like David — a shepherd before he was a king — you have a natural instinct to protect, guide, and care for those in your circle. People feel safe around you. Your leadership doesn't demand followers; it earns them. The people God has placed around you are not accidents — they are your flock.`,
    growthEdge: `Shepherds carry the weight of everyone else's wellbeing until they're completely empty. Your growth edge is letting the Good Shepherd lead you first — you cannot shepherd others from a depleted soul.`,
  },
  CATALYST: {
    id: 'CATALYST', name: 'The Catalyst', subtitle: 'Like Paul',
    emoji: '🔥', color: '#991B1B', bg: '#FEE2E2', rarity: 12,
    verse: 'Romans 1:16',
    verseText: '"I am not ashamed of the gospel, for it is the power of God."',
    description: (name) => `${name}, you are called to ignite. Like Paul, who turned the ancient world upside down, you carry a fire that refuses to be contained. You see potential where others see obstacles. You start movements, not just moments — and people catch your flame when they're near you. God placed that urgency in you on purpose.`,
    growthEdge: `Catalysts burn bright — and can burn out. Your growth edge is cultivating deep inner peace that sustains the fire for decades, not just seasons. Go deep before you go wide.`,
  },
  CREATOR: {
    id: 'CREATOR', name: 'The Creator', subtitle: 'Like Bezalel',
    emoji: '✨', color: '#78350F', bg: '#FEF9C3', rarity: 13,
    verse: 'Exodus 31:3',
    verseText: '"I have filled him with the Spirit of God, with wisdom, understanding, and knowledge in all kinds of crafts."',
    description: (name) => `${name}, you are called to reflect God's beauty. Like Bezalel — the very first person in Scripture filled with the Spirit of God — your creativity is not just talent. It's a calling. You are wired to express the invisible things of God in ways people can see, hear, and feel. When you create, God is speaking through you.`,
    growthEdge: `Creators can create from comparison or insecurity. Your growth edge is learning to create as an act of worship, not performance — from overflow, not emptiness. Your best work comes from rest.`,
  },
  ANCHOR: {
    id: 'ANCHOR', name: 'The Anchor', subtitle: 'Like Ruth',
    emoji: '⚓', color: '#14532D', bg: '#DCFCE7', rarity: 12,
    verse: 'Ruth 1:16',
    verseText: '"Where you go, I will go. Your people shall be my people."',
    description: (name) => `${name}, you are called to stay. Like Ruth, whose radical faithfulness changed the entire bloodline of history, your greatest strength is your loyalty — to God, to people, to promises. In a world of quitters, you are the rare person who holds steady when everything shakes. That faithfulness is more powerful than you know.`,
    growthEdge: `Anchors can mistake endurance for passivity. Your growth edge is allowing God to expand your vision — you are called to more than staying. You are called to go with purpose.`,
  },
}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'q1',
    text: 'As a child, what did you dream of becoming?',
    options: [
      { label: 'An engineer, architect, or someone who builds things', type: 'BUILDER' },
      { label: 'A doctor, nurse, or someone who heals people', type: 'HEALER' },
      { label: 'A teacher, researcher, or explorer of ideas', type: 'SEEKER' },
      { label: 'A leader, pastor, or someone who guides others', type: 'SHEPHERD' },
      { label: 'An entrepreneur or someone who makes things happen', type: 'CATALYST' },
      { label: 'An artist, musician, writer, or creative', type: 'CREATOR' },
      { label: 'Someone faithful — close to family and loyal to those I love', type: 'ANCHOR' },
    ],
  },
  {
    id: 'q2',
    text: 'What activity makes you completely lose track of time?',
    options: [
      { label: 'Building, fixing, or designing something meaningful', type: 'BUILDER' },
      { label: 'Sitting with someone who is hurting and truly helping them', type: 'HEALER' },
      { label: 'Reading, studying, or having really deep conversations', type: 'SEEKER' },
      { label: "Mentoring, guiding, or investing in someone's growth", type: 'SHEPHERD' },
      { label: 'Launching something new and watching it come alive', type: 'CATALYST' },
      { label: 'Creating — art, music, writing, or anything expressive', type: 'CREATOR' },
      { label: 'Simply being present with the people I love most', type: 'ANCHOR' },
    ],
  },
  {
    id: 'q3',
    text: 'When you see suffering or injustice, what is your first instinct?',
    options: [
      { label: 'Fix it — find a practical solution and build a path forward', type: 'BUILDER' },
      { label: 'Go to the person and comfort them first', type: 'HEALER' },
      { label: "Research and understand what's really causing it", type: 'SEEKER' },
      { label: 'Protect and stand with the most vulnerable', type: 'SHEPHERD' },
      { label: 'Rally others and spark a movement for change', type: 'CATALYST' },
      { label: 'Tell the story in a way that moves hearts and changes minds', type: 'CREATOR' },
      { label: 'Stay faithful to those affected — long-term, quietly', type: 'ANCHOR' },
    ],
  },
  {
    id: 'q4',
    text: 'In your circle, people usually come to you when they need...',
    options: [
      { label: 'A practical solution — someone who can make it actually happen', type: 'BUILDER' },
      { label: 'Emotional support — someone who truly understands their pain', type: 'HEALER' },
      { label: 'Wisdom or perspective — someone to think deeply with them', type: 'SEEKER' },
      { label: 'Direction or guidance — someone who will genuinely look out for them', type: 'SHEPHERD' },
      { label: 'Courage — someone who will push them to take the next step', type: 'CATALYST' },
      { label: 'A fresh idea or creative perspective on a problem', type: 'CREATOR' },
      { label: 'Dependability — someone they know will be there, no matter what', type: 'ANCHOR' },
    ],
  },
  {
    id: 'q5',
    text: 'Rate how fulfilled you feel in each area of your life right now:',
    type: 'rating',
    subtitle: '1 = struggling, 5 = thriving',
    areas: [
      { id: 'career', label: '💼 Career & Purpose' },
      { id: 'relationships', label: '❤️ Relationships & Love' },
      { id: 'faith', label: '✝️ Faith & Spiritual Life' },
      { id: 'peace', label: '🕊️ Inner Peace & Joy' },
    ],
  },
  {
    id: 'q6',
    text: "When you're alone and quiet — perhaps in prayer — what do you feel most strongly?",
    options: [
      { label: 'A deep desire to create or build something for God', type: 'BUILDER' },
      { label: 'Compassion — my heart breaks for people who are hurting', type: 'HEALER' },
      { label: 'A longing to know and understand God more deeply', type: 'SEEKER' },
      { label: 'A calling to watch over and care for specific people in my life', type: 'SHEPHERD' },
      { label: 'A burning urgency — like something needs to move and happen', type: 'CATALYST' },
      { label: "Awe at God's beauty and a deep desire to express it", type: 'CREATOR' },
      { label: 'Quiet gratitude for His faithfulness — a peace that grounds me', type: 'ANCHOR' },
    ],
  },
  {
    id: 'q7',
    text: 'Complete this sentence honestly:',
    subtitle: '"I wish God would show me..."',
    type: 'opentext',
    placeholder: 'Type your answer here — be as honest as you want...',
  },
  {
    id: 'q8',
    text: 'What would make your life feel truly meaningful?',
    type: 'opentext',
    placeholder: 'Take a moment. Be really honest with yourself.',
  },
]

// ─── SCORING ──────────────────────────────────────────────────────────────────
function scoreAnswers(answers) {
  const scores = { BUILDER: 0, HEALER: 0, SEEKER: 0, SHEPHERD: 0, CATALYST: 0, CREATOR: 0, ANCHOR: 0 }
  for (const qId of ['q1', 'q2', 'q3', 'q4', 'q6']) {
    const val = answers[qId]
    if (val && scores[val] !== undefined) scores[val]++
  }
  let max = -1, winner = 'SEEKER'
  for (const [t, s] of Object.entries(scores)) {
    if (s > max) { max = s; winner = t }
  }
  return { type: winner, scores }
}

// ─── WHATSAPP VALIDATION ──────────────────────────────────────────────────────
function validateIndonesianWA(phone) {
  const c = phone.replace(/[\s\-\(\)\.]/g, '')
  if (!/^\+?\d{9,15}$/.test(c)) return false
  return /^(08\d{8,11}|628\d{8,11}|\+628\d{8,11})$/.test(c)
}

function normalizeWA(phone) {
  const c = phone.replace(/[\s\-\(\)\.]/g, '')
  if (c.startsWith('08')) return '+62' + c.slice(1)
  if (c.startsWith('628')) return '+' + c
  return c
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const btn = {
  primary: {
    display: 'block', width: '100%', padding: '16px 24px',
    background: `linear-gradient(135deg, ${C.navy} 0%, #1a3a9e 100%)`,
    color: C.white, border: 'none', borderRadius: 12,
    fontSize: 17, fontWeight: 700, cursor: 'pointer',
    letterSpacing: 0.3,
    boxShadow: '0 4px 20px rgba(15,33,103,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  option: (selected) => ({
    display: 'block', width: '100%', textAlign: 'left',
    padding: '14px 18px',
    background: selected ? C.navy : C.white,
    color: selected ? C.white : C.text,
    border: `2px solid ${selected ? C.navy : C.border}`,
    borderRadius: 10, fontSize: 15, fontWeight: selected ? 600 : 400,
    cursor: 'pointer', marginBottom: 10, transition: 'all 0.15s',
  }),
}

const wrap = {
  minHeight: '100vh', background: C.cream,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const card = {
  maxWidth: 520, margin: '0 auto', padding: '0 16px',
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: C.muted }}>Question {current} of {total}</span>
          <span style={{ fontSize: 13, color: C.navy, fontWeight: 600 }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
          <div style={{ height: 4, width: `${pct}%`, background: C.navy, borderRadius: 2, transition: 'width 0.4s' }} />
        </div>
      </div>
    </div>
  )
}

// ─── LANDING SCREEN ───────────────────────────────────────────────────────────
function Landing({ onStart }) {
  return (
    <div style={wrap}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navy} 60%, #1a3a9e 100%)`, padding: '60px 20px 50px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✝️</div>
          <h1 style={{ color: C.white, fontSize: 28, fontWeight: 800, lineHeight: 1.25, margin: '0 0 16px', letterSpacing: -0.5 }}>
            Which of the 7 Biblical<br />Purpose Types Are You?
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.6, margin: '0 0 24px' }}>
            Discover what God specifically designed you to do.<br />Takes 3 minutes. 100% free.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 18px', marginBottom: 32, textAlign: 'left' }}>
            <p style={{ color: C.gold, fontSize: 14, fontWeight: 600, margin: '0 0 4px', letterSpacing: 0.5 }}>JEREMIAH 29:11</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
              "For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."
            </p>
          </div>
          <button
            onClick={onStart}
            style={{ ...btn.primary, fontSize: 18, padding: '18px 32px', background: `linear-gradient(135deg, ${C.gold} 0%, #e8b84b 100%)`, color: C.navyDark, boxShadow: '0 4px 24px rgba(201,151,43,0.5)' }}
          >
            Discover My Purpose Type →
          </button>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '12px 16px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['🔒 No download', '🚫 No login', '💰 Completely free', '🇸🇬 Built in Singapore'].map(t => (
            <span key={t} style={{ fontSize: 12, color: C.muted, background: '#F3F4F6', padding: '4px 10px', borderRadius: 20 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div style={{ ...card, paddingTop: 32, paddingBottom: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
          {'⭐⭐⭐⭐⭐'.split('').map((s, i) => <span key={i} style={{ fontSize: 20 }}>{s}</span>)}
          <span style={{ fontSize: 14, color: C.muted, marginLeft: 6, alignSelf: 'center' }}>4.8 / 5</span>
        </div>
        <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px' }}>
          Taken by <strong style={{ color: C.navy }}>12,847 Christians</strong> across Southeast Asia
        </p>
      </div>

      {/* 7 types preview */}
      <div style={{ ...card, paddingBottom: 8 }}>
        <p style={{ textAlign: 'center', color: C.muted, fontSize: 14, fontWeight: 600, letterSpacing: 0.5, marginBottom: 16, textTransform: 'uppercase' }}>The 7 Biblical Purpose Types</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Object.values(TYPES).map(t => (
            <div key={t.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{t.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA repeat */}
      <div style={{ ...card, padding: '32px 16px 48px', textAlign: 'center' }}>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 20 }}>God did not make you by accident.</p>
        <button onClick={onStart} style={{ ...btn.primary, maxWidth: 360, margin: '0 auto' }}>
          Discover My Purpose Type →
        </button>
        <p style={{ color: C.muted, fontSize: 12, marginTop: 12 }}>🇸🇬 Built by Christians in Singapore for believers across Southeast Asia</p>
      </div>
    </div>
  )
}

// ─── MULTIPLE CHOICE QUESTION ─────────────────────────────────────────────────
function MCQuestion({ question, qIndex, total, selected, onSelect, onNext }) {
  return (
    <div style={wrap}>
      <ProgressBar current={qIndex + 1} total={total} />
      <div style={{ ...card, paddingTop: 32, paddingBottom: 48 }}>
        <p style={{ fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Question {qIndex + 1}</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, lineHeight: 1.35, margin: '0 0 8px' }}>{question.text}</h2>
        {question.subtitle && <p style={{ fontSize: 15, color: C.muted, marginBottom: 24 }}>{question.subtitle}</p>}
        <div style={{ marginBottom: 8 }}>
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onSelect(opt.type)}
              style={btn.option(selected === opt.type)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {selected && (
          <button onClick={onNext} style={{ ...btn.primary, marginTop: 8 }}>
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── RATING QUESTION ──────────────────────────────────────────────────────────
function RatingQuestion({ question, qIndex, total, ratings, onRate, onNext }) {
  const allRated = question.areas.every(a => ratings[a.id] > 0)
  return (
    <div style={wrap}>
      <ProgressBar current={qIndex + 1} total={total} />
      <div style={{ ...card, paddingTop: 32, paddingBottom: 48 }}>
        <p style={{ fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Question {qIndex + 1}</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, lineHeight: 1.35, margin: '0 0 6px' }}>{question.text}</h2>
        {question.subtitle && <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>{question.subtitle}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          {question.areas.map(area => (
            <div key={area.id}>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: '0 0 10px' }}>{area.label}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => onRate(area.id, n)}
                    style={{
                      flex: 1, padding: '10px 0',
                      background: ratings[area.id] >= n ? C.navy : C.white,
                      color: ratings[area.id] >= n ? C.white : C.muted,
                      border: `2px solid ${ratings[area.id] >= n ? C.navy : C.border}`,
                      borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    }}
                  >{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {allRated && (
          <button onClick={onNext} style={btn.primary}>Continue →</button>
        )}
      </div>
    </div>
  )
}

// ─── OPEN TEXT QUESTION ───────────────────────────────────────────────────────
function OpenTextQuestion({ question, qIndex, total, value, onChange, onNext }) {
  return (
    <div style={wrap}>
      <ProgressBar current={qIndex + 1} total={total} />
      <div style={{ ...card, paddingTop: 32, paddingBottom: 48 }}>
        <p style={{ fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Question {qIndex + 1}</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, lineHeight: 1.35, margin: '0 0 8px' }}>{question.text}</h2>
        {question.subtitle && (
          <p style={{ fontSize: 18, fontStyle: 'italic', color: C.navy, margin: '0 0 24px', fontWeight: 600 }}>{question.subtitle}</p>
        )}
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '14px 16px', fontSize: 16, lineHeight: 1.6,
            border: `2px solid ${value.length > 3 ? C.navy : C.border}`,
            borderRadius: 10, outline: 'none', resize: 'vertical',
            background: C.white, color: C.text, fontFamily: 'inherit',
            marginBottom: 20,
          }}
        />
        <button
          onClick={onNext}
          disabled={value.trim().length < 3}
          style={{ ...btn.primary, opacity: value.trim().length < 3 ? 0.4 : 1, cursor: value.trim().length < 3 ? 'not-allowed' : 'pointer' }}
        >
          {qIndex + 1 === total ? 'See My Results →' : 'Continue →'}
        </button>
        {value.trim().length < 3 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 8 }}>Please write at least a few words</p>
        )}
      </div>
    </div>
  )
}

// ─── GATE SCREEN ──────────────────────────────────────────────────────────────
function GateScreen({ onSubmit, submitting, error }) {
  const [name, setName] = useState('')
  const [wa, setWa] = useState('')
  const [email, setEmail] = useState('')
  const [faithJourney, setFaithJourney] = useState('')
  const [churchStatus, setChurchStatus] = useState('')
  const [openToMeet, setOpenToMeet] = useState('')
  const [availability, setAvailability] = useState([])
  const [waError, setWaError] = useState('')

  const toggleAvail = (v) => setAvailability(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const handleSubmit = () => {
    setWaError('')
    if (!name.trim()) return
    if (!wa.trim()) { setWaError('Please enter your WhatsApp number.'); return }
    if (!validateIndonesianWA(wa)) {
      setWaError('Please enter a valid Indonesian WhatsApp number (e.g. 0812-3456-7890).')
      return
    }
    if (!faithJourney) return
    if (!churchStatus) return
    if (!openToMeet) return
    onSubmit({ name: name.trim(), wa: normalizeWA(wa), email: email.trim(), faithJourney, churchStatus, openToMeet, availability })
  }

  const allFilled = name.trim() && wa.trim() && faithJourney && churchStatus && openToMeet

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '13px 14px',
    fontSize: 16, border: `2px solid ${C.border}`, borderRadius: 10,
    background: C.white, color: C.text, fontFamily: 'inherit', outline: 'none',
  }
  const labelStyle = { fontSize: 14, fontWeight: 600, color: C.text, display: 'block', marginBottom: 6 }
  const sectionStyle = { marginBottom: 22 }

  return (
    <div style={wrap}>
      <div style={{ background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navy} 100%)`, padding: '28px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
          <h2 style={{ color: C.white, fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Your Purpose Type is Ready!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, margin: 0 }}>
            Tell us a little about yourself so we can personalise your full report.
          </p>
        </div>
      </div>
      <div style={{ ...card, paddingTop: 28, paddingBottom: 48 }}>

        {/* Contact info */}
        <div style={{ background: C.white, borderRadius: 12, padding: '20px 18px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 16px' }}>📋 Your Details</p>
          <div style={sectionStyle}>
            <label style={labelStyle}>First Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Joshua" style={inputStyle} />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>WhatsApp Number * <span style={{ color: C.muted, fontWeight: 400 }}>(Indonesian number)</span></label>
            <input value={wa} onChange={e => { setWa(e.target.value); setWaError('') }} placeholder="e.g. 0812-3456-7890" style={{ ...inputStyle, borderColor: waError ? C.red : C.border }} />
            {waError && <p style={{ color: C.red, fontSize: 13, marginTop: 4 }}>{waError}</p>}
            <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>🔒 Only used to send your report. Never shared.</p>
          </div>
          <div style={{ ...sectionStyle, marginBottom: 0 }}>
            <label style={labelStyle}>Email <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="yourname@email.com" style={inputStyle} />
          </div>
        </div>

        {/* Faith journey */}
        <div style={{ background: C.white, borderRadius: 12, padding: '20px 18px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>✝️ Your Faith Journey</p>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 14px' }}>Where are you right now? (Select the one that fits most)</p>
          {[
            { v: 'thriving', label: 'Growing and thriving in my faith' },
            { v: 'stuck', label: "I believe, but I'm feeling stuck or confused" },
            { v: 'questions', label: "I have questions about my faith that haven't been answered" },
            { v: 'away', label: "I believe in God/Jesus, but I've stepped away from church" },
            { v: 'exploring', label: "I'm beginning to explore who Jesus really is" },
          ].map(({ v, label }) => (
            <button key={v} onClick={() => setFaithJourney(v)} style={btn.option(faithJourney === v)}>{label}</button>
          ))}
        </div>

        {/* Church status */}
        <div style={{ background: C.white, borderRadius: 12, padding: '20px 18px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 14px' }}>⛪ Your Church Life</p>
          {[
            { v: 'active', label: 'Actively involved in a church' },
            { v: 'occasional', label: 'Attending occasionally' },
            { v: 'looking', label: 'Looking for a church home' },
            { v: 'away_open', label: 'Not attending, but open to community' },
            { v: 'away_closed', label: 'Not currently attending' },
          ].map(({ v, label }) => (
            <button key={v} onClick={() => setChurchStatus(v)} style={btn.option(churchStatus === v)}>{label}</button>
          ))}
        </div>

        {/* Availability */}
        <div style={{ background: C.white, borderRadius: 12, padding: '20px 18px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>🕐 When are you usually free?</p>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 14px' }}>Select all that apply</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { v: 'mornings', label: '🌅 Weekday mornings' },
              { v: 'afternoons', label: '☀️ Weekday afternoons' },
              { v: 'evenings', label: '🌙 Weekday evenings' },
              { v: 'weekends', label: '🗓️ Weekends' },
            ].map(({ v, label }) => (
              <button
                key={v}
                onClick={() => toggleAvail(v)}
                style={{
                  padding: '12px 10px', textAlign: 'center', fontSize: 13, fontWeight: 600,
                  background: availability.includes(v) ? C.navy : C.white,
                  color: availability.includes(v) ? C.white : C.text,
                  border: `2px solid ${availability.includes(v) ? C.navy : C.border}`,
                  borderRadius: 10, cursor: 'pointer',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Open to meet */}
        <div style={{ background: C.white, borderRadius: 12, padding: '20px 18px', marginBottom: 24, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>☕ One Last Question</p>
          <p style={{ fontSize: 14, color: C.text, margin: '0 0 14px', lineHeight: 1.5 }}>
            If someone with a similar purpose type wanted to connect with you — just for a casual conversation over coffee — how would you feel?
          </p>
          {[
            { v: 'yes', label: "😊 I'd love that — I'm open to it!" },
            { v: 'maybe', label: '🤔 Maybe — depends on who it is' },
            { v: 'online', label: "💬 I'd prefer to stay in touch online for now" },
            { v: 'no', label: '🙏 Not right now, but thank you' },
          ].map(({ v, label }) => (
            <button key={v} onClick={() => setOpenToMeet(v)} style={btn.option(openToMeet === v)}>{label}</button>
          ))}
        </div>

        {error && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 14px', marginBottom: 16, color: C.red, fontSize: 14 }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
          style={{ ...btn.primary, opacity: allFilled ? 1 : 0.4, cursor: allFilled ? 'pointer' : 'not-allowed' }}
        >
          {submitting ? 'Processing...' : 'Reveal My Purpose Type →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 10 }}>
          🔒 Your information is private and will never be sold or shared.
        </p>
      </div>
    </div>
  )
}

// ─── RADAR CHART ──────────────────────────────────────────────────────────────
function RadarChart({ ratings }) {
  const areas = ['career', 'relationships', 'faith', 'peace']
  const labels = { career: 'Career', relationships: 'Relationships', faith: 'Faith', peace: 'Peace' }
  const cx = 100, cy = 100, r = 70
  const angles = areas.map((_, i) => (i / areas.length) * 2 * Math.PI - Math.PI / 2)
  const gridLevels = [1, 2, 3, 4, 5]
  const toXY = (angle, value) => ({
    x: cx + (r * (value / 5)) * Math.cos(angle),
    y: cy + (r * (value / 5)) * Math.sin(angle),
  })
  const dataPoints = areas.map((a, i) => toXY(angles[i], ratings[a] || 1))
  const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 220, display: 'block', margin: '0 auto' }}>
      {gridLevels.map(l => (
        <polygon key={l} points={angles.map(a => `${cx + (r * l / 5) * Math.cos(a)},${cy + (r * l / 5) * Math.sin(a)}`).join(' ')}
          fill="none" stroke={l === 5 ? '#E5E7EB' : '#F3F4F6'} strokeWidth={l === 5 ? 1.5 : 1} />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#E5E7EB" strokeWidth={1} />
      ))}
      <path d={pathD} fill="rgba(15,33,103,0.15)" stroke={C.navy} strokeWidth={2} />
      {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill={C.navy} />)}
      {areas.map((a, i) => {
        const lp = toXY(angles[i], 5.8)
        return <text key={a} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={C.muted} fontWeight={600}>{labels[a]}</text>
      })}
    </svg>
  )
}

// ─── RESULTS SCREEN ───────────────────────────────────────────────────────────
function ResultsScreen({ purposeType, name, ratings, answers, gateData, onEncounterClick, encounterRequested }) {
  const type = TYPES[purposeType]
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${purposeType.toLowerCase()}` : 'https://purposetype.com'
  const shareMsg = encodeURIComponent(`I just discovered I'm "${type.name}" (like ${type.subtitle.replace('Like ', '')}) — one of the 7 Biblical Purpose Types!\n\nFind out yours here: ${shareUrl}`)
  const waShareLink = `https://wa.me/?text=${shareMsg}`

  return (
    <div style={wrap}>
      {/* Type badge */}
      <div style={{ background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navy} 100%)`, padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Your Biblical Purpose Type</p>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 10 }}>{type.emoji}</div>
            <h1 style={{ color: C.gold, fontSize: 32, fontWeight: 900, margin: '0 0 4px', letterSpacing: -0.5 }}>{type.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, margin: '0 0 16px' }}>{type.subtitle}</p>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 16px', textAlign: 'left' }}>
              <p style={{ color: C.gold, fontSize: 12, fontWeight: 700, margin: '0 0 4px', letterSpacing: 0.5 }}>{type.verse}</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>{type.verseText}</p>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px', display: 'inline-block' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Only </span>
            <span style={{ color: C.gold, fontSize: 15, fontWeight: 700 }}>{type.rarity}%</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}> of people share your type</span>
          </div>
        </div>
      </div>

      <div style={{ ...card, paddingTop: 28, paddingBottom: 48 }}>

        {/* Description */}
        <div style={{ background: C.white, borderRadius: 12, padding: '22px 20px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.gold, letterSpacing: 0.5, textTransform: 'uppercase', margin: '0 0 12px' }}>Who You Are</p>
          <p style={{ fontSize: 16, color: C.text, lineHeight: 1.75, margin: 0 }}>{type.description(name)}</p>
        </div>

        {/* Life satisfaction chart */}
        <div style={{ background: C.white, borderRadius: 12, padding: '22px 20px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.gold, letterSpacing: 0.5, textTransform: 'uppercase', margin: '0 0 4px' }}>Your Life Right Now, {name}</p>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px' }}>Based on what you shared with us</p>
          <RadarChart ratings={ratings} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            {[
              { key: 'career', label: '💼 Career & Purpose' },
              { key: 'relationships', label: '❤️ Relationships' },
              { key: 'faith', label: '✝️ Faith' },
              { key: 'peace', label: '🕊️ Inner Peace' },
            ].map(({ key, label }) => (
              <div key={key} style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: ratings[key] <= 2 ? C.red : ratings[key] === 3 ? C.gold : C.green }}>
                  {ratings[key]}/5
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth edge */}
        <div style={{ background: type.bg, borderRadius: 12, padding: '22px 20px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: type.color, letterSpacing: 0.5, textTransform: 'uppercase', margin: '0 0 12px' }}>Your Growth Edge, {name}</p>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.75, margin: 0 }}>{type.growthEdge}</p>
        </div>

        {/* What they wrote */}
        {answers.q7 && (
          <div style={{ background: C.goldLight, borderRadius: 12, padding: '20px 18px', marginBottom: 20, border: `1px solid #F3D99A` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#92600A', letterSpacing: 0.5, textTransform: 'uppercase', margin: '0 0 8px' }}>You said you wish God would show you...</p>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>"{answers.q7}"</p>
            <p style={{ fontSize: 13, color: '#92600A', marginTop: 12, margin: '12px 0 0', lineHeight: 1.5 }}>
              That prayer matters, {name}. It is not accidental that you carry that question.
            </p>
          </div>
        )}

        {/* Spiritual Encounter CTA */}
        {(gateData.openToMeet === 'yes' || gateData.openToMeet === 'maybe') && !encounterRequested && (
          <div style={{ background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navy} 100%)`, borderRadius: 14, padding: '24px 20px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🕊️</div>
            <h3 style={{ color: C.white, fontSize: 19, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>
              God is not done writing your story, {name}.
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
              Based on what you have shared, we believe there is someone God wants you to meet — not a pastor, not a salesman, but a real person who has walked a similar path.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
              <p style={{ color: C.gold, fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>What is a Spiritual Encounter?</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                A 1-on-1 conversation — over coffee or a meal — with someone who understands the journey you are on. No agenda. No pressure. Just real talk about faith, purpose, and what God might be doing in your life right now.
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontStyle: 'italic', margin: '0 0 18px' }}>
              "If you feel the nudge, say yes. God will take it from there."
            </p>
            <button
              onClick={onEncounterClick}
              style={{ ...btn.primary, background: `linear-gradient(135deg, ${C.gold} 0%, #e8b84b 100%)`, color: C.navyDark, boxShadow: '0 4px 20px rgba(201,151,43,0.4)' }}
            >
              ✝️ Yes — I am Open to a Spiritual Encounter
            </button>
          </div>
        )}

        {encounterRequested && (
          <div style={{ background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '22px 20px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
            <h3 style={{ color: '#166534', fontSize: 17, fontWeight: 800, margin: '0 0 8px' }}>Thank you, {name}.</h3>
            <p style={{ color: '#166534', fontSize: 14, lineHeight: 1.65, margin: 0 }}>
              Someone is being set apart for you. You will receive a WhatsApp message within 24 hours from someone who has a similar purpose type and a story worth hearing. Until then — keep seeking.
            </p>
          </div>
        )}

        {gateData.openToMeet === 'no' && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 18px', marginBottom: 20, textAlign: 'center' }}>
            <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>We respect your space, {name}. If you ever want to connect, we are always here. 🙏</p>
          </div>
        )}

        {/* Share */}
        <div style={{ background: C.white, borderRadius: 12, padding: '20px 18px', marginBottom: 20, border: `1px solid ${C.border}`, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Share with your friends</p>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px' }}>Let them discover their Biblical Purpose Type too</p>
          <a
            href={waShareLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', padding: '14px 20px',
              background: '#25D366', color: C.white,
              borderRadius: 10, fontSize: 15, fontWeight: 700,
              textDecoration: 'none', marginBottom: 10,
            }}
          >
            📲 Share on WhatsApp
          </a>
          <button
            onClick={() => { navigator.clipboard?.writeText(shareUrl); alert('Link copied!') }}
            style={{ ...btn.primary, background: '#F3F4F6', color: C.text, boxShadow: 'none', border: `1px solid ${C.border}` }}
          >
            🔗 Copy Link
          </button>
        </div>

        {/* Trust footer */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            🇸🇬 Built by Christians in Singapore · Free for everyone · Your data is private
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState('landing')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [ratings, setRatings] = useState({ career: 0, relationships: 0, faith: 0, peace: 0 })
  const [purposeType, setPurposeType] = useState(null)
  const [gateData, setGateData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [encounterRequested, setEncounterRequested] = useState(false)

  const totalQ = QUESTIONS.length
  const currentQ = QUESTIONS[qIndex]

  const handleStart = () => setScreen('quiz')

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }))
  }

  const handleRating = (areaId, value) => {
    setRatings(prev => ({ ...prev, [areaId]: value }))
  }

  const handleNext = () => {
    if (qIndex + 1 >= totalQ) {
      setScreen('gate')
    } else {
      setQIndex(i => i + 1)
    }
  }

  const handleGateSubmit = async (data) => {
    setSubmitting(true)
    setSubmitError('')
    const { type } = scoreAnswers(answers)
    setPurposeType(type)
    setGateData(data)

    try {
      await fetch('/api/purpose-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          purposeType: type,
          ratings,
          answers: { q7: answers.q7, q8: answers.q8 },
        }),
      })
    } catch {
      // Silent fail — show results anyway
    }

    setSubmitting(false)
    setScreen('results')
  }

  const handleEncounterClick = async () => {
    try {
      await fetch('/api/purpose-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...gateData,
          purposeType,
          ratings,
          answers: { q7: answers.q7, q8: answers.q8 },
          encounterRequested: true,
          updateEncounter: true,
        }),
      })
    } catch { /* silent */ }
    setEncounterRequested(true)
  }

  if (screen === 'landing') return (
    <>
      <Head>
        <title>Which of the 7 Biblical Purpose Types Are You?</title>
        <meta name="description" content="Discover what God specifically designed you to do — in 3 minutes. Free. Taken by 12,847 Christians." />
        <meta property="og:title" content="Which of the 7 Biblical Purpose Types Are You?" />
        <meta property="og:description" content="Discover what God specifically designed you to do — in 3 minutes. Free. Built by Christians in Singapore." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Landing onStart={handleStart} />
    </>
  )

  if (screen === 'quiz') {
    if (currentQ.type === 'rating') return (
      <>
        <Head><title>Question {qIndex + 1} — Biblical Purpose Types</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
        <RatingQuestion question={currentQ} qIndex={qIndex} total={totalQ} ratings={ratings} onRate={handleRating} onNext={handleNext} />
      </>
    )
    if (currentQ.type === 'opentext') return (
      <>
        <Head><title>Question {qIndex + 1} — Biblical Purpose Types</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
        <OpenTextQuestion question={currentQ} qIndex={qIndex} total={totalQ} value={answers[currentQ.id] || ''} onChange={val => setAnswers(prev => ({ ...prev, [currentQ.id]: val }))} onNext={handleNext} />
      </>
    )
    return (
      <>
        <Head><title>Question {qIndex + 1} — Biblical Purpose Types</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
        <MCQuestion question={currentQ} qIndex={qIndex} total={totalQ} selected={answers[currentQ.id] || null} onSelect={handleAnswer} onNext={handleNext} />
      </>
    )
  }

  if (screen === 'gate') return (
    <>
      <Head><title>Almost There — Biblical Purpose Types</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <GateScreen onSubmit={handleGateSubmit} submitting={submitting} error={submitError} />
    </>
  )

  if (screen === 'results') return (
    <>
      <Head>
        <title>{purposeType ? `I am ${TYPES[purposeType].name} — Biblical Purpose Types` : 'Your Results'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ResultsScreen
        purposeType={purposeType}
        name={gateData?.name || 'Friend'}
        ratings={ratings}
        answers={answers}
        gateData={gateData}
        onEncounterClick={handleEncounterClick}
        encounterRequested={encounterRequested}
      />
    </>
  )

  return null
}
