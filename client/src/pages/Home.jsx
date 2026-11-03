import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { profile } from '../content/profile.js'
import '../styles/formal.css'
import TopBar from '../components/layout/TopBar.jsx'
import Footer from '../components/layout/Footer.jsx'
import MobileCta from '../components/layout/MobileCta.jsx'
import Hero from '../components/formal/Hero.jsx'

export default function Home() {
  useDocumentMeta({
    title: `${profile.name} · Software Developer`,
    description: profile.summary,
  })
  return (
    <div className="formal">
      <TopBar />
      <main id="main">
        <Hero />
      </main>
      <Footer />
      <MobileCta />
    </div>
  )
}
