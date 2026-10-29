import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Studio Chitkala",
  description: "Terms of Service governing the use of Studio Chitkala services and website.",
};

export default function TermsOfService() {
  return (
    <div className="policy-page">
      <header className="policy-header">
        <Link href="/" className="policy-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Studio Chitkala
        </Link>
        <Link href="/" className="policy-logo-link">
          <img src="/studiochitkala-logo.png" alt="Studio Chitkala" className="policy-logo-img" />
        </Link>
      </header>

      <main className="policy-content">
        <div className="policy-container">
          <span className="policy-tag">Studio Chitkala</span>
          <h1 className="policy-title">Terms of Service</h1>
          <p className="policy-updated">Last updated: October 2026</p>

          <div className="policy-divider"></div>

          <section className="policy-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the website of Studio Chitkala (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), or by submitting inquiries for creative services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our services or site.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Creative Services &amp; Engagements</h2>
            <p>
              Studio Chitkala specializes in creative branding, brand identities, packaging, print design, web design, digital graphics, and motion design.
            </p>
            <p>
              Submitting an inquiry through our interactive postcard form does not constitute a binding contract. A formal creative engagement begins only upon mutual agreement of a project scope, timeline, quotation, and signed agreement.
            </p>
          </section>

          <section className="policy-section">
            <h2>3. Intellectual Property Rights</h2>
            <p>
              All visual designs, motion artworks, typography pairings, animations, interactive elements, and logos featured on this website are the intellectual property of Studio Chitkala unless otherwise attributed to client portfolio rights.
            </p>
            <p>
              You may not reproduce, redistribute, screenshot for commercial reuse, or replicate any portion of this website or our artistic assets without prior written consent from Studio Chitkala.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. Client Submissions &amp; Accuracy</h2>
            <p>
              When submitting contact details or project briefs, you agree to provide truthful and accurate information (name, organization, contact telephone, and email). You represent that any preliminary assets or trademarks you share do not infringe upon any third-party copyrights.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Limitation of Liability</h2>
            <p>
              While we strive to provide seamless interactive animations and experiences, Studio Chitkala provides this site &quot;as is&quot; without warranties of uninterrupted availability. We are not liable for incidental or consequential damages resulting from website downtime or technical failures beyond our control.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of India, under the jurisdiction of the courts located in Surat, Gujarat.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Inquiries &amp; Contact</h2>
            <p>
              For legal inquiries, brand licensing, or design service questions, please contact:
            </p>
            <p className="policy-contact-box">
              <strong>Studio Chitkala</strong><br />
              Email: <a href="mailto:contact@studiochitkala.com">contact@studiochitkala.com</a><br />
              Surat, Gujarat, India
            </p>
          </section>
        </div>
      </main>

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
        <div className="footer-bottom">
          <div className="footer-legal-links">
            <Link href="/privacy-policy" className="footer-legal-link">Privacy Policy</Link>
            <span className="footer-legal-divider">•</span>
            <Link href="/terms-of-service" className="footer-legal-link">Terms of Service</Link>
          </div>
          <p className="copyright-text">© 2026 Studio Chitkala All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
