import { useEffect, useRef, useState } from 'react'
import './GeoIntReel.css'

/* ============================================================
   GEOINT · TERRAIN FEATURE ANALYSIS
   Cinematic auto-playing reel using operational screenshots.
   Screenshot backgrounds are normalized with a blurred "fill"
   layer so mismatched captures blend into the dark stage.
   Drop the images into /public as geoint-1.png ... geoint-5.png
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

/* ---- TERRAIN IMPACT LEDGER ---- */
const impact = [
  { code: 'GEO-01', val: 24, mult: true, label: 'Videos Geo-Located', sub: 'Footage-based GEOINT' },
  { code: 'GEO-02', val: 6, mult: true, label: 'Training Sites', sub: 'Coordinate-locked' },
  { code: 'GEO-03', val: 4, mult: true, label: 'Analysis Stages', sub: 'Source → Enhance → Map' },
  { code: 'GEO-04', val: 3, mult: true, label: 'Regions Covered', sub: 'KPK · Balochistan · AF' },
  { code: 'GEO-05', val: 5, mult: true, label: 'Feature Matches', sub: 'Satellite cross-ref' },
]

/* ---- REEL SLIDES (the provided screenshots) ---- */
const slides = [
  {
    id: 's1', no: '01', img: '/geoint-1.png', kind: 'MAP', code: 'GEO-GRID',
    title: 'Geolocated Training Videos', region: 'KPK · Balochistan · Afghanistan',
    tag: 'OVERVIEW - GEOLOCATED FEEDS',
    summary: 'Six hostile training videos geolocated to precise coordinates through terrain-feature matching.',
    flow: ['Feed Intake', 'Frame Extraction', 'Terrain Match', 'Coordinate Fix'],
    tags: ['6 SITES', 'COORDINATE-LOCKED'],
  },
  {
    id: 's2', no: '02', img: '/geoint-2.png', kind: 'VID', code: 'FEATURE-MATCH',
    title: 'Distinctive Terrain Feature', region: 'Ras Koh / Dranjan belt',
    tag: 'ENHANCEMENT - FEATURE ISOLATION',
    summary: 'Enhanced terrain frames matched to a distinctive pyramid-shaped peak, confirmed against satellite terrain view.',
    flow: ['Enhanced Frame', 'Feature Isolation', 'Satellite Compare'],
    tags: ['PYRAMID PEAK', 'ARID · RUGGED'],
  },
  {
    id: 's3', no: '03', img: '/geoint-3.png', kind: 'MAP', code: 'DRANJAN',
    title: 'Source → Enhanced → Map', region: 'Dranjan / Bolan area',
    tag: 'PIPELINE - CANYON GEOLOCATION',
    summary: 'Source frame enhanced to isolate the canyon floor and rocky slopes; map pin aligned with Dranjan/Bolan formations.',
    flow: ['Source Frame', 'AI-Enhanced', 'Terrain Compare', 'Map Fix'],
    tags: ['CANYON', '29°34′ N · 67°22′ E'],
  },
  {
    id: 's4', no: '04', img: '/geoint-4.png', kind: 'MAP', code: 'BAGH-CORRIDOR',
    title: 'Frame Match & Satellite Correlation', region: 'Bagh · Aghal · Tarangi',
    tag: 'CORRELATION - NARROWED AOI',
    summary: 'Riverbed and cliff frames matched across two satellite views; both coordinate estimates fall within one terrain corridor.',
    flow: ['Evidence Frame', 'Riverbed Match', 'Satellite ×2', 'Narrow AOI'],
    tags: ['33.816, 70.838', 'SINGLE CORRIDOR'],
  },
  {
    id: 's5', no: '05', img: '/geoint-5.png', kind: 'VID', code: 'RUIN-SEQ',
    title: 'Visual Evidence Sequence', region: 'Desert mountains & settlements',
    tag: 'EVIDENCE - FEED vs SATELLITE',
    summary: 'Enhanced feed frames of mud-brick ruins and open desert compared against satellite terrain cues.',
    flow: ['Enhanced Feed', 'Ruin Structure', 'Satellite Cues'],
    tags: ['MUD-BRICK RUIN', 'DESERT TERRAIN'],
  },
]

const REEL_MS = 5600

const TerrainGlyph = () => (
  <svg className="geo-fallback" viewBox="0 0 320 200" aria-hidden="true">
    <rect width="320" height="200" fill="#0e1913" />
    <polygon points="-10,150 70,60 150,150" fill="#22402c" />
    <polygon points="90,155 200,40 320,155" fill="#2c5238" />
    <polygon points="210,160 270,90 340,160" fill="#22402c" />
    <rect y="148" width="320" height="60" fill="#16281c" />
    <path d="M0 175 C80 150 150 200 320 165" stroke="#3a6b47" strokeWidth="2" fill="none" opacity="0.6" />
  </svg>
)

