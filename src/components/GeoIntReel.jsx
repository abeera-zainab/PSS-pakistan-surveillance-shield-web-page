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

/* ---- REEL SLIDES ---- */
const slides = [
  {
    id: 's1', no: '01', img: '/geoint-1.png', kind: 'MAP', code: 'GEO-GRID',
    title: 'Geolocated Training Videos', region: 'KPK · Balochistan · AF',
    tag: 'OVERVIEW',
    summary: 'Six training videos pinned to exact coordinates.',
    outputs: ['6 sites locked', 'Terrain matched'],
    tags: ['6 SITES', 'COORD-LOCKED'],
  },
  {
    id: 's2', no: '02', img: '/geoint-2.png', kind: 'VID', code: 'FEATURE-MATCH',
    title: 'Distinctive Terrain Feature', region: 'Ras Koh / Dranjan',
    tag: 'ENHANCE',
    summary: 'Pyramid peak matched to satellite terrain.',
    outputs: ['Feature isolated', 'Sat confirmed'],
    tags: ['PYRAMID PEAK', 'ARID'],
  },
  {
    id: 's3', no: '03', img: '/geoint-3.png', kind: 'MAP', code: 'DRANJAN',
    title: 'Source → Enhanced → Map', region: 'Dranjan / Bolan',
    tag: 'PIPELINE',
    summary: 'Canyon frame enhanced and pinned on map.',
    outputs: ['AI enhanced', 'Map pin set'],
    tags: ['CANYON', '29°34′ N'],
  },
  {
    id: 's4', no: '04', img: '/geoint-4.png', kind: 'MAP', code: 'BAGH-CORRIDOR',
    title: 'Satellite Correlation', region: 'Bagh · Aghal · Tarangi',
    tag: 'CORRELATE',
    summary: 'Two sat views narrow to one corridor.',
    outputs: ['Riverbed match', 'AOI narrowed'],
    tags: ['33.816, 70.838'],
  },
  {
    id: 's5', no: '05', img: '/geoint-5.png', kind: 'VID', code: 'RUIN-SEQ',
    title: 'Visual Evidence Sequence', region: 'Desert mountains',
    tag: 'EVIDENCE',
    summary: 'Feed frames compared to satellite cues.',
    outputs: ['Ruin matched', 'Desert fix'],
    tags: ['MUD-BRICK', 'DESERT'],
  },
]

const REEL_MS = 2800

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
          <h2 className="geo__title">Terrain Feature Analysis</h2>
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
            <h3 className="geo__caption-title">{item.title}</h3>
            <span className="geo__caption-region">{item.region}</span>
            <p className="geo__caption-sub">{item.summary}</p>
            <ul className="geo__caption-outputs">
              {item.outputs.slice(0, 2).map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <div className="geo__tags">
              {item.tags.slice(0, 2).map((t) => (
                <span key={t} className="geo__tag">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={`geo__thumbs ${visible ? 'geo__thumbs--show' : ''}`}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`geo__thumb ${i === active ? 'geo__thumb--active' : ''}`}
              onClick={() => go(i)}
              type="button"
            >
              <span className="geo__thumb-media" style={{ backgroundImage: `url(${s.img})` }} />
              <span className="geo__thumb-body">
                <span className="geo__thumb-no">{s.no}</span>
                <span className="geo__thumb-code">{s.code}</span>
                <span className="geo__thumb-title">{s.title}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GeoIntReel
