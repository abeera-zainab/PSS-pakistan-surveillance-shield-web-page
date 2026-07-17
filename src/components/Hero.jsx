import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

const projectCards = [
  { title: 'AGEX IRIS', logo: '/logo-agex-iris.png', bgImage: '/bg-agex-iris.png', desc: 'AI-powered facial reconstruction & enhancement system for precision identity analysis, feature mapping, and real-time biometric recognition.' },
  { title: 'GEO INT', subtitle: 'Terrain Feature Analysis', logo: '/logo-terrain.png', bgImage: '/bg-terrain.png', desc: 'Geolocation and Terrain analysis of target areas from a video or image feed' },
  { title: 'NIGRAN', subtitle: 'Media Monitoring', logo: '/logo-nigran.png', bgImage: '/bg-nigran.png', desc: 'Autonomous digital pulse reporting system' },
  { title: 'Pakistan Surveillance Shield', subtitle: '(PSS)', logo: '/logo.png.png', bgImage: '/logo.png.png', desc: 'Smart Surveillance. Safer Pakistan.', isPss: true },
  { title: 'RAVEN', logo: '/logo-raven.png', bgImage: '/bg-raven.png', desc: 'Spotting the subtle changes to secure the road ahead' },
  { title: 'NoX', logo: '/logo-nox.png', bgImage: '/bg-nox.png', desc: 'Adversarial offensive cyber toolset & capability' },
  { title: 'CyberINT', logo: '/logo-cyberint.png', bgImage: '/bg-cyberint.png', desc: 'Full-spectrum OSINT, target profiling, data harvesting, dark web monitoring, and continuous watchdog' },
]

const CENTER = Math.floor(projectCards.length / 2)
const SLIDE_SPEED = 0.52
const CARD_GAP = 48

// After the PSS card dissolves, only these cards live in the carousel
const SLIDER_INDICES = projectCards.map((c, i) => (c.isPss ? -1 : i)).filter((i) => i !== -1)
const SLIDE_CENTER = (SLIDER_INDICES.length - 1) / 2

const Hero = () => {
  const canvasRef = useRef(null)
  const typoRef = useRef(null)
  const line1 = useTypewriter('Smart Surveillance.', 55, 400)
  const line2 = useTypewriter('Safer Pakistan.', 55, 1600)

  // hidden → assembling → stacked → spreading → dissolving → sliding
  const [phase, setPhase] = useState('hidden')
  const [cardH, setCardH] = useState(300)
  const [activeCard, setActiveCard] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

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
    if (!line2.done) return
    const timers = [
      setTimeout(() => setPhase('assembling'), 280),
      setTimeout(() => setPhase('stacked'), 1450),
      setTimeout(() => setPhase('spreading'), 3150),
      setTimeout(() => setPhase('dissolving'), 4700),
      setTimeout(() => setPhase('sliding'), 5900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [line2.done])

  useEffect(() => {
    const measure = () => {
      // Measure the real space the cards section gets; the 36px buffer keeps
      // hover lift/tilt from ever clipping at the section edges.
      const section = wrapRef.current ? wrapRef.current.parentElement : null
      const available = section
        ? section.offsetHeight - 32
        : window.innerHeight - 64 - 250
      setCardH(Math.max(160, Math.min(380, available)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [line2.done])

  // Left / right scroll only — horizontal wheel, shift+wheel, or touch swipe
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

    const tick = (now) => {
      // Delta-time smoothing: speed stays constant across 60/120/144Hz displays
      if (lastT == null) lastT = now
      const dt = Math.min((now - lastT) / 16.667, 3)
      lastT = now

      if (!pausedRef.current) autoXRef.current -= SLIDE_SPEED * dt

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

        // Instant wrap: leave one side, appear on the other — no edge fade
        while (x < -totalW) x += totalW * 2
        while (x > totalW) x -= totalW * 2

        el.style.opacity = '1'

        if (tiltRef.current.idx === cardIdx) {
          const tx = tiltRef.current.x
          const tiltY = tiltRef.current.y
          el.style.transform = `translateX(${x}px) translateY(-10px) rotateY(${tx * 17}deg) rotateX(${-tiltY * 12}deg) scale(1.09)`
          el.style.zIndex = '20'
        } else {
          const nx = Math.max(-1, Math.min(1, x / (vw / 2)))
          const dist = Math.abs(nx)
          // Coverflow: side cards angle toward the centre; centre card faces flat
          const rotY = -nx * 18
          const scale = 1 - dist * 0.08
          const ty = dist * 4
          const tz = -dist * 60
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
    tiltRef.current = { x, y, idx: i }
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

  const openCard = (index) => {
    setActiveCard(index)
    requestAnimationFrame(() => setModalVisible(true))
  }

  const closeCard = () => {
    setModalVisible(false)
    setTimeout(() => setActiveCard(null), 400)
  }

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && activeCard !== null) closeCard() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [activeCard])

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
          <span className="hero__badge-text">UNIT-47 CYBER INTELLIGENCE DIVISION</span>
          <span className="hero__badge-line" />
        </div>

        <div className="hero__typography" ref={typoRef}>
          <h1 className="hero__title">
            <span className="hero__title-line hero__title-line--1">
              {line1.displayed}
              {!line1.done && <span className="hero__cursor">|</span>}
            </span>
            <span className="hero__title-line hero__title-line--2">
              {line2.displayed}
              {line1.done && !line2.done && <span className="hero__cursor">|</span>}
              {line2.done && <span className="hero__cursor hero__cursor--blink">|</span>}
            </span>
          </h1>
          <div className={`hero__divider ${line2.done ? 'hero__divider--visible' : ''}`}>
            <span className="hero__divider-wing" />
            <span className="hero__divider-diamond" />
            <span className="hero__divider-wing" />
          </div>
          <p className={`hero__subtitle ${line2.done ? 'hero__subtitle--visible' : ''}`}>
            An in-house cyber intelligence capability that transforms
            raw cyber signals into actionable insights for informed decisions.
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
                  onClick={() => openCard(i)}
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
                    {card.logo && <img src={card.logo} alt={card.title} className="hero__card-logo" />}
                    <h3 className="hero__card-title">{card.title}</h3>
                    {card.subtitle && <span className="hero__card-subtitle">{card.subtitle}</span>}
                    <p className="hero__card-desc">{card.desc}</p>
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

      {activeCard !== null && createPortal(
        <div className={`hero__modal-overlay ${modalVisible ? 'hero__modal-overlay--visible' : 'hero__modal-overlay--closing'}`} onClick={closeCard}>
          <div className={`hero__modal-card ${modalVisible ? 'hero__modal-card--visible' : 'hero__modal-card--closing'}`} onClick={(e) => e.stopPropagation()}>
            {projectCards[activeCard].bgImage && <img src={projectCards[activeCard].bgImage} alt="" className="hero__modal-bg" />}
            <div className="hero__modal-glass" />
            <div className="hero__modal-content">
              {projectCards[activeCard].logo && <img src={projectCards[activeCard].logo} alt={projectCards[activeCard].title} className="hero__modal-logo" />}
              <h3 className="hero__modal-title">{projectCards[activeCard].title}</h3>
              {projectCards[activeCard].subtitle && <span className="hero__modal-subtitle">{projectCards[activeCard].subtitle}</span>}
              <p className="hero__modal-desc">{projectCards[activeCard].desc}</p>
            </div>
            <button className="hero__modal-close" onClick={closeCard}>✕</button>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}

export default Hero
