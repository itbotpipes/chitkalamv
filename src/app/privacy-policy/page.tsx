import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Studio Chitkala",
  description: "Privacy Policy for Studio Chitkala - Creative branding, design and motion studio.",
};

export default function PrivacyPolicy() {
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
          <h1 className="policy-title">Privacy Policy</h1>
          <p className="policy-updated">Last updated: October 2026</p>

          <div className="policy-divider"></div>

          <section className="policy-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Studio Chitkala. We respect your privacy and are committed to protecting any personal information you share with us through our website and creative inquiry channels. This Privacy Policy outlines how we collect, use, and safeguard your information.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Information We Collect</h2>
            <p>We only collect personal information that you voluntarily provide to us when contacting us, requesting a consultation, or submitting our interactive postcard inquiry form:</p>
            <ul>
              <li><strong>Contact Information:</strong> Name, organization or brand name, telephone number (including country code), and email address.</li>
              <li><strong>Project Details:</strong> The creative services of interest (such as Brand Identity, Print Design, Web Design, Digital &amp; Motion, or Illustration) and any project briefs or notes you provide.</li>
              <li><strong>Technical Data:</strong> Basic browser parameters and device metrics necessary for rendering our visual experiences.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. How We Use Your Information</h2>
            <p>Your details are used solely for creative and business collaboration:</p>
            <ul>
              <li>To review project inquiries and respond with design proposals or consultations.</li>
              <li>To communicate with you regarding your creative branding and design requirements.</li>
              <li>To maintain our client relationship records.</li>
            </ul>
            <p>We do not sell, rent, or trade your personal information to third-party marketers or advertisers.</p>
          </section>

          <section className="policy-section">
            <h2>4. Data Storage &amp; Security</h2>
            <p>
              We implement industry-standard technical measures and secure transmission protocols (including encrypted messaging channels via EmailJS) to protect your inquiries from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Intellectual Property &amp; Confidentiality</h2>
            <p>
              Any creative briefs, concept drafts, and organizational materials you share with us during inquiries are treated with strict confidentiality.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Third-Party Services</h2>
            <p>
              Our website may utilize trusted service providers (such as communication APIs, font delivery networks, and video hosting) solely to ensure high-fidelity delivery of our visual assets. These providers adhere to standard data privacy practices.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions, requests, or privacy-related concerns, please reach out to us directly through our postcard contact form on our website or at:
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
