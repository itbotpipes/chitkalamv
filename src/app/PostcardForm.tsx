'use client';

import emailjs from '@emailjs/browser';
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
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    org: '',
    phone: '',
    countryCode: '+91',
    email: '',
    services: [] as string[],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handlePhoneInput = (index: number, value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    if (!cleanValue && value !== '') return;

    let currentPhone = (formData.phone || '').padEnd(10, ' ').split('');
    currentPhone[index] = cleanValue;
    const newPhone = currentPhone.join('').trimRight();
    setFormData({ ...formData, phone: newPhone });
    setErrorMessage('');

    if (cleanValue.length === 1 && index < 9) {
      phoneRefs.current[index + 1]?.focus();
    }
  };

  const handlePhoneKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !(formData.phone || '')[index] && index > 0) {
      phoneRefs.current[index - 1]?.focus();
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const service = e.target.value;
    setFormData(prev => ({
      ...prev,
      services: e.target.checked 
        ? [...prev.services, service]
        : prev.services.filter(s => s !== service)
    }));
  };

  const validateStep = (stepIndex: number): { valid: boolean; message: string } => {
    switch (stepIndex) {
      case 0:
        if (!formData.name.trim()) {
          return { valid: false, message: 'Please enter your name before proceeding.' };
        }
        return { valid: true, message: '' };
      case 1:
        if (!formData.org.trim()) {
          return { valid: false, message: 'Please enter your organization / creative corner.' };
        }
        return { valid: true, message: '' };
      case 2:
        if (!formData.phone.trim()) {
          return { valid: false, message: 'Please enter your phone number.' };
        }
        if (!formData.email.trim()) {
          return { valid: false, message: 'Please enter your email address.' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          return { valid: false, message: 'Please enter a valid email address.' };
        }
        return { valid: true, message: '' };
      case 3:
        if (formData.services.length === 0) {
          return { valid: false, message: 'Please select at least one service.' };
        }
        return { valid: true, message: '' };
      default:
        return { valid: true, message: '' };
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleNext = (nextStepIndex: number) => {
    const validation = validateStep(currentStep);
    if (!validation.valid) {
      triggerError(validation.message);
      return;
    }
    setErrorMessage('');
    setCurrentStep(nextStepIndex);
  };

  const handleNavClick = (targetIdx: number) => {
    if (targetIdx === currentStep) return;

    if (targetIdx < currentStep) {
      setErrorMessage('');
      setCurrentStep(targetIdx);
      return;
    }

    for (let i = 0; i < targetIdx; i++) {
      const validation = validateStep(i);
      if (!validation.valid) {
        if (i !== currentStep) {
          setCurrentStep(i);
        }
        triggerError(validation.message);
        return;
      }
    }

    setErrorMessage('');
    setCurrentStep(targetIdx);
  };

  const handleSubmit = async () => {
    for (let i = 0; i <= 3; i++) {
      const validation = validateStep(i);
      if (!validation.valid) {
        setCurrentStep(i);
        triggerError(validation.message);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await emailjs.send(
        'service_5roaiis', 
        'template_itjecka', 
        {
          name: formData.name,
          org: formData.org,
          contact: `Phone: ${formData.phone} | Email: ${formData.email}`,
          services: formData.services.join(', '),
          notes: formData.notes
        }, 
        {
          publicKey: 'LObISpNTHrDTUpMUl',
        }
      );
      alert('Postcard sent successfully!');
      setCurrentStep(0);
      setFormData({ name: '', org: '', phone: '', countryCode: '+91', email: '', services: [], notes: '' });
      setErrorMessage('');
    } catch (error: any) {
      console.error('FAILED...', error?.text || error?.message || JSON.stringify(error));
      alert(`Failed to send postcard: ${error?.text || 'Unknown error'}. Please check console.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="postcard-section" ref={sectionRef}>
      <h2 className="postcard-title">This postcard is finding its way to us...</h2>
      
      <div className="postcard-container">
        {POSTCARD_BACKGROUNDS.map((bg, idx) => (
          <div
            key={bg}
            className={`postcard-bg ${idx === currentStep ? 'active' : ''}`}
            style={{ backgroundImage: `url('${bg}')` }}
          />
        ))}
        
        <div className="postcard-form-overlay"></div>
        <div className="postcard-form-area">
          <div className="form-step-wrapper">
            {currentStep === 0 && (
              <div className={`form-step fade-in-up ${isShaking ? 'shake' : ''}`}>
                <label className="step-main-label">Who's behind this postcard?</label>
                <div className="input-group">
                  <span className="input-label">Name:</span>
                  <input 
                    type="text" 
                    placeholder="Type in your name" 
                    className="line-input" 
                    value={formData.name} 
                    onChange={e => { setFormData({...formData, name: e.target.value}); setErrorMessage(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleNext(1); }}
                  />
                </div>
                {errorMessage && <p className="step-error-msg">{errorMessage}</p>}
                <button className="next-btn premium-btn" onClick={() => handleNext(1)}>Next &gt;&gt;&gt;</button>
              </div>
            )}

            {currentStep === 1 && (
              <div className={`form-step fade-in-up ${isShaking ? 'shake' : ''}`}>
                <label className="step-main-label">Your HQ, hideout, or creative corner?</label>
                <div className="input-group">
                  <span className="input-label">Organization name</span>
                  <input 
                    type="text" 
                    placeholder="Type here" 
                    className="line-input" 
                    value={formData.org} 
                    onChange={e => { setFormData({...formData, org: e.target.value}); setErrorMessage(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleNext(2); }}
                  />
                </div>
                {errorMessage && <p className="step-error-msg">{errorMessage}</p>}
                <button className="next-btn premium-btn" onClick={() => handleNext(2)}>Next &gt;&gt;&gt;</button>
              </div>
            )}

            {currentStep === 2 && (
              <div className={`form-step fade-in-up contact-step ${isShaking ? 'shake' : ''}`}>
                <label className="step-main-label">Where should our reply land?</label>
                <div className="input-group floating-group phone-group">
                  <div className="phone-boxes" style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                    {[...Array(10)].map((_, i) => (
                      <input
                        type="tel"
                        maxLength={1}
                        key={i}
                        className="phone-box"
                        ref={(el) => { phoneRefs.current[i] = el; }}
                        value={(formData.phone || '')[i] || ''}
                        onChange={(e) => handlePhoneInput(i, e.target.value)}
                        onKeyDown={(e) => handlePhoneKeyDown(i, e)}
                      />
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <span className="input-label">Email</span>
                  <input 
                    type="email" 
                    placeholder="Type your mail id here" 
                    className="line-input" 
                    value={formData.email} 
                    onChange={e => { setFormData({...formData, email: e.target.value}); setErrorMessage(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleNext(3); }}
                  />
                </div>
                {errorMessage && <p className="step-error-msg">{errorMessage}</p>}
                <button className="next-btn premium-btn" onClick={() => handleNext(3)}>Next &gt;&gt;&gt;</button>
              </div>
            )}

            {currentStep === 3 && (
              <div className={`form-step fade-in-up services-step ${isShaking ? 'shake' : ''}`}>
                <label className="step-main-label">Pick what sparked this postcard.</label>
                
                <div className="services-checkbox-grid">
                  {[
                    "Brand Identity", 
                    "Digital & Motion", 
                    "Print Design", 
                    "Website Design/Devlopment", 
                    "Illustration", 
                    "Brand/Design Consultation"
                  ].map((service) => (
                    <label key={service} className="service-checkbox-label">
                      <input 
                        type="checkbox" 
                        className="service-checkbox" 
                        onChange={e => { handleServiceChange(e); setErrorMessage(''); }} 
                        checked={formData.services.includes(service)} 
                        value={service} 
                      />
                      <span className="custom-checkbox"></span>
                      <span className="service-checkbox-text">{service}</span>
                    </label>
                  ))}
                </div>
                {errorMessage && <p className="step-error-msg">{errorMessage}</p>}
                <button className="next-btn premium-btn" onClick={() => handleNext(4)}>Next &gt;&gt;&gt;</button>
              </div>
            )}

            {currentStep === 4 && (
              <div className={`form-step fade-in-up notes-step ${isShaking ? 'shake' : ''}`}>
                <label className="step-main-label">This is your moment, pen it!</label>
                <div className="textarea-wrapper">
                  <textarea 
                    rows={4} 
                    className="notes-textarea" 
                    placeholder="Additional Notes:" 
                    value={formData.notes} 
                    onChange={e => { setFormData({...formData, notes: e.target.value}); setErrorMessage(''); }}
                  ></textarea>
                </div>
                {errorMessage && <p className="step-error-msg">{errorMessage}</p>}
                <button className="submit-btn premium-submit-btn" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Drop it in the box!"}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="postcard-nav">
        {steps.map((step, idx) => {
          const isStepFilled = (index: number) => {
            switch(index) {
              case 0: return formData.name.trim().length > 0;
              case 1: return formData.org.trim().length > 0;
              case 2: return formData.phone.trim().length > 0 && formData.email.trim().length > 0;
              case 3: return formData.services.length > 0;
              case 4: return formData.notes.trim().length > 0;
              default: return false;
            }
          };

          const isFilled = isStepFilled(idx);
          let dotClass = 'nav-dot';
          if (isFilled) dotClass += ' completed';
          if (idx === currentStep) dotClass += ' active';

          return (
            <div key={step} className="nav-item" onClick={() => handleNavClick(idx)}>
              <div className="nav-dot-wrapper">
                <div className={dotClass}></div>
                {idx === currentStep && (
                  <div className="nav-selector">
                    <img src="/postcard/selector.svg" alt="Active Step" />
                  </div>
                )}
              </div>
              <span className={`nav-label ${isFilled ? 'completed' : ''}`}>{step}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

