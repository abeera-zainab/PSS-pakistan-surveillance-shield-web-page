import { useState, useEffect, useRef, useCallback } from 'react'
import './Header.css'

const Header = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => { const r = canvas.parentElement.getBoundingClientRect(); canvas.width = r.width; canvas.height = r.height }
    resize(); window.addEventListener('resize', resize)
    const particles = []
    for (let i = 0; i < 35; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, baseX: Math.random() * canvas.width, baseY: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.15, r: Math.random() * 1.5 + 0.5, depth: Math.random() * 0.8 + 0.2 })
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x, my = mouseRef.current.y
      particles.forEach(p => { p.baseX += p.vx; p.baseY += p.vy; if (p.baseX < 0 || p.baseX > canvas.width) p.vx *= -1; if (p.baseY < 0 || p.baseY > canvas.height) p.vy *= -1; p.x = p.baseX + (mx - canvas.width / 2) * 0.02 * p.depth; p.y = p.baseY + (my - canvas.height / 2) * 0.02 * p.depth })
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) { const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 140) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(45,90,61,${(1 - d / 140) * 0.12 * ((particles[i].depth + particles[j].depth) / 2)})`; ctx.lineWidth = 0.4; ctx.stroke() } }
      particles.forEach(p => { const a = 0.1 + p.depth * 0.15, s = p.r * (0.6 + p.depth * 0.4); ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2); ctx.fillStyle = `rgba(45,90,61,${a})`; ctx.fill(); if (p.depth > 0.6) { ctx.beginPath(); ctx.arc(p.x, p.y, s + 2, 0, Math.PI * 2); ctx.fillStyle = `rgba(0,200,83,${a * 0.15})`; ctx.fill() } })
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  useEffect(() => {
    const sectionIds = ['home', 'capabilities', 'workflow', 'about']

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const scrollY = window.scrollY + 120
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (el && el.offsetTop <= scrollY) {
          setActiveTab(sectionIds[i])
          break
        }
      }
    }

    const handleMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouse)
    setTimeout(() => setLoaded(true), 100)
    const cleanup = initCanvas()
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMouse); if (cleanup) cleanup() }
  }, [initCanvas])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'about', label: 'About Us' },
  ]

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''} ${loaded ? 'header--loaded' : ''}`}>
      <canvas ref={canvasRef} className="header__canvas-bg" />
      <div className="header__grid-overlay" />
      <div className="header__shimmer" />
      <div className="header__energy-line header__energy-line--1" />
      <div className="header__energy-line header__energy-line--2" />

      <div className="header__container">
        <div className="header__logo-group" onClick={() => scrollTo('home')} style={{ cursor: 'pointer' }}>
          <div className="header__logo-ring">
            <div className="header__logo-ring-outer" />
            <div className="header__logo-ring-inner" />
            <div className="header__logo-scan" />
            <img src="/logo.png.png" alt="PSS Logo" className="header__logo-img" />
            <div className="header__logo-pulse" />
            <div className="header__logo-pulse header__logo-pulse--delayed" />
          </div>
          <div className="header__brand">
            <span className="header__brand-name">
              <span className="header__brand-accent">P</span>akistan{' '}
              <span className="header__brand-accent">S</span>urveillance{' '}
              <span className="header__brand-accent">S</span>hield
            </span>
            <span className="header__brand-tagline">
              <span className="header__tagline-dot" />
              UNIT-47 DIVISION
            </span>
          </div>
        </div>

        <nav className="header__nav">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              className={`header__nav-item ${activeTab === item.id ? 'header__nav-item--active' : ''}`}
              onClick={() => scrollTo(item.id)}
              style={{ animationDelay: `${0.3 + index * 0.08}s` }}
            >
              <span className="header__nav-label">{item.label}</span>
              <span className="header__nav-indicator" />
              {activeTab === item.id && <span className="header__nav-glow" />}
            </button>
          ))}
        </nav>

        <div className="header__status">
          <span className="header__status-dot" />
          <span className="header__status-text">SYSTEM ACTIVE</span>
          <span className="header__status-ping" />
        </div>
      </div>

      <div className="header__bottom-line" />
      <div className="header__bottom-sweep" />
    </header>
  )
}

export default Header
