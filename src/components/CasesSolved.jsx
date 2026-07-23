import { useEffect, useRef, useState } from 'react'
import './CasesSolved.css'

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

const impact = [
  { code: 'FR-01', val: 25, mult: true, label: 'Face Reconstructions', sub: 'FR pipeline output' },
  { code: 'IS-02', val: 4, mult: true, label: 'Image Scaling', sub: 'AI super-resolution' },
  { code: 'IA-03', val: 5, mult: true, label: 'Identity Attribution', sub: 'NADRA-matched IDs' },
  { code: 'FT-04', val: 8, mult: true, label: 'FaceTrace', sub: 'Cross-source tracing' },
  { code: 'MS-05', val: 3, mult: true, label: 'MSISDN Artifacts', sub: 'PK / US / Iran' },
]

const irisCases = [
  {
    id: 'panjgur',
    no: '01',
    code: 'IBO-PANJGUR',
    name: 'IBO Panjgur – 27ᵗʰ Dec 2025',
    img: '/agex-01-panjgur.png',
    date: '27/12/2025',
    tech: 'FR / FE',
    summary: 'Blurred field faces restored for identity match.',
    outputs: ['Faces reconstructed', 'NADRA match ready'],
    geoint: { region: 'Panjgur · Balochistan', tags: ['FIELD CAPTURE'] },
    cyberint: { tags: ['FR / FE'] },
  },
  {
    id: 'naukandi-a',
    no: '02',
    code: 'NAUKANDI',
    name: 'Naukandi Case – 2ⁿᵈ Dec 2025',
    img: '/agex-02-naukandi.png',
    date: '02/12/2025',
    tech: 'Face Rebuild',
    summary: 'Low-quality capture rebuilt into a clear face.',
    outputs: ['Image enhanced', 'Identity lead found'],
    geoint: { region: 'Naukandi · Chagai', tags: ['BORDER'] },
    cyberint: { tags: ['GAN'] },
  },
  {
    id: 'imambargah',
    no: '03',
    code: 'IMAMBARGAH',
    name: 'Imambargah Incident – 6 Feb 2026',
    img: '/agex-03-imambargah.png',
    date: '06/02/2026',
    tech: 'FR / FE',
    summary: 'Suspect faces pulled from CCTV and matched.',
    outputs: ['Suspects isolated', 'Match set ready'],
    geoint: { region: 'Islamabad · G-10', tags: ['CCTV'] },
    cyberint: { tags: ['OSINT'] },
  },
  {
    id: 'naukandi-b',
    no: '04',
    code: 'NAUKANDI',
    name: 'Naukandi Case – 2ⁿᵈ Dec 2025',
    img: '/agex-04-naukandi.png',
    date: '02/12/2025',
    tech: 'Full Strip',
    summary: 'Four source-to-identity face pairs in one strip.',
    outputs: ['4× face pairs', 'Full ID set'],
    geoint: { region: 'Naukandi · Chagai', tags: ['4 SUBJECTS'] },
    cyberint: { tags: ['MATCHED'] },
  },
  {
    id: 'radulfitna',
    no: '05',
    code: 'RAD-UL-FITNA',
    name: 'Rad-ul-Fitna – Face Reconstruction',
    img: '/face-radulfitna.png',
    date: '2025',
    tech: 'Before / After',
    summary: 'Before-and-after faces from degraded field shots.',
    outputs: ['10× face pairs', 'ID set delivered'],
  },
]

const REEL_MS = 2800

