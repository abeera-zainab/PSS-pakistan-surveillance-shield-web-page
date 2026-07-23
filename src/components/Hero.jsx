import { useEffect, useRef, useState, useCallback } from 'react'
import './Hero.css'

const useTypewriter = (text, delay = 60, startDelay = 0) => {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  useEffect(() => { const t = setTimeout(() => setStarted(true), startDelay); return () => clearTimeout(t) }, [startDelay])
  useEffect(() => {
    if (!started) return
    if (displayed.length >= text.length) { setDone(true); return }
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), delay)
    return () => clearTimeout(t)
  }, [displayed, started, text, delay])
  return { displayed, done }
}

// Keys out a solid near-black or near-white logo background into transparency
// at runtime, so the logo merges cleanly with the card's background image.
const logoCache = {}
const ProjectLogo = ({ src, bg = 'dark', alt, className, raw = false }) => {
  const cacheKey = `${src}|${bg}`
  // Always start with a visible source so cards never flash empty while processing.
  const [url, setUrl] = useState(() => (raw ? src : (logoCache[cacheKey] || src)))

  useEffect(() => {
    if (raw) {
      setUrl(src)
      return
    }
    if (logoCache[cacheKey]) {
      setUrl(logoCache[cacheKey])
      return
    }

    let cancelled = false
    const img = new Image()
    img.decoding = 'async'
    img.src = src
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        const ctx = c.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)
        const data = ctx.getImageData(0, 0, c.width, c.height)
        const p = data.data
        for (let i = 0; i < p.length; i += 4) {
          const L = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]
          // Soft alpha ramp keeps edges antialiased instead of hard-cut.
          const t = bg === 'light' ? (231 - L) / 66 : (L - 18) / 40
          p[i + 3] *= Math.max(0, Math.min(1, t))
        }
        ctx.putImageData(data, 0, 0)
        const out = c.toDataURL('image/png')
        logoCache[cacheKey] = out
        if (!cancelled) setUrl(out)
      } catch {
        if (!cancelled) setUrl(src)
      }
    }
    img.onerror = () => {
      if (!cancelled) setUrl(src)
    }
    return () => { cancelled = true }
  }, [src, bg, raw, cacheKey])

  return <img src={url || src} alt={alt} className={className} draggable={false} />
}

// Each capability panel maps to a live app (opened on click at the current host + port).
const projectCards = [
  {
    title: 'AGEX IRIS',
    subtitle: 'Facial Reconstruction',
    icon: 'eye',
    logo: '/agex-logo.png',
    logoClass: 'agex',
    port: 8120,
    bgImage: '/bg-agex-iris.png',
    desc: 'Restores degraded facial imagery — noise reduction, detail recovery, and AI reconstruction.',
  },
  {
    title: 'NIGRAN',
    subtitle: 'Media Monitoring Platform',
    icon: 'activity',
    logo: '/nigran-logo.png',
    logoBg: 'light',
    port: 5173,
    bgImage: '/bg-nigran.png',
    desc: 'Real-time media tracking with instant alerts when watched accounts publish or act.',
  },
  {
    title: 'GEO INT',
    subtitle: 'Terrain Feature Analysis',
    icon: 'globe',
    logo: '/geoint-logo.png',
    port: 5174,
    bgImage: '/bg-terrain.png',
    desc: 'Estimates image and video locations from terrain, landmarks, and environmental cues.',
  },

  {
    title: 'Pakistan Surveillance Shield',
    subtitle: 'PSS Technology Portfolio',
    icon: 'shield',
    bgImage: '/logo.png.png',
    desc: 'Integrated CyberINT, MediaINT, GEOINT, AI security, route surveillance, and cyber defense.',
    isPss: true,
  },
  {
    title: 'NOX CYBERINT',
    subtitle: 'Dark Web · Offensive · Auto Pentest',
    icon: 'target',
    logo: '/nox-logo.png',
    logoBg: 'light',
    port: 5177,
    bgImage: '/bg-nox.png',
    desc: 'Dark-web monitoring, ethical hacking, and automated penetration testing.',
  },
  {
    title: 'RAVEN',
    subtitle: 'Route Anomaly & Verification',
    icon: 'radar',
    logo: '/raven-logo.png',
    bgImage: '/bg-raven.png',
    desc: 'Aerial route clearance — captures, stitches and compares road imagery to flag what changed overnight.',
  },
  {
    title: 'DEFENSIVE SUITE',
    subtitle: 'All-in-One Cyber Defense',
    icon: 'defend',
    logo: '/logo-defensive.png',
    port: 8130,
    bgImage: '/bg-defensive.jpg',
    desc: 'In-house enterprise AXN EDR with SIEM, SOAR and SOC — 360° cyber defense in one suite.',
  },
  {
    title: 'TRUSTWORTHY AI',
    subtitle: 'Secure · Responsible · Ethical',
    icon: 'shieldCheck',
    logo: '/logo-responsible-ai.png',
    port: 5176,
    bgImage: '/responsible-ai.png',
    desc: 'AI governance, data protection, prompt security, and adversarial testing for safe AI use.',
  },
]

