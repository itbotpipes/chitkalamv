import Image from "next/image";
import HeroFace from './HeroFace';
import HeroFaceBL from './HeroFaceBL';
import HeroFaceTR from './HeroFaceTR';
import HeroFaceBR from './HeroFaceBR';
import HandFlowers from './HandFlowers';
import ScrollTextReveal from './ScrollTextReveal';
import FullscreenVideo from './FullscreenVideo';
import PostcardForm from './PostcardForm';

import MobilePostcardForm from './MobilePostcardForm';

import HeroScrollbarObserver from './HeroScrollbarObserver';

export default function Home() {
  return (
    <main>
        <div className="hero-scroll-wrapper" style={{ position: 'relative', width: '100%', height: '300vh' }}>
          <section className="hero-section">
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <HeroScrollbarObserver />
            <nav className="navbar">
              <div className="logo-container">
                <img
                  src="/studiochitkala-logo.png"
                  alt="Chitkala Logo"
                  className="logo-image"
                />
              </div>
              <ul className="nav-links">
                <li><a href="#what-is">What is Studio Chitkala?</a></li>
                <li><a href="#about-us">About Us</a></li>
                <li><a href="#contact-us">Contact Us</a></li>
              </ul>
            </nav>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
              <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
                <HeroFace />
                <HeroFaceBL />
                <HeroFaceTR />
                <HeroFaceBR />
              </div>
            </div>
            <HandFlowers />
            <div className="hero-bottom-text-container">
              <div className="hero-bottom-text-scroller">
                <span>Branding, Design &amp; Motion</span>
                <span>Branding, Design &amp; Motion</span>
              </div>
            </div>
            </div>
          </section>
        </div>

      <div id="about-us">
        <ScrollTextReveal />
      </div>

      <div id="what-is">
        <FullscreenVideo />
      </div>

      <div id="contact-us" style={{ position: 'relative', width: '100%' }}>
        <div className="desktop-only">
          <PostcardForm />
        </div>
        <div className="mobile-only">
          <MobilePostcardForm />
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-divider"></div>
        <div className="footer-logo">
          <Image
            src="/chitkala-logo.svg"
            alt="Studio Chitkala"
            width={800}
            height={256}
            className="footer-logo-img"
          />
        </div>
        <p className="copyright-text">© 2026 Studio Chitkala All rights reserved</p>
      </footer>
    </main>
  );
}
