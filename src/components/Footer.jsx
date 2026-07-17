import './Footer.css'

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const Footer = () => (
  <footer className="footer">
    <div className="footer__grid-bg" />
    <div className="footer__content">
      <div className="footer__top">
        <div className="footer__brand">
          <img src="/logo.png.png" alt="PSS" className="footer__logo" />
          <div className="footer__brand-text">
            <span className="footer__brand-name">Pakistan Surveillance Shield</span>
            <span className="footer__brand-tag">UNIT-47 DIVISION</span>
          </div>
        </div>

        <nav className="footer__links">
          <button className="footer__link" onClick={() => scrollTo('home')}>Home</button>
          <button className="footer__link" onClick={() => scrollTo('capabilities')}>Capabilities</button>
          <button className="footer__link" onClick={() => scrollTo('workflow')}>Workflow</button>
          <button className="footer__link" onClick={() => scrollTo('about')}>About Us</button>
        </nav>
      </div>

      <div className="footer__divider" />

      <div className="footer__bottom">
        <span className="footer__copy">&copy; {new Date().getFullYear()} Pakistan Surveillance Shield. All rights reserved.</span>
        <span className="footer__status">
          <svg className="footer__status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          SYSTEM SECURE
        </span>
      </div>
    </div>
  </footer>
)

export default Footer
