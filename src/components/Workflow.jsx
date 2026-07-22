import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Workflow.css'

const SvgCheck = () => (
  <svg className="wf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
)

const SvgChevron = () => (
  <svg className="wf-icon wf-icon--chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
)

const SvgArrowDown = () => (
  <svg className="wf-icon wf-icon--arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="4" x2="12" y2="20"/><polyline points="6 14 12 20 18 14"/></svg>
)

const SvgDiamond = () => (
  <svg className="wf-icon wf-icon--diamond" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4 8-4 8-4-8z"/></svg>
)

const SvgBack = () => (
  <svg className="wf-icon wf-icon--media" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
)

const SvgForward = () => (
  <svg className="wf-icon wf-icon--media" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
)

/* Phase → inline case stage nav (back / forward from workflow controls) */
const reelNavBus = {
  listeners: new Set(),
  emit(dir) { this.listeners.forEach((fn) => fn(dir)) },
  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  },
}

const phases = [
  {
    id: 'phase1', num: '01', title: 'NIGRAN', system: 'NIGRAN', subtitle: 'Media Monitoring',
    sources: ['NEWS', 'TELEGRAM', 'X', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'RSS', 'FORUMS'],
    scanItems: ['Language Detection', 'Threat Score', 'Keywords', 'Audio Analysis', 'Sentiment Analysis'],
    output: 'Threat Detected', confidence: '93%',
  },
  {
    id: 'phase2', num: '02', title: 'GEO INT', system: 'GEOINT', subtitle: 'Terrain Feature Analysis',
    systemSub: 'Location Analysis',
    units: ['GEOINT', 'FR/FE · AGEX IRIS', 'SOCIAL MEDIA RECON', 'CYBERINT RECON'],
    scanItems: ['Satellite Imagery', 'Terrain Feature Analysis', 'Terrain', 'Roads', 'Buildings', 'GPS'],
    matchItems: [{ label: 'Mountain Match', val: '98%' }, { label: 'Road Match', val: '96%' }, { label: 'Building Match', val: '94%' }],
    zoomPath: ['Planet', 'Country', 'Province', 'City', 'Street', 'Building', 'Exact Coordinates'],
    output: 'Coordinates Confirmed',
  },
  {
    id: 'agexphase', num: '03', title: 'AGEX IRIS', system: 'AGEX IRIS', subtitle: 'Facial Reconstruction & Recognition',
    systemSub: 'FR/FE Reconstruction & Matching',
    modules: [
      { name: 'AGEX IRIS · FR/FE', caseId: 'agex', steps: ['Frame Extraction', 'AI Face Enhancement', 'GAN Reconstruction', 'Face Recognition', 'Identity Matching'], result: 'Identity Candidate Found' },
    ],
  },
  {
    id: 'noxphase', num: '04', title: 'NOX CYBERINT', system: 'NOX', subtitle: 'Dark Web & Offensive Cyber',
    systemSub: 'Cyber Operations',
    modules: [
      { name: 'DARKOVA · DARK WEB MONITORING', caseId: 'nox-darkweb', items: ['TOR Network', 'Dark Web Portals', 'Marketplaces', 'Threat Actor Channels', 'Credential Dumps', 'Leaked Databases'], result: 'Dark Web Intel Harvested' },
      { name: 'OFFENSIVE HACKING', caseId: 'nox-offensive', caseLabel: 'WORKING ▸', steps: ['Reconnaissance', 'Vulnerability Assessment', 'Controlled Exploitation', 'Access & Collection', 'Evidence Extraction'], result: 'Authorized Access Achieved' },
      { name: 'ARIE · AUTO PENTESTING', caseId: 'nox-arie', caseLabel: 'AUTOMATED ▸', steps: ['Asset Discovery', 'Automated Scanning', 'Exploit Chaining', 'Privilege Escalation', 'Automated Reporting'], result: 'Pentest Report Generated' },
    ],
  },
  {
    id: 'ravenphase', num: '05', title: 'RAVEN', system: 'RAVEN', subtitle: 'Route Anomaly & Verification',
    units: ['CAPTURE', 'STITCH', 'COMPARE', 'FILTER', 'REPORT'],
    output: 'Change Sites Confirmed',
  },
  {
    id: 'defensivephase', num: '06', title: 'DEFENSIVE SUITE', system: 'DEFENSIVE SUITE', subtitle: 'See · Control · Respond',
    systemSub: 'Security Operations Platform',
    modules: [
      { name: 'SECURITY · SEE', items: ['Wazuh', 'Prometheus', 'Exporters', 'Grafana', 'Axn Telemetry'], result: 'Full Visibility' },
      { name: 'CONTROL · ENFORCE', items: ['Axn', 'Active Directory', 'Firewall'], result: 'Policy Enforced' },
      { name: 'RESPONSE · ACT', items: ['DFIR-IRIS', 'Shuffle', 'Axn Actions'], result: 'Automated Response' },
    ],
  },
  {
    id: 'raiphase', num: '07', title: 'TRUSTWORTHY AI', system: 'TRUSTWORTHY AI', subtitle: 'Secure, Responsible, Ethical',
    systemSub: 'Ethical by Design · Trusted by Default',
    units: ['FAIRNESS', 'TRANSPARENCY', 'PRIVACY', 'ACCOUNTABILITY'],
    output: 'Signed Assurance Evidence',
  },
]

const FlowArrow = () => (
  <div className="wf-arrow">
    <div className="wf-arrow__line" />
    <div className="wf-arrow__signal" />
    <div className="wf-arrow__head"><SvgArrowDown /></div>
  </div>
)

/* ===== GEOINT CASE FILE - Terrain Feature Analysis ===== */

const caseStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - WHAT THIS DOES',
    title: 'GEOINT · Terrain Feature Analysis',
    sub: 'Confirms where a photo or video was really captured. Terrain features in the frame are enhanced with AI, analyzed, and matched against satellite imagery until exact coordinates are verified.',
    flow: ['VIDEO / IMAGE IN', 'AI TERRAIN MATCH', 'COORDINATES OUT'],
  },
  {
    key: 'input', tab: 'INPUT', num: '01',
    tag: 'STEP 01 / 04',
    title: 'Source Frame from Video',
    sub: 'Single frame extracted from ground footage',
    meta: ['FRAME 00:14', 'MP4 · 1080p', 'EXIF: NONE'],
    img: '/geoint-source.png',
  },
  {
    key: 'enhance', tab: 'AI ENHANCE', num: '02',
    tag: 'STEP 02 / 04',
    title: 'AI Enhanced Terrain',
    sub: 'Denoise, sharpen & terrain detail recovery',
    meta: ['GAN UPSCALE ×4', 'CLARITY +82%', 'NOISE −64%'],
    img: '/geoint-enhanced.png',
  },
  {
    key: 'analysis', tab: 'ANALYSIS', num: '03',
    tag: 'STEP 03 / 04',
    title: 'Terrain Feature Analysis',
    sub: 'Key terrain indicators extracted from the frame',
    indicators: [
      'Narrow unpaved route in steep rocky terrain',
      'Green mountain vegetation and valley features',
      'Terrain Feature Analyzer pin confirms coordinate-based location',
    ],
    img: '/geoint-analysis.png',
  },
  {
    key: 'output', tab: 'OUTPUT', num: '04',
    tag: 'STEP 04 / 04',
    title: 'Location Confirmation',
    sub: 'Map pin aligns with uploaded coordinates and surrounding mountain terrain',
    coords: '34.6976, 72.6375',
    place: 'Chawga, Puran, Shangla',
    note: 'Similar terrain found in the same area',
    img: '/geoint-location.png',
  },
]

/* ===== NIGRAN CASE - Real-Time Media Monitoring ===== */

const nigranPlatforms = [
  { key: 'twitter', label: 'TWITTER / X', img: '/nigran-feed-twitter.png', color: '#1d9bf0' },
  { key: 'facebook', label: 'FACEBOOK', img: '/nigran-feed-facebook.png', color: '#1877f2' },
  { key: 'instagram', label: 'INSTAGRAM', img: '/nigran-feed-instagram.png', color: '#d6449a' },
  { key: 'youtube', label: 'YOUTUBE', img: '/nigran-feed-youtube.png', color: '#e53935' },
  { key: 'all', label: 'ALL FEEDS', img: '/nigran-feed-all.png', color: '#1a3a2a' },
]

const nigranStages = [
  {
    key: 'overview', tab: 'OVERVIEW', num: '00',
    tag: 'SUMMARY · PIPELINE',
    title: 'NIGRAN · Real-Time Media Monitoring',
    sub: 'A centralized platform that monitors, analyzes and generates intelligence from multiple social media platforms in real time — then turns raw feeds into alerts and reports.',
    flow: ['SOCIAL FEEDS IN', 'MONITOR · ANALYZE', 'ALERTS & REPORTS OUT'],
    meta: ['5 PLATFORMS', '24/7 LIVE', 'REAL-TIME ALERTS'],
    steps: [
      'Social media platforms monitored continuously',
      'Data collection - mentions fetched & stored',
      'Keyword & account monitoring',
      'Content & sentiment analysis',
      'Real-time alerts on relevant events',
      'Analytics & intelligence reports',
    ],
  },
  {
    key: 'dashboard', tab: 'DASHBOARD', num: '01',
    tag: 'LIVE MEDIA INTELLIGENCE',
    title: 'Operations Dashboard',
    img: '/nigran-dashboard.png',
    enhance: true,
    visualOnly: true,
  },
  {
    key: 'platforms', tab: 'PLATFORMS', num: '02',
    tag: 'MULTI-PLATFORM FEEDS',
    title: 'Live Platform Coverage',
    sub: 'Continuous monitoring across Twitter/X, Facebook, Instagram, YouTube and combined feeds — tap a card to focus that stream.',
    stack: true,
    meta: ['5 FEEDS', '24/7 LIVE', 'REAL-TIME'],
  },
]

/* ===== AGEX IRIS CASE - FR/FE Reconstruction & Matching ===== */

const agexStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - WHAT THIS DOES',
    title: 'AGEX IRIS · Facial Reconstruction & Recognition',
    sub: 'Restores degraded, obscured and damaged facial images using an in-house GAN reconstruction model, then passes the restored face to the recognition engine for NADRA database matching.',
    flow: ['DEGRADED FACE IN', 'GAN RESTORE', 'NADRA MATCH OUT'],
    meta: ['NUST GPU TRAINED', 'ASIAN FACIAL FEATURES', 'ANALYST-LED REVIEW'],
  },
  {
    key: 'input', tab: 'INPUT', num: '01',
    tag: 'STEP 01 / 04 - IMAM BARGAH CASE, ISLAMABAD',
    title: 'Degraded Face Image',
    sub: 'Severely damaged facial image recovered from the scene - Islamabad G10 SB, 11 Nov 2025.',
    img: '/agex-input.png',
    meta: ['SOURCE: SCENE MEDIA', 'QUALITY: SEVERE DAMAGE'],
    face: 'degraded',
  },
  {
    key: 'gan', tab: 'GAN MODEL', num: '02',
    tag: 'STEP 02 / 04',
    title: 'Reconstruction Architecture',
    sub: 'In-house model trained on NUST high-performance GPU infrastructure - fine-tuned on Asian facial characteristics and feature patterns.',
    img: '/agex-gan.png',
    meta: ['TRAIN → RESTORE', 'IN-HOUSE MODEL'],
    face: 'gan',
  },
  {
    key: 'restored', tab: 'RESTORED', num: '03',
    tag: 'STEP 03 / 04',
    title: 'Enhanced Face for Recognition',
    sub: 'Reconstructed face processed through the facial recognition engine and compared with existing databases.',
    img: '/agex-restored.png',
    meta: ['RECONSTRUCT → MATCH', 'RECOGNITION LAYER'],
    face: 'restored',
  },
  {
    key: 'matched', tab: 'MATCHED', num: '04',
    tag: 'STEP 04 / 04 - IDENTITY SURFACED',
    title: 'NADRA Match',
    sub: 'Identity candidate surfaced for analyst review - supporting investigative and forensic operations.',
    img: '/agex-matched.png',
    meta: ['NADRA DATABASE', 'CANDIDATE FOUND'],
    face: 'matched',
    match: {
      label: 'IDENTITY CANDIDATE',
      caseLine: 'Imam Bargah Case - Islamabad G10 SB · 11 Nov 2025',
      verdict: 'Analyst-led review',
    },
  },
]

/* ===== SOCIAL MEDIA RECON CASE - OSINT Intelligence ===== */

const socialPlatforms = [
  { name: 'FACEBOOK', color: '#1877f2' },
  { name: 'INSTAGRAM', color: '#d6449a' },
  { name: 'TIKTOK', color: '#111111' },
  { name: 'TELEGRAM', color: '#2aabee' },
  { name: 'LINKEDIN', color: '#0a66c2' },
  { name: 'TWITTER / X', color: '#1d9bf0' },
  { name: 'YOUTUBE', color: '#e53935' },
]

const socialStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - WHAT THIS DOES',
    title: 'Social Media Recon · OSINT Intelligence',
    sub: 'A unified view of social interaction - OSINT extraction and case-based intelligence support across every major platform.',
    flow: ['OSINT RECON', 'ACCOUNT MAPPING', 'PROFILE CORRELATION', 'ACTIONABLE LEADS'],
    meta: ['MULTI-PLATFORM OPS', 'TECHINT PROFILING', 'CASE-BASED INTEL'],
  },
  {
    key: 'platforms', tab: 'PLATFORMS', num: '01',
    tag: 'UNIFIED SOCIAL VIEW',
    title: 'Multi-Platform Operations',
    sub: 'Multi-platform ops for intelligence gathering - a single unified view of social interaction across all monitored networks.',
    social3d: true,
    meta: ['7 NETWORKS', 'UNIFIED VIEW'],
  },
  {
    key: 'metrics', tab: 'METRICS', num: '02',
    tag: 'DATA EXTRACTION - OSINT RECON',
    title: 'Extraction at Scale',
    sub: '2,000+ accounts mapped through OSINT recon, correlated into actionable intelligence.',
    stats: [
      { val: 2000, suffix: '+', label: 'Accounts mapped' },
      { val: 1200, suffix: '+', label: 'Missing persons profiles' },
      { val: 1200, suffix: '+', label: 'Faces processed' },
    ],
  },
  {
    key: 'pipeline', tab: 'PIPELINE', num: '03',
    tag: 'CASE STUDIES - TECHINT PROFILING',
    title: 'From Recon to Actionable Leads',
    sub: 'Suspects profiled in the database through TechINT - an OSINT pipeline turning raw social data into leads.',
    steps: [
      'OSINT Recon across all platforms',
      'Account Mapping - 2,000+ accounts linked',
      'Profile Correlation & identity resolution',
      'Actionable Leads surfaced for analysts',
    ],
  },
]

/* ===== CYBERINT RECON CASE - OSINT / Data Harvest ===== */

const cyberSources = [
  { name: 'GOV RECORDS', color: '#1a3a2a' },
  { name: 'PUBLIC DATABASES', color: '#2f6b45' },
  { name: 'DOMAINS', color: '#0a66c2' },
  { name: 'EMAILS', color: '#b2452f' },
  { name: 'PHONE NUMBERS', color: '#8a6d3b' },
  { name: 'LEAKED DATABASES', color: '#6d2e46' },
]

const cyberStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - WHAT THIS DOES',
    title: 'CyberInt Recon · OSINT Data Harvest',
    sub: 'Reconnaissance across open and closed sources - government records, public databases, domains, emails, phone numbers and leaked databases - compiled into actionable recon intelligence.',
    flow: ['SOURCE HARVEST', 'CORRELATION', 'SUSPECT PROFILING', 'ACTIONABLE LEADS'],
    meta: ['OSINT + TECHINT', 'CASE-BASED INTEL', 'ANALYST-LED REVIEW'],
  },
  {
    key: 'sources', tab: 'SOURCES', num: '01',
    tag: 'RECON SOURCES',
    title: 'Multi-Source Harvest',
    sub: 'Six recon streams merged into a single intelligence picture, harvested continuously and correlated per case.',
    ring: cyberSources, core: 'RECON',
    meta: ['6 STREAMS', 'CONTINUOUS'],
  },
  {
    key: 'metrics', tab: 'METRICS', num: '02',
    tag: 'IMPACT - TECHINT PROFILING',
    title: 'Recon at Scale',
    sub: 'Suspects profiled in the database through CyberInt - turning harvested records into supported cases.',
    stats: [
      { val: 63, suffix: '+', label: 'Cases supported with actionable leads' },
      { val: 13000, suffix: '', label: 'Suspects profiled through CyberInt' },
      { val: 20, suffix: ' Mn', label: 'Dark-web leaked records harvested' },
    ],
  },
  {
    key: 'pipeline', tab: 'PIPELINE', num: '03',
    tag: 'CASE STUDIES - CASE-BASED INTEL',
    title: 'From Harvest to Actionable Leads',
    sub: 'A recon pipeline turning raw records into case-ready intelligence for analysts.',
    steps: [
      'Source harvest across gov, public & leaked databases',
      'Correlation & identity resolution',
      'Suspect profiling - 13,000+ records matched',
      'Actionable leads surfaced for analyst review',
    ],
  },
]

const CountUp = ({ target, suffix = '', duration = 1300 }) => {
  const [n, setN] = useState(0)
  const rafRef = useRef()
  useEffect(() => {
    let start
    const tick = (t) => {
      if (start === undefined) start = t
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * target))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    // safety net: guarantees the final value even if rAF is throttled/paused
    const done = setTimeout(() => setN(target), duration + 250)
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(done) }
  }, [target, duration])
  return <span>{n.toLocaleString()}{suffix}</span>
}

// Remember missing case photos so re-mounts don't retry (and spam 404s)
const failedCaseImgs = new Set()

const CaseTyper = ({ text, active }) => {
  const [n, setN] = useState(0)
  useEffect(() => { if (!active) setN(0) }, [active])
  useEffect(() => {
    if (!active || n >= text.length) return
    const t = setTimeout(() => setN(n + 1), 55)
    return () => clearTimeout(t)
  }, [active, n, text])
  return <span>{text.slice(0, n)}<span className="wf-case__caret" /></span>
}

const TerrainScene = ({ variant }) => (
  <svg
    className={`wf-case__scene ${variant === 'blur' ? 'wf-case__scene--blur' : ''} ${variant === 'enhance' ? 'wf-case__scene--enhance' : ''}`}
    viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
  >
    <rect width="320" height="180" fill="#e5e0cd" />
    <polygon points="-10,100 60,30 150,100" fill="#95a582" />
    <polygon points="80,105 185,14 300,105" fill="#7a8b6a" />
    <polygon points="205,110 268,48 340,110" fill="#8ba077" />
    <rect y="98" width="320" height="82" fill="#a9b394" />
    <path d="M148 182 C158 152 136 132 160 112 C174 99 166 92 174 84" stroke="#d9cfae" strokeWidth="13" fill="none" strokeLinecap="round" />
    <circle cx="52" cy="128" r="7" fill="#5f7352" />
    <circle cx="72" cy="140" r="9" fill="#697d5a" />
    <circle cx="242" cy="132" r="8" fill="#5f7352" />
    <circle cx="262" cy="146" r="10" fill="#697d5a" />
    <circle cx="118" cy="150" r="6" fill="#5f7352" />
    <path d="M185 14 L205 40 L188 36 L174 52 L166 34 Z" fill="#e8e4d2" opacity="0.7" />
  </svg>
)

const MapScene = () => (
  <svg className="wf-case__scene" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="320" height="180" fill="#eae4d2" />
    <g stroke="#d3c9b2" strokeWidth="0.7">
      <line x1="0" y1="36" x2="320" y2="36" /><line x1="0" y1="72" x2="320" y2="72" />
      <line x1="0" y1="108" x2="320" y2="108" /><line x1="0" y1="144" x2="320" y2="144" />
      <line x1="46" y1="0" x2="46" y2="180" /><line x1="92" y1="0" x2="92" y2="180" />
      <line x1="138" y1="0" x2="138" y2="180" /><line x1="184" y1="0" x2="184" y2="180" />
      <line x1="230" y1="0" x2="230" y2="180" /><line x1="276" y1="0" x2="276" y2="180" />
    </g>
    <ellipse cx="176" cy="78" rx="52" ry="30" fill="none" stroke="#b9c0a2" strokeWidth="1" opacity="0.8" />
    <ellipse cx="176" cy="78" rx="34" ry="19" fill="none" stroke="#aeb796" strokeWidth="1" opacity="0.8" />
    <ellipse cx="176" cy="78" rx="17" ry="9" fill="none" stroke="#a3ad8b" strokeWidth="1" opacity="0.8" />
    <path d="M0 132 C70 122 118 92 178 96 C238 101 282 70 320 64" stroke="#c9bda0" strokeWidth="5" fill="none" />
    <path d="M58 182 C92 143 148 132 186 98" stroke="#d2c7ab" strokeWidth="3.5" fill="none" />
    <path d="M300 182 C270 150 240 140 206 118" stroke="#d2c7ab" strokeWidth="3" fill="none" />
    <path d="M0 24 C60 36 120 26 190 40 C250 50 290 44 320 52" stroke="#b8c4c4" strokeWidth="4" fill="none" opacity="0.8" />
  </svg>
)

/* Wireframe threat globe (Darkova console) */
const GLOBE_ARCS = [
  { d: 'M70 128 Q150 20 244 96', hot: false },
  { d: 'M110 66 Q170 150 214 236', hot: true },
  { d: 'M96 190 Q150 120 236 150', hot: false },
  { d: 'M244 96 Q210 40 150 42', hot: false },
]
const GLOBE_NODES = [[92, 96], [150, 42], [236, 150], [110, 200], [214, 96], [160, 250]]

const DarkGlobe = () => (
  <svg className="wf-globe" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <radialGradient id="dovaGlobeGlow" cx="48%" cy="42%" r="60%">
        <stop offset="0%" stopColor="rgba(70,110,180,0.3)" />
        <stop offset="100%" stopColor="rgba(10,14,30,0)" />
      </radialGradient>
      <clipPath id="dovaGlobeClip"><circle cx="150" cy="150" r="118" /></clipPath>
    </defs>
    <circle cx="150" cy="150" r="126" fill="url(#dovaGlobeGlow)" />
    {/* wireframe sphere */}
    <g stroke="rgba(96,140,210,0.4)" strokeWidth="0.8" fill="none">
      <circle cx="150" cy="150" r="118" />
      <ellipse cx="150" cy="100" rx="98" ry="16" />
      <ellipse cx="150" cy="150" rx="118" ry="24" />
      <ellipse cx="150" cy="200" rx="98" ry="16" />
      <ellipse cx="150" cy="150" rx="42" ry="118" />
      <ellipse cx="150" cy="150" rx="84" ry="118" />
    </g>
    {/* continents (clipped to sphere) */}
    <g clipPath="url(#dovaGlobeClip)" fill="rgba(150,190,240,0.1)" stroke="rgba(190,215,255,0.5)" strokeWidth="0.9">
      <path d="M70 96 Q104 78 120 100 Q128 124 104 138 Q78 140 68 118 Q62 104 70 96 Z" />
      <path d="M150 70 Q196 66 214 92 Q220 118 190 128 Q158 126 150 100 Q146 82 150 70 Z" />
      <path d="M120 180 Q150 168 168 190 Q172 214 148 224 Q124 220 116 200 Q114 188 120 180 Z" />
      <path d="M206 156 Q232 150 240 172 Q238 192 216 194 Q200 184 206 156 Z" />
    </g>
    {/* attack arcs - comet pulse */}
    <g clipPath="url(#dovaGlobeClip)">
      {GLOBE_ARCS.map((a, i) => <path key={`b${i}`} className="wf-tm__arc-base" d={a.d} />)}
      {GLOBE_ARCS.map((a, i) => (
        <path key={`p${i}`} className={`wf-tm__arc-pulse ${a.hot ? 'wf-tm__arc-pulse--hot' : ''}`} d={a.d} style={{ animationDelay: `${i * 0.55}s` }} />
      ))}
    </g>
    {/* glowing threat nodes */}
    <g clipPath="url(#dovaGlobeClip)">
      {GLOBE_NODES.map(([x, y], i) => (
        <g key={i}>
          <circle className="wf-tm__ring" cx={x} cy={y} r="3.5" style={{ animationDelay: `${i * 0.35}s` }} />
          <circle className="wf-tm__node" cx={x} cy={y} r="2.4" />
        </g>
      ))}
    </g>
  </svg>
)

const DOVA_STATS = [
  { label: 'LIVE ARCS', val: '10', c: '#4fd88a' },
  { label: 'TOTAL ALERTS', val: '129', c: '#e8913a' },
  { label: 'UNACK', val: '37', c: '#b78bff' },
  { label: 'WATCHLIST', val: '8', c: '#5aa9e6' },
  { label: 'SOURCES', val: '8', c: '#3fc9b0' },
]
const DOVA_CONSOLE_TABS = ['THREAT MAP', 'SHADOW LEDGER', 'SPECTRAL SIEVE', 'FINGERPRINT']
const DOVA_FEED = [
  { t: '14:51:14.589', sev: 'CRITICAL', from: 'SA', to: 'CN' },
  { t: '14:51:13.091', sev: 'CRITICAL', from: 'US', to: 'MX' },
  { t: '14:51:11.588', sev: 'MEDIUM', from: 'IR', to: 'IT' },
  { t: '14:51:10.105', sev: 'MEDIUM', from: 'NG', to: 'AF' },
]

