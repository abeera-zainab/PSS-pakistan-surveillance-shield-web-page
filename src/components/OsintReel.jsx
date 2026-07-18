import { useEffect, useRef, useState } from 'react'
import './OsintReel.css'

/* ============================================================
   OSINT TECHNIQUE · CASE REEL
   Combines all OSINT cases (IO110 / IO111 / IO106) into one
   cinematic auto-playing reel using operational screenshots.
   Drop images into /public as osint-1.png ... osint-3.png
   ============================================================ */

function useOnScreen(ref, threshold = 0.15) {
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

const CountUp = ({ target, duration = 1500, start = false }) => {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf, t0
    const tick = (t) => {
      if (t0 === undefined) t0 = t
      const p = Math.min((t - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const safety = setTimeout(() => setN(target), duration + 250)
    return () => { cancelAnimationFrame(raf); clearTimeout(safety) }
  }, [start, target, duration])
  return <span>{n}</span>
}

/* ---- OSINT IMPACT LEDGER ---- */
const impact = [
  { code: 'OS-01', val: 3, mult: true, label: 'OSINT Cases', sub: 'Parallel tracks' },
  { code: 'OS-02', val: 8, mult: true, label: 'Faces Extracted', sub: 'Candidate crops' },
  { code: 'OS-03', val: 3, mult: true, label: 'Upload Traces', sub: 'X reposts' },
  { code: 'OS-04', val: 2, mult: true, label: 'Platforms', sub: 'X · YouTube' },
  { code: 'OS-05', val: 5, mult: true, label: 'Leads Retained', sub: 'Verified links' },
]

/* ---- REEL SLIDES (provided screenshots) ---- */
const slides = [
  {
    id: 'o1', no: '01', img: '/osint-1.png', kind: 'BOARD', code: 'CASE-BOARD',
    title: 'OSINT Case Board', region: 'IO110 · IO111 · IO106',
    tag: 'OVERVIEW — ACTIVE OSINT CASES',
    summary: 'Three OSINT cases tracked in parallel — social-media tracing, CCTV enhancement, and protest attribution.',
    flow: ['Intake', 'Trace', 'Extract', 'Map'],
    tags: ['3 CASES', 'MULTI-SOURCE'],
  },
  {
    id: 'o2', no: '02', img: '/osint-2.png', kind: 'OSINT', code: 'IO110',
    title: 'BLF “Chaos” OSINT', region: '04/06/2026 · Social Media Analysis',
    tag: 'DIGITAL FOOTPRINT — FACE EXTRACTION',
    summary: '“Chaos” video traced across three X uploads; eight candidate face crops prepared for reconstruction / recognition.',
    flow: ['Face Extraction', 'Reconstruction', 'Recognition', 'Candidate Shortlist'],
    tags: ['8 FACES', '3 UPLOAD TRACES'],
  },
  {
    id: 'o3', no: '03', img: '/osint-3.png', kind: 'CCTV', code: 'IO111',
    title: 'CCTV Enhancement', region: '03/06/2026 · Image Extraction',
    tag: 'SOURCE → ENHANCED FACE VIEWS',
    summary: 'CCTV footage processed; driver/passenger frames extracted and enhanced for clearer facial review.',
    flow: ['Source CCTV', 'Frame Extract', 'AI Enhance', 'ID Support'],
    tags: ['DRIVER / PASSENGER', 'ENHANCED'],
  },
]

/* ---- OSINT CASES ---- */
const osintCases = [
  {
    code: 'IO110', title: 'BLF “Chaos” OSINT', date: '04/06/2026', tech: 'Social Media Analysis',
    outputs: ['Multiple uploads identified', 'Source posts & screenshots retained', 'Extracted face set prepared'],
    leads: ['X lead 1', 'X lead 2'],
  },
  {
    code: 'IO111', title: 'CCTV Enhancement', date: '03/06/2026', tech: 'Image Extraction',
    outputs: ['Driver / passenger focus frames', 'Degraded footage enhanced', 'Identification support output'],
    leads: ['Internal evidence', 'No public lead'],
  },
  {
    code: 'IO106', title: 'BNM Protest OSINT', date: '01/06/2026', tech: 'Social Media Analysis',
    outputs: ['Broadcast source identified', 'Participant frames extracted', 'Social profiles mapped / flagged'],
    leads: ['X lead', 'YouTube'],
  },
]

const REEL_MS = 5600

const OsintGlyph = () => (
  <svg className="os-fallback" viewBox="0 0 320 200" aria-hidden="true">
    <rect width="320" height="200" fill="#0e1913" />
    <circle cx="160" cy="86" r="34" fill="none" stroke="#2c5238" strokeWidth="3" />
    <circle cx="160" cy="76" r="12" fill="#2c5238" />
    <path d="M138 110 q22 -18 44 0" fill="#2c5238" />
    <path d="M60 160 h200 M60 174 h150" stroke="#22402c" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

const Stage = ({ item }) => {
  const [failed, setFailed] = useState(false)
  return (
    <div className="os-stage__frame">
      {!failed && <div className="os-stage__bg" style={{ backgroundImage: `url(${item.img})` }} />}
      <div className="os-stage__media">
        {failed
          ? <OsintGlyph />
          : <img src={item.img} alt={item.title} className="os-stage__img" onError={() => setFailed(true)} />}
      </div>

      <span className="os-stage__kind">{item.kind}</span>
      <span className="os-stage__scan" />
      <span className="os-stage__stamp"><span className="os-stage__stamp-tick">✓</span> TRACED</span>

      <span className="os-stage__corner os-stage__corner--tl" />
      <span className="os-stage__corner os-stage__corner--tr" />
      <span className="os-stage__corner os-stage__corner--bl" />
      <span className="os-stage__corner os-stage__corner--br" />
    </div>
  )
}

const OsintReel = () => {
  const rootRef = useRef(null)
  const visible = useOnScreen(rootRef, 0.12)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [playKey, setPlayKey] = useState(0)

  useEffect(() => {
    if (!visible || paused) return
    const iv = setTimeout(() => {
      setActive((a) => (a + 1) % slides.length)
      setPlayKey((k) => k + 1)
    }, REEL_MS)
    return () => clearTimeout(iv)
  }, [visible, paused, active])

  const go = (i) => { setActive(i); setPlayKey((k) => k + 1) }
  const item = slides[active]

  return (
    <section className="os" id="osint-technique" ref={rootRef}>
      <div className="os__grid-bg" />
      <div className="os__scan" />
      <div className="os__vignette" />

      <div className="os__inner">
        {/* ===== HEADER ===== */}
        <header className={`os__head ${visible ? 'os__head--show' : ''}`}>
          <div className="os__head-row">
            <span className="os__eyebrow">
              <span className="os__eyebrow-dot" />
              OPERATION · OSINT TECHNIQUE
            </span>
            <span className="os__sys">OSINT · TRACE &amp; EXTRACT</span>
          </div>
          <h2 className="os__title">OSINT Case Reel</h2>
          <p className="os__lead">
            Open-source tracing across social platforms and CCTV — video dissemination mapped,
            frames extracted and enhanced, and candidate faces surfaced for the recognition pipeline.
          </p>
        </header>

        {/* ===== IMPACT LEDGER ===== */}
        <div className={`os__ledger ${visible ? 'os__ledger--show' : ''}`}>
          {impact.map((m, i) => (
            <div className="os__metric" key={m.code} style={{ '--m-i': i }}>
              <div className="os__metric-top">
                <span className="os__metric-code">{m.code}</span>
                <span className="os__metric-live" />
              </div>
              <span className="os__metric-val">
                <CountUp target={m.val} start={visible} />{m.mult ? <em>×</em> : null}
              </span>
              <span className="os__metric-label">{m.label}</span>
              <span className="os__metric-sub">{m.sub}</span>
            </div>
          ))}
          <div className="os__ledger-seal">OSINT</div>
        </div>

        {/* ===== REEL ===== */}
        <div
          className={`os__reel ${visible ? 'os__reel--show' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="os__stage">
            <div className="os__stage-bar">
              <span className="os__stage-count">CASE {item.no} / {String(slides.length).padStart(2, '0')}</span>
              <span className="os__stage-code">{item.code}</span>
              <span className={`os__stage-state ${paused ? 'is-paused' : ''}`}>
                {paused ? '❚❚ PAUSED' : '▶ PLAYING'}
              </span>
            </div>

            <Stage key={playKey} item={item} />

            <div className="os__progress">
              {slides.map((s, i) => (
                <span key={s.id} className="os__progress-track">
                  <span
                    className={`os__progress-fill ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
                    style={{ animationDuration: `${REEL_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="os__caption" key={`cap-${playKey}`}>
            <span className="os__caption-tag">{item.tag}</span>
            <h3 className="os__caption-title">
              {item.title}
              <span className="os__caption-region">{item.region}</span>
            </h3>
            <p className="os__caption-sub">{item.summary}</p>

            <div className="os__flow">
              {item.flow.map((p, i) => (
                <span key={p} className="os__flow-step" style={{ '--f-i': i }}>
                  {i > 0 && <span className="os__flow-arrow">›</span>}
                  <span className="os__flow-chip">{p}</span>
                </span>
              ))}
            </div>

            <div className="os__tags">
              {item.tags.map((t) => (
                <span key={t} className="os__tag">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== THUMBNAIL SCRUBBER ===== */}
        <div className={`os__thumbs ${visible ? 'os__thumbs--show' : ''}`}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`os__thumb ${i === active ? 'os__thumb--active' : ''}`}
              onClick={() => go(i)}
              type="button"
              style={{ backgroundImage: `url(${s.img})` }}
            >
              <span className="os__thumb-shade" />
              <span className="os__thumb-no">{s.no}</span>
              <span className="os__thumb-title">{s.title}</span>
            </button>
          ))}
        </div>

        {/* ===== OSINT CASES ===== */}
        <div className={`os__cases ${visible ? 'os__cases--show' : ''}`}>
          <div className="os__cases-head">
            <span className="os__eyebrow">
              <span className="os__eyebrow-dot" />
              OSINT CASE LOG
            </span>
            <span className="os__sys">TECHNIQUE · OUTPUTS · LEADS</span>
          </div>
          <div className="os__cases-grid">
            {osintCases.map((c, i) => (
              <div className="os__case" key={c.code} style={{ '--c-i': i }}>
                <div className="os__case-top">
                  <span className="os__case-code">{c.code}</span>
                  <span className="os__case-date">{c.date}</span>
                </div>
                <h4 className="os__case-title">{c.title}</h4>
                <span className="os__case-tech">{c.tech}</span>
                <div className="os__case-outputs">
                  {c.outputs.map((o) => (
                    <span key={o} className="os__case-output">
                      <span className="os__case-bullet">›</span>{o}
                    </span>
                  ))}
                </div>
                <div className="os__case-leads">
                  {c.leads.map((l) => (
                    <span
                      key={l}
                      className={`os__case-lead ${/^no /i.test(l) ? 'is-muted' : ''}`}
                    >{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OsintReel
