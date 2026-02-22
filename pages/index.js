import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

// ─── GLOBAL CSS (animations) ──────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; }  to { opacity:1; } }
  @keyframes floatY  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
  @keyframes pulseBtn { 0%,100% { box-shadow:0 6px 28px rgba(245,158,11,0.45); } 50% { box-shadow:0 6px 44px rgba(245,158,11,0.75); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes dotDot { 0%,20% { content:'.'; } 40%,60% { content:'..'; } 80%,100% { content:'...'; } }
  .au  { animation: fadeUp  0.45s ease both; }
  .ai  { animation: fadeIn  0.35s ease both; }
  .af1 { animation-delay: 0.05s; }
  .af2 { animation-delay: 0.10s; }
  .af3 { animation-delay: 0.15s; }
  .af4 { animation-delay: 0.20s; }
  .af5 { animation-delay: 0.25s; }
  .float { animation: floatY 3.2s ease-in-out infinite; }
  .pulseCTA { animation: pulseBtn 2.5s ease-in-out infinite; }
  .opt-card { transition: all 0.18s ease; cursor:pointer; }
  .opt-card:hover { border-color:#0F2167 !important; background:#F0F4FF !important; transform:translateX(3px); }
  .opt-card.sel { background:#0A1628 !important; color:#fff !important; border-color:#F59E0B !important; transform:translateX(4px); }
  @keyframes bubbleIn { from { opacity:0; transform:translateY(14px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes popSel { 0% { transform:scale(1); } 40% { transform:scale(1.06); } 100% { transform:scale(1); } }
  @keyframes glowGold { 0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,0); } 50% { box-shadow:0 0 0 6px rgba(245,158,11,0.25); } }
  .bubble-in { animation: bubbleIn 0.35s cubic-bezier(.2,0,.1,1) both; }
  .opt-icon { transition: background 0.15s ease, border-color 0.15s ease; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .opt-icon:active { opacity:0.85; transform:scale(0.97); }
  .opt-icon.sel { animation: popSel 0.35s ease; }
  button { cursor:pointer; }
  a { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:#0F2167; border-radius:2px; }
`

// ─── COLOURS ──────────────────────────────────────────────────────────────────
const C = {
  navyDark:'#0A1628', navy:'#0F2167', navyLight:'#1a3a9e',
  gold:'#F59E0B',  goldDark:'#D97706', goldPale:'#FFFBEB',
  cream:'#FAFAF8', white:'#FFFFFF',
  text:'#111827', sub:'#374151', muted:'#6B7280',
  border:'#E5E7EB', red:'#DC2626', green:'#059669', purple:'#6D28D9',
}

// ─── TYPE DEFINITIONS (EN + ID) ───────────────────────────────────────────────
const TYPES = {
  BUILDER: {
    id:'BUILDER', emoji:'🏗️', rarity:18, color:'#92400E', bg:'#FEF3C7', barColor:'#D97706',
    verse:'Nehemiah 6:3', verseID:'Nehemia 6:3',
    name:      { EN:'The Builder',    ID:'Sang Pembangun' },
    subtitle:  { EN:'Like Nehemiah',  ID:'Seperti Nehemia' },
    verseText: { EN:'"I am doing a great work and cannot come down."',
                 ID:'"Aku sedang melakukan pekerjaan yang besar dan aku tidak bisa turun."' },
    description:{
      EN:(n)=>`${n}, you are called to build — not just with your hands, but with vision, strategy, and faithfulness. Like Nehemiah, who rebuilt Jerusalem's walls while opposition surrounded him, you see what could be and refuse to settle for what is. You carry a divine blueprint for something that hasn't been built yet. People follow your clarity because they sense God is in it.`,
      ID:(n)=>`${n}, kamu dipanggil untuk membangun — bukan hanya dengan tanganmu, tapi dengan visi, strategi, dan kesetiaan. Seperti Nehemia, yang membangun kembali tembok Yerusalem di tengah tentangan besar, kamu melihat apa yang bisa ada dan menolak puas dengan apa yang ada sekarang. Kamu membawa cetak biru ilahi untuk sesuatu yang belum dibangun. Orang mengikuti kejelasanmu karena mereka merasakan Allah ada di sana.`,
    },
    growthEdge:{
      EN:`Builders can get so focused on the work that they forget to rest in the One behind all things. Your next growth edge: learn to build from a place of rest, not striving — to receive from God before you give to others.`,
      ID:`Para Pembangun bisa begitu fokus pada pekerjaan hingga melupakan istirahat dalam Dia. Area pertumbuhanmu: belajar membangun dari tempat istirahat, bukan perjuangan — terima dari Allah sebelum memberi kepada orang lain.`,
    },
  },
  HEALER: {
    id:'HEALER', emoji:'💚', rarity:16, color:'#065F46', bg:'#D1FAE5', barColor:'#059669',
    verse:'Isaiah 61:1', verseID:'Yesaya 61:1',
    name:      { EN:'The Healer',  ID:'Sang Penyembuh' },
    subtitle:  { EN:'Like Luke',   ID:'Seperti Lukas' },
    verseText: { EN:'"He has sent me to bind up the brokenhearted."',
                 ID:'"Ia telah mengutus aku untuk membalut yang patah hati."' },
    description:{
      EN:(n)=>`${n}, you are called to restore what is broken. Like Luke the physician, you notice pain that others walk past. Where others see problems, you see people. Your presence alone brings comfort — and your calling is to be a channel of God's healing grace in a world full of wounds. That tenderness in you is not weakness. It is your anointing.`,
      ID:(n)=>`${n}, kamu dipanggil untuk memulihkan yang rusak. Seperti Lukas sang tabib, kamu memperhatikan rasa sakit yang dilewati orang lain. Di mana orang lain melihat masalah, kamu melihat manusia. Kehadiranmu saja sudah membawa kenyamanan — dan panggilanmu adalah menjadi saluran kasih penyembuhan Allah. Kelembutanmu itu bukan kelemahan. Itu pengurapanmu.`,
    },
    growthEdge:{
      EN:`Healers often pour out for others while neglecting their own soul. Your growth edge: allow God — and others — to minister to you first. You cannot give from an empty well.`,
      ID:`Para Penyembuh sering mencurahkan diri untuk orang lain sambil mengabaikan jiwa mereka sendiri. Area pertumbuhanmu: biarkan Allah — dan orang lain — melayanimu terlebih dahulu. Kamu tidak bisa memberi dari sumur yang kosong.`,
    },
  },
  SEEKER: {
    id:'SEEKER', emoji:'🔍', rarity:14, color:'#1E3A8A', bg:'#DBEAFE', barColor:'#3B82F6',
    verse:'Proverbs 25:2', verseID:'Amsal 25:2',
    name:      { EN:'The Seeker',   ID:'Sang Pencari' },
    subtitle:  { EN:'Like Solomon', ID:'Seperti Salomo' },
    verseText: { EN:'"It is the glory of God to conceal a matter; to search it out is the glory of kings."',
                 ID:'"Adalah kemuliaan Allah untuk merahasiakan suatu perkara; kemuliaan para raja untuk menyelidikinya."' },
    description:{
      EN:(n)=>`${n}, you are called to pursue wisdom — to ask the questions others are afraid to ask and find answers that change lives. Like Solomon, you have a hunger for truth that goes beyond the surface. You're not satisfied with easy answers, and that holy restlessness is a gift. The questions that keep you up at night are exactly what God wants you to carry.`,
      ID:(n)=>`${n}, kamu dipanggil untuk mengejar hikmat — menanyakan pertanyaan yang ditakuti orang lain dan menemukan jawaban yang mengubah hidup. Seperti Salomo, kamu lapar akan kebenaran yang melampaui permukaan. Kamu tidak puas dengan jawaban mudah, dan kegelisahan kudus itu adalah karunia. Pertanyaan-pertanyaan yang membuatmu tidak bisa tidur itu adalah tepat yang Allah ingin kamu bawa.`,
    },
    growthEdge:{
      EN:`Seekers can wander alone in their questions. Your growth edge: find a community to seek alongside — truth is sharpest when shared, and your questions deserve real conversation.`,
      ID:`Para Pencari bisa mengembara sendirian dalam pertanyaan mereka. Area pertumbuhanmu: temukan komunitas untuk mencari bersama — kebenaran paling tajam ketika dibagikan, dan pertanyaan-pertanyaanmu layak mendapat percakapan nyata.`,
    },
  },
  SHEPHERD: {
    id:'SHEPHERD', emoji:'🌿', rarity:15, color:'#5B21B6', bg:'#EDE9FE', barColor:'#7C3AED',
    verse:'Psalm 23:1', verseID:'Mazmur 23:1',
    name:      { EN:'The Shepherd', ID:'Sang Gembala' },
    subtitle:  { EN:'Like David',   ID:'Seperti Daud' },
    verseText: { EN:'"The Lord is my shepherd; I shall not want."',
                 ID:'"TUHAN adalah gembalaku, takkan kekurangan aku."' },
    description:{
      EN:(n)=>`${n}, you are called to lead with love. Like David — a shepherd before he was a king — you have a natural instinct to protect, guide, and care for those in your circle. People feel safe around you. Your leadership doesn't demand followers; it earns them. The people God has placed around you are not accidents — they are your flock.`,
      ID:(n)=>`${n}, kamu dipanggil untuk memimpin dengan kasih. Seperti Daud — seorang gembala sebelum menjadi raja — kamu punya insting alami untuk melindungi, membimbing, dan merawat. Orang merasa aman di sekitarmu. Kepemimpinanmu tidak menuntut pengikut; kepemimpinanmu mendapatkannya. Orang-orang yang Allah tempatkan di sekitarmu bukan kebetulan — mereka adalah kawananmu.`,
    },
    growthEdge:{
      EN:`Shepherds carry the weight of everyone else's wellbeing until they're completely empty. Your growth edge: let the Good Shepherd lead you first — you cannot shepherd others from a depleted soul.`,
      ID:`Para Gembala menanggung beban kesejahteraan semua orang hingga benar-benar kosong. Area pertumbuhanmu: biarkan Gembala Yang Baik memimpinmu terlebih dahulu — kamu tidak bisa menggembalakan orang lain dari jiwa yang habis.`,
    },
  },
  CATALYST: {
    id:'CATALYST', emoji:'🔥', rarity:12, color:'#991B1B', bg:'#FEE2E2', barColor:'#EF4444',
    verse:'Romans 1:16', verseID:'Roma 1:16',
    name:      { EN:'The Catalyst', ID:'Sang Katalis' },
    subtitle:  { EN:'Like Paul',    ID:'Seperti Paulus' },
    verseText: { EN:'"I am not ashamed of the gospel, for it is the power of God."',
                 ID:'"Sebab aku tidak malu terhadap Injil, karena Injil adalah kekuatan Allah."' },
    description:{
      EN:(n)=>`${n}, you are called to ignite. Like Paul, who turned the ancient world upside down, you carry a fire that refuses to be contained. You see potential where others see obstacles. You start movements, not just moments — and people catch your flame when they're near you. God placed that urgency in you on purpose.`,
      ID:(n)=>`${n}, kamu dipanggil untuk menyalakan api. Seperti Paulus, yang mengubah dunia kuno, kamu membawa api yang tidak bisa dibendung. Kamu melihat potensi di mana orang lain melihat hambatan. Kamu memulai gerakan, bukan sekadar momen — dan orang-orang menangkap apimu ketika dekat denganmu. Allah menempatkan urgensi itu dalam dirimu dengan sengaja.`,
    },
    growthEdge:{
      EN:`Catalysts burn bright — and can burn out. Your growth edge: cultivate deep inner peace that sustains the fire for decades, not just seasons. Go deep before you go wide.`,
      ID:`Para Katalis terbakar terang — dan bisa terbakar habis. Area pertumbuhanmu: tumbuhkan kedamaian batin yang mendalam yang mempertahankan api selama beberapa dekade. Pergi dalam sebelum pergi luas.`,
    },
  },
  CREATOR: {
    id:'CREATOR', emoji:'✨', rarity:13, color:'#78350F', bg:'#FEF9C3', barColor:'#CA8A04',
    verse:'Exodus 31:3', verseID:'Keluaran 31:3',
    name:      { EN:'The Creator',  ID:'Sang Pencipta' },
    subtitle:  { EN:'Like Bezalel', ID:'Seperti Bezaleel' },
    verseText: { EN:'"I have filled him with the Spirit of God, with wisdom, understanding, and knowledge in all kinds of crafts."',
                 ID:'"Aku telah memenuhi dia dengan Roh Allah, dengan keahlian, pengertian, dan pengetahuan dalam segala jenis kerajinan."' },
    description:{
      EN:(n)=>`${n}, you are called to reflect God's beauty. Like Bezalel — the very first person in Scripture filled with the Spirit of God — your creativity is not just talent. It's a calling. You are wired to express the invisible things of God in ways people can see, hear, and feel. When you create, God is speaking through you.`,
      ID:(n)=>`${n}, kamu dipanggil untuk mencerminkan keindahan Allah. Seperti Bezaleel — orang pertama dalam Alkitab yang dipenuhi Roh Allah — kreativitasmu bukan sekadar bakat. Ini adalah panggilan. Kamu dirancang untuk mengekspresikan hal-hal tak terlihat dari Allah dengan cara yang bisa orang lihat, dengar, dan rasakan. Ketika kamu mencipta, Allah berbicara melaluimu.`,
    },
    growthEdge:{
      EN:`Creators can create from comparison or insecurity. Your growth edge: learn to create as an act of worship, not performance — from overflow, not emptiness. Your best work comes from rest.`,
      ID:`Para Pencipta bisa menciptakan dari perbandingan atau ketidakamanan. Area pertumbuhanmu: belajar menciptakan sebagai tindakan ibadah, bukan pertunjukan — dari kelimpahan, bukan kekosongan. Karya terbaikmu datang dari istirahat.`,
    },
  },
  ANCHOR: {
    id:'ANCHOR', emoji:'⚓', rarity:12, color:'#134E4A', bg:'#CCFBF1', barColor:'#0D9488',
    verse:'Ruth 1:16', verseID:'Rut 1:16',
    name:      { EN:'The Anchor', ID:'Sang Jangkar' },
    subtitle:  { EN:'Like Ruth',  ID:'Seperti Rut' },
    verseText: { EN:'"Where you go, I will go. Your people shall be my people."',
                 ID:'"Ke mana engkau pergi, ke sana jugalah aku pergi. Bangsamu adalah bangsaku."' },
    description:{
      EN:(n)=>`${n}, you are called to stay. Like Ruth, whose radical faithfulness changed the entire bloodline of history, your greatest strength is your loyalty — to God, to people, to promises. In a world of quitters, you are the rare person who holds steady when everything shakes. That faithfulness is more powerful than you know.`,
      ID:(n)=>`${n}, kamu dipanggil untuk tetap. Seperti Rut, yang kesetiaannya mengubah garis keturunan sejarah, kekuatan terbesarmu adalah loyalitasmu — kepada Allah, kepada orang-orang, kepada janji-janji. Di dunia yang penuh orang yang menyerah, kamulah orang langka yang tetap kokoh ketika semua berguncang. Kesetiaan itu lebih kuat dari yang kamu tahu.`,
    },
    growthEdge:{
      EN:`Anchors can mistake endurance for passivity. Your growth edge: allow God to expand your vision — you are called to more than staying. You are called to go with purpose.`,
      ID:`Para Jangkar bisa mengira ketahanan sebagai kepasifan. Area pertumbuhanmu: biarkan Allah memperluas visimu — kamu dipanggil untuk lebih dari sekadar bertahan. Kamu dipanggil untuk pergi dengan tujuan.`,
    },
  },
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  EN: {
    langBtn: 'ID 🇮🇩',
    badge: '✝️ FREE  ·  3 MINUTES  ·  12,847 CHRISTIANS',
    heroTitle: 'God Wired You\nDifferently.',
    heroSub: 'Discover the specific Blueprint God crafted for your life — in 3 minutes.',
    verseRef: 'JEREMIAH 29:11',
    verseText: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    cta: 'Reveal My Blueprint →',
    painHeading: 'Does any of this sound like you?',
    pains: [
      '😔  You believe in God — but your faith feels stuck or empty.',
      '🔎  You sense you were made for something more, but can\'t quite name it.',
      '🚶  You\'ve drifted from church, but haven\'t stopped believing.',
      '💭  The things that truly light you up feel disconnected from your "Christian duty".',
    ],
    painClose: 'If even one of these resonates — this was built for you.',
    whyHeading: 'Why You Need to Know Your Blueprint',
    whySub: 'Without it, most Christians spend their whole life doing good things — instead of the right things for how God specifically made them.',
    whys: [
      { icon:'🔄', text:'You stop comparing yourself to Christians wired completely differently to you.' },
      { icon:'💡', text:'Your gifts, your frustrations, even your blind spots — suddenly all make sense.' },
      { icon:'🎯', text:'You know exactly where to invest your energy — and what to let go of.' },
      { icon:'🕊️', text:'You stop feeling guilty for not being more like someone else. God made you to be you.' },
    ],
    typesHeading: 'The 7 Biblical Blueprints',
    typesRarity: pct => `Only ${pct}% of people`,
    proofNum: '12,847',
    proofText: 'Christians across Southeast Asia have discovered their Blueprint',
    testimonials: [
      { text: 'I cried reading my result. It described me so accurately that I had to reread it twice.', name: 'Rachel T.', city: 'Jakarta' },
      { text: 'Finally I understand why I am wired the way I am. This isn\'t just a quiz — it\'s a mirror.', name: 'Joshua L.', city: 'Batam' },
      { text: 'I shared it with all my friends. 4 of them cried too. This is different from anything I have seen.', name: 'Maria P.', city: 'Surabaya' },
    ],
    ctaBottom: 'Your Blueprint has been waiting to be revealed.',
    trust: ['🔒 No account', '🚫 No download', '💰 Completely free', '🇸🇬 By Christians in Singapore'],
    disclaimer: 'This is not a church recruitment tool. We built this because we genuinely believe God designed you with a specific Blueprint — and we want to help you find it.',
    qOf: (n,t) => `Clue ${n} of ${t}`,
    pct: p => p < 40 ? 'Your Blueprint is forming…' : p < 75 ? 'A picture is taking shape…' : 'Almost revealed…',
    continue: 'Continue →',
    seeResults: 'See My Blueprint →',
    ratingLow: '1 — Struggling',
    ratingHigh: '5 — Thriving',
    gateTitle: '🎯 Your Blueprint is Ready!',
    gateSub: 'Tell us a little about yourself so we can personalise your full report.',
    secContact: '📋 Your Details',
    fldName: 'First Name *',
    phName: 'e.g. Joshua',
    fldWA: 'WhatsApp Number *',
    waHint: '(Indonesian number)',
    phWA: 'e.g. 0812-3456-7890',
    waPriv: '🔒 Only used to send your report. Never shared.',
    fldEmail: 'Email (optional)',
    phEmail: 'yourname@email.com',
    secFaith: '✝️ Your Faith Journey',
    faithHint: 'Where are you right now? (Choose the one that fits most)',
    faithOpts: [
      'Growing and thriving in my faith',
      'I believe, but I\'m feeling stuck or confused',
      'I have questions about my faith that have never been answered',
      'I believe in God/Jesus, but I\'ve stepped away from church',
      'I\'m beginning to explore who Jesus really is',
    ],
    secChurch: '⛪ Your Church Life',
    churchOpts: [
      'Actively involved in a church',
      'Attending occasionally',
      'Looking for a church home',
      'Not attending, but open to community',
      'Not currently attending',
    ],
    secAvail: '🕐 When are you usually free?',
    availHint: 'Select all that apply',
    availOpts: [
      { v:'mornings',   label:'🌅 Weekday mornings' },
      { v:'afternoons', label:'☀️ Weekday afternoons' },
      { v:'evenings',   label:'🌙 Weekday evenings' },
      { v:'weekends',   label:'🗓️ Weekends' },
    ],
    secMeet: '☕ One Last Question',
    meetPrompt: 'If someone with a similar Blueprint wanted to connect with you — just a casual coffee chat — how would you feel?',
    meetOpts: [
      { v:'yes',    label:"😊 I'd love that — I'm open to it!" },
      { v:'maybe',  label:'🤔 Maybe — depends on who it is' },
      { v:'online', label:"💬 I'd prefer to stay in touch online for now" },
      { v:'no',     label:'🙏 Not right now, but thank you' },
    ],
    submitBtn: 'Reveal My Blueprint →',
    submitting: 'Revealing...',
    gatePriv: '🔒 Your information is private and will never be sold or shared.',
    waErr: 'Please enter a valid Indonesian WhatsApp number (e.g. 0812-3456-7890).',
    loadLines: ['Analysing your answers…', 'Matching your patterns…', 'Consulting the 7 Blueprints…', 'Preparing your revelation…'],
    resBadge: 'YOUR BIBLICAL BLUEPRINT',
    resRarity: (pct, name) => `Only ${pct}% of people share your Blueprint, ${name}`,
    resWho: 'Who You Are',
    resLife: name => `Your Life Right Now, ${name}`,
    resLifeSub: 'Based on what you shared',
    resGrowth: name => `Your Growth Edge, ${name}`,
    resWishTitle: 'You said you wish God would show you…',
    resWishClose: name => `That prayer matters, ${name}. It is not accidental that you carry that question.`,
    encStep1: 'Be honest with yourself for a moment.',
    encStep2: "You\u2019ve tried figuring it out on your own. The reading. The searching. The late-night prayers that feel like they hit the ceiling. But the emptiness hasn\u2019t left. The questions haven\u2019t gone away.",
    encStep3: name => `${name}, you are so close.`,
    encStep3Body: "Everything you\u2019ve shared \u2014 your answers, your longings, the areas where you\u2019re struggling \u2014 they reveal something. You are not lost. You are on the edge of a breakthrough. But you can\u2019t cross it alone.",
    encTitle: name => `${name}, there is one step left.`,
    encBody: "God doesn\u2019t just give you answers through an app. When the time is right, He sends someone. Someone anointed to speak into your life. Someone who carries what you\u2019ve been missing. This is not a coincidence \u2014 you were led here for a reason.",
    encCTA: 'I\u2019m Ready',
    encDoneTitle: name => `${name}, heaven has heard you.`,
    encDoneBody: "Someone has been set apart for this very moment. You will receive a WhatsApp message within 24 hours. When they reach out \u2014 receive them. God does not send people by accident.",
    noMeet: name => `We respect your space, ${name}. But know this \u2014 when the time is right, God will make a way. 🙏`,
    shareTitle: 'Share with your friends',
    shareSub: 'Let them discover their Biblical Blueprint too',
    shareWA: '📲 Share on WhatsApp',
    copyLink: '🔗 Copy Link',
    copyAlert: 'Link copied!',
    footer: '🇸🇬 Built by Christians in Singapore · Free for everyone · Your data is private',
    lifeKeys: [
      { k:'career',        label:'💼 Career & Purpose' },
      { k:'relationships', label:'❤️ Relationships' },
      { k:'faith',         label:'✝️ Faith' },
      { k:'peace',         label:'🕊️ Inner Peace' },
    ],
  },

  ID: {
    langBtn: 'EN 🇬🇧',
    badge: '✝️ GRATIS  ·  3 MENIT  ·  12.847 ORANG KRISTEN',
    heroTitle: 'Kamu Bukan\nKebetulan.',
    heroSub: 'Temukan Blueprint spesifik yang Tuhan rancang untuk hidupmu — dalam 3 menit.',
    verseRef: 'YEREMIA 29:11',
    verseText: '"Aku mengetahui rancangan-rancangan yang ada pada-Ku mengenai kamu," firman TUHAN, "yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan."',
    cta: 'Ungkap Blueprintku →',
    painHeading: 'Apakah ini terdengar familiar bagimu?',
    pains: [
      '😔  Kamu percaya Tuhan — tapi imanmu terasa mandek atau hampa.',
      '🔎  Kamu merasa ada sesuatu yang lebih besar dalam hidupmu, tapi tidak tahu apa.',
      '🚶  Kamu sudah lama tidak ke gereja, tapi tidak berhenti percaya.',
      '💭  Hal-hal yang membuatmu bersemangat terasa tidak nyambung dengan "kewajiban Kristen".',
    ],
    painClose: 'Jika salah satu dari ini terasa nyata — kuis ini dibuat untukmu.',
    whyHeading: 'Kenapa Kamu Perlu Tahu Blueprintmu',
    whySub: 'Tanpa itu, banyak orang Kristen menghabiskan seluruh hidupnya melakukan hal-hal baik — bukan hal-hal yang tepat sesuai cara Tuhan merancang mereka.',
    whys: [
      { icon:'🔄', text:'Kamu berhenti membandingkan dirimu dengan orang Kristen yang dirancang sangat berbeda darimu.' },
      { icon:'💡', text:'Karuniamu, frustrasimu, bahkan titik butamu — tiba-tiba semua masuk akal.' },
      { icon:'🎯', text:'Kamu tahu persis di mana menginvestasikan energimu — dan apa yang harus kamu lepaskan.' },
      { icon:'🕊️', text:'Kamu berhenti merasa bersalah karena tidak menjadi seperti orang lain. Tuhan membuatmu untuk menjadi dirimu.' },
    ],
    typesHeading: '7 Biblical Blueprint',
    typesRarity: pct => `Hanya ${pct}% orang`,
    proofNum: '12.847',
    proofText: 'orang Kristen di Asia Tenggara telah menemukan Blueprint mereka',
    testimonials: [
      { text: 'Aku nangis baca hasilnya. Persis menggambarkan aku sampai aku baca ulang dua kali.', name: 'Rachel T.', city: 'Jakarta' },
      { text: 'Akhirnya aku mengerti kenapa aku diciptakan seperti ini. Ini bukan sekadar kuis — ini cermin.', name: 'Joshua L.', city: 'Batam' },
      { text: 'Aku share ke semua temanku. 4 orang juga menangis. Ini beda dari semua yang pernah aku lihat.', name: 'Maria P.', city: 'Surabaya' },
    ],
    ctaBottom: 'Blueprintmu sudah menunggu untuk diungkap.',
    trust: ['🔒 Tanpa akun', '🚫 Tanpa unduhan', '💰 Sepenuhnya gratis', '🇸🇬 Oleh Kristen di Singapura'],
    disclaimer: 'Ini bukan alat rekrutmen gereja. Kami membangun ini karena kami sungguh percaya Allah merancangmu dengan Blueprint spesifik — dan kami ingin membantumu menemukannya.',
    qOf: (n,t) => `Petunjuk ${n} dari ${t}`,
    pct: p => p < 40 ? 'Blueprintmu sedang terbentuk…' : p < 75 ? 'Gambaran mulai terlihat…' : 'Hampir terungkap…',
    continue: 'Lanjutkan →',
    seeResults: 'Lihat Blueprintku →',
    ratingLow: '1 — Kesulitan',
    ratingHigh: '5 — Berkembang',
    gateTitle: '🎯 Blueprintmu Sudah Siap!',
    gateSub: 'Ceritakan sedikit tentang dirimu agar kami bisa mempersonalisasi laporanmu.',
    secContact: '📋 Detail Kamu',
    fldName: 'Nama Depan *',
    phName: 'misal: Joshua',
    fldWA: 'Nomor WhatsApp *',
    waHint: '(nomor Indonesia)',
    phWA: 'misal: 0812-3456-7890',
    waPriv: '🔒 Hanya digunakan untuk mengirim laporanmu. Tidak pernah dibagikan.',
    fldEmail: 'Email (opsional)',
    phEmail: 'namamu@email.com',
    secFaith: '✝️ Perjalanan Imanmu',
    faithHint: 'Di mana kamu sekarang? (Pilih yang paling sesuai)',
    faithOpts: [
      'Bertumbuh dan berkembang dalam imanku',
      'Aku percaya, tapi merasa stuck atau bingung',
      'Aku punya pertanyaan tentang imanku yang belum terjawab',
      'Aku percaya Tuhan/Yesus, tapi sudah lama tidak ke gereja',
      'Aku sedang mulai menjelajahi siapa Yesus sebenarnya',
    ],
    secChurch: '⛪ Kehidupan Gerejamu',
    churchOpts: [
      'Aktif terlibat dalam gereja',
      'Hadir sesekali',
      'Sedang mencari gereja',
      'Tidak hadir, tapi terbuka untuk komunitas',
      'Tidak hadir saat ini',
    ],
    secAvail: '🕐 Kapan kamu biasanya bebas?',
    availHint: 'Pilih semua yang berlaku',
    availOpts: [
      { v:'mornings',   label:'🌅 Pagi hari kerja' },
      { v:'afternoons', label:'☀️ Siang hari kerja' },
      { v:'evenings',   label:'🌙 Malam hari kerja' },
      { v:'weekends',   label:'🗓️ Akhir pekan' },
    ],
    secMeet: '☕ Satu Pertanyaan Terakhir',
    meetPrompt: 'Jika seseorang dengan Blueprint serupa ingin terhubung denganmu — hanya ngobrol santai sambil ngopi — bagaimana perasaanmu?',
    meetOpts: [
      { v:'yes',    label:'😊 Mau banget — aku terbuka!' },
      { v:'maybe',  label:'🤔 Mungkin — tergantung orangnya' },
      { v:'online', label:'💬 Lebih suka terhubung online dulu' },
      { v:'no',     label:'🙏 Belum sekarang, tapi terima kasih' },
    ],
    submitBtn: 'Ungkap Blueprintku →',
    submitting: 'Mengungkap...',
    gatePriv: '🔒 Informasimu bersifat privat dan tidak akan dijual atau dibagikan.',
    waErr: 'Masukkan nomor WhatsApp Indonesia yang valid (misal: 0812-3456-7890).',
    loadLines: ['Menganalisis jawabanmu…', 'Mencocokkan polamu…', 'Memeriksa 7 Blueprint…', 'Menyiapkan pengungkapanmu…'],
    resBadge: 'BIBLICAL BLUEPRINT-MU',
    resRarity: (pct, name) => `Hanya ${pct}% orang berbagi Blueprint ini, ${name}`,
    resWho: 'Siapa Kamu',
    resLife: name => `Hidupmu Saat Ini, ${name}`,
    resLifeSub: 'Berdasarkan apa yang kamu bagikan',
    resGrowth: name => `Area Pertumbuhanmu, ${name}`,
    resWishTitle: 'Kamu bilang kamu berharap Tuhan menunjukkan…',
    resWishClose: name => `Doa itu penting, ${name}. Bukan kebetulan kamu membawa pertanyaan itu.`,
    encStep1: 'Jujurlah pada dirimu sendiri sejenak.',
    encStep2: 'Kamu sudah mencoba mencari jawabannya sendiri. Membaca. Mencari. Berdoa larut malam yang terasa tak sampai. Tapi kekosongan itu belum pergi. Pertanyaan itu belum terjawab.',
    encStep3: name => `${name}, kamu sudah sangat dekat.`,
    encStep3Body: 'Semua yang kamu bagikan \u2014 jawabanmu, kerinduanmu, area di mana kamu berjuang \u2014 mengungkapkan sesuatu. Kamu tidak tersesat. Kamu ada di ambang terobosan. Tapi kamu tidak bisa melewatinya sendiri.',
    encTitle: name => `${name}, ada satu langkah terakhir.`,
    encBody: 'Tuhan tidak hanya memberimu jawaban lewat aplikasi. Ketika waktunya tepat, Dia mengutus seseorang. Seseorang yang diurapi untuk berbicara ke dalam hidupmu. Seseorang yang membawa apa yang selama ini kamu cari. Ini bukan kebetulan \u2014 kamu dituntun ke sini karena suatu alasan.',
    encCTA: 'Aku Siap',
    encDoneTitle: name => `${name}, surga telah mendengarmu.`,
    encDoneBody: 'Seseorang telah disiapkan untuk saat ini. Kamu akan menerima pesan WhatsApp dalam 24 jam. Ketika mereka menghubungimu \u2014 terimalah. Tuhan tidak mengutus orang secara kebetulan.',
    noMeet: name => `Kami menghormati ruangmu, ${name}. Tapi ketahuilah \u2014 ketika waktunya tepat, Tuhan akan membuka jalan. 🙏`,
    shareTitle: 'Bagikan ke temanmu',
    shareSub: 'Biarkan mereka menemukan Biblical Blueprint mereka juga',
    shareWA: '📲 Bagikan di WhatsApp',
    copyLink: '🔗 Salin Link',
    copyAlert: 'Link tersalin!',
    footer: '🇸🇬 Dibuat oleh Kristen di Singapura · Gratis untuk semua · Data kamu aman',
    lifeKeys: [
      { k:'career',        label:'💼 Karier' },
      { k:'relationships', label:'❤️ Hubungan' },
      { k:'faith',         label:'✝️ Iman' },
      { k:'peace',         label:'🕊️ Kedamaian' },
    ],
  },
}

// ─── QUESTIONS (bilingual) ────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id:'q1',
    teaser:{ EN:'Your childhood dream held a divine clue…', ID:'Impian masa kecilmu menyimpan petunjuk ilahi…' },
    text:{ EN:'As a child, what did you dream of becoming?', ID:'Saat kamu kecil, apa yang kamu impikan untuk menjadi?' },
    options:[
      { icon:'🏗️', short:{ EN:'Build things',     ID:'Membangun sesuatu'       }, label:{ EN:'An engineer, architect, or someone who builds things',        ID:'Seorang insinyur, arsitek, atau seseorang yang membangun sesuatu'     }, type:'BUILDER'  },
      { icon:'🩺', short:{ EN:'Heal people',      ID:'Menyembuhkan orang'      }, label:{ EN:'A doctor, nurse, or someone who heals people',                ID:'Dokter, perawat, atau seseorang yang menyembuhkan orang'             }, type:'HEALER'   },
      { icon:'📚', short:{ EN:'Explore ideas',    ID:'Menjelajahi ide'         }, label:{ EN:'A teacher, researcher, or explorer of ideas',                 ID:'Guru, peneliti, atau penjelajah ide'                                 }, type:'SEEKER'   },
      { icon:'🤝', short:{ EN:'Guide others',     ID:'Membimbing orang lain'   }, label:{ EN:'A leader, mentor, or someone who guides others',             ID:'Pemimpin, mentor, atau seseorang yang membimbing orang lain'         }, type:'SHEPHERD' },
      { icon:'🚀', short:{ EN:'Make it happen',   ID:'Buat sesuatu terjadi'    }, label:{ EN:'An entrepreneur or someone who makes things happen',          ID:'Pengusaha atau seseorang yang membuat sesuatu terjadi'               }, type:'CATALYST' },
      { icon:'🎨', short:{ EN:'Create & express', ID:'Berkreasi'               }, label:{ EN:'An artist, musician, writer, or creative',                   ID:'Seniman, musisi, penulis, atau kreator'                             }, type:'CREATOR'  },
      { icon:'🏡', short:{ EN:'Stay faithful',    ID:'Tetap setia'             }, label:{ EN:'Someone faithful — close to family and deeply loyal',         ID:'Seseorang yang setia — dekat dengan keluarga dan sangat loyal'       }, type:'ANCHOR'   },
    ],
  },
  {
    id:'q2',
    teaser:{ EN:'What captivates you reveals exactly how God wired you.', ID:'Apa yang paling menyita perhatianmu mengungkap cara Tuhan merancangmu.' },
    text:{ EN:'What activity makes you completely lose track of time?', ID:'Aktivitas apa yang membuatmu benar-benar lupa waktu?' },
    options:[
      { icon:'🔧', short:{ EN:'Build or design',    ID:'Membangun/merancang'    }, label:{ EN:'Building, fixing, or designing something meaningful',           ID:'Membangun, memperbaiki, atau merancang sesuatu yang bermakna'        }, type:'BUILDER'  },
      { icon:'💙', short:{ EN:'Help the hurting',   ID:'Bantu yang terluka'     }, label:{ EN:'Sitting with someone who is hurting and truly helping them',    ID:'Menemani seseorang yang terluka dan benar-benar membantunya'         }, type:'HEALER'   },
      { icon:'📖', short:{ EN:'Study & discuss',    ID:'Belajar/berdiskusi'     }, label:{ EN:'Reading, studying, or having really deep conversations',        ID:'Membaca, belajar, atau berdiskusi sangat mendalam'                   }, type:'SEEKER'   },
      { icon:'🌱', short:{ EN:'Mentor someone',     ID:'Membimbing seseorang'   }, label:{ EN:"Mentoring, guiding, or investing in someone's growth",         ID:'Membimbing atau berinvestasi dalam pertumbuhan seseorang'            }, type:'SHEPHERD' },
      { icon:'⚡', short:{ EN:'Launch new things',  ID:'Luncurkan hal baru'     }, label:{ EN:'Launching something new and watching it come alive',           ID:'Meluncurkan sesuatu yang baru dan melihatnya hidup'                  }, type:'CATALYST' },
      { icon:'🎶', short:{ EN:'Create anything',    ID:'Menciptakan apa saja'   }, label:{ EN:'Creating — art, music, writing, or anything expressive',       ID:'Menciptakan — seni, musik, tulisan, atau apa pun yang ekspresif'    }, type:'CREATOR'  },
      { icon:'❤️', short:{ EN:'Be with loved ones', ID:'Bersama orang tercinta' }, label:{ EN:'Simply being present with the people I love most',             ID:'Sekadar hadir bersama orang-orang yang paling kucintai'             }, type:'ANCHOR'   },
    ],
  },
  {
    id:'q3',
    teaser:{ EN:'Your instinct toward pain is a direct pointer to your purpose.', ID:'Instinkmu terhadap rasa sakit menunjuk langsung pada tujuanmu.' },
    text:{ EN:'When you see suffering or injustice, what is your first instinct?', ID:'Ketika kamu melihat penderitaan atau ketidakadilan, apa instink pertamamu?' },
    options:[
      { icon:'🔨', short:{ EN:'Fix it fast',       ID:'Perbaiki segera'         }, label:{ EN:'Fix it — find a practical solution and build a path forward',    ID:'Perbaiki — temukan solusi praktis dan bangun jalan ke depan'         }, type:'BUILDER'  },
      { icon:'🤗', short:{ EN:'Comfort them',      ID:'Menghibur mereka'        }, label:{ EN:'Go to the person first and comfort them',                       ID:'Pergi ke orangnya terlebih dahulu dan menghiburnya'                  }, type:'HEALER'   },
      { icon:'🔬', short:{ EN:'Research why',      ID:'Teliti penyebabnya'      }, label:{ EN:"Research and understand what's truly causing it",               ID:'Meneliti dan memahami apa yang benar-benar menyebabkannya'           }, type:'SEEKER'   },
      { icon:'🛡️', short:{ EN:'Protect the weak',  ID:'Lindungi yang rentan'    }, label:{ EN:'Protect and stand with the most vulnerable',                   ID:'Melindungi dan berpihak pada yang paling rentan'                    }, type:'SHEPHERD' },
      { icon:'📢', short:{ EN:'Rally others',      ID:'Gerakkan semua orang'   }, label:{ EN:'Rally others and spark a movement for change',                  ID:'Menggerakkan orang lain dan memicu pergerakan perubahan'             }, type:'CATALYST' },
      { icon:'✍️', short:{ EN:'Tell their story',  ID:'Ceritakan kisahnya'      }, label:{ EN:'Tell the story in a way that moves hearts and minds',           ID:'Menceritakan kisah itu dengan cara yang menggerakkan hati'           }, type:'CREATOR'  },
      { icon:'🌿', short:{ EN:'Stay beside them',  ID:'Tetap di sisinya'        }, label:{ EN:'Stay faithful to those affected — long-term, quietly',          ID:'Tetap setia bagi yang terdampak — jangka panjang, dengan tenang'    }, type:'ANCHOR'   },
    ],
  },
  {
    id:'q4',
    teaser:{ EN:'The role others need from you is almost never an accident.', ID:'Peran yang dibutuhkan orang darimu hampir tidak pernah kebetulan.' },
    text:{ EN:'In your circle, people usually come to you when they need…', ID:'Di lingkunganmu, orang biasanya datang ke kamu ketika mereka butuh…' },
    options:[
      { icon:'⚙️', short:{ EN:'A practical fix',    ID:'Solusi praktis'         }, label:{ EN:'A practical solution — someone who can make it actually happen', ID:'Solusi praktis — seseorang yang bisa membuatnya benar-benar terjadi' }, type:'BUILDER'  },
      { icon:'💗', short:{ EN:'Emotional support',  ID:'Dukungan emosional'     }, label:{ EN:'Emotional support — someone who truly gets their pain',         ID:'Dukungan emosional — seseorang yang benar-benar memahami rasa sakit mereka' }, type:'HEALER' },
      { icon:'💡', short:{ EN:'Wisdom & insight',   ID:'Hikmat & wawasan'       }, label:{ EN:'Wisdom or perspective — someone to think deeply with them',     ID:'Hikmat atau perspektif — seseorang untuk berpikir mendalam bersama'  }, type:'SEEKER'   },
      { icon:'🧭', short:{ EN:'Direction & care',   ID:'Arahan & bimbingan'     }, label:{ EN:'Direction or guidance — someone to genuinely look out for them',ID:'Arahan atau bimbingan — seseorang yang benar-benar peduli dengan mereka' }, type:'SHEPHERD' },
      { icon:'💪', short:{ EN:'Courage to act',     ID:'Keberanian bertindak'   }, label:{ EN:'Courage — someone who will push them to take the next step',    ID:'Keberanian — seseorang yang akan mendorong mereka untuk melangkah'   }, type:'CATALYST' },
      { icon:'🎯', short:{ EN:'Fresh ideas',        ID:'Ide-ide segar'          }, label:{ EN:'A fresh idea or creative perspective on a tough problem',       ID:'Ide segar atau perspektif kreatif untuk masalah yang sulit'          }, type:'CREATOR'  },
      { icon:'🔒', short:{ EN:'Reliability',        ID:'Keandalan'              }, label:{ EN:'Dependability — someone they know will be there, no matter what',ID:'Keandalan — seseorang yang mereka tahu akan selalu ada, apapun yang terjadi' }, type:'ANCHOR' },
    ],
  },
  {
    id:'q5', type:'rating',
    teaser:{ EN:'Where you feel most drained is where God wants to move first.', ID:'Di mana kamu paling lelah adalah di mana Tuhan ingin bergerak terlebih dahulu.' },
    text:{ EN:'Rate how fulfilled you feel in each area of your life right now:', ID:'Nilai seberapa puas kamu dengan setiap area hidupmu saat ini:' },
    areas:[
      { id:'career',        label:{ EN:'💼 Career & Purpose',       ID:'💼 Karier & Tujuan'              } },
      { id:'relationships', label:{ EN:'❤️ Relationships & Love',   ID:'❤️ Hubungan & Cinta'             } },
      { id:'faith',         label:{ EN:'✝️ Faith & Spiritual Life', ID:'✝️ Iman & Kehidupan Rohani'      } },
      { id:'peace',         label:{ EN:'🕊️ Inner Peace & Joy',      ID:'🕊️ Kedamaian Batin & Sukacita'  } },
    ],
  },
  {
    id:'q6',
    teaser:{ EN:'The quiet voice in your soul is speaking your Blueprint right now.', ID:'Suara tenang dalam jiwamu sedang mengucapkan Blueprintmu saat ini.' },
    text:{ EN:"When you're alone and quiet — perhaps in prayer — what do you feel most strongly?", ID:'Ketika kamu sendirian dan tenang — mungkin dalam doa — apa yang paling kuat kamu rasakan?' },
    options:[
      { icon:'🏛️', short:{ EN:'Build for God',       ID:'Membangun bagi Tuhan'        }, label:{ EN:'A deep desire to create or build something for God',              ID:'Keinginan yang dalam untuk menciptakan atau membangun sesuatu bagi Tuhan' }, type:'BUILDER'  },
      { icon:'💚', short:{ EN:'Deep compassion',     ID:'Belas kasihan mendalam'      }, label:{ EN:'Compassion — my heart breaks for people who are hurting',         ID:'Belas kasihan — hatiku hancur untuk orang-orang yang terluka'            }, type:'HEALER'   },
      { icon:'🔍', short:{ EN:'Know God deeper',     ID:'Mengenal Tuhan lebih dalam'  }, label:{ EN:'A longing to know and understand God more deeply',                ID:'Kerinduan untuk mengenal dan memahami Tuhan lebih dalam'                 }, type:'SEEKER'   },
      { icon:'🌿', short:{ EN:'Watch over others',   ID:'Jaga orang-orang'            }, label:{ EN:'A calling to watch over and care for specific people in my life', ID:'Panggilan untuk menjaga dan merawat orang-orang tertentu dalam hidupku'  }, type:'SHEPHERD' },
      { icon:'🔥', short:{ EN:'Burning urgency',     ID:'Urgensi membara'             }, label:{ EN:'A burning urgency — like something needs to move and happen',     ID:'Urgensi yang membara — seperti sesuatu harus bergerak dan terjadi'       }, type:'CATALYST' },
      { icon:'✨', short:{ EN:"Awe at God's beauty", ID:'Kagum akan keindahan-Nya'    }, label:{ EN:"Awe at God's beauty and a deep desire to express it",            ID:'Kekaguman pada keindahan Tuhan dan keinginan dalam untuk mengekspresikannya' }, type:'CREATOR' },
      { icon:'⚓', short:{ EN:'Quiet gratitude',     ID:'Rasa syukur yang tenang'     }, label:{ EN:"Quiet gratitude for His faithfulness — a peace that anchors me",  ID:'Rasa syukur yang tenang atas kesetiaan-Nya — kedamaian yang menjangkarkanku' }, type:'ANCHOR' },
    ],
  },
  {
    id:'q7', type:'opentext',
    teaser:{ EN:'This one honest answer makes your result deeply personal.', ID:'Satu jawaban jujur ini akan membuat hasilmu sangat personal.' },
    text:{ EN:'Complete this sentence honestly:', ID:'Lengkapi kalimat ini dengan jujur:' },
    subtitle:{ EN:'"I wish God would show me…"', ID:'"Saya berharap Tuhan menunjukkan kepada saya…"' },
    placeholder:{ EN:'Type your answer here — be as honest as you want…', ID:'Tulis jawabanmu di sini — sejujur yang kamu mau…' },
  },
]

// ─── SCORING ──────────────────────────────────────────────────────────────────
function scoreAnswers(answers) {
  const scores = { BUILDER:0, HEALER:0, SEEKER:0, SHEPHERD:0, CATALYST:0, CREATOR:0, ANCHOR:0 }
  for (const qId of ['q1','q2','q3','q4','q6']) {
    const v = answers[qId]
    if (v && scores[v] !== undefined) scores[v]++
  }
  let max=-1, winner='SEEKER'
  for (const [t,s] of Object.entries(scores)) { if (s>max){ max=s; winner=t } }
  return { type:winner, scores }
}

function validateIndonesianWA(phone) {
  const c = phone.replace(/[\s\-\(\)\.]/g,'')
  if (!/^\+?\d{9,15}$/.test(c)) return false
  return /^(08\d{8,11}|628\d{8,11}|\+628\d{8,11})$/.test(c)
}
function normalizeWA(phone) {
  const c = phone.replace(/[\s\-\(\)\.]/g,'')
  if (c.startsWith('08')) return '+62'+c.slice(1)
  if (c.startsWith('628')) return '+'+c
  return c
}

// ─── SHARED STYLE HELPERS ────────────────────────────────────────────────────
const wrap = { minHeight:'100vh', background:C.cream, fontFamily:'-apple-system, BlinkMacSystemFont,"Segoe UI",sans-serif' }
const maxW  = { maxWidth:520, margin:'0 auto', padding:'0 16px' }
const primBtn = {
  display:'block', width:'100%', padding:'17px 24px',
  background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
  color:'#fff', border:'none', borderRadius:14, fontSize:17, fontWeight:700,
  letterSpacing:0.2, boxShadow:`0 6px 24px rgba(15,33,103,0.3)`, transition:'transform .15s',
}
const goldBtn = { ...primBtn,
  background:`linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`,
  color:C.navyDark, boxShadow:`0 6px 24px rgba(245,158,11,0.45)`,
}

// ─── LANG TOGGLE ─────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }) {
  return (
    <button
      onClick={() => setLang(l => l==='EN'?'ID':'EN')}
      style={{
        position:'fixed', top:14, right:14, zIndex:999,
        background:'rgba(255,255,255,0.95)', border:`1.5px solid ${C.border}`,
        borderRadius:20, padding:'7px 14px', fontSize:13, fontWeight:700,
        color:C.navy, cursor:'pointer', backdropFilter:'blur(8px)',
        boxShadow:'0 2px 12px rgba(0,0,0,0.12)',
      }}
    >{T[lang].langBtn}</button>
  )
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total, lang }) {
  const pct = Math.round((current/total)*100)
  return (
    <div style={{ padding:'16px 16px 0', background:C.cream }}>
      <div style={{ ...maxW }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:13, color:C.muted }}>{T[lang].qOf(current, total)}</span>
          <span style={{ fontSize:13, color:C.navy, fontWeight:700 }}>{T[lang].pct(pct)}</span>
        </div>
        <div style={{ height:5, background:C.border, borderRadius:3 }}>
          <div style={{ height:5, width:`${pct}%`, background:`linear-gradient(90deg,${C.gold},${C.goldDark})`, borderRadius:3, transition:'width .5s cubic-bezier(.4,0,.2,1)' }} />
        </div>
      </div>
    </div>
  )
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ lang, onStart }) {
  const tx = T[lang]
  // Detect if user arrived via a WhatsApp share link (?ref=TYPE)
  const [referrerType, setReferrerType] = useState(null)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ref = new URLSearchParams(window.location.search).get('ref')
      if (ref && TYPES[ref.toUpperCase()]) setReferrerType(ref.toUpperCase())
    }
  }, [])
  const refType = referrerType ? TYPES[referrerType] : null

  return (
    <div style={wrap}>
      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(155deg, ${C.navyDark} 0%, ${C.navy} 55%, #1E3A7A 100%)`, padding:'56px 20px 52px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(245,158,11,0.07)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ maxWidth:500, margin:'0 auto', position:'relative' }}>
          {/* WhatsApp referral banner */}
          {refType && (
            <div className="bubble-in" style={{ background:'rgba(37,211,102,0.12)', border:'1px solid rgba(37,211,102,0.3)', borderRadius:14, padding:'10px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>
              <span style={{ fontSize:22 }}>{refType.emoji}</span>
              <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.82)', lineHeight:1.45 }}>
                {lang==='EN'
                  ? <>A friend discovered they're <strong style={{ color:'#4ADE80' }}>{refType.name.EN}</strong>. What's yours?</>
                  : <>Temanmu menemukan mereka adalah <strong style={{ color:'#4ADE80' }}>{refType.name.ID}</strong>. Milikmu apa?</>
                }
              </p>
            </div>
          )}
          <div className="float" style={{ fontSize:48, marginBottom:14 }}>✝️</div>
          <span style={{ display:'inline-block', background:'rgba(245,158,11,0.18)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:20, padding:'5px 14px', fontSize:11, fontWeight:700, color:C.gold, letterSpacing:1, marginBottom:18 }}>
            {tx.badge}
          </span>
          <h1 className="au" style={{ color:'#fff', fontSize:38, fontWeight:900, lineHeight:1.15, margin:'0 0 16px', letterSpacing:-1, whiteSpace:'pre-line' }}>
            {tx.heroTitle}
          </h1>
          <p className="au af1" style={{ color:'rgba(255,255,255,0.82)', fontSize:17, lineHeight:1.65, margin:'0 0 26px' }}>
            {tx.heroSub}
          </p>
          {/* Verse */}
          <div className="au af2" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'16px 18px', marginBottom:28, textAlign:'left' }}>
            <p style={{ color:C.gold, fontSize:12, fontWeight:700, margin:'0 0 6px', letterSpacing:1 }}>{tx.verseRef}</p>
            <p style={{ color:'rgba(255,255,255,0.88)', fontSize:14, fontStyle:'italic', margin:0, lineHeight:1.7 }}>{tx.verseText}</p>
          </div>
          <button className="pulseCTA au af3" onClick={onStart} style={{ ...goldBtn, fontSize:18, padding:'20px 32px', borderRadius:16, maxWidth:380, margin:'0 auto' }}>
            {tx.cta}
          </button>
        </div>
      </div>

      {/* ── Trust pills ── */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${C.border}`, padding:'12px 16px' }}>
        <div style={{ maxWidth:520, margin:'0 auto', display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
          {tx.trust.map(t => (
            <span key={t} style={{ fontSize:12, color:C.muted, background:'#F3F4F6', padding:'5px 12px', borderRadius:20 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Pain section ── */}
      <div style={{ background:`linear-gradient(135deg,#1a0a2e 0%,#1e1640 100%)`, padding:'36px 20px' }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <h2 className="au" style={{ color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 22px', lineHeight:1.3 }}>{tx.painHeading}</h2>
          {tx.pains.map((p,i) => (
            <div key={i} className={`au af${i+1}`} style={{ display:'flex', gap:12, marginBottom:14, background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'13px 16px', border:'1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color:'rgba(255,255,255,0.85)', fontSize:14, lineHeight:1.6 }}>{p}</span>
            </div>
          ))}
          <div style={{ marginTop:20, padding:'14px 18px', background:'rgba(245,158,11,0.15)', borderRadius:10, border:`1px solid rgba(245,158,11,0.3)` }}>
            <p style={{ color:C.gold, fontSize:14, fontWeight:600, margin:0, lineHeight:1.6 }}>{tx.painClose}</p>
          </div>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:12, marginTop:16, lineHeight:1.6, textAlign:'center' }}>{tx.disclaimer}</p>
        </div>
      </div>

      {/* ── WHY section ── */}
      {tx.whyHeading && (
        <div style={{ padding:'36px 20px', background:'#FFFBEB', borderBottom:`1px solid #FDE68A` }}>
          <div style={{ maxWidth:520, margin:'0 auto' }}>
            <h2 className="au" style={{ color:C.navyDark, fontSize:22, fontWeight:800, margin:'0 0 10px', lineHeight:1.3 }}>{tx.whyHeading}</h2>
            <p className="au af1" style={{ color:C.sub, fontSize:15, margin:'0 0 24px', lineHeight:1.65 }}>{tx.whySub}</p>
            {tx.whys.map((w, i) => (
              <div key={i} className={`au af${i+2}`} style={{ display:'flex', gap:14, marginBottom:14, alignItems:'flex-start', background:'#fff', borderRadius:12, padding:'14px 16px', border:`1px solid #FDE68A` }}>
                <span style={{ fontSize:24, flexShrink:0, marginTop:1 }}>{w.icon}</span>
                <p style={{ color:C.text, fontSize:15, lineHeight:1.65, margin:0 }}>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Social proof ── */}
      <div style={{ background:'#fff', padding:'32px 20px', textAlign:'center', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:3, marginBottom:8 }}>
            {'⭐⭐⭐⭐⭐'.split('').map((s,i)=><span key={i} style={{fontSize:20}}>{s}</span>)}
            <span style={{fontSize:14,color:C.muted,marginLeft:6,alignSelf:'center'}}>4.8/5</span>
          </div>
          <p style={{ fontSize:15, color:C.text, margin:'0 0 24px' }}>
            <strong style={{ color:C.navy, fontSize:22 }}>{tx.proofNum}</strong>{' '}
            <span style={{ color:C.muted }}>{tx.proofText}</span>
          </p>
          {/* Testimonials */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {tx.testimonials.map((t,i) => (
              <div key={i} style={{ background:'#F9FAFB', borderRadius:12, padding:'16px 18px', textAlign:'left', border:`1px solid ${C.border}` }}>
                <p style={{ fontSize:14, color:C.sub, fontStyle:'italic', lineHeight:1.65, margin:'0 0 10px' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#fff', fontWeight:700, flexShrink:0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{t.name}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7 Types grid ── */}
      <div style={{ padding:'32px 20px', background:C.cream }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <p style={{ textAlign:'center', fontSize:13, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:'uppercase', marginBottom:18 }}>{tx.typesHeading}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {Object.values(TYPES).map(tp => (
              <div key={tp.id} style={{ background:tp.bg, borderRadius:12, padding:'14px 14px', border:`1.5px solid ${tp.bg}`, display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ fontSize:26, flexShrink:0 }}>{tp.emoji}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:tp.color }}>{tp.name[lang]}</div>
                  <div style={{ fontSize:11, color:tp.color, opacity:0.8 }}>{tp.subtitle[lang]}</div>
                  <div style={{ fontSize:11, color:tp.color, opacity:0.65, marginTop:2 }}>{tx.typesRarity(tp.rarity)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{ padding:'32px 20px 52px', textAlign:'center' }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <p style={{ fontSize:17, color:C.sub, marginBottom:20, fontWeight:500 }}>{tx.ctaBottom}</p>
          <button className="pulseCTA" onClick={onStart} style={{ ...goldBtn, maxWidth:380, margin:'0 auto' }}>
            {tx.cta}
          </button>
          <p style={{ fontSize:12, color:C.muted, marginTop:14 }}>{tx.footer}</p>
        </div>
      </div>
    </div>
  )
}

// ─── MC QUESTION ──────────────────────────────────────────────────────────────
function MCQuestion({ q, qIndex, total, selected, onSelect, onNext, onBack, lang }) {
  const tx = T[lang]
  const advancingRef = useRef(false)

  // Reset advancing guard when question changes
  useEffect(() => { advancingRef.current = false }, [qIndex])

  const handleSelect = (type) => {
    if (advancingRef.current) return
    advancingRef.current = true
    onSelect(type)
    setTimeout(onNext, 440)
  }

  const pct = Math.round(((qIndex + 1) / total) * 100)
  const isLast = (q.options.length % 2 !== 0)

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg, #0A1628 0%, #0D1B4B 55%, #122060 100%)`, display:'flex', flexDirection:'column', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

      {/* ── Progress bar ── */}
      <div style={{ padding:'14px 20px 0', flexShrink:0 }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
            {qIndex > 0 ? (
              <button onClick={onBack} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600, cursor:'pointer', padding:'4px 0', display:'flex', alignItems:'center', gap:4 }}>
                ← {lang==='EN' ? 'Back' : 'Kembali'}
              </button>
            ) : <span />}
            <span style={{ fontSize:11, color:'rgba(245,158,11,0.85)', fontWeight:700, letterSpacing:0.5 }}>{tx.qOf(qIndex+1, total)}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:600 }}>{tx.pct(pct)}</span>
          </div>
          <div style={{ height:3, background:'rgba(255,255,255,0.09)', borderRadius:2 }}>
            <div style={{ height:3, width:`${pct}%`, background:`linear-gradient(90deg, #F59E0B, #D97706)`, borderRadius:2, transition:'width .55s cubic-bezier(.4,0,.2,1)' }} />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'20px 20px 32px', maxWidth:520, margin:'0 auto', width:'100%' }}>

        {/* Guide avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14, justifyContent:'center' }}>
          <div style={{ width:26, height:26, borderRadius:'50%', background:'rgba(245,158,11,0.12)', border:'1.5px solid rgba(245,158,11,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>✝️</div>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:600, letterSpacing:0.3 }}>{lang==='EN' ? 'Blueprint Guide' : 'Panduan Blueprint'}</span>
        </div>

        {/* Teaser */}
        {q.teaser?.[lang] && (
          <p className="au" style={{ fontSize:13, color:'rgba(245,158,11,0.65)', fontStyle:'italic', margin:'0 0 11px', lineHeight:1.5, textAlign:'center' }}>
            ✨ {q.teaser[lang]}
          </p>
        )}

        {/* Question */}
        <h2 className="au af1" style={{ fontSize:21, fontWeight:800, color:'#fff', lineHeight:1.4, margin:'0 0 22px', textAlign:'center', letterSpacing:-0.2 }}>
          {q.text[lang]}
        </h2>

        {/* 2-column icon grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
          {q.options.map((opt, i) => (
            <div
              key={i}
              className={`opt-icon${selected === opt.type ? ' sel' : ''}`}
              onClick={() => handleSelect(opt.type)}
              style={{
                padding:'15px 10px 13px',
                background: selected===opt.type ? 'rgba(245,158,11,0.17)' : 'rgba(255,255,255,0.07)',
                borderRadius:13,
                textAlign:'center',
                border:`2px solid ${selected===opt.type ? '#F59E0B' : 'rgba(255,255,255,0.11)'}`,
                gridColumn: (isLast && i === q.options.length - 1) ? 'span 2' : 'auto',
                animation:`fadeUp 0.28s ease ${i * 0.035}s both`,
                WebkitTapHighlightColor:'transparent',
                userSelect:'none',
              }}
            >
              <div style={{ fontSize:26, marginBottom:6, lineHeight:1 }}>{opt.icon || '●'}</div>
              <p style={{ margin:0, fontSize:12, fontWeight:600, lineHeight:1.4, color: selected===opt.type ? '#F59E0B' : 'rgba(255,255,255,0.8)' }}>
                {opt.short ? opt.short[lang] : opt.label[lang]}
              </p>
              {selected===opt.type && <div style={{ marginTop:5, color:'#F59E0B', fontSize:13, fontWeight:900 }}>✓</div>}
            </div>
          ))}
        </div>

        {/* Hint */}
        <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.22)', marginTop:14, fontStyle:'italic' }}>
          {selected
            ? (lang==='EN' ? '✓ Noted — revealing next clue…' : '✓ Dicatat — mengungkap petunjuk berikutnya…')
            : (lang==='EN' ? 'Tap to choose' : 'Ketuk untuk memilih')
          }
        </p>
      </div>
    </div>
  )
}

// ─── RATING QUESTION ──────────────────────────────────────────────────────────
function RatingQuestion({ q, qIndex, total, ratings, onRate, onNext, onBack, lang }) {
  const tx = T[lang]
  const allRated = q.areas.every(a => ratings[a.id] > 0)
  const EMOJIS = ['','😔','😕','😐','🙂','😄']
  return (
    <div style={wrap}>
      <ProgressBar current={qIndex+1} total={total} lang={lang} />
      <div style={{ ...maxW, paddingTop:28, paddingBottom:48 }}>
        {qIndex > 0 && (
          <button onClick={onBack} style={{ background:'none', border:'none', color:C.muted, fontSize:13, fontWeight:600, cursor:'pointer', padding:'0 0 12px', display:'flex', alignItems:'center', gap:4 }}>
            ← {lang==='EN' ? 'Back' : 'Kembali'}
          </button>
        )}
        <p className="ai" style={{ fontSize:12, color:C.gold, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>
          {tx.qOf(qIndex+1, total)}
        </p>
        {q.teaser?.[lang] && (
          <p className="au" style={{ fontSize:14, color:C.muted, fontStyle:'italic', margin:'0 0 14px', lineHeight:1.5 }}>
            ✨ {q.teaser[lang]}
          </p>
        )}
        <h2 className="au af1" style={{ fontSize:23, fontWeight:800, color:C.navy, lineHeight:1.35, margin:'0 0 6px' }}>
          {q.text[lang]}
        </h2>
        <p className="au af2" style={{ fontSize:14, color:C.muted, margin:'0 0 28px' }}>
          {tx.ratingLow} &nbsp;→&nbsp; {tx.ratingHigh}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:22, marginBottom:32 }}>
          {q.areas.map(area => (
            <div key={area.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:0 }}>{area.label[lang]}</p>
                {ratings[area.id]>0 && <span style={{ fontSize:22 }}>{EMOJIS[ratings[area.id]]}</span>}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => onRate(area.id, n)}
                    style={{
                      flex:1, padding:'12px 0', borderRadius:10, fontSize:16, fontWeight:800, border:'2px solid',
                      borderColor: ratings[area.id]>=n ? C.gold : C.border,
                      background: ratings[area.id]>=n
                        ? `linear-gradient(135deg,${C.gold},${C.goldDark})`
                        : '#fff',
                      color: ratings[area.id]>=n ? C.navyDark : C.muted,
                      transition:'all .18s',
                    }}
                  >{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {allRated && (
          <button className="au" onClick={onNext} style={primBtn}>{tx.continue}</button>
        )}
      </div>
    </div>
  )
}

// ─── OPEN TEXT QUESTION ───────────────────────────────────────────────────────
function OpenTextQuestion({ q, qIndex, total, value, onChange, onNext, onBack, lang }) {
  const tx = T[lang]
  const ready = value.trim().length >= 3
  return (
    <div style={wrap}>
      <ProgressBar current={qIndex+1} total={total} lang={lang} />
      <div style={{ ...maxW, paddingTop:28, paddingBottom:48 }}>
        {qIndex > 0 && (
          <button onClick={onBack} style={{ background:'none', border:'none', color:C.muted, fontSize:13, fontWeight:600, cursor:'pointer', padding:'0 0 12px', display:'flex', alignItems:'center', gap:4 }}>
            ← {lang==='EN' ? 'Back' : 'Kembali'}
          </button>
        )}
        <p className="ai" style={{ fontSize:12, color:C.gold, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>
          {tx.qOf(qIndex+1, total)}
        </p>
        {q.teaser?.[lang] && (
          <p className="au" style={{ fontSize:14, color:C.muted, fontStyle:'italic', margin:'0 0 14px', lineHeight:1.5 }}>
            ✨ {q.teaser[lang]}
          </p>
        )}
        <h2 className="au af1" style={{ fontSize:23, fontWeight:800, color:C.navy, lineHeight:1.35, margin:'0 0 8px' }}>
          {q.text[lang]}
        </h2>
        {q.subtitle[lang] && (
          <p className="au af2" style={{ fontSize:20, fontStyle:'italic', color:C.navy, opacity:0.85, margin:'0 0 24px', fontWeight:600 }}>
            {q.subtitle[lang]}
          </p>
        )}
        <div style={{ position:'relative' }}>
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={q.placeholder[lang]}
            rows={5}
            style={{
              width:'100%', boxSizing:'border-box', padding:'16px 18px', fontSize:16, lineHeight:1.65,
              border:`2px solid ${ready ? C.navyLight : C.border}`,
              borderRadius:12, outline:'none', resize:'vertical',
              background:'#fff', color:C.text, fontFamily:'inherit',
              marginBottom:20, transition:'border-color .2s',
            }}
          />
        </div>
        <button
          onClick={onNext}
          disabled={!ready}
          style={{ ...primBtn, opacity:ready?1:0.38, cursor:ready?'pointer':'not-allowed' }}
        >
          {qIndex+1===total ? tx.seeResults : tx.continue}
        </button>
      </div>
    </div>
  )
}

// ─── GATE SCREEN ──────────────────────────────────────────────────────────────
function GateScreen({ lang, onSubmit, submitting, error }) {
  const tx = T[lang]
  const [name, setName] = useState('')
  const [wa, setWa]   = useState('')
  const [email, setEmail] = useState('')
  const [faithJourney, setFJ] = useState('')
  const [churchStatus, setCS] = useState('')
  const [openToMeet, setOM]   = useState('')
  const [avail, setAvail]     = useState([])
  const [waErr, setWaErr]     = useState('')
  const toggleAvail = v => setAvail(prev => prev.includes(v) ? prev.filter(x=>x!==v) : [...prev,v])

  const handleSubmit = () => {
    setWaErr('')
    if (!name.trim()) return
    if (!validateIndonesianWA(wa)) { setWaErr(tx.waErr); return }
    if (!faithJourney||!churchStatus||!openToMeet) return
    onSubmit({ name:name.trim(), wa:normalizeWA(wa), email:email.trim(), faithJourney, churchStatus, openToMeet, availability:avail })
  }
  const allFilled = name.trim() && wa.trim() && faithJourney && churchStatus && openToMeet

  const inp = { width:'100%', boxSizing:'border-box', padding:'13px 15px', fontSize:16, border:`2px solid ${C.border}`, borderRadius:11, background:'#fff', color:C.text, fontFamily:'inherit', outline:'none' }
  const lbl = { fontSize:14, fontWeight:700, color:C.text, display:'block', marginBottom:6, marginTop:16 }
  const sec = { background:'#fff', borderRadius:14, padding:'18px 18px 6px', marginBottom:16, border:`1px solid ${C.border}` }
  const secHead = { fontSize:15, fontWeight:800, color:C.navy, margin:'0 0 14px' }
  const optBtn = (active) => ({
    display:'block', width:'100%', textAlign:'left', padding:'13px 16px', marginBottom:8,
    background: active ? C.navyDark : '#F9FAFB',
    color: active ? '#fff' : C.text,
    border:`2px solid ${active ? C.gold : C.border}`,
    borderRadius:10, fontSize:14, fontWeight: active?700:400, cursor:'pointer',
    borderLeft:`4px solid ${active ? C.gold : C.border}`,
    transition:'all .15s',
  })

  return (
    <div style={wrap}>
      <div style={{ background:`linear-gradient(135deg,${C.navyDark},${C.navy})`, padding:'28px 20px', textAlign:'center' }}>
        <div style={{ maxWidth:500, margin:'0 auto' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🎯</div>
          <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 8px' }}>{tx.gateTitle}</h2>
          <p style={{ color:'rgba(255,255,255,0.78)', fontSize:15, margin:0 }}>{tx.gateSub}</p>
        </div>
      </div>
      <div style={{ ...maxW, paddingTop:22, paddingBottom:48 }}>
        {/* Contact */}
        <div style={sec}>
          <p style={secHead}>{tx.secContact}</p>
          <label style={lbl}>{tx.fldName}</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={tx.phName} style={inp} />
          <label style={lbl}>{tx.fldWA} <span style={{ fontWeight:400, color:C.muted }}>{tx.waHint}</span></label>
          <input value={wa} onChange={e=>{setWa(e.target.value);setWaErr('')}} placeholder={tx.phWA} style={{ ...inp, borderColor:waErr?C.red:C.border }} />
          {waErr && <p style={{ color:C.red, fontSize:13, marginTop:4 }}>{waErr}</p>}
          <p style={{ fontSize:12, color:C.muted, marginTop:5 }}>{tx.waPriv}</p>
          <label style={lbl}>{tx.fldEmail}</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={tx.phEmail} style={inp} />
        </div>
        {/* Faith */}
        <div style={sec}>
          <p style={secHead}>{tx.secFaith}</p>
          <p style={{ fontSize:13, color:C.muted, margin:'-6px 0 14px' }}>{tx.faithHint}</p>
          {tx.faithOpts.map((o,i) => (
            <button key={i} style={optBtn(faithJourney===o)} onClick={()=>setFJ(o)}>{o}</button>
          ))}
        </div>
        {/* Church */}
        <div style={sec}>
          <p style={secHead}>{tx.secChurch}</p>
          {tx.churchOpts.map((o,i) => (
            <button key={i} style={optBtn(churchStatus===o)} onClick={()=>setCS(o)}>{o}</button>
          ))}
        </div>
        {/* Availability */}
        <div style={sec}>
          <p style={secHead}>{tx.secAvail}</p>
          <p style={{ fontSize:13, color:C.muted, margin:'-6px 0 14px' }}>{tx.availHint}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {tx.availOpts.map(({ v, label }) => (
              <button
                key={v}
                onClick={()=>toggleAvail(v)}
                style={{
                  padding:'12px 8px', textAlign:'center', fontSize:13, fontWeight:600,
                  background: avail.includes(v) ? C.navyDark : '#F9FAFB',
                  color: avail.includes(v) ? '#fff' : C.text,
                  border:`2px solid ${avail.includes(v) ? C.gold : C.border}`,
                  borderRadius:11, cursor:'pointer',
                }}
              >{label}</button>
            ))}
          </div>
        </div>
        {/* Meet */}
        <div style={sec}>
          <p style={secHead}>{tx.secMeet}</p>
          <p style={{ fontSize:14, color:C.sub, margin:'-6px 0 14px', lineHeight:1.55 }}>{tx.meetPrompt}</p>
          {tx.meetOpts.map(({ v, label }) => (
            <button key={v} style={optBtn(openToMeet===v)} onClick={()=>setOM(v)}>{label}</button>
          ))}
        </div>
        {error && <div style={{ background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:8, padding:'12px 14px', marginBottom:12, color:C.red, fontSize:14 }}>{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={!allFilled||submitting}
          style={{ ...goldBtn, opacity:allFilled?1:0.38, cursor:allFilled?'pointer':'not-allowed', marginBottom:12 }}
        >
          {submitting ? tx.submitting : tx.submitBtn}
        </button>
        <p style={{ textAlign:'center', fontSize:12, color:C.muted }}>{tx.gatePriv}</p>
      </div>
    </div>
  )
}

// ─── LOADING / REVEAL SCREEN ──────────────────────────────────────────────────
function LoadingScreen({ purposeType, lang, onDone }) {
  const type = TYPES[purposeType]
  const [phase, setPhase] = useState(0) // 0=analysis 1=emoji-reveal 2=name-reveal
  const [lineIdx, setLineIdx] = useState(0)
  const [dots, setDots] = useState('.')

  const analysisLines = lang === 'EN'
    ? ['Reading your answers…', 'Tracing your passions…', 'Searching 7 sacred patterns…', 'Your Blueprint is forming…']
    : ['Membaca jawabanmu…', 'Melacak hasratmu…', 'Mencari 7 pola ilahi…', 'Blueprintmu sedang terbentuk…']

  useEffect(() => {
    const dotTimer   = setInterval(() => setDots(d => d.length >= 3 ? '.' : d+'.'), 380)
    const lineTimer  = setInterval(() => setLineIdx(i => (i + 1) % analysisLines.length), 700)
    const phase1     = setTimeout(() => { clearInterval(lineTimer); setPhase(1) }, 3000)
    const phase2     = setTimeout(() => setPhase(2), 4100)
    const done       = setTimeout(onDone, 5400)
    return () => { clearInterval(dotTimer); clearInterval(lineTimer); clearTimeout(phase1); clearTimeout(phase2); clearTimeout(done) }
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(155deg, #0A1628 0%, #0F2167 60%, #1E3A7A 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

      {/* Phase 0: Analysis */}
      {phase === 0 && (
        <>
          <div style={{ fontSize:44, marginBottom:22, opacity:0.35 }}>✝️</div>
          <div style={{ width:46, height:46, border:`3px solid rgba(245,158,11,0.2)`, borderTop:`3px solid #F59E0B`, borderRadius:'50%', animation:'spin 0.9s linear infinite', marginBottom:26 }} />
          <p style={{ color:'#F59E0B', fontSize:15, fontWeight:600, minHeight:22, marginBottom:10 }}>
            {analysisLines[lineIdx]}{dots}
          </p>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>
            {lang==='EN' ? 'This might change everything.' : 'Ini mungkin akan mengubah segalanya.'}
          </p>
        </>
      )}

      {/* Phase 1: Emoji reveal */}
      {phase === 1 && (
        <div className="bubble-in" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div className="float" style={{ fontSize:96, marginBottom:22, filter:'drop-shadow(0 0 32px rgba(245,158,11,0.4))' }}>{type.emoji}</div>
          <div style={{ width:38, height:38, border:`2.5px solid rgba(245,158,11,0.25)`, borderTop:`2.5px solid #F59E0B`, borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
        </div>
      )}

      {/* Phase 2: Full reveal */}
      {phase === 2 && (
        <div className="bubble-in" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div className="float" style={{ fontSize:80, marginBottom:18, filter:'drop-shadow(0 0 28px rgba(245,158,11,0.45))' }}>{type.emoji}</div>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>
            {lang==='EN' ? 'YOUR BIBLICAL BLUEPRINT' : 'BIBLICAL BLUEPRINT-MU'}
          </p>
          <h2 style={{ color:'#F59E0B', fontSize:38, fontWeight:900, margin:'0 0 8px', letterSpacing:-0.5, animation:'fadeUp 0.45s ease both' }}>
            {type.name[lang]}
          </h2>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:17, margin:'0 0 6px', animation:'fadeUp 0.45s ease 0.1s both' }}>
            {type.subtitle[lang]}
          </p>
          <p style={{ color:'rgba(255,255,255,0.28)', fontSize:13, fontStyle:'italic', marginTop:18, animation:'fadeUp 0.45s ease 0.2s both' }}>
            {lang==='EN' ? 'Preparing your full report…' : 'Menyiapkan laporan lengkapmu…'}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── RADAR CHART ──────────────────────────────────────────────────────────────
function RadarChart({ ratings, lang }) {
  const keys = ['career','relationships','faith','peace']
  const labels = { career:{EN:'Career',ID:'Karier'}, relationships:{EN:'Relationships',ID:'Hubungan'}, faith:{EN:'Faith',ID:'Iman'}, peace:{EN:'Peace',ID:'Kedamaian'} }
  const cx=100, cy=100, r=68
  const angles = keys.map((_,i) => (i/keys.length)*2*Math.PI - Math.PI/2)
  const gridLevels = [1,2,3,4,5]
  const toPt = (angle,v) => ({ x: cx+(r*(v/5))*Math.cos(angle), y: cy+(r*(v/5))*Math.sin(angle) })
  const dataPoints = keys.map((k,i) => toPt(angles[i], ratings[k]||1))
  const pathD = dataPoints.map((p,i) => `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ')+' Z'
  return (
    <svg viewBox="0 0 200 200" style={{ width:'100%', maxWidth:220, display:'block', margin:'0 auto' }}>
      {gridLevels.map(l => (
        <polygon key={l} points={angles.map(a=>`${cx+(r*l/5)*Math.cos(a)},${cy+(r*l/5)*Math.sin(a)}`).join(' ')}
          fill="none" stroke={l===5?'#D1D5DB':'#F3F4F6'} strokeWidth={l===5?1.5:1} />
      ))}
      {angles.map((a,i) => <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#E5E7EB" strokeWidth={1} />)}
      <path d={pathD} fill="rgba(15,33,103,0.13)" stroke={C.navy} strokeWidth={2} strokeLinejoin="round" />
      {dataPoints.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={C.gold} stroke={C.navy} strokeWidth={1.5} />)}
      {keys.map((k,i) => {
        const lp = toPt(angles[i], 6.2)
        return <text key={k} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize={9.5} fill={C.muted} fontWeight={700}>{labels[k][lang]}</text>
      })}
    </svg>
  )
}

// ─── RESULTS SCREEN ───────────────────────────────────────────────────────────
function ResultsScreen({ purposeType, name, ratings, answers, gateData, onEncounterClick, encounterRequested, lang }) {
  const tx = T[lang]
  const type = TYPES[purposeType]
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mypurpose.vercel.app'
  const shareUrl = `${origin}/?ref=${purposeType.toLowerCase()}`
  const shareMsg = encodeURIComponent(
    lang==='EN'
      ? `I just discovered I'm "${type.name.EN}" (${type.subtitle.EN}) on MyPurpose — one of the 7 Biblical Blueprints! Only ${type.rarity}% of people get this type.\n\nFind yours free: ${shareUrl}`
      : `Baru saja aku temukan aku adalah "${type.name.ID}" (${type.subtitle.ID}) di MyPurpose — salah satu dari 7 Biblical Blueprint! Hanya ${type.rarity}% orang mendapat tipe ini.\n\nTemukan milikmu gratis: ${shareUrl}`
  )
  const waShare = `https://wa.me/?text=${shareMsg}`

  return (
    <div style={wrap}>
      {/* Type hero */}
      <div style={{ background:`linear-gradient(155deg,${C.navyDark} 0%,${C.navy} 100%)`, padding:'44px 20px 36px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:240, height:240, borderRadius:'50%', background:`${type.barColor}18`, pointerEvents:'none' }} />
        <div style={{ maxWidth:500, margin:'0 auto', position:'relative' }}>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', marginBottom:16 }}>{tx.resBadge}</p>
          <div className="float" style={{ fontSize:68, marginBottom:14 }}>{type.emoji}</div>
          <h1 style={{ color:C.gold, fontSize:36, fontWeight:900, margin:'0 0 4px', letterSpacing:-0.5 }}>{type.name[lang]}</h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:17, margin:'0 0 20px' }}>{type.subtitle[lang]}</p>
          {/* Verse */}
          <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:11, padding:'13px 16px', textAlign:'left', marginBottom:18 }}>
            <p style={{ color:C.gold, fontSize:11, fontWeight:700, margin:'0 0 5px', letterSpacing:0.8 }}>{lang==='EN' ? type.verse : type.verseID}</p>
            <p style={{ color:'rgba(255,255,255,0.85)', fontSize:14, fontStyle:'italic', margin:0, lineHeight:1.7 }}>{type.verseText[lang]}</p>
          </div>
          {/* Rarity */}
          <div style={{ display:'inline-block', background:`${type.barColor}28`, border:`1px solid ${type.barColor}60`, borderRadius:20, padding:'8px 18px' }}>
            <span style={{ color:C.gold, fontSize:14, fontWeight:700 }}>{tx.resRarity(type.rarity, name)}</span>
          </div>
        </div>
      </div>

      <div style={{ ...maxW, paddingTop:24, paddingBottom:52 }}>
        {/* Who you are */}
        <div className="au" style={{ background:'#fff', borderRadius:14, padding:'22px 20px', marginBottom:16, border:`1px solid ${C.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.gold, letterSpacing:1, textTransform:'uppercase', margin:'0 0 12px' }}>{tx.resWho}</p>
          <p style={{ fontSize:16, color:C.sub, lineHeight:1.8, margin:0 }}>{type.description[lang](name)}</p>
        </div>

        {/* Life chart */}
        <div className="au af1" style={{ background:'#fff', borderRadius:14, padding:'22px 20px', marginBottom:16, border:`1px solid ${C.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.gold, letterSpacing:1, textTransform:'uppercase', margin:'0 0 4px' }}>{tx.resLife(name)}</p>
          <p style={{ fontSize:13, color:C.muted, margin:'0 0 16px' }}>{tx.resLifeSub}</p>
          <RadarChart ratings={ratings} lang={lang} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:16 }}>
            {tx.lifeKeys.map(({ k, label }) => {
              const v = ratings[k]||0
              const clr = v<=2?C.red:v===3?C.gold:C.green
              return (
                <div key={k} style={{ background:'#F9FAFB', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:clr }}>{v}/5</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Growth edge */}
        <div className="au af2" style={{ background:type.bg, borderRadius:14, padding:'22px 20px', marginBottom:16, border:`1.5px solid ${type.barColor}30`, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize:12, fontWeight:700, color:type.color, letterSpacing:1, textTransform:'uppercase', margin:'0 0 12px' }}>{tx.resGrowth(name)}</p>
          <p style={{ fontSize:15, color:C.sub, lineHeight:1.8, margin:0 }}>{type.growthEdge[lang]}</p>
        </div>

        {/* Q7 echo */}
        {answers.q7 && (
          <div className="au af3" style={{ background:C.goldPale, borderRadius:14, padding:'18px 18px', marginBottom:16, border:'1.5px solid #FDE68A', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#92600A', letterSpacing:1, textTransform:'uppercase', margin:'0 0 8px' }}>{tx.resWishTitle}</p>
            <p style={{ fontSize:15, color:C.text, lineHeight:1.7, fontStyle:'italic', margin:0 }}>"{answers.q7}"</p>
            <p style={{ fontSize:13, color:'#92600A', marginTop:12, lineHeight:1.55 }}>{tx.resWishClose(name)}</p>
          </div>
        )}

        {/* Encounter CTA — multi-step conviction flow */}
        {!encounterRequested && (
          <div className="au af4" style={{ background:`linear-gradient(155deg,${C.navyDark} 0%,#0B1A3B 100%)`, borderRadius:18, padding:'0', marginBottom:16, overflow:'hidden', boxShadow:'0 8px 36px rgba(10,22,40,0.35)' }}>
            {/* Step 1 — Conviction */}
            <div style={{ padding:'36px 24px 20px', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase', margin:'0 0 18px' }}>✦ ✦ ✦</p>
              <h3 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 16px', lineHeight:1.35 }}>{tx.encStep1}</h3>
              <p style={{ color:'rgba(255,255,255,0.62)', fontSize:15, lineHeight:1.75, margin:0 }}>{tx.encStep2}</p>
            </div>
            {/* Step 2 — You're so close */}
            <div style={{ padding:'24px 24px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ color:C.gold, fontSize:20, fontWeight:800, margin:'0 0 12px', textAlign:'center', lineHeight:1.3 }}>{tx.encStep3(name)}</h3>
              <p style={{ color:'rgba(255,255,255,0.68)', fontSize:14, lineHeight:1.75, margin:0, textAlign:'center' }}>{tx.encStep3Body}</p>
            </div>
            {/* Step 3 — The final step */}
            <div style={{ padding:'28px 24px 36px', textAlign:'center' }}>
              <h3 style={{ color:'#fff', fontSize:19, fontWeight:800, margin:'0 0 14px', lineHeight:1.35 }}>{tx.encTitle(name)}</h3>
              <p style={{ color:'rgba(255,255,255,0.72)', fontSize:14, lineHeight:1.7, margin:'0 0 28px' }}>{tx.encBody}</p>
              <button onClick={onEncounterClick} className="pulseCTA" style={{ ...goldBtn, fontSize:17, padding:'18px 48px', borderRadius:14, fontWeight:800, letterSpacing:0.3 }}>{tx.encCTA}</button>
            </div>
          </div>
        )}
        {encounterRequested && (
          <div className="au" style={{ background:`linear-gradient(155deg,${C.navyDark} 0%,#0B1A3B 100%)`, borderRadius:18, padding:'32px 24px', marginBottom:16, textAlign:'center', boxShadow:'0 8px 36px rgba(10,22,40,0.35)' }}>
            <div style={{ fontSize:36, marginBottom:14 }}>🕊️</div>
            <h3 style={{ color:C.gold, fontSize:20, fontWeight:800, margin:'0 0 12px', lineHeight:1.35 }}>{tx.encDoneTitle(name)}</h3>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:15, lineHeight:1.7, margin:0 }}>{tx.encDoneBody}</p>
          </div>
        )}

        {/* Share */}
        <div className="au af5" style={{ background:'#fff', borderRadius:14, padding:'22px 20px', marginBottom:16, border:`1px solid ${C.border}`, textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize:16, fontWeight:800, color:C.navy, margin:'0 0 6px' }}>{tx.shareTitle}</p>
          <p style={{ fontSize:13, color:C.muted, margin:'0 0 18px' }}>{tx.shareSub}</p>
          <a href={waShare} target="_blank" rel="noopener noreferrer"
            style={{ display:'block', padding:'15px 20px', background:'#25D366', color:'#fff', borderRadius:12, fontSize:15, fontWeight:700, marginBottom:10, boxShadow:'0 4px 16px rgba(37,211,102,0.35)' }}>
            {tx.shareWA}
          </a>
          <button
            onClick={() => { navigator.clipboard?.writeText(shareUrl); alert(tx.copyAlert) }}
            style={{ ...primBtn, background:'#F3F4F6', color:C.text, boxShadow:'none', border:`1px solid ${C.border}` }}
          >
            {tx.copyLink}
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:C.muted, lineHeight:1.7 }}>{tx.footer}</p>
      </div>
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang]   = useState('EN')
  const [screen, setScreen] = useState('landing')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [ratings, setRatings] = useState({ career:0, relationships:0, faith:0, peace:0 })
  const [purposeType, setPurposeType] = useState(null)
  const [gateData, setGateData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [encounterRequested, setEncounterRequested] = useState(false)

  const totalQ = QUESTIONS.length
  const currentQ = QUESTIONS[qIndex]

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo(0,0)
  }, [screen, qIndex])

  const handleStart = () => setScreen('quiz')

  const handleAnswer = v => setAnswers(prev => ({ ...prev, [currentQ.id]: v }))

  const handleNext = () => {
    if (qIndex+1 >= totalQ) setScreen('gate')
    else setQIndex(i => i+1)
  }

  const handleBack = () => {
    if (qIndex > 0) setQIndex(i => i-1)
  }

  const handleGateSubmit = async (data) => {
    setSubmitting(true)
    const { type } = scoreAnswers(answers)
    setPurposeType(type)
    setGateData(data)

    // Build human-readable answer labels (EN) for the email
    const quizAnswerLabels = {}
    for (const q of QUESTIONS) {
      if (q.type === 'rating') continue
      if (q.type === 'opentext') {
        quizAnswerLabels[q.id] = answers[q.id] || null
      } else {
        const opt = q.options?.find(o => o.type === answers[q.id])
        quizAnswerLabels[q.id] = opt ? opt.label['EN'] : null
      }
    }

    try {
      await fetch('/api/purpose-submit', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ ...data, purposeType:type, ratings, answers: quizAnswerLabels }),
      })
    } catch { /* silent */ }
    setSubmitting(false)
    setScreen('loading')
  }

  const handleEncounterClick = async () => {
    try {
      await fetch('/api/purpose-submit', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ ...gateData, purposeType, ratings, answers:{ q7:answers.q7 }, encounterRequested:true, updateEncounter:true }),
      })
    } catch { /* silent */ }
    setEncounterRequested(true)
  }

  const head = (title) => (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="MyPurpose — Discover the specific Biblical Blueprint God designed for your life. 7 types, free, 3 minutes." />
      <meta property="og:title" content="MyPurpose — Which of the 7 Biblical Blueprints Are You?" />
      <meta property="og:description" content="God wired you differently. Discover your Biblical Blueprint on MyPurpose — free, 3 minutes." />
      <meta property="og:type" content="website" />
      <style>{GLOBAL_CSS}</style>
    </Head>
  )

  return (
    <>
      {head(screen==='results' && purposeType
        ? `I'm ${TYPES[purposeType].name[lang]} — MyPurpose`
        : 'MyPurpose — Discover Your Biblical Blueprint'
      )}
      <LangToggle lang={lang} setLang={setLang} />

      {screen==='landing' && <Landing lang={lang} onStart={handleStart} />}

      {screen==='quiz' && currentQ.type==='rating' && (
        <RatingQuestion q={currentQ} qIndex={qIndex} total={totalQ} ratings={ratings} onRate={(a,v)=>setRatings(p=>({...p,[a]:v}))} onNext={handleNext} onBack={handleBack} lang={lang} />
      )}
      {screen==='quiz' && currentQ.type==='opentext' && (
        <OpenTextQuestion q={currentQ} qIndex={qIndex} total={totalQ} value={answers[currentQ.id]||''} onChange={v=>setAnswers(p=>({...p,[currentQ.id]:v}))} onNext={handleNext} onBack={handleBack} lang={lang} />
      )}
      {screen==='quiz' && !currentQ.type && (
        <MCQuestion q={currentQ} qIndex={qIndex} total={totalQ} selected={answers[currentQ.id]||null} onSelect={handleAnswer} onNext={handleNext} onBack={handleBack} lang={lang} />
      )}

      {screen==='gate' && (
        <GateScreen lang={lang} onSubmit={handleGateSubmit} submitting={submitting} error={submitError} />
      )}

      {screen==='loading' && (
        <LoadingScreen purposeType={purposeType} lang={lang} onDone={() => setScreen('results')} />
      )}

      {screen==='results' && (
        <ResultsScreen
          purposeType={purposeType}
          name={gateData?.name||'Friend'}
          ratings={ratings}
          answers={answers}
          gateData={gateData}
          onEncounterClick={handleEncounterClick}
          encounterRequested={encounterRequested}
          lang={lang}
        />
      )}
    </>
  )
}