const Stage = ({ item }) => {
  const [failed, setFailed] = useState(false)
  return (
    <div className="geo-stage__frame">
      {!failed && <div className="geo-stage__bg" style={{ backgroundImage: `url(${item.img})` }} />}
      <div className="geo-stage__media">
        {failed
          ? <TerrainGlyph />
          : <img src={item.img} alt={item.title} className="geo-stage__img" onError={() => setFailed(true)} />}
      </div>

      <span className={`geo-stage__kind geo-stage__kind--${item.kind.toLowerCase()}`}>{item.kind}</span>
      <span className="geo-stage__scan" />
      <span className="geo-stage__stamp"><span className="geo-stage__stamp-tick">✓</span> GEOLOCATED</span>

      <span className="geo-stage__corner geo-stage__corner--tl" />
      <span className="geo-stage__corner geo-stage__corner--tr" />
      <span className="geo-stage__corner geo-stage__corner--bl" />
      <span className="geo-stage__corner geo-stage__corner--br" />
    </div>
  )
}

const GeoIntReel = () => {
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
    <section className="geo" id="geoint-terrain" ref={rootRef}>
      <div className="geo__grid-bg" />
      <div className="geo__scan" />
      <div className="geo__vignette" />

      <div className="geo__inner">
        {/* ===== HEADER ===== */}
        <header className={`geo__head ${visible ? 'geo__head--show' : ''}`}>
          <div className="geo__head-row">
            <span className="geo__eyebrow">
              <span className="geo__eyebrow-dot" />
              OPERATION · TERRAIN INTEL
            </span>
            <span className="geo__sys">GEOINT · FEATURE ANALYSIS</span>
          </div>
          <h2 className="geo__title">Terrain Feature Analysis</h2>
          <p className="geo__lead">
            Hostile training footage geolocated by matching enhanced video frames to distinctive
            terrain features and satellite imagery - from source frame to a pinned coordinate.
          </p>
        </header>

        {/* ===== IMPACT LEDGER ===== */}
        <div className={`geo__ledger ${visible ? 'geo__ledger--show' : ''}`}>
          {impact.map((m, i) => (
            <div className="geo__metric" key={m.code} style={{ '--m-i': i }}>
              <div className="geo__metric-top">
                <span className="geo__metric-code">{m.code}</span>
                <span className="geo__metric-live" />
              </div>
              <span className="geo__metric-val">
                <CountUp target={m.val} start={visible} />{m.mult ? <em>×</em> : null}
              </span>
              <span className="geo__metric-label">{m.label}</span>
              <span className="geo__metric-sub">{m.sub}</span>
            </div>
          ))}
          <div className="geo__ledger-seal">TERRAIN</div>
        </div>

        {/* ===== REEL ===== */}
        <div
          className={`geo__reel ${visible ? 'geo__reel--show' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="geo__stage">
            <div className="geo__stage-bar">
              <span className="geo__stage-count">FRAME {item.no} / {String(slides.length).padStart(2, '0')}</span>
              <span className="geo__stage-code">{item.code}</span>
              <span className={`geo__stage-state ${paused ? 'is-paused' : ''}`}>
                {paused ? '❚❚ PAUSED' : '▶ PLAYING'}
              </span>
            </div>

            <Stage key={playKey} item={item} />

            <div className="geo__progress">
              {slides.map((s, i) => (
                <span key={s.id} className="geo__progress-track">
                  <span
                    className={`geo__progress-fill ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
                    style={{ animationDuration: `${REEL_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="geo__caption" key={`cap-${playKey}`}>
            <span className="geo__caption-tag">{item.tag}</span>
            <h3 className="geo__caption-title">
              {item.title}
              <span className="geo__caption-region">{item.region}</span>
            </h3>
            <p className="geo__caption-sub">{item.summary}</p>

            <div className="geo__flow">
              {item.flow.map((p, i) => (
                <span key={p} className="geo__flow-step" style={{ '--f-i': i }}>
                  {i > 0 && <span className="geo__flow-arrow">›</span>}
                  <span className="geo__flow-chip">{p}</span>
                </span>
              ))}
            </div>

            <div className="geo__tags">
              {item.tags.map((t) => (
                <span key={t} className="geo__tag">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== THUMBNAIL SCRUBBER ===== */}
        <div className={`geo__thumbs ${visible ? 'geo__thumbs--show' : ''}`}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`geo__thumb ${i === active ? 'geo__thumb--active' : ''}`}
              onClick={() => go(i)}
              type="button"
              style={{ backgroundImage: `url(${s.img})` }}
            >
              <span className="geo__thumb-shade" />
              <span className="geo__thumb-no">{s.no}</span>
              <span className="geo__thumb-title">{s.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GeoIntReel
