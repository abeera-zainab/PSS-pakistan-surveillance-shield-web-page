import { useEffect, useRef, useState } from 'react'
import './AboutUs.css'

function useOnScreen(ref, threshold = 0.12) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el) }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

function useCounter(target, duration = 2200, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const num = parseInt(target.replace(/[^0-9]/g, ''), 10)
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * num))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  const num = parseInt(target.replace(/[^0-9]/g, ''), 10)
  const suffix = target.replace(/[0-9,]/g, '')
  if (count >= num) return target
  return count.toLocaleString() + suffix
}

const Icon = ({ name }) => {
  const icons = {
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    radar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12l4-4"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/></svg>,
    globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    code: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    folder: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    database: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    web: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    scan: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>,
    video: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="15" height="12" rx="2"/><path d="M17 10l5-3v10l-5-3z"/></svg>,
    cpu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></svg>,
    eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    network: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4M12 11l-5.5 6M12 11l5.5 6"/></svg>,
  }
  return <span className="about__icon-svg">{icons[name]}</span>
}

const teams = [
  { name: 'FR Team', code: '01', icon: 'user', desc: 'Facial reconstruction & biometric identification' },
  { name: 'NIGRAN Team', code: '02', icon: 'radar', desc: 'Multi-platform media threat monitoring' },
  { name: 'Terrain Team', code: '03', icon: 'globe', desc: 'GEOINT, geolocation & terrain analysis' },
  { name: 'Offensive Team', code: '04', icon: 'zap', desc: 'Offensive cyber & threat operations' },
  { name: 'Defensive Team', code: '05', icon: 'shield', desc: 'Defensive cyber security & protection' },
  { name: 'Dev Team', code: '06', icon: 'code', desc: 'Platform engineering & tooling' },
]

const pillars = [
  { icon: 'eye', title: 'Surveillance Intelligence', text: 'Continuous monitoring across open, social, and dark-web channels to surface threats early.' },
  { icon: 'cpu', title: 'AI Correlation', text: 'Multi-source fusion engines that connect identities, locations, and behavioural patterns.' },
  { icon: 'network', title: 'Mission Delivery', text: 'Actionable intelligence reports designed for operational decision-making under pressure.' },
]

const stats = [
  { icon: 'folder', value: '63+', label: 'Cases Supported', desc: 'Actionable leads delivered', code: 'OPS-01' },
  { icon: 'database', value: '13,000', label: 'Suspects Profiled', desc: 'CyberInt database records', code: 'CINT-02' },
  { icon: 'web', value: '20 Mn', label: 'Dark-Web Records', desc: 'Leaked data harvested', code: 'NOX-03' },
  { icon: 'users', value: '750', label: 'Hostile Accounts', desc: 'Mapped & monitored', code: 'SOC-04' },
  { icon: 'scan', value: '697', label: 'Faces Reconstructed', desc: 'FRS pipeline output', code: 'FRS-05' },
  { icon: 'video', value: '24', label: 'Videos Geo-Located', desc: 'Footage-based GEOINT', code: 'GEO-06' },
]

const StatCard = ({ stat, index, started }) => {
  const display = useCounter(stat.value, 2200, started)
  return (
    <div className={`about__stat ${started ? 'about__stat--show' : ''}`} style={{ '--stat-i': index }}>
      <span className="about__stat-corner about__stat-corner--tl" />
      <span className="about__stat-corner about__stat-corner--tr" />
      <span className="about__stat-corner about__stat-corner--bl" />
      <span className="about__stat-corner about__stat-corner--br" />
      <div className="about__stat-top">
        <div className="about__stat-icon-wrap">
          <Icon name={stat.icon} />
        </div>
        <div className="about__stat-meta">
          <span className="about__stat-code">{stat.code}</span>
          <span className="about__stat-live" />
        </div>
      </div>
      <span className="about__stat-value">{display}</span>
      <span className="about__stat-label">{stat.label}</span>
      <p className="about__stat-desc">{stat.desc}</p>
      <div className="about__stat-bar">
        <span className="about__stat-bar-fill" style={{ '--fill-i': index }} />
      </div>
    </div>
  )
}

