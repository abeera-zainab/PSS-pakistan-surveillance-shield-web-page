import Header from './components/Header'
import Hero from './components/Hero'
import Workflow from './components/Workflow'
import AboutUs from './components/AboutUs'
import CasesSolved from './components/CasesSolved'
import GeoIntReel from './components/GeoIntReel'
import OsintReel from './components/OsintReel'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <Workflow />
      <AboutUs />
      <CasesSolved />
      <GeoIntReel />
      <OsintReel />
      <Footer />
    </div>
  )
}

export default App
