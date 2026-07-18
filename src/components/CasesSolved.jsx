import { useEffect, useRef, useState } from 'react'
import './CasesSolved.css'

/* ============================================================
   CASES SOLVED — OPERATION RAD-UL-FITNA
   AGEX IRIS · Face Reconstruction / Face Enhancement (FR/FE)
   Cinematic auto-playing reel using operational screenshots.
   Images live in /public as face-cases.png & face-radulfitna.png
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

/* ---- IMPACT LEDGER (Rad-ul-Fitna dashboard) ---- */
const impact = [
  { code: 'FR-01', val: 25, mult: true, label: 'Face Reconstructions', sub: 'FR pipeline output' },
  { code: 'IS-02', val: 4, mult: true, label: 'Image Scaling', sub: 'AI super-resolution' },
  { code: 'IA-03', val: 5, mult: true, label: 'Identity Attribution', sub: 'NADRA-matched IDs' },
  { code: 'FT-04', val: 8, mult: true, label: 'FaceTrace', sub: 'Cross-source tracing' },
  { code: 'MS-05', val: 3, mult: true, label: 'MSISDN Artifacts', sub: 'PK / US / Iran' },
]

/* ---- REEL SLIDES (provided screenshots) ---- */
const slides = [
  {
    id: 'f1', no: '01', img: '/face-cases.png', kind: 'FR', code: 'CASE-GALLERY',
    title: 'Reconstructed Case Gallery', region: 'Panjgur · Naukandi · Imambargah',
    tag: 'OVERVIEW — DEGRADED → RECONSTRUCTED',
    summary: 'Severely degraded scene media restored via GAN reconstruction and matched to identities across three operations.',
    flow: ['Degraded Face In', 'GAN Restore', 'Recognition', 'NADRA Match'],
    tags: ['MULTI-SUBJECT', 'NADRA-MATCHED'],
  },
  {
    id: 'f2', no: '02', img: '/face-radulfitna.png', kind: 'BOARD', code: 'RAD-UL-FITNA',
    title: 'Rad-ul-Fitna Impact Board', region: 'FR / FE · Operational Output',
    tag: 'IMPACT — RECONSTRUCTION LEDGER',
    summary: 'Before / after reconstructions across the operation — 25 face reconstructions with image scaling, identity attribution, FaceTrace and MSISDN artifacts.',
    flow: ['Reconstruct', 'Image Scaling', 'Identity Attribution', 'FaceTrace'],
    tags: ['25 FR', '8 FACETRACE'],
  },
]

/* ---- SOLVED CASES ---- */
const cases = [
  {
    code: 'IBO-PANJGUR', title: 'IBO Panjgur', date: '27 Dec 2025', subjects: 4,
    verdict: 'Subjects reconstructed & identified',
    tags: ['GAN Reconstruction', 'NADRA Match'],
  },
  {
    code: 'NAUKANDI', title: 'Naukandi Case', date: '02 Dec 2025', subjects: 6,
    verdict: 'Identities surfaced for review',
    tags: ['Face Enhancement', 'FaceTrace'],
  },
  {
    code: 'IMAMBARGAH', title: 'Imambargah Incident', date: '06 Feb 2026', subjects: 1,
    verdict: 'Identity confirmed · ID matched',
    tags: ['GAN Restore', 'NADRA Match', 'ID Confirmed'],
  },
]

const REEL_MS = 6000

const FaceGlyph = () => (
  <svg className="cs-fallback" viewBox="0 0 320 200" aria-hidden="true">
    <rect width="320" height="200" fill="#0e1913" />
    <ellipse cx="160" cy="150" rx="70" ry="40" fill="#22402c" />
    <ellipse cx="160" cy="92" rx="46" ry="54" fill="#2c5238" />
    <circle cx="142" cy="94" r="5" fill="#0e1512" />
    <circle cx="178" cy="94" r="5" fill="#0e1512" />
    <path d="M146 124 q14 9 28 0" stroke="#0e1512" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
)

const Stage = ({ item }) => {
  const [failed, setFailed] = useState(false)
  return (
    <div className="cs-stage__frame">
      {!failed && <div className="cs-stage__bg" style={{ backgroundImage: `url(${item.img})` }} />}
      <div className="cs-stage__media">
        {failed
          ? <FaceGlyph />
          : <img src={item.img} alt={item.title} className="cs-stage__img" onError={() => setFailed(true)} />}
      </div>

      <span className="cs-stage__kind">{item.kind}</span>
      <span className="cs-stage__scan" />
      <span className="cs-stage__stamp"><span className="cs-stage__stamp-tick">✓</span> SOLVED</span>

      <span className="cs-stage__corner cs-stage__corner--tl" />
      <span className="cs-stage__corner cs-stage__corner--tr" />
      <span className="cs-stage__corner cs-stage__corner--bl" />
      <span className="cs-stage__corner cs-stage__corner--br" />
    </div>
  )
}

