import { useState } from 'react'

const CaseStudyDetail = ({ caseStudyId, onBack }) => {
  const caseStudies = {
    'helmet-mask': {
      id: 'helmet-mask',
      title: 'Reverse Engineering Helmet Mask for Inert Operations',
      subtitle: 'From manual measurement to production-ready manufacturing',
      company: 'STELNA Designs',
      metrics: [
        { value: '60%', label: 'Cost Reduction' },
        { value: '3-7 days', label: 'Lead Time' }
      ],
      heroImage: '/case-studies/Helmetmask/helmet-mask-banner.png',
      challenge: 'The challenge was to reverse engineer a specialized helmet mask used in inert operations. Traditional procurement channels were expensive and time-consuming, requiring custom imports with lead times of 4-12 weeks.',
      challengeImage: 'https://via.placeholder.com/600x400?text=Challenge+Initial+Design',
      objective: 'Create a manufacturable CAD model that could be produced locally using advanced manufacturing techniques, reducing both cost and procurement time.',
      process: [
        {
          step: 1,
          title: 'Manual Measurement',
          description: 'Captured precise dimensions using digital calipers and 3D scanning. Created detailed measurement spreadsheets to ensure accuracy.',
          image: 'https://via.placeholder.com/400x300?text=Measurement+Phase'
        },
        {
          step: 2,
          title: 'CAD Modeling',
          description: 'Built parametric CAD model using SolidWorks. Incorporated design features, mounting points, and ventilation requirements. Ensured manufacturability through design reviews.',
          image: 'https://via.placeholder.com/400x300?text=CAD+Model'
        },
        {
          step: 3,
          title: 'Prototype - FDM (PLA)',
          description: 'Rapid prototyping using FDM 3D printing with PLA material. Tested fit, form, and basic functionality. Validated design with stakeholders.',
          image: 'https://via.placeholder.com/400x300?text=FDM+Prototype'
        },
        {
          step: 4,
          title: 'Final Production - MJF (PA11)',
          description: 'Produced final parts using Multi Jet Fusion (MJF) with PA11 nylon. Superior strength-to-weight ratio, excellent durability, and cost-effective at scale.',
          image: 'https://via.placeholder.com/400x300?text=MJF+Production'
        }
      ],
      outcomes: [
        {
          metric: '60%',
          label: 'Cost Reduction',
          description: 'Compared to traditional procurement and import costs'
        },
        {
          metric: '3-7 days',
          label: 'Production Lead Time',
          description: 'From order to delivery (vs. 4-12 weeks previously)'
        },
        {
          metric: '100%',
          label: 'Design Control',
          description: 'Full ownership of manufacturing specifications and modifications'
        },
        {
          metric: '+45%',
          label: 'Durability Improvement',
          description: 'PA11 nylon material outperforms original specs'
        }
      ],
      learnings: [
        {
          title: 'Challenge',
          content: 'Balancing precision requirements with manufacturability constraints. MJF has different tolerances than traditional machining.'
        },
        {
          title: 'Solution',
          content: 'Collaborated with manufacturing experts early in design phase. Built in design margins and material selection optimization.'
        },
        {
          title: 'Tools Used',
          content: 'SolidWorks CAD | SolidWorks Simulation | Fusion 360 for review | MJF production specs'
        },
        {
          title: 'Key Takeaway',
          content: 'Understanding manufacturing constraints at the design stage creates products that are cheaper, faster, and more reliable to produce.'
        }
      ],
      pdfUrl: '/case-studies/helmet-mask.pdf'
    }
  }

  const study = caseStudies[caseStudyId]

  if (!study) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Case study not found</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', width: '100%', boxSizing: 'border-box' }}>
      {/* Back Button */}
      <div style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 89,
        background: 'var(--bg)',
        zIndex: 50,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: 'clamp(300px, 90%, 1000px)', margin: '0 auto', padding: '0 clamp(12px, 3vw, 24px)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: 'var(--text)',
              padding: '4px 8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(-2px)'
              e.currentTarget.style.color = 'var(--amber)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)'
              e.currentTarget.style.color = 'var(--text)'
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Hero Section - Heading Only */}
      <section style={{
        padding: 'clamp(20px, 4vw, 30px) 0',
        borderBottom: '1px solid var(--border)',
        animation: 'fadeUp 420ms ease both',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: 'clamp(300px, 90%, 1000px)', margin: '0 auto', padding: '0 clamp(12px, 3vw, 24px)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            animation: 'fadeUp 460ms ease both',
            animationDelay: '80ms'
          }}>
            <span style={{
              fontFamily: 'var(--sans)',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--amber)',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Case Study
            </span>
            <span style={{ color: 'var(--border)' }}>•</span>
            <span style={{
              fontFamily: 'var(--sans)',
              fontSize: '12px',
              color: 'var(--text2)'
            }}>
              {study.company}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--sans)',
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: '700',
            lineHeight: '1.1',
            letterSpacing: '-1px',
            marginBottom: '20px',
            color: 'var(--text)',
            animation: 'fadeUp 480ms ease both',
            animationDelay: '120ms'
          }}>
            {study.title}
          </h1>

          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: '18px',
            color: 'var(--text2)',
            lineHeight: '1.7',
            marginBottom: '40px',
            maxWidth: '750px',
            animation: 'fadeUp 500ms ease both',
            animationDelay: '160ms'
          }}>
            {study.subtitle}
          </p>

          {/* Hero Image */}
          <div style={{
            width: '100%',
            height: 'auto',
            minHeight: '350px',
            background: 'linear-gradient(135deg, #e5d6c3 0%, #d4c4b0 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            animation: 'fadeUp 560ms ease both',
            animationDelay: '240ms',
            border: '1px solid var(--border)'
          }}>
            <img
              src={study.heroImage}
              alt="Product"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default CaseStudyDetail