// Artistic, theme-matched emblem icons (forest-green + gold intelligence palette).
const SV = { viewBox: '0 0 24 24', fill: 'none' }
const ICONS = {
  // AGEX IRIS — biometric iris with gold reticle
  eye: (
    <svg {...SV}>
      <defs>
        <radialGradient id="ic-iris" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stopColor="#d1fae5" /><stop offset="0.45" stopColor="#34d399" /><stop offset="1" stopColor="#1f8a4c" /></radialGradient>
        <linearGradient id="ic-iris-r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e6c766" /><stop offset="1" stopColor="#c8a84e" /></linearGradient>
      </defs>
      <path d="M2 12S5.6 5.4 12 5.4 22 12 22 12 18.4 18.6 12 18.6 2 12 2 12Z" fill="#0c1f16" stroke="url(#ic-iris-r)" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="4.6" fill="url(#ic-iris)" />
      <circle cx="12" cy="12" r="4.6" fill="none" stroke="#e6c766" strokeWidth="0.5" opacity="0.7" />
      <circle cx="12" cy="12" r="2" fill="#08130d" />
      <circle cx="10.8" cy="10.7" r="0.8" fill="#eafff5" />
      <path d="M12 6.6v1.4M12 16v1.4M6.8 12h1.4M15.8 12h1.4" stroke="#e6c766" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
    </svg>
  ),
  // CYBER INT — multi-source intel node
  cyber: (
    <svg {...SV}>
      <defs><linearGradient id="ic-cint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e6c766" /><stop offset="1" stopColor="#34d399" /></linearGradient></defs>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3.2" fill="#0c1f16" stroke="url(#ic-cint)" strokeWidth="1.2" />
      <circle cx="8.2" cy="8.2" r="1.4" fill="#e6c766" />
      <circle cx="15.8" cy="8.2" r="1.4" fill="#34d399" />
      <circle cx="8.2" cy="15.8" r="1.4" fill="#34d399" />
      <circle cx="15.8" cy="15.8" r="1.4" fill="#e6c766" />
      <circle cx="12" cy="12" r="1.7" fill="#7dffb0" />
      <path d="M9.4 8.8 10.8 11M14.6 8.8 13.2 11M9.4 15.2 10.8 13M14.6 15.2 13.2 13" stroke="#c8a84e" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  // NIGRAN — broadcast / signal arcs
  activity: (
    <svg {...SV}>
      <defs><linearGradient id="ic-sig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#1f8a4c" /><stop offset="1" stopColor="#e6c766" /></linearGradient></defs>
      <path d="M4 9.6a11.5 11.5 0 0 1 16 0" stroke="#e6c766" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      <path d="M6 11.9a8.6 8.6 0 0 1 12 0" stroke="#7dd39a" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M8.2 14.1a5.4 5.4 0 0 1 7.6 0" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r="2.2" fill="url(#ic-sig)" />
      <circle cx="12" cy="16.4" r="0.85" fill="#eafff5" />
    </svg>
  ),
  // GEO INT — globe with gold graticule + pin
  globe: (
    <svg {...SV}>
      <defs><linearGradient id="ic-geo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e6c766" /><stop offset="1" stopColor="#34d399" /></linearGradient></defs>
      <circle cx="12" cy="12" r="9" fill="#0c1f16" stroke="url(#ic-geo)" strokeWidth="1.2" />
      <path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18M5 7.4c4 1.9 9 1.9 14 0M5 16.6c4-1.9 9-1.9 14 0" stroke="#34d399" strokeWidth="0.8" opacity="0.85" />
      <path d="M15.4 6.1a2.1 2.1 0 0 0-2.1 2.1c0 1.6 2.1 3.6 2.1 3.6s2.1-2 2.1-3.6a2.1 2.1 0 0 0-2.1-2.1z" fill="none" stroke="#e6c766" strokeWidth="1" />
      <circle cx="15.4" cy="8.2" r="0.7" fill="#e6c766" />
    </svg>
  ),
  // NoX — rising phoenix flame
  target: (
    <svg {...SV}>
      <defs><linearGradient id="ic-nox" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#1f8a4c" /><stop offset="0.55" stopColor="#34d399" /><stop offset="1" stopColor="#e6c766" /></linearGradient></defs>
      <path d="M12 2.4c1.8 2.7 1 4.5 2 6.5.85-.7 1.25-1.85 1-3 1.9 1.85 3 4.2 3 6.6a6.1 6.1 0 1 1-12.2 0c0-2.6 1.45-5 3.45-6.4-.2 1.35.25 2.5 1.15 3.25C13.1 8.3 10.7 5.7 12 2.4Z" fill="#0c1f16" stroke="url(#ic-nox)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12 11.6c1 .9 1.5 1.9 1.5 3a1.5 1.5 0 1 1-3 0c0-.8.4-1.5.95-2 .2.6.5 1 .95 1.25-.5-.8-.65-1.55-.35-2.25Z" fill="none" stroke="#34d399" strokeWidth="0.9" />
    </svg>
  ),
  // RAVEN — radar sweep
  radar: (
    <svg {...SV}>
      <defs><linearGradient id="ic-rdr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#34d399" /><stop offset="1" stopColor="#c8a84e" /></linearGradient></defs>
      <circle cx="12" cy="12" r="8.6" fill="#0c1f16" stroke="#e6c766" strokeWidth="0.9" />
      <circle cx="12" cy="12" r="5.6" fill="none" stroke="#2d5a3d" strokeWidth="0.7" />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="#2d5a3d" strokeWidth="0.7" />
      <path d="M12 12 12 3.4 A8.6 8.6 0 0 1 19.8 14.4 Z" fill="url(#ic-rdr)" opacity="0.5" />
      <path d="M12 12 19.6 8.2" stroke="#e6c766" strokeWidth="1" strokeLinecap="round" />
      <circle cx="16.4" cy="8.4" r="1.1" fill="#7dffb0" />
      <circle cx="12" cy="12" r="1.2" fill="#e6c766" />
    </svg>
  ),
  // RESPONSIBLE AI — governed neural shield
  // RESPONSIBLE AI — assurance seal (certified / audited)
  shieldCheck: (
    <svg {...SV}>
      <defs><linearGradient id="ic-rai" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e6c766" /><stop offset="1" stopColor="#34d399" /></linearGradient></defs>
      <path d="M9.4 14.8 7.7 20.8l4.3-2.1 4.3 2.1-1.7-6" fill="#0c1f16" stroke="#34d399" strokeWidth="0.9" strokeLinejoin="round" />
      <circle cx="12" cy="9.3" r="6.9" fill="#0c1f16" stroke="url(#ic-rai)" strokeWidth="1.2" />
      <circle cx="12" cy="9.3" r="4.7" fill="none" stroke="#34d399" strokeWidth="0.7" opacity="0.7" />
      <path d="M8.8 9.4 11 11.6l4.3-4.6" stroke="#e6c766" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // DEFENSIVE SUITE — layered aegis shield (defense-in-depth)
  defend: (
    <svg {...SV}>
      <defs><linearGradient id="ic-def" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#34d399" /><stop offset="1" stopColor="#e6c766" /></linearGradient></defs>
      <path d="M12 2.4l7.4 2.7v6c0 4.7-3.2 8.1-7.4 9.6-4.2-1.5-7.4-4.9-7.4-9.6v-6L12 2.4Z" fill="#0c1f16" stroke="url(#ic-def)" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="12" cy="10.6" r="3.6" fill="none" stroke="#34d399" strokeWidth="0.8" opacity="0.8" />
      <circle cx="12" cy="10.6" r="2.1" fill="none" stroke="#e6c766" strokeWidth="0.9" />
      <circle cx="12" cy="10.6" r="0.9" fill="#e6c766" />
    </svg>
  ),
  // PSS — crest shield
  shield: (
    <svg {...SV}>
      <defs><linearGradient id="ic-pss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e6c766" /><stop offset="1" stopColor="#2d5a3d" /></linearGradient></defs>
      <path d="M12 2.2l8 3v6.2c0 4.9-3.4 8.5-8 10.1-4.6-1.6-8-5.2-8-10.1V5.2l8-3z" fill="url(#ic-pss)" />
      <path d="M12 4l6 2.3v4.9c0 3.8-2.6 6.6-6 7.9-3.4-1.3-6-4.1-6-7.9V6.3L12 4z" fill="none" stroke="#0c1f16" strokeWidth="0.7" opacity="0.6" />
      <path d="M8.6 11.6l2.4 2.4 4.6-4.9" stroke="#0c1f16" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const APP_URL = (port) => `${window.location.protocol}//${window.location.hostname}:${port}`

const CENTER = Math.floor(projectCards.length / 2)
const SLIDE_SPEED = 0.22
const CARD_GAP = 56

// After the PSS card dissolves, only these cards live in the carousel
const SLIDER_INDICES = projectCards.map((c, i) => (c.isPss ? -1 : i)).filter((i) => i !== -1)
const SLIDE_CENTER = (SLIDER_INDICES.length - 1) / 2

const Hero = () => {
  const canvasRef = useRef(null)
  const typoRef = useRef(null)
  const line1 = useTypewriter('Pakistan Surveillance Shield.', 32, 250)

  // hidden → assembling → stacked → spreading → dissolving → sliding
  const [phase, setPhase] = useState('hidden')
  const [cardH, setCardH] = useState(300)

  const wrapRef = useRef(null)
  const cardRefs = useRef([])
  const autoXRef = useRef(0)
  const scrollTargetRef = useRef(0)
  const scrollCurrentRef = useRef(0)
  const pausedRef = useRef(false)
  const rafRef = useRef(null)
  const tiltRef = useRef({ x: 0, y: 0, idx: -1 })

  const getOffsets = useCallback((index) => {
    const offset = index - CENTER
    return { offset, dist: Math.abs(offset) }
  }, [])

  useEffect(() => {
    if (!line1.done) return
    const timers = [
      setTimeout(() => setPhase('assembling'), 280),
      setTimeout(() => setPhase('stacked'), 1450),
      setTimeout(() => setPhase('spreading'), 3150),
      setTimeout(() => setPhase('dissolving'), 4700),
      setTimeout(() => setPhase('sliding'), 5900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [line1.done])

  useEffect(() => {
    const measure = () => {
      // Measure the real space the cards section gets; the 36px buffer keeps
      // hover lift/tilt from ever clipping at the section edges.
      const section = wrapRef.current ? wrapRef.current.parentElement : null
      const available = section
        ? section.offsetHeight - 32
        : window.innerHeight - 64 - 250
      // Cap scales with display: larger LED walls need taller cards.
      const w = window.innerWidth
      const maxH = w >= 3840 ? 800 : w >= 2560 ? 680 : w >= 1920 ? 580 : w >= 1600 ? 520 : 480
      setCardH(Math.max(220, Math.min(maxH, available)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [line1.done])

  // Left / right scroll only - horizontal wheel, shift+wheel, or touch swipe
  useEffect(() => {
    if (phase !== 'sliding') return
    const wrap = wrapRef.current
    if (!wrap) return

    const onWheel = (e) => {
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      // Horizontal trackpad swipe, or Shift + vertical wheel → left/right slide
      const isHorizontal = absX > absY || e.shiftKey
      if (!isHorizontal) return

      e.preventDefault()
      const amount = e.shiftKey && absX <= absY ? e.deltaY : e.deltaX || e.deltaY
      scrollTargetRef.current -= amount * 0.9
    }

    let touchX = null
    const onTouchStart = (e) => {
      touchX = e.touches[0]?.clientX ?? null
    }
    const onTouchMove = (e) => {
      if (touchX == null) return
      const x = e.touches[0]?.clientX
      if (x == null) return
      const dx = x - touchX
      touchX = x
      if (Math.abs(dx) < 1) return
      scrollTargetRef.current += dx * 1.2
    }
    const onTouchEnd = () => { touchX = null }

    wrap.addEventListener('wheel', onWheel, { passive: false })
    wrap.addEventListener('touchstart', onTouchStart, { passive: true })
    wrap.addEventListener('touchmove', onTouchMove, { passive: true })
    wrap.addEventListener('touchend', onTouchEnd)
    return () => {
      wrap.removeEventListener('wheel', onWheel)
      wrap.removeEventListener('touchstart', onTouchStart)
      wrap.removeEventListener('touchmove', onTouchMove)
      wrap.removeEventListener('touchend', onTouchEnd)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'sliding') return

    autoXRef.current = 0
    scrollCurrentRef.current = 0
    pausedRef.current = false
    tiltRef.current = { x: 0, y: 0, idx: -1 }

    const n = SLIDER_INDICES.length
    let lastT = null
    let startT = null

    const tick = (now) => {
      // Delta-time smoothing: speed stays constant across 60/120/144Hz displays
      if (lastT == null) lastT = now
      if (startT == null) startT = now
      const dt = Math.min((now - lastT) / 16.667, 3)
      lastT = now

      // Ease the coverflow depth in over the first ~650ms so cards glide out of the
      // dissolving layout instead of popping into 3D - seamless hand-off.
      const p = Math.min((now - startT) / 650, 1)
      const settle = 1 - Math.pow(1 - p, 3)

      if (!pausedRef.current) autoXRef.current -= SLIDE_SPEED * dt

      // slow, gentle ease-in of the hover pop for the hovered card
      if (tiltRef.current.idx >= 0) tiltRef.current.k = Math.min(1, (tiltRef.current.k || 0) + 0.05 * dt)

      // Frame-rate-independent lerp for the manual scroll contribution
      scrollCurrentRef.current += (scrollTargetRef.current - scrollCurrentRef.current) * (1 - Math.pow(0.86, dt))

      const primary = SLIDER_INDICES.map((i) => cardRefs.current[i]).filter(Boolean)
      if (!primary.length) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const cardW = primary[0].offsetWidth || 200
      const stride = cardW + CARD_GAP
      const totalW = n * stride
      const vw = window.innerWidth
      const slideX = autoXRef.current + scrollCurrentRef.current

      // Keep auto loop bounded
      if (autoXRef.current <= -totalW) autoXRef.current += totalW
      if (autoXRef.current > 0) autoXRef.current -= totalW

      const placeCard = (el, si, setOffset, cardIdx) => {
        if (!el) return
        let x = (si - SLIDE_CENTER) * stride + slideX + setOffset

        // Instant wrap: leave one side, appear on the other - no edge fade
        while (x < -totalW) x += totalW * 2
        while (x > totalW) x -= totalW * 2

        el.style.opacity = '1'

        if (tiltRef.current.idx === cardIdx) {
          const k = tiltRef.current.k || 0
          const tx = tiltRef.current.x
          const tiltY = tiltRef.current.y
          el.style.transform = `translateX(${x}px) translateY(${-5 * k}px) rotateY(${tx * 9 * k}deg) rotateX(${-tiltY * 6 * k}deg) scale(${1 + 0.045 * k})`
          el.style.zIndex = '20'
        } else {
          const nx = Math.max(-1, Math.min(1, x / (vw / 2)))
          const dist = Math.abs(nx)
          // Coverflow: side cards angle toward the centre; centre card faces flat.
          // `settle` ramps the depth from flat → full so the entrance is smooth.
          const rotY = -nx * 18 * settle
          const scale = 1 - dist * 0.08 * settle
          const ty = dist * 4 * settle
          const tz = -dist * 60 * settle
          el.style.transform = `translateX(${x}px) translateY(${ty}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`
          el.style.zIndex = String(10 - Math.floor(dist * 5))
        }
      }

      SLIDER_INDICES.forEach((cardIdx, si) => {
        placeCard(cardRefs.current[cardIdx], si, 0, cardIdx)
        placeCard(cardRefs.current[cardIdx + 100], si, totalW, cardIdx + 100)
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      SLIDER_INDICES.forEach((i) => {
        ;[i, i + 100].forEach((refI) => {
          const el = cardRefs.current[refI]
          if (el) el.style.opacity = ''
        })
      })
    }
  }, [phase])

  const resetCardVars = (idx) => {
    const el = cardRefs.current[idx]
    if (!el) return
    el.style.setProperty('--px', '0')
    el.style.setProperty('--py', '0')
  }

  const handleMouseMove = useCallback((e, i) => {
    const el = cardRefs.current[i]
    if (!el) return
    if (tiltRef.current.idx !== i && tiltRef.current.idx >= 0) resetCardVars(tiltRef.current.idx)
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    tiltRef.current = { x, y, idx: i, k: tiltRef.current.idx === i ? (tiltRef.current.k || 0) : 0 }
    // glare position + parallax depth for bg image & content
    el.style.setProperty('--mx', `${((x + 1) / 2) * 100}%`)
    el.style.setProperty('--my', `${((y + 1) / 2) * 100}%`)
    el.style.setProperty('--px', String(x * 8))
    el.style.setProperty('--py', String(y * 8))
  }, [])

  const handleMouseEnter = useCallback(() => { pausedRef.current = true }, [])
  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false
    if (tiltRef.current.idx >= 0) resetCardVars(tiltRef.current.idx)
    tiltRef.current = { x: 0, y: 0, idx: -1 }
  }, [])

  const openApp = (card) => {
    if (!card || !card.port) return // DEFENSIVE SUITE (in progress) — no link yet
    window.open(APP_URL(card.port), '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const nodes = []
    for (let i = 0; i < 60; i++) nodes.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, radius: Math.random() * 2 + 1 })
    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes.forEach(n => { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > canvas.width) n.vx *= -1; if (n.y < 0 || n.y > canvas.height) n.vy *= -1 })
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 180) { ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.strokeStyle = `rgba(45,90,61,${(1 - d / 180) * 0.12})`; ctx.lineWidth = 0.5; ctx.stroke() } }
      nodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(45,90,61,0.15)'; ctx.fill() })
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  const isInteractive = phase === 'sliding'
  const renderList = phase === 'sliding'
    ? [...projectCards.map((_, i) => i), ...SLIDER_INDICES]
    : projectCards.map((_, i) => i)

  return (
    <section className="hero" id="home">
      <canvas ref={canvasRef} className="hero__canvas" />
      <div className="hero__bg-grid" />
      <div className="hero__bg-gradient" />
      <div className="hero__scan-line" />

      <div className="hero__content">
        <div className="hero__top-badge">
          <span className="hero__badge-line" />
          <span className="hero__badge-text">UNIT 47 CYBER INTELLIGENCE PLATFORM</span>
          <span className="hero__badge-line" />
        </div>

        <div className="hero__typography" ref={typoRef}>
          <h1 className="hero__title">
            <span className="hero__title-line hero__title-line--1">
              {line1.displayed}
              {!line1.done && <span className="hero__cursor">|</span>}
              {line1.done && <span className="hero__cursor hero__cursor--blink">|</span>}
            </span>
          </h1>

          <div className={`hero__divider ${line1.done ? 'hero__divider--visible' : ''}`}>
            <span className="hero__divider-wing" />
            <span className="hero__divider-diamond" />
            <span className="hero__divider-wing" />
          </div>
          <p className={`hero__subtitle ${line1.done ? 'hero__subtitle--visible' : ''}`}>
            CyberInt Capabilities
          </p>
        </div>

        <div id="capabilities" className={`hero__cards-section hero__cards-section--${phase}`}>
          <div
            className="hero__cards-wrap"
            ref={wrapRef}
            onMouseEnter={isInteractive ? handleMouseEnter : undefined}
            onMouseLeave={isInteractive ? handleMouseLeave : undefined}
          >
            {renderList.map((i, renderKey) => {
              const card = projectCards[i]
              const { offset, dist } = getOffsets(i)
              const isPss = !!card.isPss
              const isClone = phase === 'sliding' && renderKey >= projectCards.length
              const refIndex = isClone ? i + 100 : i
              const sliderPos = SLIDER_INDICES.indexOf(i)
              const slideOffset = sliderPos === -1 ? 0 : sliderPos - SLIDE_CENTER
              return (
                <div
                  className={`hero__card ${isPss ? 'hero__card--pss' : ''} ${isClone ? 'hero__card--clone' : ''}`}
                  key={`${card.title}-${renderKey}`}
                  ref={(el) => { cardRefs.current[refIndex] = el }}
                  style={{
                    height: `${cardH}px`,
                    '--stack-offset': offset,
                    '--stack-dist': dist,
                    '--slide-offset': slideOffset,
                    '--slide-dist': Math.abs(slideOffset),
                  }}
                  onMouseMove={isInteractive ? (e) => handleMouseMove(e, refIndex) : undefined}
                  onClick={() => openApp(card)}
                >
                  {card.bgImage && (
                    <img
                      src={card.bgImage}
                      alt=""
                      className={`hero__card-bg ${isPss ? 'hero__card-bg--logo' : ''}`}
                    />
                  )}
                  <div className="hero__card-overlay" />
                  <div className="hero__card-glass" />
                  <div className="hero__card-shine" />
                  <div className="hero__card-scan" />
                  {!isPss && (
                    <>
                      <span className="hero__card-hud hero__card-hud--tl" />
                      <span className="hero__card-hud hero__card-hud--tr" />
                      <span className="hero__card-hud hero__card-hud--bl" />
                      <span className="hero__card-hud hero__card-hud--br" />
                    </>
                  )}
                  <div className="hero__card-content">
                    <div className="hero__card-icon">
                      {card.isPss
                        ? <img src="/team_logo.png" alt="PSS" className="hero__card-logo-img" />
                        : card.logo
                          ? (
                              <ProjectLogo
                                src={card.logo}
                                bg={card.logoBg === 'light' ? 'light' : 'dark'}
                                raw={!!card.logoRaw}
                                alt={`${card.title} logo`}
                                className={`hero__project-logo${card.logoClass ? ` hero__project-logo--${card.logoClass}` : ''}${card.logoRaw ? ' hero__project-logo--raw' : ''}`}
                              />
                            )
                          : ICONS[card.icon]}
                    </div>
                    <h3 className="hero__card-title">{card.title}</h3>
                    <span className="hero__card-subtitle">{card.subtitle}</span>
                    <p className="hero__card-desc">{card.desc}</p>
                    {!isPss && (
                      <button
                        className="hero__card-cta"
                        onClick={(e) => { e.stopPropagation(); openApp(card) }}
                      >
                        Explore Project
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="hero__corner hero__corner--tl" />
      <div className="hero__corner hero__corner--tr" />
      <div className="hero__corner hero__corner--bl" />
      <div className="hero__corner hero__corner--br" />

      {/* Corner seal emblems - PSS top-left, NIFTAC top-right */}
      <div className={`hero__corner-seal hero__corner-seal--tl ${line1.done ? 'hero__corner-seal--visible' : ''}`}>
        <div className="hero__seal-wrap hero__seal-wrap--left">
          <img
            src="/pss-logo.png"
            alt="Pak Surveillance Shield"
            className="hero__seal"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      </div>
      <div className={`hero__corner-seal hero__corner-seal--tr ${line1.done ? 'hero__corner-seal--visible' : ''}`}>
        <div className="hero__seal-wrap hero__seal-wrap--right">
          <img
            src="/niftac-logo.png"
            alt="NIFTAC - National Intelligence Fusion & Threat Assessment Center"
            className="hero__seal"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      </div>

    </section>
  )
}

export default Hero
