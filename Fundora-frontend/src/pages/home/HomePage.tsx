import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Coverage } from './sections/Coverage'
import { Faq } from './sections/Faq'
import { Features } from './sections/Features'
import { FinalCta } from './sections/FinalCta'
import { Hero } from './sections/Hero'
import { Highlights } from './sections/Highlights'
import { HowItWorks } from './sections/HowItWorks'
import { Prepare } from './sections/Prepare'
import { Results } from './sections/Results'
import { Safety } from './sections/Safety'

export function HomePage() {
  const { hash, key } = useLocation()

  // Section links are router links (so they also work from other pages), which
  // means the browser won't jump to the anchor by itself.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash, key])

  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Highlights />
        <HowItWorks />
        <Results />
        <Features />
        <Coverage />
        <Prepare />
        <Safety />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