const Stage = ({ item }) => {
  const [failed, setFailed] = useState(false)
  const isStrip = item.id === 'naukandi-b' || item.id === 'radulfitna'
  return (
    <div className={`iris-stage__frame ${isStrip ? 'iris-stage__frame--strip' : ''}`}>
      {!failed && <div className={`iris-stage__bg ${isStrip ? 'iris-stage__bg--strip' : ''}`} style={{ backgroundImage: `url(${item.img})` }} />}
      <div className={`iris-stage__media ${isStrip ? 'iris-stage__media--strip' : ''}`}>
        {failed
          ? <div className="iris-stage__fallback" />
          : (
            <img
              src={item.img}
              alt={item.name}
              className={`iris-stage__img ${isStrip ? 'iris-stage__img--strip' : ''}`}
              onError={() => setFailed(true)}
            />
          )}
      </div>
      <span className="iris-stage__scan" />
      {!isStrip && (
        <span className="iris-stage__stamp"><span className="iris-stage__stamp-tick">✓</span> SOLVED</span>
      )}
      <span className="iris-stage__corner iris-stage__corner--tl" />
      <span className="iris-stage__corner iris-stage__corner--tr" />
      <span className="iris-stage__corner iris-stage__corner--bl" />
      <span className="iris-stage__corner iris-stage__corner--br" />
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
      setActive((a) => (a + 1) % irisCases.length)
      setPlayKey((k) => k + 1)
    }, REEL_MS)
    return () => clearTimeout(iv)
  }, [visible, paused, active])

  const go = (i) => { setActive(i); setPlayKey((k) => k + 1) }
  const item = irisCases[active]

  return (
    <section className="cases" id="dividends" ref={rootRef}>
      <div className="cases__grid-bg" />
      <div className="cases__scan" />
      <div className="cases__vignette" />

      <div className="cases__inner">
        <header className={`cases__head ${visible ? 'cases__head--show' : ''}`}>
          <h2 className="cases__title">Dividends</h2>
        </header>

        <h3 className={`cases__subhead ${visible ? 'cases__subhead--show' : ''}`}>AGEX IRIS</h3>

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
        </div>

        <div
          className={`iris-reel ${visible ? 'iris-reel--show' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="iris-reel__stage">
            <div className="iris-reel__bar">
              <span className="iris-reel__count">CASE {item.no} / {String(irisCases.length).padStart(2, '0')}</span>
              <span className="iris-reel__code">{item.code}</span>
              <span className={`iris-reel__state ${paused ? 'is-paused' : ''}`}>
                {paused ? '❚❚ PAUSED' : '▶ PLAYING'}
              </span>
            </div>

            <Stage key={playKey} item={item} />

            <div className="iris-reel__progress">
              {irisCases.map((c, i) => (
                <span key={c.id} className="iris-reel__progress-track">
                  <span
                    className={`iris-reel__progress-fill ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
                    style={{
                      animationDuration: `${REEL_MS}ms`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="iris-reel__caption" key={`cap-${playKey}`}>
            <h4 className="iris-reel__case-name">{item.name}</h4>
            <div className="iris-reel__meta">
              <span className="iris-reel__meta-date">{item.date}</span>
              <span className="iris-reel__meta-tech">{item.tech}</span>
            </div>
            <p className="iris-reel__summary">{item.summary}</p>
            {item.geoint?.region && (
              <span className="iris-reel__region">{item.geoint.region}</span>
            )}
            <ul className="iris-reel__outputs">
              {item.outputs.slice(0, 2).map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            {(item.geoint?.tags || item.cyberint?.tags) && (
              <div className="iris-reel__tags">
                {(item.geoint?.tags || []).slice(0, 1).map((t) => (
                  <span key={t} className="iris-reel__tag">{t}</span>
                ))}
                {(item.cyberint?.tags || []).slice(0, 1).map((t) => (
                  <span key={`c-${t}`} className="iris-reel__tag iris-reel__tag--cyber">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`iris-thumbs ${visible ? 'iris-thumbs--show' : ''}`}>
          {irisCases.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`iris-thumb ${i === active ? 'iris-thumb--active' : ''}`}
              onClick={() => go(i)}
            >
              <span className="iris-thumb__media" style={{ backgroundImage: `url(${c.img})` }} />
              <span className="iris-thumb__body">
                <span className="iris-thumb__no">{c.no}</span>
                <span className="iris-thumb__code">{c.code}</span>
                <span className="iris-thumb__name">{c.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CasesSolved
