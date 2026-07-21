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
    tech: 'FR / FE Pipeline',
    summary: 'Degraded operation imagery restored through AI face reconstruction for identity attribution.',
    outputs: ['Faces reconstructed from source frames', 'Identity candidates generated', 'NADRA-match support delivered'],
    geoint: {
      region: 'Panjgur District · Balochistan',
      summary: 'Field imagery tied to the IBO engagement zone — scene frames georeferenced against terrain and route context.',
      details: [
        'Terrain: desert scrub belt with dry riverbed crossing',
        'GEOINT fix on engagement coordinates from field capture',
        'Route context mapped against known transit corridors',
      ],
      tags: ['PANJGUR BELT', 'FIELD CAPTURE'],
    },
    cyberint: {
      summary: 'Source media recovered from operation feeds; faces isolated and queued through the FR/FE reconstruction stack.',
      details: [
        'AGEX IRIS: degraded frames fed into GAN restore pipeline',
        'CyberINT: feed intake and frame extraction from operation media',
        'NADRA-match candidates generated for analyst review',
      ],
      flow: ['Feed Intake', 'Frame Extract', 'GAN Restore', 'NADRA Match'],
      tags: ['FR / FE', 'IDENTITY LEADS'],
    },
  },
  {
    id: 'naukandi-a',
    no: '02',
    code: 'NAUKANDI',
    name: 'Naukandi Case – 2ⁿᵈ Dec 2025',
    img: '/agex-02-naukandi.png',
    date: '02/12/2025',
    tech: 'Face Reconstruction',
    summary: 'Low-quality captures enhanced and reconstructed into recognition-ready face views.',
    outputs: ['Source captures enhanced', 'Recognition-ready face set', 'Identity leads forwarded'],
    geoint: {
      region: 'Naukandi · Chagai District',
      summary: 'Incident location anchored in the Naukandi sector — imagery cross-checked against regional terrain signatures.',
      details: [
        'Terrain: arid border sector with sparse elevation change',
        'GEOINT anchor on Naukandi coordinate cluster',
        'Regional terrain signatures cross-checked against incident site',
      ],
      tags: ['CHAGAI', 'BORDER SECTOR'],
    },
    cyberint: {
      summary: 'Degraded facial captures enhanced via in-house GAN model; recognition engine surfaced identity candidates.',
      details: [
        'AGEX IRIS: single-subject face reconstruction from low-quality capture',
        'CyberINT: AI enhancement and recognition-ready face set built',
        'Identity leads forwarded to analyst review queue',
      ],
      flow: ['Degraded Input', 'AI Enhance', 'Face Rebuild', 'Candidate ID'],
      tags: ['GAN RESTORE', 'MATCH SET'],
    },
  },
  {
    id: 'imambargah',
    no: '03',
    code: 'IMAMBARGAH',
    name: 'Imambargah Incident – 6 February 2026',
    img: '/agex-03-imambargah.png',
    date: '06/02/2026',
    tech: 'FR / FE Pipeline',
    summary: 'Incident footage processed — suspect faces isolated, enhanced, and matched.',
    outputs: ['Suspect frames isolated', 'AI enhancement applied', 'Match set compiled for review'],
    geoint: {
      region: 'Islamabad · G-10 Sector',
      summary: 'Scene context mapped to the Imambargah incident footprint for coordinate-locked analyst review.',
      details: [
        'Terrain: urban node with fixed scene geometry and access routes',
        'GEOINT scene fix on Imambargah incident footprint',
        'CCTV vantage points mapped to building layout context',
      ],
      tags: ['URBAN NODE', 'SCENE FIX'],
    },
    cyberint: {
      summary: 'CCTV and field media traced through OSINT channels; suspect faces extracted and run against identity databases.',
      details: [
        'AGEX IRIS: suspect frames isolated and AI-enhanced',
        'CyberINT: OSINT trace on CCTV and field media sources',
        'Match set compiled for multi-suspect identity review',
      ],
      flow: ['CCTV Extract', 'Face Isolate', 'Enhancement', 'Identity Review'],
      tags: ['OSINT TRACE', 'SUSPECT SET'],
    },
  },
  {
    id: 'naukandi-b',
    no: '04',
    code: 'NAUKANDI',
    name: 'Naukandi Case – 2ⁿᵈ Dec 2025',
    img: '/agex-04-naukandi.png',
    date: '02/12/2025',
    tech: 'End-to-End Reconstruction',
    summary: 'Full pipeline strip — four source-to-identity face pairs delivered in a single analyst-ready trace.',
    outputs: ['4× source → match pairs', 'Before / after reconstruction trace', 'Final identity set delivered'],
    geoint: {
      region: 'Naukandi · Chagai District',
      summary: 'Multi-subject engagement imagery from the Naukandi operation — all field frames tied to the same coordinate cluster.',
      details: [
        'Terrain: same Naukandi sector — 4 subjects from one coordinate cluster',
        'GEOINT: all field frames locked to shared incident coordinates',
        'Terrain cross-check confirms single engagement zone context',
      ],
      tags: ['4 SUBJECTS', 'SAME SECTOR'],
    },
    cyberint: {
      summary: 'End-to-end FR/FE pipeline output — degraded field captures reconstructed and matched to NADRA-ready identity portraits.',
      details: [
        'AGEX IRIS: 4× source-to-match face pairs in analyst strip',
        'CyberINT: full pipeline — field capture → GAN rebuild → ID portrait',
        'All four subjects matched through NADRA-ready identity set',
      ],
      flow: ['Field Capture', 'GAN Rebuild', 'Face Match', 'ID Portrait'],
      tags: ['FULL STRIP', '4× MATCHED'],
    },
  },
]

const REEL_MS = 5200

const Stage = ({ item }) => {
  const [failed, setFailed] = useState(false)
  const isStrip = item.id === 'naukandi-b'
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
    <section className="cases" id="dividents" ref={rootRef}>
      <div className="cases__grid-bg" />
      <div className="cases__scan" />
      <div className="cases__vignette" />

      <div className="cases__inner">
        <header className={`cases__head ${visible ? 'cases__head--show' : ''}`}>
          <h2 className="cases__title">Dividents</h2>
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
            <ul className="iris-reel__outputs">
              {item.outputs.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`iris-thumbs ${visible ? 'iris-thumbs--show' : ''}`}>
          {irisCases.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`iris-thumb ${i === active ? 'iris-thumb--active' : ''}`}
              onClick={() => go(i)}
              style={{ backgroundImage: `url(${c.img})` }}
            >
              <span className="iris-thumb__shade" />
              <span className="iris-thumb__no">{c.no}</span>
              <span className="iris-thumb__name">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CasesSolved