const CasesSolved = () => {
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
    <section className="cases" id="cases-solved" ref={rootRef}>
      <div className="cases__grid-bg" />
      <div className="cases__scan" />
      <div className="cases__vignette" />

      <div className="cases__inner">
        {/* ===== HEADER ===== */}
        <header className={`cases__head ${visible ? 'cases__head--show' : ''}`}>
          <div className="cases__head-row">
            <span className="cases__eyebrow">
              <span className="cases__eyebrow-dot" />
              OPERATION · RAD-UL-FITNA
            </span>
            <span className="cases__sys">AGEX IRIS · FR / FE RECONSTRUCTION</span>
          </div>
          <h2 className="cases__title">Cases Solved</h2>
          <p className="cases__lead">
            Operational outcomes from the AGEX IRIS facial reconstruction &amp; enhancement pipeline —
            degraded scene media restored, matched, and attributed to confirmed identities.
          </p>
        </header>

        {/* ===== IMPACT LEDGER ===== */}
        <div className={`cases__ledger ${visible ? 'cases__ledger--show' : ''}`}>
          {impact.map((m, i) => (
            <div className="cases__metric" key={m.code} style={{ '--m-i': i }}>
              <div className="cases__metric-top">
                <span className="cases__metric-code">{m.code}</span>
                <span className="cases__metric-live" />
              </div>
              <span className="cases__metric-val">
                <CountUp target={m.val} start={visible} />{m.mult ? <em>×</em> : null}
              </span>
              <span className="cases__metric-label">{m.label}</span>
              <span className="cases__metric-sub">{m.sub}</span>
            </div>
          ))}
          <div className="cases__ledger-seal">RAD-UL-FITNA</div>
        </div>

        {/* ===== REEL ===== */}
        <div
          className={`cases__reel ${visible ? 'cases__reel--show' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="cases__stage">
            <div className="cases__stage-bar">
              <span className="cases__stage-count">FRAME {item.no} / {String(slides.length).padStart(2, '0')}</span>
              <span className="cases__stage-code">{item.code}</span>
              <span className={`cases__stage-state ${paused ? 'is-paused' : ''}`}>
                {paused ? '❚❚ PAUSED' : '▶ PLAYING'}
              </span>
            </div>

            <Stage key={playKey} item={item} />

            <div className="cases__progress">
              {slides.map((s, i) => (
                <span key={s.id} className="cases__progress-track">
                  <span
                    className={`cases__progress-fill ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
                    style={{ animationDuration: `${REEL_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="cases__caption" key={`cap-${playKey}`}>
            <span className="cases__caption-tag">{item.tag}</span>
            <h3 className="cases__caption-title">
              {item.title}
              <span className="cases__caption-region">{item.region}</span>
            </h3>
            <p className="cases__caption-sub">{item.summary}</p>

            <div className="cases__flow">
              {item.flow.map((p, i) => (
                <span key={p} className="cases__flow-step" style={{ '--f-i': i }}>
                  {i > 0 && <span className="cases__flow-arrow">›</span>}
                  <span className="cases__flow-chip">{p}</span>
                </span>
              ))}
            </div>

            <div className="cases__tags">
              {item.tags.map((t) => (
                <span key={t} className="cases__tag">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== THUMBNAIL SCRUBBER ===== */}
        <div className={`cases__thumbs ${visible ? 'cases__thumbs--show' : ''}`}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`cases__thumb ${i === active ? 'cases__thumb--active' : ''}`}
              onClick={() => go(i)}
              type="button"
              style={{ backgroundImage: `url(${s.img})` }}
            >
              <span className="cases__thumb-shade" />
              <span className="cases__thumb-no">{s.no}</span>
              <span className="cases__thumb-title">{s.title}</span>
            </button>
          ))}
        </div>

        {/* ===== SOLVED CASE LOG ===== */}
        <div className={`cases__log ${visible ? 'cases__log--show' : ''}`}>
          <div className="cases__log-head">
            <span className="cases__eyebrow">
              <span className="cases__eyebrow-dot" />
              SOLVED CASE LOG
            </span>
            <span className="cases__sys">DATE · SUBJECTS · VERDICT</span>
          </div>
          <div className="cases__log-grid">
            {cases.map((c, i) => (
              <div className="cases__case" key={c.code} style={{ '--c-i': i }}>
                <div className="cases__case-top">
                  <span className="cases__case-code">{c.code}</span>
                  <span className="cases__case-date">{c.date}</span>
                </div>
                <h4 className="cases__case-title">{c.title}</h4>
                <div className="cases__case-foot">
                  <div className="cases__verdict">
                    <span className="cases__verdict-dot" />
                    {c.verdict}
                  </div>
                  <div className="cases__subjects">
                    <span className="cases__subjects-val">{c.subjects}</span>
                    <span className="cases__subjects-lbl">{c.subjects > 1 ? 'subjects' : 'subject'}</span>
                  </div>
                </div>
                <div className="cases__tags cases__tags--sm">
                  {c.tags.map((t) => (<span key={t} className="cases__tag">{t}</span>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CasesSolved