const AboutUs = () => {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const statsRef = useRef(null)
  const visible = useOnScreen(sectionRef, 0.08)
  const statsVisible = useOnScreen(statsRef, 0.12)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!visible) return
    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => setStep(2), 700),
      setTimeout(() => setStep(3), 1300),
      setTimeout(() => setStep(4), 1900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [visible])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = canvas.parentElement.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = []
    for (let i = 0; i < 48; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
        o: Math.random() * 0.14 + 0.03,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(45, 90, 61, ${p.o})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(45, 90, 61, ${(1 - d / 120) * 0.06})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="about" id="about" ref={sectionRef}>
      <canvas ref={canvasRef} className="about__canvas" />
      <div className="about__bg-grid" />
      <div className="about__bg-glow about__bg-glow--tl" />
      <div className="about__bg-glow about__bg-glow--br" />

      {/* ===== INTRO — full bleed ===== */}
      <div className={`about__intro ${visible ? 'about__intro--show' : ''}`}>
        <div className="about__intro-inner">
          <div className="about__intro-left">
            <span className="about__eyebrow">
              <span className="about__eyebrow-dot" />
              ABOUT UNIT-47
            </span>
            <h2 className="about__title">Who We Are</h2>
            <p className="about__lead">
              Pakistan Surveillance Shield is a specialized cyber-intelligence division
              delivering end-to-end threat detection, geolocation, and mission-ready
              intelligence for national security operations.
            </p>
            <div className="about__meta-row">
              <div className="about__meta">
                <span className="about__meta-label">DIVISION</span>
                <span className="about__meta-value">UNIT-47</span>
              </div>
              <div className="about__meta-divider" />
              <div className="about__meta">
                <span className="about__meta-label">DOMAIN</span>
                <span className="about__meta-value">CYBER INTEL</span>
              </div>
              <div className="about__meta-divider" />
              <div className="about__meta">
                <span className="about__meta-label">STATUS</span>
                <span className="about__meta-value about__meta-value--live">OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div className="about__pillars">
            {pillars.map((p, i) => (
              <div
                key={i}
                className={`about__pillar ${visible ? 'about__pillar--show' : ''}`}
                style={{ '--pillar-i': i }}
              >
                <div className="about__pillar-icon">
                  <Icon name={p.icon} />
                </div>
                <div className="about__pillar-body">
                  <h3 className="about__pillar-title">{p.title}</h3>
                  <p className="about__pillar-text">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== COMMAND STRUCTURE — full width ===== */}
      <div className={`about__structure ${visible ? 'about__structure--show' : ''}`}>
        <div className="about__structure-head">
          <span className="about__eyebrow about__eyebrow--center">
            <span className="about__eyebrow-dot" />
            COMMAND STRUCTURE
          </span>
          <h3 className="about__subtitle">Operational Hierarchy</h3>
          <p className="about__structure-desc">
            Leadership cascade from technical command through CISO into specialized mission cells.
          </p>
        </div>

        <div className={`about__chart ${visible ? 'about__chart--visible' : ''}`}>
          <div className={`about__node about__node--cto ${step >= 1 ? 'about__node--show' : ''}`}>
            <div className="about__node-box about__node-box--cto">
              <span className="about__node-corner about__node-corner--tl" />
              <span className="about__node-corner about__node-corner--tr" />
              <span className="about__node-corner about__node-corner--bl" />
              <span className="about__node-corner about__node-corner--br" />
              <span className="about__node-tag">L0 · COMMAND AUTHORITY</span>
              <span className="about__node-title">Chief Technology Officer</span>
              <span className="about__node-sub">Strategic Technical Leadership · UNIT-47</span>
            </div>
          </div>

          <div className={`about__vline about__vline--top ${step >= 2 ? 'about__vline--show' : ''}`} />

          <div className={`about__node about__node--ciso ${step >= 2 ? 'about__node--show' : ''}`}>
            <div className="about__node-box about__node-box--ciso">
              <span className="about__node-corner about__node-corner--tl" />
              <span className="about__node-corner about__node-corner--tr" />
              <span className="about__node-corner about__node-corner--bl" />
              <span className="about__node-corner about__node-corner--br" />
              <span className="about__node-tag about__node-tag--alt">L1 · SECURITY COMMAND</span>
              <span className="about__node-title">CISO</span>
              <span className="about__node-sub about__node-sub--dark">Chief Information Security Officer</span>
            </div>
          </div>

          <div className={`about__vline about__vline--mid ${step >= 3 ? 'about__vline--show' : ''}`} />

          <div className={`about__rail ${step >= 3 ? 'about__rail--show' : ''}`}>
            <div className="about__rail-line" />
            <div className="about__rail-label">{step >= 3 ? 'MISSION CELLS' : ''}</div>
            {teams.map((_, i) => (
              <div
                key={i}
                className={`about__rail-drop ${step >= 3 ? 'about__rail-drop--show' : ''}`}
                style={{ '--drop-i': i }}
              />
            ))}
          </div>

          <div className="about__teams">
            {teams.map((team, i) => (
              <div
                key={i}
                className={`about__team ${step >= 4 ? 'about__team--show' : ''}`}
                style={{ '--team-i': i }}
              >
                <div className="about__team-scan" />
                <div className="about__team-top">
                  <span className="about__team-code">CELL-{team.code}</span>
                  <span className="about__team-status" />
                </div>
                <div className="about__team-icon-wrap">
                  <Icon name={team.icon} />
                </div>
                <h4 className="about__team-name">{team.name}</h4>
                <p className="about__team-desc">{team.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== STATS — light technical mission output ===== */}
      <div className="about__stats-section" ref={statsRef}>
        <div className="about__stats-grid-bg" />
        <div className="about__stats-scan" />
        <div className="about__stats-inner">
          <div className={`about__stats-header ${statsVisible ? 'about__stats-header--show' : ''}`}>
            <div className="about__stats-header-row">
              <span className="about__eyebrow">
                <span className="about__eyebrow-dot" />
                MISSION OUTPUT
              </span>
              <span className="about__stats-sys">SYS · METRICS · LIVE</span>
            </div>
            <h2 className="about__title">What PSS Has Delivered</h2>
            <p className="about__stats-lead">
              Quantified operational impact across cases, cyber intelligence, and forensic pipelines.
            </p>
          </div>

          <div className="about__stats-grid">
            {stats.map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} started={statsVisible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
