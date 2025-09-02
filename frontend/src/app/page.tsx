import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Demo } from '@/components/landing/demo-simple'
import { Pricing } from '@/components/landing/pricing'
import { CTA } from '@/components/landing/cta'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Demo />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