const DarkovaDashboard = () => (
  <div className="wf-dova">
    <div className="wf-dova__top">
      <span className="wf-dova__brand">◑ DARKOVA WATCH <em>· Onion Crawler v3</em></span>
      <span className="wf-dova__ops"><span className="wf-dova__ops-dot" /> OPERATIONAL · 8 SOURCES</span>
    </div>

    <div className="wf-dova__stats">
      {DOVA_STATS.map((s, i) => (
        <div key={i} className="wf-dova-stat">
          <span className="wf-dova-stat__label">{s.label}</span>
          <span className="wf-dova-stat__val" style={{ color: s.c }}>{s.val}</span>
        </div>
      ))}
    </div>

    <div className="wf-dova__tabs">
      {DOVA_CONSOLE_TABS.map((t, i) => (
        <span key={i} className={`wf-dova__ctab ${i === 0 ? 'wf-dova__ctab--active' : ''}`}>
          {t}{i === 0 && <em className="wf-dova__ctab-badge">10</em>}
        </span>
      ))}
    </div>

    <div className="wf-dova__body">
      <div className="wf-dova__globe">
        <span className="wf-dova__globe-label"><span className="wf-dova__ops-dot" /> LIVE · GLOBAL THREAT GLOBE</span>
        <span className="wf-dova__globe-arcs">ACTIVE ARCS · 10</span>
        <DarkGlobe />
      </div>
      <div className="wf-dova__feed">
        <div className="wf-dova__feed-head">LIVE ATTACK FEED <span className="wf-dova__ops-dot" /></div>
        {DOVA_FEED.map((f, i) => (
          <div key={i} className={`wf-dova-feed__row wf-dova-feed__row--${f.sev.toLowerCase()}`}>
            <span className="wf-dova-feed__ts">{f.t} <em>{f.sev}</em></span>
            <span className="wf-dova-feed__route">{f.from} → {f.to}</span>
            <span className="wf-dova-feed__tag">vector logged</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const FaceScene = ({ variant }) => {
  const skin = variant === 'degraded' ? '#6a6258' : variant === 'gan' ? '#7a8b6a' : '#c9baa5'
  return (
    <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="200" fill={variant === 'matched' ? '#e9e6da' : '#dfdbcd'} />
      {variant === 'matched' && (
        <rect x="92" y="18" width="136" height="170" rx="8" fill="#f4f1e7" stroke="#c8bdb0" strokeWidth="1.5" />
      )}
      <g>
        <ellipse cx="160" cy="92" rx="40" ry="50" fill={skin} opacity="0.92" />
        <path d="M120 92 C120 56 136 40 160 40 C184 40 200 56 200 92 C200 74 188 64 160 64 C132 64 120 74 120 92 Z" fill="#3a352c" opacity="0.85" />
        <rect x="104" y="150" width="112" height="50" rx="20" fill={variant === 'gan' ? '#697d5a' : '#8a7d70'} opacity="0.9" />
      </g>
      {variant === 'degraded' && (
        <g stroke="#3a352c" strokeWidth="1.5" opacity="0.7">
          <path d="M138 74 L150 90 L142 104" fill="none" />
          <path d="M176 66 L168 84 L180 98" fill="none" />
          <path d="M152 118 L164 126" fill="none" />
        </g>
      )}
      {variant === 'gan' && (
        <g stroke="rgba(0,200,83,0.55)" strokeWidth="0.8" fill="none">
          <path d="M120 92 L160 40 L200 92 L160 142 Z" />
          <path d="M120 92 L200 92 M160 40 L160 142 M136 62 L184 122 M184 62 L136 122" />
          <circle cx="160" cy="92" r="2.5" fill="rgba(0,200,83,0.8)" stroke="none" />
        </g>
      )}
      {variant === 'matched' && (
        <g fill="#b0a090">
          <rect x="108" y="160" width="70" height="5" rx="2" />
          <rect x="108" y="172" width="96" height="5" rx="2" />
        </g>
      )}
    </svg>
  )
}

/* Stage explorer — Back / Forward only (inside the card) */
const CaseExplorer = ({ name, stages, stage, setStage, onClose, renderBody, inline, onExitToWorkflow }) => {
  const s = stages[stage]
  const atStart = stage <= 0
  const atEnd = stage >= stages.length - 1
  const previousStage = () => {
    if (!atStart) {
      setStage(stage - 1)
      return
    }
    if (onExitToWorkflow) onExitToWorkflow()
  }
  const nextStage = () => { if (!atEnd) setStage(stage + 1) }

  useEffect(() => {
    if (!inline) return undefined
    return reelNavBus.subscribe((dir) => {
      setStage((cur) => {
        if (dir < 0) {
          if (cur <= 0) {
            onExitToWorkflow?.()
            return cur
          }
          return cur - 1
        }
        if (dir > 0) return Math.min(stages.length - 1, cur + 1)
        return cur
      })
    })
  }, [inline, stages.length, setStage, onExitToWorkflow])

  const nav = (
    <div className="wf-reel-controls">
      <button
        type="button"
        className="wf-media-btn"
        onClick={previousStage}
        disabled={atStart && !onExitToWorkflow}
        aria-label="Back"
      >
        <SvgBack />
      </button>
      <span className="wf-reel-controls__count">{stage + 1}/{stages.length}</span>
      <button
        type="button"
        className="wf-media-btn"
        onClick={nextStage}
        disabled={atEnd}
        aria-label="Forward"
      >
        <SvgForward />
      </button>
    </div>
  )

  if (inline) {
    return (
      <div className="wf-inline-reel">
        {name && <div className="wf-inline-reel__name">{name}</div>}
        <div className="wf-inline-reel__nav">
          <div className="wf-explorer__tabs wf-inline-reel__tabs">
            {stages.map((st, i) => (
              <button
                key={st.key} type="button"
                className={`wf-explorer__tab ${i === stage ? 'wf-explorer__tab--active' : ''}`}
                onClick={() => setStage(i)}
              >
                <span className="wf-explorer__tab-num">{st.num}</span>
                {st.tab}
              </button>
            ))}
          </div>
          {nav}
        </div>
        <div key={s.key} className="wf-sat wf-sat--active wf-focus__card wf-explorer__card">
          {renderBody(s, true)}
        </div>
      </div>
    )
  }

  return createPortal(
    <div className="wf-focus" onClick={onClose}>
      <div className="wf-explorer" onClick={(e) => e.stopPropagation()}>
        <div className="wf-explorer__head">
          <span className="wf-explorer__name">{name}</span>
          <button className="wf-focus__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="wf-explorer__tabs">
          {stages.map((st, i) => (
            <button
              key={st.key} type="button"
              className={`wf-explorer__tab ${i === stage ? 'wf-explorer__tab--active' : ''}`}
              onClick={() => setStage(i)}
            >
              <span className="wf-explorer__tab-num">{st.num}</span>
              {st.tab}
            </button>
          ))}
          <div className="wf-reel-controls--modal">{nav}</div>
        </div>
        <div key={s.key} className="wf-sat wf-sat--active wf-focus__card wf-explorer__card">
          {renderBody(s, true)}
        </div>
      </div>
    </div>,
    document.body
  )
}

const useCaseExplorer = (open, onClose) => {
  const [stage, setStage] = useState(0)

  useEffect(() => { if (open) setStage(0) }, [open])

  useEffect(() => {
    if (!open || !onClose) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return { stage, setStage }
}

const TerrainCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)
  const run = open || inline

  const renderBody = (s, active) => (
    <>
          {s.key !== 'summary' && (
            <div className="wf-case__visual">
              {s.img && !failedCaseImgs.has(s.img) && (
                <img
                  src={s.img} alt=""
                  className={`wf-case__photo ${s.key === 'input' ? 'wf-case__photo--blur' : ''} ${s.key === 'enhance' ? 'wf-case__photo--enhance' : ''}`}
                  onError={(e) => { failedCaseImgs.add(s.img); e.currentTarget.style.display = 'none' }}
                />
              )}

              {s.key === 'output'
                ? <MapScene />
                : <TerrainScene variant={s.key === 'input' ? 'blur' : s.key === 'enhance' ? 'enhance' : undefined} />}

              {s.key === 'input' && (
                <>
                  <span className="wf-case__rec"><span className="wf-case__rec-dot" /> REC</span>
                  <span className="wf-case__play" />
                  <span className="wf-case__timecode">00:14:07 &nbsp;·&nbsp; 1920×1080</span>
                </>
              )}

              {s.key === 'enhance' && (
                <>
                  <span className="wf-case__beam" />
                  <span className="wf-case__bracket wf-case__bracket--tl" />
                  <span className="wf-case__bracket wf-case__bracket--tr" />
                  <span className="wf-case__bracket wf-case__bracket--bl" />
                  <span className="wf-case__bracket wf-case__bracket--br" />
                  <span className="wf-case__badge">AI ENHANCING…</span>
                </>
              )}

              {s.key === 'analysis' && (
                <>
                  <span className="wf-case__box wf-case__box--trail">TRAIL</span>
                  <span className="wf-case__box wf-case__box--ridge">RIDGE LINE</span>
                  <span className="wf-case__box wf-case__box--veg">VEGETATION</span>
                </>
              )}

              {s.key === 'output' && (
                <>
                  <span className="wf-case__ripple" />
                  <span className="wf-case__pin" />
                  <span className="wf-case__coord-chip">{s.coords}</span>
                </>
              )}
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}

            {s.indicators && (
              <div className="wf-case__list">
                {s.indicators.map((item, li) => (
                  <div key={li} className="wf-case__list-item" style={{ animationDelay: `${0.25 + li * 0.35}s` }}>
                    <span className="wf-case__list-check"><SvgCheck /></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {s.coords && (
              <div className="wf-case__result">
                <span className="wf-case__result-label">LOCATION COORD</span>
                <span className="wf-case__coords">
                  {active ? <CaseTyper text={s.coords} active={run} /> : s.coords}
                </span>
                <span className="wf-case__place">{s.place}</span>
                <span className="wf-case__note"><SvgCheck /> {s.note}</span>
              </div>
            )}
          </div>
    </>
  )

  if (!open && !inline) return null
  return (
    <CaseExplorer
      inline={inline}
      name="GEOINT - TERRAIN FEATURE ANALYSIS CASE"
      stages={caseStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

const NigranCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)
  const [plat, setPlat] = useState(0)
  const onPlatforms = nigranStages[stage]?.stack

  // Platform stack rotates while the Platforms stage is showing
  useEffect(() => {
    if ((!open && !inline) || !onPlatforms) return
    const t = setInterval(() => setPlat((p) => (p + 1) % nigranPlatforms.length), 2400)
    return () => clearInterval(t)
  }, [open, inline, onPlatforms])

  const renderBody = (s) => (
    <>
      {s.img && (
        <div className={`wf-case__visual wf-case__visual--tall${s.enhance ? ' wf-case__visual--nigran-dash' : ''}${s.visualOnly ? ' wf-case__visual--fill' : ''}`}>
          {!failedCaseImgs.has(s.img) && (
            <img
              src={s.img} alt={s.title}
              className={`wf-case__photo wf-case__photo--top${s.enhance ? ' wf-case__photo--nigran-enhance' : ''}`}
              onError={(e) => { failedCaseImgs.add(s.img); e.currentTarget.style.display = 'none' }}
            />
          )}
          <span className="wf-case__rec"><span className="wf-case__rec-dot wf-case__rec-dot--live" /> LIVE</span>
          <span className="wf-case__beam" />
          {s.enhance && <span className="wf-nigran-dash-chip">DASHBOARD</span>}
        </div>
      )}

      {s.stack && (
        <div className="wf-case__visual wf-case__visual--stack wf-case__visual--nigran-stack">
          {nigranPlatforms.map((p, pi) => {
            const off = (pi - plat + nigranPlatforms.length) % nigranPlatforms.length
            return (
              <div
                key={p.key}
                className={`wf-stack__card wf-stack__card--o${off}`}
                onClick={(e) => { e.stopPropagation(); setPlat(pi) }}
              >
                {!failedCaseImgs.has(p.img) && (
                  <img
                    src={p.img} alt={p.label}
                    className="wf-stack__img wf-stack__img--enhance"
                    onError={(e) => { failedCaseImgs.add(p.img); e.currentTarget.style.display = 'none' }}
                  />
                )}
                <span className="wf-stack__label">
                  <span className="wf-stack__dot" style={{ background: p.color }} />
                  {p.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {!s.visualOnly && (
        <div className={`wf-case__info${s.key === 'overview' ? ' wf-case__info--nigran-overview' : ''}`}>
          <span className="wf-case__stage-tag">{s.tag}</span>
          <h4 className="wf-case__title">{s.title}</h4>
          <p className="wf-case__sub">{s.sub}</p>

          {s.flow && (
            <div className="wf-case__flow">
              {s.flow.map((f, fi) => (
                <span key={fi} className="wf-case__flow-step">
                  {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                  <span className="wf-case__flow-chip">{f}</span>
                </span>
              ))}
            </div>
          )}

          {s.meta && (
            <div className="wf-case__meta">
              {s.meta.map((m, mi) => (
                <span key={mi} className="wf-case__meta-chip">{m}</span>
              ))}
            </div>
          )}

          {s.steps && (
            <div className="wf-case__list">
              {s.steps.map((item, si) => (
                <div key={si} className="wf-case__list-item">
                  <span className="wf-case__step-num">{si + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )

  if (!open && !inline) return null
  return (
    <CaseExplorer
      inline={inline}
      name={inline ? '' : 'NIGRAN - MEDIA MONITORING CASE'}
      stages={nigranStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

const AgexCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)

  const renderBody = (s, active) => (
    <>
          {s.face && (
            <div className="wf-case__visual wf-case__visual--tall wf-case__visual--face">
              {s.img && !failedCaseImgs.has(s.img) && (
                <img
                  src={s.img} alt={s.title}
                  className={`wf-case__photo wf-case__photo--face ${s.face === 'degraded' ? 'wf-case__photo--degraded' : ''} ${s.face === 'restored' ? 'wf-case__photo--enhance' : ''}`}
                  onError={(e) => { failedCaseImgs.add(s.img); e.currentTarget.style.display = 'none' }}
                />
              )}

              <FaceScene variant={s.face} />

              {s.face === 'degraded' && (
                <>
                  <span className="wf-case__coord-chip">IMAM BARGAH CASE - ISLAMABAD</span>
                  <span className="wf-case__bracket wf-case__bracket--tl" />
                  <span className="wf-case__bracket wf-case__bracket--tr" />
                  <span className="wf-case__bracket wf-case__bracket--bl" />
                  <span className="wf-case__bracket wf-case__bracket--br" />
                  <span className="wf-case__badge">EVIDENCE 01</span>
                </>
              )}

              {s.face === 'gan' && (
                <>
                  <span className="wf-case__mesh" />
                  <span className="wf-case__beam" />
                  <span className="wf-case__badge">GAN RECONSTRUCTING…</span>
                </>
              )}

              {s.face === 'restored' && (
                <>
                  <span className="wf-case__bracket wf-case__bracket--tl" />
                  <span className="wf-case__bracket wf-case__bracket--tr" />
                  <span className="wf-case__bracket wf-case__bracket--bl" />
                  <span className="wf-case__bracket wf-case__bracket--br" />
                  <span className="wf-case__badge">ENHANCED FOR RECOGNITION</span>
                </>
              )}

              {s.face === 'matched' && (
                <>
                  <span className="wf-case__stamp">NADRA MATCH ✓</span>
                  <span className="wf-case__coord-chip">CANDIDATE SURFACED</span>
                </>
              )}
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}

            {s.match && (
              <div className="wf-case__result">
                <span className="wf-case__result-label">{s.match.label}</span>
                <span className="wf-case__matchline">{s.match.caseLine}</span>
                <span className="wf-case__note"><SvgCheck /> {s.match.verdict}</span>
              </div>
            )}
          </div>
    </>
  )

  if (!open && !inline) return null
  return (
    <CaseExplorer
      inline={inline}
      name="AGEX IRIS - FR/FE RECONSTRUCTION CASE"
      stages={agexStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

const SocialCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)
  const angle = 360 / socialPlatforms.length

  const renderBody = (s) => (
    <>
          {s.social3d && (
            <div className="wf-case__visual wf-case__visual--3d">
              <div className="wf-social3d">
                <div className="wf-social3d__ring">
                  {socialPlatforms.map((p, i) => (
                    <div
                      key={p.name}
                      className="wf-social3d__node"
                      style={{ transform: `rotateY(${i * angle}deg) translateZ(195px)` }}
                    >
                      <span className="wf-social3d__dot" style={{ background: p.color }} />
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
              <span className="wf-social3d__core">OSINT</span>
              <span className="wf-case__badge">UNIFIED SOCIAL VIEW</span>
            </div>
          )}

          {s.stats && (
            <div className="wf-case__visual wf-case__visual--stats">
              {s.stats.map((st, i) => (
                <div key={i} className="wf-stat3d" style={{ animationDelay: `${0.15 + i * 0.14}s` }}>
                  <span className="wf-stat3d__val"><CountUp target={st.val} suffix={st.suffix} /></span>
                  <span className="wf-stat3d__label">{st.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}

            {s.steps && (
              <div className="wf-case__list">
                {s.steps.map((item, si) => (
                  <div key={si} className="wf-case__list-item" style={{ animationDelay: `${0.2 + si * 0.22}s` }}>
                    <span className="wf-case__step-num">{si + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
    </>
  )

  if (!open && !inline) return null
  return (
    <CaseExplorer
      name="SOCIAL MEDIA RECON - OSINT CASE"
      stages={socialStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      inline={inline}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

const CyberCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)

  const renderBody = (s) => {
    const angle = s.ring ? 360 / s.ring.length : 0
    return (
    <>
          {s.ring && (
            <div className="wf-case__visual wf-case__visual--3d">
              <div className="wf-social3d">
                <div className="wf-social3d__ring">
                  {s.ring.map((p, i) => (
                    <div
                      key={p.name}
                      className="wf-social3d__node"
                      style={{ transform: `rotateY(${i * angle}deg) translateZ(195px)` }}
                    >
                      <span className="wf-social3d__dot" style={{ background: p.color }} />
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
              <span className="wf-social3d__core">{s.core}</span>
              <span className="wf-case__badge">RECON SOURCES</span>
            </div>
          )}

          {s.stats && (
            <div className="wf-case__visual wf-case__visual--stats">
              {s.stats.map((st, i) => (
                <div key={i} className="wf-stat3d" style={{ animationDelay: `${0.15 + i * 0.14}s` }}>
                  <span className="wf-stat3d__val"><CountUp target={st.val} suffix={st.suffix} /></span>
                  <span className="wf-stat3d__label">{st.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}

            {s.steps && (
              <div className="wf-case__list">
                {s.steps.map((item, si) => (
                  <div key={si} className="wf-case__list-item" style={{ animationDelay: `${0.2 + si * 0.22}s` }}>
                    <span className="wf-case__step-num">{si + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
    </>
    )
  }

  if (!open && !inline) return null
  return (
    <CaseExplorer
      inline={inline}
      name="CYBERINT RECON - OSINT DATA HARVEST CASE"
      stages={cyberStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

/* ===== DARKOVA - Dark Web Monitoring (NOX) ===== */

const darkovaSources = [
  { name: 'INDIAN GOVT DB', color: '#c9a227' },
  { name: 'ISRAELI RED DOME', color: '#e05d4f' },
  { name: 'DARK WEB LEAKFORUMS', color: '#9668dc' },
  { name: 'TELEGRAM CHANNELS', color: '#2aabee' },
  { name: 'RANSOMWARE BLOGS', color: '#d6449a' },
  { name: '.ONION MARKETS (TOR)', color: '#7a5fd0' },
]

const darkovaStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - WHAT NOX HARVESTS',
    title: 'Darkova · Dark Web Monitoring',
    sub: 'Continuously monitoring hostile platforms, harvesting leaked databases and mapping threat actors across the onion network.',
    flow: ['MONITOR HOSTILE PLATFORMS', 'HARVEST LEAKS', 'MAP THREAT ACTORS'],
    meta: ['ONION SURVEILLANCE', 'LEAK HARVESTING', 'THREAT-ACTOR MAPPING'],
  },
  {
    key: 'dashboard', tab: 'DASHBOARD', num: '01',
    tag: 'MODULE 03 · DARKOVA - NOX LAB ENGINE',
    title: 'Darkova Threat Console',
    sub: 'Live global threat globe with realtime attack arcs, alert triage and an onion-crawler source feed.',
    dashboard: true,
    meta: ['GLOBAL THREAT GLOBE', 'LIVE ATTACK FEED'],
  },
  {
    key: 'harvest', tab: 'HARVEST', num: '02',
    tag: 'WHAT NOX HARVESTS',
    title: 'Dark Web Harvest at Scale',
    sub: 'Leaked records, hostile accounts and infiltrated markets - the yield of continuous dark-web surveillance.',
    stats: [
      { val: 20, suffix: ' Mn', label: 'Leaked Records Harvested', note: 'Indian · Israeli Red Dome' },
      { val: 750, suffix: '', label: 'Hostile Accounts Mapped', note: 'Forums · Markets · Chans' },
      { val: 3, suffix: '+', label: 'Dark Markets Infiltrated', note: '.onion network surveillance' },
    ],
  },
  {
    key: 'sources', tab: 'SOURCES', num: '03',
    tag: 'SOURCES MONITORED',
    title: 'Monitored Hostile Sources',
    sub: 'Six hostile source families under continuous surveillance and correlation.',
    ring: darkovaSources, core: 'DARKOVA',
    meta: ['6 SOURCE FAMILIES', 'CONTINUOUS'],
  },
]

const DarkovaCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)

  const renderBody = (s) => {
    const angle = s.ring ? 360 / s.ring.length : 0
    return (
    <>
          {s.dashboard && <DarkovaDashboard />}

          {s.ring && (
            <div className="wf-case__visual wf-case__visual--3d wf-case__visual--dark">
              <div className="wf-social3d">
                <div className="wf-social3d__ring">
                  {s.ring.map((p, i) => (
                    <div
                      key={p.name}
                      className="wf-social3d__node"
                      style={{ transform: `rotateY(${i * angle}deg) translateZ(195px)` }}
                    >
                      <span className="wf-social3d__dot" style={{ background: p.color }} />
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
              <span className="wf-social3d__core">{s.core}</span>
              <span className="wf-case__badge">SOURCES MONITORED</span>
            </div>
          )}

          {s.stats && (
            <div className="wf-case__visual wf-case__visual--stats wf-stats--gold">
              {s.stats.map((st, i) => (
                <div key={i} className="wf-stat3d" style={{ animationDelay: `${0.15 + i * 0.14}s` }}>
                  <span className="wf-stat3d__val"><CountUp target={st.val} suffix={st.suffix} /></span>
                  <span className="wf-stat3d__label">{st.label}</span>
                  {st.note && <span className="wf-stat3d__note">{st.note}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}
          </div>
    </>
    )
  }

  if (!open && !inline) return null
  return (
    <CaseExplorer
      inline={inline}
      name="DARKOVA - NOX DARK WEB MONITORING CASE"
      stages={darkovaStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

/* ===== OFFENSIVE HACKING (NOX) - one-tap backdoor attack chain ===== */

const AttackScene = ({ variant }) => {
  if (variant === 'terminal') {
    const rows = [
      { w: 200, c: '#3ad17a' }, { w: 130, c: '#e0574a' }, { w: 240, c: '#5a6478' },
      { w: 96, c: '#3ad17a' }, { w: 170, c: '#3ad17a' }, { w: 150, c: '#e0574a' },
      { w: 210, c: '#5a6478' }, { w: 120, c: '#3ad17a' },
    ]
    return (
      <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="320" height="200" fill="#080b10" />
        {rows.map((r, i) => (
          <rect key={i} className="wf-atk-line" x="14" y={16 + i * 20} width={r.w} height="6" rx="2" fill={r.c} style={{ animationDelay: `${i * 0.13}s` }} />
        ))}
        <rect className="wf-atk-cursor" x="14" y={16 + rows.length * 20} width="10" height="7" fill="#3ad17a" />
      </svg>
    )
  }
  if (variant === 'whatsapp') {
    return (
      <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="320" height="200" fill="#0b141a" />
        <rect x="0" y="0" width="320" height="12" fill="#128c7e" />
        <rect x="66" y="34" width="188" height="132" rx="12" fill="#1f2c33" />
        <rect x="80" y="46" width="160" height="78" rx="8" fill="#0e181e" />
        <circle cx="160" cy="85" r="22" fill="#3a4a52" />
        <path d="M152 76 l20 9 l-20 9 z" fill="#8fb0bd" />
        <rect x="80" y="132" width="150" height="6" rx="3" fill="#4a5a62" />
        <rect x="80" y="144" width="112" height="6" rx="3" fill="#33454d" />
      </svg>
    )
  }
  if (variant === 'clone') {
    return (
      <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="320" height="200" fill="#e7e3da" />
        <rect x="0" y="0" width="320" height="18" fill="#33373b" />
        <circle cx="12" cy="9" r="3" fill="#e0574a" /><circle cx="24" cy="9" r="3" fill="#d9a441" /><circle cx="36" cy="9" r="3" fill="#3ad17a" />
        <rect x="86" y="40" width="148" height="128" rx="8" fill="#fff" stroke="#dcdcdc" />
        <rect x="86" y="40" width="148" height="30" rx="8" fill="#f57224" />
        <rect x="100" y="86" width="120" height="8" rx="3" fill="#dddddd" />
        <rect x="100" y="102" width="84" height="8" rx="3" fill="#ececec" />
        <rect x="100" y="132" width="120" height="22" rx="6" fill="#f57224" />
      </svg>
    )
  }
  // 'app' - Daraz-clone app grid
  return (
    <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="200" fill="#f2f2f2" />
      <rect x="0" y="0" width="320" height="26" fill="#f57224" />
      <rect x="12" y="8" width="180" height="10" rx="5" fill="#ffd9c2" />
      <rect x="12" y="38" width="296" height="46" rx="6" fill="#ffe1cf" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={12 + i * 74} y="96" width="62" height="52" rx="6" fill="#ffffff" stroke="#e6e6e6" />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={12 + i * 74} y="156" width="62" height="34" rx="6" fill="#ffffff" stroke="#e6e6e6" />)}
      <rect x="0" y="192" width="320" height="8" fill="#f57224" />
    </svg>
  )
}

const offensiveStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - HOW NOX DELIVERS A BACKDOOR',
    title: 'Offensive Hacking · One-Tap Backdoor',
    sub: 'A pixel-perfect Daraz clone delivered via WhatsApp - silent backdoor, full Android device access via C2.',
    flow: ['DELIVERY', 'INFECTION', 'PERSISTENCE', 'EXFILTRATION'],
    meta: ['WHATSAPP DELIVERY', 'SILENT BACKDOOR', 'C2 DEVICE ACCESS'],
  },
  {
    key: 'delivery', tab: 'DELIVERY', num: '01',
    tag: 'STEP 01 / 04 - DELIVERY',
    title: 'WhatsApp',
    sub: 'Victim receives a crafted link disguised as a Daraz special offer via WhatsApp message.',
    img: '/offensive-whatsapp.png', scene: 'whatsapp', badge: 'DELIVERY',
  },
  {
    key: 'infection', tab: 'INFECTION', num: '02',
    tag: 'STEP 02 / 04 - INFECTION',
    title: 'Clone Installed',
    sub: 'Victim clicks and installs a pixel-perfect Daraz clone APK with one tap - no suspicion.',
    img: '/offensive-clone.png', scene: 'clone', badge: 'INFECTION',
  },
  {
    key: 'persistence', tab: 'PERSISTENCE', num: '03',
    tag: 'STEP 03 / 04 - PERSISTENCE',
    title: 'Back Door Opens',
    sub: 'App silently opens a persistent backdoor upon launch, granting remote C2 access 24/7.',
    img: '/offensive-c2.png', scene: 'terminal', badge: 'PERSISTENCE', live: 'C2 LIVE',
  },
  {
    key: 'exfiltration', tab: 'EXFILTRATION', num: '04',
    tag: 'STEP 04 / 04 - EXFILTRATION',
    title: 'Full Access',
    sub: 'Camera · Microphone · GPS · Messages · Files · Call logs - all live-streamed to C2 server.',
    img: '/offensive-app.png', scene: 'app', badge: 'EXFILTRATION',
    access: ['Camera', 'Microphone', 'GPS', 'Messages', 'Files', 'Call logs'],
    c2note: 'All live-streamed to C2 server',
  },
  {
    key: 'next', tab: 'NEXT', num: '05',
    tag: 'FUTURE NOVELTY - NEXT VERSION',
    title: 'One-Click Compromise',
    sub: 'The next version collapses the entire chain into a single click - delivery, install and backdoor in one action, with zero further victim interaction.',
    novelty: true,
    flow: ['ONE CLICK', 'AUTO-INSTALL', 'INSTANT C2'],
  },
]

const OffensiveCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)

  const renderBody = (s) => (
    <>
          {s.scene && (
            <div className="wf-case__visual wf-case__visual--tall wf-case__visual--attack">
              {s.img && !failedCaseImgs.has(s.img) && (
                <img
                  src={s.img} alt={s.title}
                  className="wf-case__photo wf-case__photo--top"
                  onError={(e) => { failedCaseImgs.add(s.img); e.currentTarget.style.display = 'none' }}
                />
              )}
              <AttackScene variant={s.scene} />
              {s.badge && <span className="wf-case__badge wf-case__badge--red">{s.badge}</span>}
              {s.live && <span className="wf-case__rec"><span className="wf-case__rec-dot" /> {s.live}</span>}
            </div>
          )}

          {s.novelty && (
            <div className="wf-case__visual wf-case__visual--tall wf-case__visual--attack wf-novelty">
              <span className="wf-novelty__tag">NEXT VERSION</span>
              <span className="wf-novelty__num">1</span>
              <span className="wf-novelty__click">CLICK</span>
              <span className="wf-novelty__sub">FULL COMPROMISE · ZERO INTERACTION</span>
              <span className="wf-novelty__pulse" />
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}

            {s.access && (
              <div className="wf-case__meta wf-access">
                {s.access.map((a, ai) => (
                  <span key={ai} className="wf-case__meta-chip wf-access__chip" style={{ animationDelay: `${0.25 + ai * 0.12}s` }}>{a}</span>
                ))}
              </div>
            )}

            {s.c2note && <span className="wf-case__note wf-note--red"><SvgChevron /> {s.c2note}</span>}
          </div>
    </>
  )

  if (!open && !inline) return null
  return (
    <CaseExplorer
      name="OFFENSIVE HACKING - ONE-TAP BACKDOOR CASE"
      stages={offensiveStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      inline={inline}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

/* ===== ARIE - Auto Pentesting (NOX) - live mission-control console ===== */

const arieMissions = [
  { name: 'Juice Shop Recon', host: 'juice.local', engine: 'PENTAGI', tasks: 12 },
  { name: 'Altoro Mutual SQLi Sweep', host: 'altoro.testfire.net', engine: 'PENTESTGPT', tasks: 18 },
  { name: 'DVWA Full Exploitation Chain', host: 'dvwa.local', engine: 'PENTAGI', tasks: 24 },
  { name: 'Bytemark Perimeter Assessment', host: 'bytemark.io', engine: 'PENTESTGPT', tasks: 9 },
]

const ariePipeline = [
  { kind: 'TASK', label: 'Recon Scan' },
  { kind: 'TASK', label: 'Port Enumeration' },
  { kind: 'TASK', label: 'Service Fingerprint' },
  { kind: 'SUBTASK', label: 'Vulnerability Analysis' },
  { kind: 'SUBTASK', label: 'Payload Crafting' },
  { kind: 'SUBTASK', label: 'Auth Bypass' },
  { kind: 'ACTION', label: 'Exploit Launch' },
  { kind: 'ACTION', label: 'Access Gained' },
  { kind: 'ACTION', label: 'Evidence Capture' },
]
const ARIE_KINDS = ['TASK', 'SUBTASK', 'ACTION']

const arieLog = [
  '[AUTOPENTEST] target locked · dvwa.local',
  '[AUTOPENTEST] engine PENTAGI engaged',
  '[AUTOPENTEST] recon scan complete - 14 services',
  '[AUTOPENTEST] SQLi vector confirmed on /login',
  '[AUTOPENTEST] payload echo hijacked',
  '[AUTOPENTEST] shell established · uid=33',
  '[AUTOPENTEST] evidence captured · report queued',
]

// Auto-advancing TASK → SUBTASK → ACTION pipeline (the "automated" card)
const AriePipeline = () => {
  const [prog, setProg] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setProg((p) => (p + 1) % (ariePipeline.length + 2)), 1200)
    return () => clearInterval(iv)
  }, [])
  const statusOf = (i) => (i < prog ? 'complete' : i === prog ? 'active' : 'queued')
  const pct = Math.round((Math.min(prog, ariePipeline.length) / ariePipeline.length) * 100)
  return (
    <div className="wf-arie">
      <div className="wf-arie__lock">
        <span className="wf-arie__host">◎ dvwa.local</span>
        <span className="wf-arie__engine">PENTAGI</span>
        <span className="wf-arie__pct">{pct}% · {pct === 100 ? 'COMPLETE' : 'RUNNING'}</span>
      </div>
      <div className="wf-arie__pipe">
        {ARIE_KINDS.map((k) => (
          <div className="wf-arie__col" key={k}>
            <div className="wf-arie__col-head">{k}</div>
            {ariePipeline.map((n, i) => (n.kind === k ? (
              <div key={i} className={`wf-arie__node wf-arie__node--${statusOf(i)}`}>
                <span className="wf-arie__node-ico">{statusOf(i) === 'complete' ? '✓' : ''}</span>
                <span className="wf-arie__node-lbl">{n.label}</span>
              </div>
            ) : null))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Looping telemetry terminal + health meter + alert cards
const ArieTelemetry = () => {
  const [n, setN] = useState(1)
  useEffect(() => {
    const iv = setInterval(() => setN((v) => (v % arieLog.length) + 1), 1100)
    return () => clearInterval(iv)
  }, [])
  return (
    <div className="wf-arie wf-arie--tele">
      <div className="wf-arie__term">
        <div className="wf-arie__term-head">▸ AUTOPENTEST TELEMETRY</div>
        {arieLog.slice(0, n).map((l, i) => (
          <div key={i} className="wf-arie__term-line">{l}</div>
        ))}
        <span className="wf-arie__term-cursor" />
      </div>
      <div className="wf-arie__side">
        <div className="wf-arie__health">
          <span className="wf-arie__health-label">INSTANCE HEALTH</span>
          <span className="wf-arie__health-bar"><span className="wf-arie__health-fill" /></span>
        </div>
        <div className="wf-arie__alert wf-arie__alert--hi"><span className="wf-arie__alert-dot" /> Payload Echo Hijacked</div>
        <div className="wf-arie__alert"><span className="wf-arie__alert-dot wf-arie__alert-dot--ok" /> Pipeline Monitor Live</div>
      </div>
    </div>
  )
}

const arieStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - AUTONOMOUS PENTEST AGENT',
    title: 'ARIE · Auto Pentesting',
    sub: 'A command-center for autonomous pentest missions - target lock, an automated TASK → SUBTASK → ACTION pipeline, and live telemetry.',
    flow: ['TARGET LOCK', 'AUTOMATED PIPELINE', 'REMEDIATION'],
    meta: ['PENTAGI · PENTESTGPT', 'AUTONOMOUS MISSIONS', 'LIVE TELEMETRY'],
  },
  {
    key: 'missions', tab: 'MISSIONS', num: '01',
    tag: 'MISSION CONTROL',
    title: 'Autonomous Missions',
    sub: 'Each mission targets a host, picks an engine and runs its task pipeline end-to-end.',
    missions: true,
    meta: ['4 SEED MISSIONS', '2 ENGINES'],
  },
  {
    key: 'pipeline', tab: 'PIPELINE', num: '02',
    tag: 'AUTOMATED - TASK → SUBTASK → ACTION',
    title: 'Live Task Pipeline',
    sub: 'The agent walks the pipeline automatically - completing tasks, activating the next node and queuing the rest.',
    pipeline: true,
  },
  {
    key: 'telemetry', tab: 'TELEMETRY', num: '03',
    tag: 'LIVE TELEMETRY & ALERTS',
    title: 'Mission Telemetry',
    sub: 'Real-time terminal feed, instance-health meter and alert cards for the engaged mission.',
    telemetry: true,
  },
]

const ArieCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)

  const renderBody = (s) => (
    <>
          {s.missions && (
            <div className="wf-arie wf-arie--missions">
              {arieMissions.map((m, i) => (
                <div key={i} className="wf-arie__mission" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
                  <span className="wf-arie__mission-name">{m.name}</span>
                  <span className="wf-arie__mission-meta">
                    <em className="wf-arie__mission-host">◎ {m.host}</em>
                    <em className={`wf-arie__mission-engine wf-arie__mission-engine--${m.engine === 'PENTAGI' ? 'a' : 'b'}`}>{m.engine}</em>
                    <em className="wf-arie__mission-tasks">{m.tasks} TASKS</em>
                  </span>
                </div>
              ))}
            </div>
          )}

          {s.pipeline && <AriePipeline />}
          {s.telemetry && <ArieTelemetry />}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}
          </div>
    </>
  )

  if (!open && !inline) return null
  return (
    <CaseExplorer
      name="ARIE - AUTO PENTESTING CONSOLE CASE"
      stages={arieStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      inline={inline}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

/* ===== RAVEN - Route Anomaly & Verification Engine (aerial route clearance) ===== */

const ravenStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - CHANGE, NOT OBJECTS',
    title: 'RAVEN · Route Anomaly & Verification',
    sub: 'Inspects a route from the air instead of on foot. Photograph a road two days running - anything new, moved or disturbed shows up as a difference. RAVEN flags what changed since yesterday for a human to inspect.',
    flow: ['TWO FLIGHTS', 'COMPARE MAPS', 'FLAG CHANGES'],
    meta: ['CHANGE DETECTION', 'NO EXOTIC SENSORS', 'HUMAN-IN-THE-LOOP'],
  },
  {
    key: 'capture', tab: 'CAPTURE', num: '01', scene: 'capture', badge: 'DRONE · AUTO ROUTE',
    tag: 'STAGE 01 / 05',
    title: 'Automated Capture',
    sub: 'A drone flies the route automatically, camera pointing straight down, taking overlapping photos. RTK records each photo’s position to centimetre accuracy.',
    meta: ['AUTO ROUTE', 'RTK CM-ACCURATE', 'OVERLAPPING PHOTOS'],
  },
  {
    key: 'stitch', tab: 'STITCH', num: '02', scene: 'stitch', badge: 'OpenDroneMap · STITCHING',
    tag: 'STAGE 02 / 05',
    title: 'Map & Height Model',
    sub: 'OpenDroneMap combines each day’s photos into one seamless top-down map, plus a height model reconstructed from photo overlap - no special sensor needed.',
    meta: ['OPENDRONEMAP', 'ORTHO MAP', '3D HEIGHT MODEL'],
  },
  {
    key: 'compare', tab: 'COMPARE', num: '03', scene: 'compare', badge: 'APPEARANCE + HEIGHT',
    tag: 'STAGE 03 / 05',
    title: 'Day 1 vs Day 2',
    sub: 'The two maps are compared on two signals - appearance change (AI model) catches new objects; height change catches disturbed or refilled ground that looks unchanged in colour.',
    meta: ['APPEARANCE + HEIGHT', 'SEEING THE INVISIBLE'],
  },
  {
    key: 'filter', tab: 'FILTER', num: '04', scene: 'filter', badge: 'NOISE SUPPRESSED',
    tag: 'STAGE 04 / 05',
    title: 'Suppress False Alarms',
    sub: 'Shadows, weather, vegetation and passing traffic are suppressed. A change must appear consistently from multiple viewpoints before it is reported.',
    meta: ['MULTI-VIEW CONSISTENCY', 'LOW FALSE ALARMS'],
  },
  {
    key: 'report', tab: 'REPORT', num: '05', scene: 'report', badge: 'GPS · COVERAGE',
    tag: 'STAGE 05 / 05',
    title: 'Confirmed Change Sites',
    sub: 'Confirmed changes are output with GPS coordinates, before/after imagery and a coverage map - a short list of specific locations to inspect.',
    meta: ['GPS COORDINATES', 'BEFORE / AFTER', 'COVERAGE MAP'],
  },
]

const RAVEN_ROUTE = 'M18 168 Q80 118 148 138 Q214 158 302 78'

const RavenScene = ({ variant }) => {
  if (variant === 'capture') {
    return (
      <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="320" height="200" fill="#0e1e24" />
        <g stroke="rgba(58,166,185,0.12)" strokeWidth="0.6">
          {[40, 80, 120, 160].map((y) => <line key={y} x1="0" y1={y} x2="320" y2={y} />)}
          {[60, 120, 180, 240, 300].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="200" />)}
        </g>
        <path d={RAVEN_ROUTE} fill="none" stroke="#c9b184" strokeWidth="7" strokeLinecap="round" opacity="0.55" />
        <path d={RAVEN_ROUTE} fill="none" stroke="#e0d3ad" strokeWidth="1.4" strokeDasharray="4 6" />
        {/* photo footprints appearing along the route */}
        {[[40, 150], [92, 122], [150, 134], [214, 150], [280, 92]].map(([x, y], i) => (
          <rect key={i} className="wf-raven__foot" x={x - 16} y={y - 12} width="32" height="24" rx="2"
            style={{ animationDelay: `${0.3 + i * 0.45}s` }} />
        ))}
        {/* drone flying the route */}
        <g className="wf-raven__drone">
          <line x1="-9" y1="-6" x2="9" y2="6" stroke="#3aa6b9" strokeWidth="2" />
          <line x1="9" y1="-6" x2="-9" y2="6" stroke="#3aa6b9" strokeWidth="2" />
          <circle cx="-9" cy="-6" r="4" fill="#3aa6b9" /><circle cx="9" cy="-6" r="4" fill="#3aa6b9" />
          <circle cx="-9" cy="6" r="4" fill="#3aa6b9" /><circle cx="9" cy="6" r="4" fill="#3aa6b9" />
          <rect x="-5" y="-4" width="10" height="8" rx="2" fill="#eafaff" />
          <polygon className="wf-raven__cone" points="-6,4 6,4 14,30 -14,30" fill="rgba(58,166,185,0.18)" />
        </g>
      </svg>
    )
  }
  if (variant === 'stitch') {
    return (
      <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="320" height="200" fill="#0e1e24" />
        {/* tiles snapping into one map */}
        {Array.from({ length: 12 }).map((_, i) => {
          const c = i % 4, r = Math.floor(i / 4)
          return <rect key={i} className="wf-raven__tile" x={22 + c * 62} y={16 + r * 40} width="58" height="36" rx="3"
            style={{ animationDelay: `${0.15 + i * 0.12}s` }} />
        })}
        {/* height model bars */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} className="wf-raven__hbar" x={20 + i * 20} width="12" rx="1"
            style={{ animationDelay: `${1.6 + i * 0.06}s` }} />
        ))}
      </svg>
    )
  }
  if (variant === 'compare') {
    const mini = (dx, day, extra) => (
      <g transform={`translate(${dx},0)`}>
        <rect x="0" y="24" width="132" height="152" rx="6" fill="#0f242b" stroke="rgba(58,166,185,0.35)" strokeWidth="1" />
        <text x="66" y="16" textAnchor="middle" className="wf-raven__daylbl">{day}</text>
        <path d="M14 150 Q60 110 118 60" fill="none" stroke="#c9b184" strokeWidth="5" opacity="0.6" />
        <circle cx="44" cy="118" r="4" fill="#7f9ba3" /><circle cx="90" cy="86" r="4" fill="#7f9ba3" />
        {extra && (
          <g>
            <circle className="wf-raven__newdot" cx="72" cy="104" r="5" fill="#e0913a" />
            <circle className="wf-raven__newring" cx="72" cy="104" r="7" fill="none" stroke="#e0913a" strokeWidth="1.5" />
          </g>
        )}
      </g>
    )
    return (
      <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="320" height="200" fill="#0e1e24" />
        {mini(20, 'DAY 1', false)}
        {mini(168, 'DAY 2', true)}
        <line className="wf-raven__cmpscan" x1="160" y1="24" x2="160" y2="176" stroke="rgba(58,166,185,0.6)" strokeWidth="1.5" />
      </svg>
    )
  }
  if (variant === 'report') {
    return (
      <svg className="wf-case__scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="320" height="200" fill="#0e1e24" />
        <g stroke="rgba(58,166,185,0.14)" strokeWidth="0.6">
          {[40, 80, 120, 160].map((y) => <line key={y} x1="0" y1={y} x2="320" y2={y} />)}
          {[64, 128, 192, 256].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="200" />)}
        </g>
        {/* coverage: verified vs unverified */}
        <path d="M0 96 Q90 78 180 92 Q250 102 320 84 L320 200 L0 200 Z" fill="rgba(58,166,185,0.12)" />
        <path d={RAVEN_ROUTE} fill="none" stroke="#c9b184" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
        {/* GPS pins dropping */}
        {[[92, 122], [150, 134], [280, 92]].map(([x, y], i) => (
          <g key={i} className="wf-raven__pin" style={{ animationDelay: `${0.5 + i * 0.5}s`, transformOrigin: `${x}px ${y}px` }}>
            <path d={`M${x} ${y} l-6 -11 a6.5 6.5 0 1 1 12 0 Z`} fill="#e0913a" />
            <circle cx={x} cy={y - 13} r="2.4" fill="#0e1e24" />
          </g>
        ))}
      </svg>
    )
  }
  return null
}

const RAVEN_NOISE = ['Shadows', 'Vegetation', 'Puddles', 'Passing Traffic']

const RavenFilter = () => (
  <div className="wf-raven-filter">
    <div className="wf-raven-filter__col">
      <span className="wf-raven-filter__head">SUPPRESSED</span>
      {RAVEN_NOISE.map((nz, i) => (
        <span key={i} className="wf-raven-filter__noise" style={{ animationDelay: `${0.3 + i * 0.35}s` }}>{nz}</span>
      ))}
    </div>
    <div className="wf-raven-filter__col">
      <span className="wf-raven-filter__head wf-raven-filter__head--keep">REPORTED</span>
      <span className="wf-raven-filter__keep">
        <span className="wf-raven-filter__keep-dot" /> New Object · consistent across views
      </span>
    </div>
  </div>
)

const RavenCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)

  const renderBody = (s) => (
    <>
          {s.scene && (
            <div className="wf-case__visual wf-case__visual--tall wf-case__visual--raven">
              {s.scene === 'filter' ? <RavenFilter /> : <RavenScene variant={s.scene} />}
              {s.badge && <span className="wf-case__badge">{s.badge}</span>}
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}
          </div>
    </>
  )

  if (!open && !inline) return null
  return (
    <CaseExplorer
      inline={inline}
      name="RAVEN - ROUTE ANOMALY & VERIFICATION CASE"
      stages={ravenStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

/* ===== DEFENSIVE SUITE - Security Operations (See · Control · Respond) ===== */

const defenseTools = [
  { name: 'WAZUH', color: '#3b82f6' },
  { name: 'PROMETHEUS', color: '#e0913a' },
  { name: 'EXPORTERS', color: '#22d3ee' },
  { name: 'GRAFANA', color: '#f59e0b' },
  { name: 'AXN', color: '#2dd4bf' },
  { name: 'ACTIVE DIRECTORY', color: '#5aa9e6' },
  { name: 'FIREWALL', color: '#e0574a' },
  { name: 'DFIR-IRIS', color: '#a78bfa' },
  { name: 'SHUFFLE', color: '#34d399' },
]

// Animated See → Control → Respond closed loop, with Axn capabilities around the hub
const axnLoopCaps = [
  { label: 'HARDWARE', sub: 'USB · Storage · Adapters', x: 52, y: 22 },
  { label: 'SOFTWARE', sub: 'Install · Run · Policy', x: 248, y: 22 },
  { label: 'DATA LOSS', sub: 'Clipboard · Browser · Egress', x: 248, y: 228 },
  { label: 'REMEDIATE', sub: 'Tasks · Timers · Lock-out', x: 52, y: 228 },
]

const DefenseLoop = () => (
  <div className="wf-def-loop">
    <svg className="wf-case__scene wf-def-loop__svg" viewBox="0 0 300 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width="300" height="250" fill="#0a1424" />
      <circle className="wf-def__outer" cx="150" cy="118" r="98" fill="none" stroke="rgba(34,211,238,0.18)" strokeWidth="1" strokeDasharray="3 9" />
      <circle className="wf-def__loop-base" cx="150" cy="118" r="78" fill="none" stroke="rgba(34,211,238,0.22)" strokeWidth="2" />
      <circle className="wf-def__loop-comet" cx="150" cy="118" r="78" fill="none" stroke="#5ee7f5" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="24 490" />

      {/* connector rays from AXN hub to each capability */}
      {axnLoopCaps.map((c) => (
        <line
          key={`ray-${c.label}`}
          className="wf-def__cap-ray"
          x1="150" y1="118" x2={c.x} y2={c.y}
        />
      ))}

      {/* AXN as the endpoint-control hub */}
      <g className="wf-def__hub">
        <circle cx="150" cy="118" r="36" fill="rgba(8, 20, 36, 0.95)" stroke="rgba(45,212,191,0.55)" strokeWidth="1.4" className="wf-def__hub-ring" />
        <path d="M150 98 L166 105 V120 Q166 136 150 143 Q134 136 134 120 V105 Z" fill="rgba(45,212,191,0.18)" stroke="#2dd4bf" strokeWidth="1.4" />
        <text className="wf-def__hub-name" x="150" y="123" textAnchor="middle">AXN</text>
      </g>

      {/* See → Control → Respond */}
      {[['SEE', 150, 48], ['CONTROL', 216, 156], ['RESPOND', 84, 156]].map(([lbl, x, y], i) => (
        <g key={lbl}>
          <circle className="wf-def__node" cx={x} cy={y} r="7" style={{ animationDelay: `${i * 0.5}s` }} />
          <circle cx={x} cy={y} r="3" fill="#0a1424" />
          <text className="wf-def__nodelbl" x={x} y={y - 12} textAnchor="middle">{lbl}</text>
        </g>
      ))}

      {/* Axn capability chips in the four corners */}
      {axnLoopCaps.map((c, i) => (
        <g key={c.label} className="wf-def__cap" style={{ animationDelay: `${i * 0.85}s` }}>
          <rect x={c.x - 44} y={c.y - 15} width="88" height="30" rx="6" className="wf-def__cap-box" />
          <text className="wf-def__cap-lbl" x={c.x} y={c.y - 1} textAnchor="middle">{c.label}</text>
          <text className="wf-def__cap-sub" x={c.x} y={c.y + 11} textAnchor="middle">{c.sub}</text>
        </g>
      ))}
    </svg>
  </div>
)

const defenseStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - SECURITY OPERATIONS, UNIFIED',
    title: 'Defensive Suite · SecOps Platform',
    sub: 'A complete Security Operations capability - See, Control, Respond - on one unified, auditable stack, with Axn as its endpoint-control and data-protection core.',
    flow: ['SEE', 'CONTROL', 'RESPOND'],
    meta: ['UNIFIED STACK', 'CENTRALLY MANAGED', 'FULLY AUDITABLE'],
  },
  {
    key: 'loop', tab: 'LOOP', num: '01', loop: true, badge: 'AXN · CLOSED LOOP',
    tag: 'AXN CORE · CLOSED LOOP',
    title: 'See → Control → Respond',
    sub: 'Axn sits at the center — hardware, software, DLP and remediation — feeding See, driving Control, and powering Respond.',
    meta: ['HARDWARE', 'SOFTWARE', 'DLP', 'REMEDIATE'],
  },
  {
    key: 'pillars', tab: 'PILLARS', num: '02',
    tag: 'THREE PILLARS',
    title: 'Security · Control · Response',
    sub: 'Visibility & detection, enforcement & prevention, and investigation & automation.',
    pillars: [
      { name: 'SECURITY', tag: 'See everything', tools: ['Wazuh', 'Prometheus', 'Exporters', 'Grafana', 'Axn'] },
      { name: 'CONTROL', tag: 'Control everything', tools: ['Axn', 'Active Directory', 'Firewall'] },
      { name: 'RESPONSE', tag: 'Act on everything', tools: ['DFIR-IRIS', 'Shuffle', 'Axn'] },
    ],
  },
  {
    key: 'toolset', tab: 'TOOLSET', num: '03', ring: defenseTools, core: 'DEFENSE', badge: 'THE STACK',
    tag: 'THE UNIFIED STACK',
    title: 'One Unified Toolset',
    sub: 'Nine proven tools, one operation - from detection to enforcement to automated response.',
    meta: ['9 TOOLS', 'ONE OPERATION'],
  },
  {
    key: 'axn', tab: 'AXN', num: '04',
    tag: 'ENDPOINT CONTROL & DLP CORE',
    title: 'Axn - the Core',
    sub: 'Advanced Endpoint Protection & Data Loss Prevention for enterprise Windows fleets, from a single console.',
    steps: [
      'Control hardware - USB, storage & network adapters',
      'Control software, services & policy per machine',
      'Prevent data loss - clipboard, screen, browser, egress',
      'Guide user remediation with timers & lock-out',
    ],
    meta: ['SEE · CONTROL · RESPOND', 'SINGLE CONSOLE'],
  },
]

const DefensiveCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)

  const renderBody = (s) => {
    const angle = s.ring ? 360 / s.ring.length : 0
    return (
    <>
          {s.loop && (
            <div className="wf-case__visual wf-case__visual--tall wf-case__visual--defsuite">
              <DefenseLoop />
              {s.badge && <span className="wf-case__badge">{s.badge}</span>}
            </div>
          )}

          {s.ring && (
            <div className="wf-case__visual wf-case__visual--3d wf-case__visual--defsuite">
              <div className="wf-social3d">
                <div className="wf-social3d__ring">
                  {s.ring.map((p, i) => (
                    <div key={p.name} className="wf-social3d__node" style={{ transform: `rotateY(${i * angle}deg) translateZ(178px)` }}>
                      <span className="wf-social3d__dot" style={{ background: p.color }} />
                      {p.name}
                    </div>
                  ))}
                </div>
                <span className="wf-social3d__core">{s.core}</span>
              </div>
              {s.badge && <span className="wf-case__badge">{s.badge}</span>}
            </div>
          )}

          {s.pillars && (
            <div className="wf-def-pillars">
              {s.pillars.map((p, i) => (
                <div key={i} className="wf-def-pillar" style={{ animationDelay: `${0.15 + i * 0.16}s` }}>
                  <span className="wf-def-pillar__name">{p.name}</span>
                  <span className="wf-def-pillar__tag">{p.tag}</span>
                  <div className="wf-def-pillar__tools">
                    {p.tools.map((t, ti) => (
                      <span key={ti} className={`wf-def-pillar__tool ${t === 'Axn' ? 'wf-def-pillar__tool--axn' : ''}`}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}

            {s.steps && (
              <div className="wf-case__list">
                {s.steps.map((item, si) => (
                  <div key={si} className="wf-case__list-item" style={{ animationDelay: `${0.2 + si * 0.22}s` }}>
                    <span className="wf-case__step-num">{si + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
    </>
    )
  }

  if (!open && !inline) return null
  return (
    <CaseExplorer
      inline={inline}
      name="DEFENSIVE SUITE - SECURITY OPERATIONS CASE"
      stages={defenseStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

/* ===== RESPONSIBLE AI - Assurance & Governance for agentic AI ===== */

const raiPipeline = ['Obligation', 'Control', 'Probe', 'Finding', 'Signed Evidence', 'Remediation', 'Retest']

// Auto-advancing obligation → evidence pipeline
const RaiPipeline = () => {
  const [prog, setProg] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setProg((p) => (p + 1) % (raiPipeline.length + 2)), 1050)
    return () => clearInterval(iv)
  }, [])
  const statusOf = (i) => (i < prog ? 'done' : i === prog ? 'active' : 'todo')
  const pct = Math.round((Math.min(prog, raiPipeline.length) / raiPipeline.length) * 100)
  return (
    <div className="wf-rai">
      <div className="wf-rai__bar">
        <span className="wf-rai__bar-lbl">◈ OBLIGATION → SIGNED EVIDENCE</span>
        <span className="wf-rai__pct">{pct}% · {pct === 100 ? 'ASSURED' : 'COMPILING'}</span>
      </div>
      <div className="wf-rai__pipe">
        {raiPipeline.map((s, i) => (
          <span key={i} className="wf-rai__step-wrap">
            {i > 0 && <span className="wf-rai__arrow"><SvgChevron /></span>}
            <span className={`wf-rai__step wf-rai__step--${statusOf(i)}`}>
              <em className="wf-rai__step-ico">{statusOf(i) === 'done' ? '✓' : i + 1}</em>
              {s}
            </span>
          </span>
        ))}
      </div>
      <div className="wf-rai__note">Continuous, governed testing - every obligation compiled to auditor-grade evidence with remediation & retest.</div>
    </div>
  )
}

const raiUmbrellas = [
  { name: 'MEMORY & CONTEXT', color: '#22c55e' },
  { name: 'PRIVACY & DISCLOSURE', color: '#38bdf8' },
  { name: 'TOOL & CODE ABUSE', color: '#e0913a' },
  { name: 'GOAL MANIPULATION', color: '#f43f5e' },
  { name: 'AUTONOMY & OVERSIGHT', color: '#a78bfa' },
]

const raiStages = [
  {
    key: 'summary', tab: 'SUMMARY', num: '00',
    tag: 'OVERVIEW - ETHICAL BY DESIGN, TRUSTED BY DEFAULT',
    title: 'Responsible AI · Assurance Framework',
    sub: 'A regulation-agnostic assurance framework for agentic AI - it compiles obligations from many regimes into signed, auditor-grade evidence, and measures precisely what governance can and cannot reach.',
    flow: ['OBLIGATIONS', 'GOVERNED TESTING', 'ASSURANCE'],
    meta: ['REGULATION-AGNOSTIC', 'AUDITOR-GRADE EVIDENCE', 'AGENTIC SYSTEMS'],
  },
  {
    key: 'pillars', tab: 'PILLARS', num: '01',
    tag: 'FOUR PILLARS',
    title: 'Fairness · Transparency · Privacy · Accountability',
    sub: 'The principles the framework operationalises - turned from posters into enforced, logged, auditable controls.',
    pillars: [
      { name: 'FAIRNESS', tag: 'Equitable by design', tools: ['Bias probes', 'Ground-truth labels'] },
      { name: 'TRANSPARENCY', tag: 'Inspectable interface', tools: ['NIST AI RMF', 'Audit logging'] },
      { name: 'PRIVACY', tag: 'First-class pillar', tools: ['Contextual integrity', 'GDPR / CCPA'] },
      { name: 'ACCOUNTABILITY', tag: 'Provable, attributable', tools: ['Signed evidence', 'Attribution'] },
    ],
  },
  {
    key: 'pipeline', tab: 'PIPELINE', num: '02', pipeline: true, badge: 'CONTINUOUS ASSURANCE',
    tag: 'OBLIGATION → EVIDENCE',
    title: 'The Evidence Pipeline',
    sub: 'Every obligation flows automatically through the pipeline - control, probe, finding, signed evidence, remediation and retest.',
    meta: ['AUTOMATED', 'CLAUSE-LINKED', 'REPRODUCIBLE'],
  },
  {
    key: 'taxonomy', tab: 'TAXONOMY', num: '03', ring: raiUmbrellas, core: 'OWASP ASI', badge: 'FIVE UMBRELLAS',
    tag: 'THREAT TAXONOMY - OWASP ASI 2026',
    title: 'Five-Umbrella Taxonomy',
    sub: 'Agentic threats mapped across five umbrellas - from memory poisoning to autonomy and oversight - as evidence-producing probes.',
    meta: ['5 UMBRELLAS', 'PROBE LIBRARY'],
  },
  {
    key: 'measure', tab: 'MEASURE', num: '04',
    tag: 'THE MEASURED CORE',
    title: 'Residual-Risk Surface & Attribution',
    sub: 'With governance toggled ON/OFF, the framework measures detectability and attributability - mapping the residual surface that even audited-maximal governance cannot reach.',
    steps: [
      'Governance ON/OFF - the single instrumented variable',
      'Detectability - provable + empirical residual subsets',
      'Attribution - rank-trend over structural distance',
      'Residual overlap - undetected ∩ misattributed',
    ],
    meta: ['DETECTABILITY', 'ATTRIBUTABILITY', 'RESIDUAL SURFACE'],
  },
]

const ResponsibleAiCase = ({ open, onClose, inline, onExitToWorkflow }) => {
  const { stage, setStage } = useCaseExplorer(open || inline, onClose)

  const renderBody = (s) => {
    const angle = s.ring ? 360 / s.ring.length : 0
    return (
    <>
          {s.pipeline && (
            <div className="wf-case__visual wf-case__visual--tall wf-case__visual--rai">
              <RaiPipeline />
              {s.badge && <span className="wf-case__badge">{s.badge}</span>}
            </div>
          )}

          {s.ring && (
            <div className="wf-case__visual wf-case__visual--3d wf-case__visual--rai">
              <div className="wf-social3d">
                <div className="wf-social3d__ring">
                  {s.ring.map((p, i) => (
                    <div key={p.name} className="wf-social3d__node" style={{ transform: `rotateY(${i * angle}deg) translateZ(176px)` }}>
                      <span className="wf-social3d__dot" style={{ background: p.color }} />
                      {p.name}
                    </div>
                  ))}
                </div>
                <span className="wf-social3d__core">{s.core}</span>
              </div>
              {s.badge && <span className="wf-case__badge">{s.badge}</span>}
            </div>
          )}

          {s.pillars && (
            <div className="wf-def-pillars wf-def-pillars--rai">
              {s.pillars.map((p, i) => (
                <div key={i} className="wf-def-pillar" style={{ animationDelay: `${0.15 + i * 0.14}s` }}>
                  <span className="wf-def-pillar__name">{p.name}</span>
                  <span className="wf-def-pillar__tag">{p.tag}</span>
                  <div className="wf-def-pillar__tools">
                    {p.tools.map((t, ti) => (<span key={ti} className="wf-def-pillar__tool">{t}</span>))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="wf-case__info">
            <span className="wf-case__stage-tag">{s.tag}</span>
            <h4 className="wf-case__title">{s.title}</h4>
            <p className="wf-case__sub">{s.sub}</p>

            {s.flow && (
              <div className="wf-case__flow">
                {s.flow.map((f, fi) => (
                  <span key={fi} className="wf-case__flow-step">
                    {fi > 0 && <span className="wf-case__flow-arrow"><SvgChevron /></span>}
                    <span className="wf-case__flow-chip">{f}</span>
                  </span>
                ))}
              </div>
            )}

            {s.meta && (
              <div className="wf-case__meta">
                {s.meta.map((m, mi) => (
                  <span key={mi} className="wf-case__meta-chip" style={{ animationDelay: `${0.3 + mi * 0.18}s` }}>{m}</span>
                ))}
              </div>
            )}

            {s.steps && (
              <div className="wf-case__list">
                {s.steps.map((item, si) => (
                  <div key={si} className="wf-case__list-item" style={{ animationDelay: `${0.2 + si * 0.22}s` }}>
                    <span className="wf-case__step-num">{si + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
    </>
    )
  }

  if (!open && !inline) return null
  return (
    <CaseExplorer
      inline={inline}
      name="RESPONSIBLE AI - ASSURANCE FRAMEWORK CASE"
      stages={raiStages}
      stage={stage} setStage={setStage}
      onClose={onClose}
      renderBody={renderBody}
      onExitToWorkflow={onExitToWorkflow}
    />
  )
}

const PhaseCard = ({ phase, index }) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(false)
  const [stepped, setStepped] = useState(false)
  const [openCaseId, setOpenCaseId] = useState(null)
  const [showReel, setShowReel] = useState(false)
  const direction = index % 2 === 0 ? 'left' : 'right'
  // single-case phases now play their case inline in the card, so no header chip
  const hasCase = false
  const closeCase = () => setOpenCaseId(null)
  // phases that own a case reel swap workflow -> slideshow; others keep the workflow view
  const hasReel = ['phase1', 'phase2', 'agexphase', 'noxphase', 'ravenphase', 'defensivephase', 'raiphase'].includes(phase.id)
  const reelActive = hasReel && showReel

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      setActive(e.isIntersecting)
      if (e.isIntersecting) setVisible(true)
    }, { threshold: 0, rootMargin: '-35% 0px -35% 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setStepped(true), 800)
    return () => clearTimeout(t)
  }, [visible])

  useEffect(() => {
    if (!active) setShowReel(false)
  }, [active])

  return (
    <div ref={ref} className={`wf-phase wf-phase--${phase.id} wf-phase--from-${direction} ${visible ? 'wf-phase--visible' : ''} ${active ? 'wf-phase--active' : ''}`}>

      <div className="wf-phase__header">
        <span className="wf-phase__num">{phase.num}</span>
        <div
          className={`wf-phase__titles ${hasCase ? 'wf-phase__titles--case' : ''}`}
          onClick={hasCase ? () => setOpenCaseId('main') : undefined}
        >
          <h3 className="wf-phase__title">{phase.title}</h3>
          <span className="wf-phase__subtitle">{phase.subtitle}</span>
          {hasCase && (
            <span className="wf-phase__case-chip">
              {['ravenphase', 'defensivephase', 'raiphase'].includes(phase.id) ? 'WORKING ▸' : 'CASE FILE ▸'}
            </span>
          )}
        </div>
        {visible && stepped && <span className="wf-phase__status-live"><span className="wf-phase__status-dot" /> ACTIVE</span>}
      </div>

      <div className={`wf-phase__body ${reelActive ? 'wf-phase__body--reel' : ''}`}>
        {visible && <div className="wf-phase__scan-line" />}

        <div className={`wf-phase__swap ${reelActive ? 'wf-phase__swap--reel' : 'wf-phase__swap--workflow'}`}>
          <div className="wf-phase__workflow">
            {hasReel && !reelActive && (
              <div className="wf-media-bar wf-media-bar--workflow">
                <button
                  type="button"
                  className="wf-media-btn"
                  aria-label="Back"
                  disabled
                >
                  <SvgBack />
                </button>
                <button
                  type="button"
                  className="wf-media-btn"
                  aria-label="Forward"
                  onClick={() => setShowReel(true)}
                >
                  <SvgForward />
                </button>
              </div>
            )}
        {phase.id === 'phase1' && (
          <>
            <div className="wf-sources">
              <div className="wf-sources__label">SOCIAL MEDIA FEEDS</div>
              <div className="wf-sources__grid">
                {phase.sources.map((s, i) => (
                  <span key={i} className={`wf-sources__item ${stepped ? 'wf-sources__item--hit' : ''}`} style={{ transitionDelay: `${0.8 + i * 0.12}s` }}>{s}</span>
                ))}
              </div>
            </div>
            <FlowArrow />
            <div className="wf-system-box"><div className="wf-system-box__label">{phase.system}</div><div className="wf-system-box__sub">{phase.subtitle}</div></div>
            <FlowArrow />
            <div className="wf-scan-grid">
              {phase.scanItems.map((item, i) => (
                <div key={i} className={`wf-scan-item ${stepped ? 'wf-scan-item--done' : ''}`} style={{ transitionDelay: `${1.5 + i * 0.15}s` }}>
                  <span className="wf-scan-item__check"><SvgCheck /></span><span>{item}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {phase.id === 'phase2' && (
          <>
            <div className="wf-units">
              {phase.units.map((u, i) => (
                <span
                  key={i}
                  className={`wf-unit ${stepped ? 'wf-unit--on' : ''} ${i === 0 ? 'wf-unit--lead' : ''}`}
                  style={{ transitionDelay: `${0.4 + i * 0.15}s` }}
                >
                  {u}
                </span>
              ))}
            </div>
            <FlowArrow />
            <div className="wf-system-box"><div className="wf-system-box__label">{phase.system}</div><div className="wf-system-box__sub">{phase.systemSub}</div></div>
            <FlowArrow />
            <div className="wf-columns">
              <div className="wf-column">
                <div className="wf-column__title">AI MATCHING</div>
                <div className="wf-flow-list">
                  {phase.scanItems.map((item, i) => (
                    <div key={i} className={`wf-flow-item ${stepped ? 'wf-flow-item--done' : ''}`} style={{ transitionDelay: `${0.8 + i * 0.12}s` }}>
                      <span className="wf-flow-item__dot" /><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="wf-column">
                <div className="wf-column__title">ZOOM PATH</div>
                <div className="wf-flow-list">
                  {phase.zoomPath.map((item, i) => (
                    <div key={i} className={`wf-flow-item ${stepped ? 'wf-flow-item--done' : ''}`} style={{ transitionDelay: `${0.8 + i * 0.15}s` }}>
                      <span className="wf-flow-item__arrow"><SvgChevron /></span><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="wf-match-row">
              {phase.matchItems.map((m, i) => (
                <div key={i} className={`wf-match ${stepped ? 'wf-match--done' : ''}`} style={{ transitionDelay: `${2.2 + i * 0.2}s` }}>
                  <span className="wf-match__label">{m.label}</span><span className="wf-match__val">{m.val}</span>
                </div>
              ))}
            </div>
            <div className={`wf-output ${stepped ? 'wf-output--active' : ''}`}>
              <span className="wf-output__pulse" /><span className="wf-output__text">{phase.output}</span>
            </div>
          </>
        )}

        {phase.modules && (
          <>
            <div className="wf-system-box wf-system-box--large"><div className="wf-system-box__label">{phase.system}</div><div className="wf-system-box__sub">{phase.systemSub || phase.subtitle}</div></div>
            <FlowArrow />
            <div className="wf-modules">
              {phase.modules.map((mod, mi) => (
                <div key={mi} className={`wf-module ${stepped ? 'wf-module--done' : ''}`} style={{ transitionDelay: `${0.8 + mi * 0.3}s` }}>
                  <div className="wf-module__header">
                    {mod.name}
                  </div>
                  <div className="wf-module__items">
                    {(mod.steps || mod.items).map((item, i) => (<span key={i} className="wf-module__item">{item}</span>))}
                  </div>
                  <div className="wf-module__result">{mod.result}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {(phase.id === 'ravenphase' || phase.id === 'raiphase') && (
          <>
            <div className="wf-units wf-units--raven">
              {phase.units.map((u, i) => (
                <span key={i} className="wf-unit-step">
                  {i > 0 && <span className="wf-unit-step__arrow"><SvgChevron /></span>}
                  <span className={`wf-unit ${stepped ? 'wf-unit--on' : ''}`} style={{ transitionDelay: `${0.4 + i * 0.16}s` }}>
                    <em className="wf-unit__n">{String(i + 1).padStart(2, '0')}</em>{u}
                  </span>
                </span>
              ))}
            </div>
            <FlowArrow />
            <div className="wf-system-box wf-system-box--large"><div className="wf-system-box__label">{phase.system}</div><div className="wf-system-box__sub">{phase.subtitle}</div></div>
            <div className={`wf-output ${stepped ? 'wf-output--active' : ''}`}>
              <span className="wf-output__pulse" /><span className="wf-output__text">{phase.output}</span>
            </div>
          </>
        )}

        {phase.id === 'phase4' && (
          <>
            <div className="wf-input-streams">
              {phase.inputStreams.map((s, i) => (
                <div key={i} className={`wf-stream ${stepped ? 'wf-stream--active' : ''}`} style={{ transitionDelay: `${0.6 + i * 0.15}s` }}>
                  <span className="wf-stream__line" /><span className="wf-stream__name">{s}</span>
                </div>
              ))}
            </div>
            <FlowArrow />
            <div className={`wf-system-box wf-system-box--core ${stepped ? 'wf-system-box--processing' : ''}`}>
              <div className="wf-system-box__label">{phase.system}</div><div className="wf-system-box__sub">{phase.subtitle}</div>
              <div className="wf-system-box__ring" />
            </div>
            <FlowArrow />
            <div className="wf-output-grid">
              {phase.outputItems.map((item, i) => (
                <div key={i} className={`wf-output-item ${stepped ? 'wf-output-item--done' : ''}`} style={{ transitionDelay: `${1.5 + i * 0.1}s` }}>
                  <span className="wf-output-item__dot" /><span>{item}</span>
                </div>
              ))}
            </div>
            <div className={`wf-output ${stepped ? 'wf-output--active' : ''}`}>
              <span className="wf-output__pulse" /><span className="wf-output__text">{phase.output}</span>
            </div>
          </>
        )}

          </div>

          {hasReel && (
            <div className="wf-phase__reel">
              {phase.id === 'phase1' && <NigranCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
              {phase.id === 'phase2' && <TerrainCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
              {phase.id === 'agexphase' && <AgexCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
              {phase.id === 'noxphase' && <DarkovaCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
              {phase.id === 'noxphase' && <OffensiveCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
              {phase.id === 'noxphase' && <ArieCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
              {phase.id === 'ravenphase' && <RavenCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
              {phase.id === 'defensivephase' && <DefensiveCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
              {phase.id === 'raiphase' && <ResponsibleAiCase inline={active && reelActive} onExitToWorkflow={() => setShowReel(false)} />}
            </div>
          )}
        </div>
      </div>

      {index < phases.length - 1 && !['03', '04', '05', '06'].includes(phase.num) && (
        <div className={`wf-connector ${stepped ? 'wf-connector--active' : ''}`}>
          <div className="wf-connector__line" />
          <div className="wf-connector__beam" />
        </div>
      )}

      {['03', '04', '05', '06'].includes(phase.num) && (
        <div className={`wf-separator ${stepped ? 'wf-separator--active' : ''}`}>
          <span className="wf-separator__line" />
          <span className="wf-separator__node">
            <span className="wf-separator__dot" />
          </span>
          <span className="wf-separator__line" />
        </div>
      )}
    </div>
  )
}

const Workflow = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles = []
    for (let i = 0; i < 40; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vy: 0.12 + Math.random() * 0.3, r: Math.random() * 1.2 + 0.4, o: Math.random() * 0.12 + 0.02 })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.y += p.vy
        if (p.y > canvas.height) { p.y = 0; p.x = Math.random() * canvas.width }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(45, 90, 61, ${p.o})`; ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section className="workflow" id="workflow">
      <canvas ref={canvasRef} className="workflow__particles" />
      <div className="workflow__bg-grid" />

      <div className="workflow__header">
        <span className="workflow__badge"><SvgDiamond /> CLASSIFIED <SvgDiamond /></span>
        <h2 className="workflow__title">PSS WORKFLOW</h2>
        <p className="workflow__desc">End-to-end intelligence pipeline from threat detection to actionable report</p>
        <div className="workflow__title-line" />
      </div>

      <div className="workflow__timeline">
        {phases.map((phase, i) => (
          <PhaseCard key={phase.id} phase={phase} index={i} />
        ))}
      </div>
    </section>
  )
}

export default Workflow
