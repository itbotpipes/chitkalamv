'use client';

import React, { useState, useEffect, useRef } from 'react';

const POSTCARD_BACKGROUNDS = [
  '/postcard/name-postcard.webp',
  '/postcard/org-postcard.webp',
  '/postcard/cont-postcard.webp',
  '/postcard/serv-postcard.webp',
  '/postcard/add-postcard.webp',
];

export default function PostcardForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);

  const steps = ['Name', 'Org.', 'Contact', 'Services', 'Notes'];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Change scrollbar color to match postcard & footer
          document.documentElement.style.setProperty('--scrollbar-thumb', '#ffffff');
          document.documentElement.style.setProperty('--scrollbar-track', '#E34234');
          document.documentElement.style.setProperty('--scrollbar-border', '#E34234');
        }
      },
      { threshold: 0.2 } // Trigger when at least 20% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Auto-advance to next phone box on input
  const handlePhoneInput = (index: number, value: string) => {
    if (value.length === 1 && index < 9) {
      phoneRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace to go to previous box
  const handlePhoneKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '' && index > 0) {
      phoneRefs.current[index - 1]?.focus();
    }
  };

  return (
    <section className="postcard-section" ref={sectionRef}>
      <h2 className="postcard-title">This postcard is finding its way to us...</h2>
      
      <div className="postcard-container">
        {/* Per-section postcard backgrounds with crossfade */}
        {POSTCARD_BACKGROUNDS.map((bg, idx) => (
          <div
            key={bg}
            className={`postcard-bg ${idx === currentStep ? 'active' : ''}`}
            style={{ backgroundImage: `url('${bg}')` }}
          />
        ))}
        
        <div className="postcard-form-area">
          {currentStep === 0 && (
            <div className="form-step">
              <label className="step-main-label">Who's behind this postcard?</label>
              <div className="input-group">
                <span className="input-label">Name:</span>
                <input type="text" placeholder="Type your name here" className="line-input" />
              </div>
              <button className="next-btn" onClick={() => setCurrentStep(1)}>Next &gt;&gt;&gt;</button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="form-step">
              <label className="step-main-label">Your HQ, hideout, or creative corner?</label>
              <div className="input-group">
                <span className="input-label">Organization Name</span>
                <input type="text" placeholder="Type here" className="line-input" />
              </div>
              <button className="next-btn" onClick={() => setCurrentStep(2)}>Next &gt;&gt;&gt;</button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step contact-step">
              <label className="step-main-label">Where should our reply land?</label>
              <div className="phone-boxes">
                {[...Array(10)].map((_, i) => (
                  <input
                    type="text"
                    maxLength={1}
                    key={i}
                    className="phone-box"
                    ref={(el) => { phoneRefs.current[i] = el; }}
                    onChange={(e) => handlePhoneInput(i, e.target.value)}
                    onKeyDown={(e) => handlePhoneKeyDown(i, e)}
                  />
                ))}
              </div>
              <div className="input-group">
                <span className="input-label">Email</span>
                <input type="email" placeholder="Type your mail id here" className="line-input" />
              </div>
              <button className="next-btn" onClick={() => setCurrentStep(3)}>Next &gt;&gt;&gt;</button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-step services-step">
              <label className="step-main-label">Pick what sparked this postcard.</label>
              
              <div className="services-grid">
                <label className="service-checkbox-label">
                  <input type="checkbox" className="service-checkbox" value="Brand Identity" />
                  <span className="custom-checkbox"></span>
                  Brand Identity
                </label>
                <label className="service-checkbox-label">
                  <input type="checkbox" className="service-checkbox" value="Digital & Motion" />
                  <span className="custom-checkbox"></span>
                  Digital &amp; Motion
                </label>
                
                <label className="service-checkbox-label">
                  <input type="checkbox" className="service-checkbox" value="Print Design" />
                  <span className="custom-checkbox"></span>
                  Print Design
                </label>
                <label className="service-checkbox-label">
                  <input type="checkbox" className="service-checkbox" value="Website Design/Devlopment" />
                  <span className="custom-checkbox"></span>
                  Website Design/Devlopment
                </label>
                
                <label className="service-checkbox-label">
                  <input type="checkbox" className="service-checkbox" value="Illustration" />
                  <span className="custom-checkbox"></span>
                  Illustration
                </label>
                <label className="service-checkbox-label">
                  <input type="checkbox" className="service-checkbox" value="Brand/Design Consultation" />
                  <span className="custom-checkbox"></span>
                  Brand/Design Consultation
                </label>
              </div>

              <button className="next-btn" onClick={() => setCurrentStep(4)}>Next &gt;&gt;&gt;</button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="form-step notes-step">
              <label className="step-main-label">This is your moment, pen it!</label>
              <div className="textarea-wrapper">
                <span className="textarea-placeholder">Additional Notes:</span>
                <textarea rows={4} className="notes-textarea"></textarea>
              </div>
              <button className="submit-btn" onClick={() => alert('Submitted!')}>Drop it in the box!</button>
            </div>
          )}
        </div>
      </div>

      <div className="postcard-nav">
        {steps.map((step, idx) => {
          let dotClass = 'nav-dot';
          if (idx < currentStep) dotClass += ' completed';
          if (idx === currentStep) dotClass += ' active';

          return (
            <div key={step} className="nav-item" onClick={() => setCurrentStep(idx)}>
              <div className="nav-dot-wrapper">
                <div className={dotClass}></div>
                {idx === currentStep && (
                  <div className="nav-selector">
                    <img src="/postcard/selector.svg" alt="Active Step" />
                  </div>
                )}
              </div>
              <span className={`nav-label ${idx < currentStep ? 'completed' : ''}`}>{step}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
