import React, { useEffect, useRef, useState } from 'react';
import {
  FiX,
  FiZap,
  FiDownload,
  FiPlay,
  FiCheckCircle as FiCheckCircleIcon,
  FiMessageCircle,
  FiEye,
  FiInfo,
  FiAlertTriangle,
  FiCheck as FiCheckIcon,
  FiCalendar,
} from 'react-icons/fi';
import { PiChatCircleDots, PiClock, PiCursorClick } from 'react-icons/pi';
import {
  ChalkboardTeacher,
  Handshake,
  Kanban,
  Briefcase,
  CaretDown,
  CheckCircle,
  CalendarCheck,
} from 'phosphor-react';
import SubscriptionProfileRequestModal from './SubscriptionProfileRequestModal';
import CleansheetQuarterModal from './CleansheetQuarterPreviewModal';

function hexToRgba(hex, alpha = 0.08) {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
  if (hex.startsWith('var(')) return `rgba(0,0,0,${alpha})`;
  const m = hex.replace('#', '');
  if (m.length !== 6 && m.length !== 3) return `rgba(0,0,0,${alpha})`;
  let r, g, b;
  if (m.length === 3) {
    r = parseInt(m[0] + m[0], 16);
    g = parseInt(m[1] + m[1], 16);
    b = parseInt(m[2] + m[2], 16);
  } else {
    r = parseInt(m.slice(0, 2), 16);
    g = parseInt(m.slice(2, 4), 16);
    b = parseInt(m.slice(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function gradientStyleFor(from, to) {
  return {
    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
  };
}

function getDataProcessingPurpose(serviceType) {
  const purposes = {
    profileBuilding: 'AI-assisted profile enhancement and open source search',
    coaching: 'facilitate the coach match process',
    consulting: 'facilitate the service discovery process',
    partnership: 'explore potential partnership opportunities',
    session: 'mock interview coaching and coach matching',
    erasure: 'data deletion and privacy rights fulfillment',
    mock_interviews: 'mock interview coaching and preparation',
    portfolio_coaching: 'portfolio coaching and feedback',
    cleansheet_quarter: 'structured coaching engagement',
    professional_services: 'professional services inquiry',
  };
  return purposes[serviceType] || 'service delivery';
}

function getDataScope(serviceType) {
  const scopes = {
    profileBuilding: ['profile', 'experiences', 'contact_info', 'browser_metadata'],
    coaching: ['profile', 'experiences', 'portfolio', 'job_opportunities', 'goals', 'stories'],
    consulting: ['profile', 'experiences', 'skills', 'contact_info'],
    partnership: ['profile', 'experiences', 'professional_info', 'contact_info'],
    session: ['profile', 'experiences', 'portfolio', 'job_opportunities'],
    erasure: ['all_personal_data'],
    mock_interviews: ['profile', 'experiences', 'portfolio', 'job_opportunities'],
    portfolio_coaching: ['profile', 'portfolio', 'projects', 'feedback'],
    cleansheet_quarter: ['profile', 'goals', 'project_plan', 'meetings'],
    professional_services: ['profile', 'organization_info', 'project_requirements'],
  };
  return scopes[serviceType] || ['profile'];
}

function getDataSharingRecipients(serviceType) {
  const recipients = {
    profileBuilding: ['Cleansheet AI systems', 'Profile enhancement services'],
    coaching: ['Cleansheet coaching team', 'Matched coaches'],
    consulting: ['Cleansheet consulting team', 'Service delivery team'],
    partnership: ['Cleansheet partnership team', 'Business development team'],
    session: ['Cleansheet coaching team', 'Mock interview coaches'],
    erasure: ['No data sharing - deletion only'],
    mock_interviews: ['Cleansheet coaching team', 'Mock interview coaches'],
    portfolio_coaching: ['Portfolio coaches', 'Cleansheet coaching team'],
    cleansheet_quarter: ['Cleansheet Success Manager', 'Cleansheet coaching team'],
    professional_services: ['Professional services team', 'Engagement delivery team'],
  };
  return recipients[serviceType] || ['Cleansheet team'];
}

function getDataSharingPurpose(serviceType) {
  const purposes = {
    profileBuilding: 'profile enhancement and improvement',
    coaching: 'coach matching and service delivery',
    consulting: 'service discovery and consulting delivery',
    partnership: 'partnership evaluation and collaboration',
    session: 'mock interview coaching and preparation',
    erasure: 'no sharing - data deletion',
    mock_interviews: 'mock interview coaching and preparation',
    portfolio_coaching: 'portfolio feedback and coaching',
    cleansheet_quarter: 'engagement delivery and coaching',
    professional_services: 'service evaluation and quoting',
  };
  return purposes[serviceType] || 'service delivery';
}

function getRetentionPolicy(serviceType) {
  const policies = {
    profileBuilding: 'retained until profile delivery or 90 days maximum',
    coaching: 'retained for duration of coaching relationship plus 1 year',
    consulting: 'retained for duration of consulting relationship plus 2 years',
    partnership: 'retained for duration of partnership evaluation plus 1 year',
    session: 'retained until session completion plus 30 days',
    erasure: 'immediate deletion upon verification',
    mock_interviews: 'retained until session completion plus 30 days',
    portfolio_coaching: 'retained for coaching relationship plus 1 year',
    cleansheet_quarter: 'retained for engagement duration plus 1 year',
    professional_services: 'retained for engagement evaluation plus 2 years',
  };
  return policies[serviceType] || 'as per Privacy Policy';
}

function getConsentText(serviceType) {
  const texts = {
    profileBuilding:
      'I acknowledge that I am requesting a profile only for myself. I authorize Cleansheet to perform an AI-assisted open source search based on my current profile and the information provided in this form, and I agree to the Terms of Service.',
    coaching:
      'I acknowledge that I am sharing my profile information with Cleansheet to facilitate the coach match process, and I agree to the Terms of Service.',
    consulting:
      'I acknowledge that I am sharing my information with Cleansheet to facilitate the service discovery process, and I agree to the Terms of Service.',
    partnership:
      'I acknowledge that I am sharing my information with Cleansheet to explore potential partnership opportunities, and I agree to the Terms of Service.',
    session:
      "I consent to sharing my profile, career experiences, job opportunities, and portfolio with Cleansheet's coaching team for the purpose of matching me with an appropriate mock interview coach.",
    erasure: 'I request the deletion of my personal data in accordance with my privacy rights.',
    mock_interviews:
      "I consent to sharing my profile and portfolio with Cleansheet's coaching team to participate in mock interviews and understand how my data will be used for coach matching.",
    portfolio_coaching:
      'I consent to sharing my portfolio and related materials with Cleansheet for portfolio coaching and feedback, and I agree to the Terms of Service.',
    cleansheet_quarter:
      'I consent to sharing my profile, goals, and project plan with Cleansheet for the 12-week Cleansheet Quarter Engagement.',
    professional_services:
      'I consent to sharing my organization and project details with Cleansheet for professional services evaluation and quoting.',
  };
  return texts[serviceType] || 'I agree to the processing of my data for the requested service.';
}

function requiresExplicitAcknowledgement(serviceType) {
  const requireAck = new Set([
    'profileBuilding',
    'coaching',
    'consulting',
    'partnership',
    'session',
    'mock_interviews',
    'portfolio_coaching',
    'cleansheet_quarter',
    'professional_services',
    'profile_request',
  ]);
  return requireAck.has(serviceType);
}

export default function CleansheetSubscriptionModal({
  isOpen = false,
  onClose = () => {},
  currentPlan = 'member',
  onSubscribe = () => {},
  onRequest = async () => ({}),
}) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan || null);
  const [engagementsOpen, setEngagementsOpen] = useState(false);

  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryProps, setInquiryProps] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestProps, setRequestProps] = useState(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else {
      document.body.style.overflow = '';
      setShowInquiryModal(false);
      setInquiryProps(null);
      setShowRequestModal(false);
      setRequestProps(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setSelectedPlan(currentPlan || null);
  }, [isOpen, currentPlan]);

  if (!isOpen) return null;

  const INQUIRE_MAP = {
    portfolio_coaching: {
      title: 'Request Portfolio Coaching',
      desc: 'Request feedback and coaching on your portfolio — connect with a Cleansheet portfolio coach.',
      accentFrom: '#0066CC',
      accentTo: '#004C99',
      formType: 'coaching',
      headerIcon: <ChalkboardTeacher className="w-5 h-5" />,
      serviceKey: 'portfolio_coaching',
    },
    mock_interviews: {
      title: 'Request Mock Interview',
      desc: 'Book a mock interview and get structured feedback to improve your interviewing skills.',
      accentFrom: '#0066CC',
      accentTo: '#004C99',
      formType: 'coaching',
      headerIcon: <ChalkboardTeacher className="w-5 h-5" />,
      serviceKey: 'mock_interviews',
    },
    cleansheet_quarter_inquiry: {
      title: 'Cleansheet Quarter Inquiry',
      desc: 'Learn more about the 12-week structured coaching engagement and request details or enrollment info.',
      accentFrom: '#0066CC',
      accentTo: '#004C99',
      formType: 'coaching',
      headerIcon: <ChalkboardTeacher className="w-5 h-5" />,
      serviceKey: 'cleansheet_quarter',
    },
    recruiter_partnership: {
      title: 'Partnership Inquiry',
      desc: 'Connect with our business development team to explore partnership opportunities.',
      accentFrom: '#16a34a',
      accentTo: '#15803d',
      formType: 'general',
      headerIcon: <Handshake className="w-5 h-5" />,
      serviceKey: 'partnership',
    },
    professional_services: {
      title: 'Professional Services Inquiry',
      desc: 'Request information about professional services, enterprise offerings, and custom quotes.',
      accentFrom: '#f59e0b',
      accentTo: '#d97706',
      formType: 'general',
      headerIcon: <Kanban className="w-5 h-5" />,
      serviceKey: 'professional_services',
    },
    consulting_services: {
      title: 'Request Consulting Engagement',
      desc: 'Request a custom quote for consulting engagements tailored to your organization.',
      accentFrom: '#7c3aed',
      accentTo: '#6d28d9',
      formType: 'general',
      headerIcon: <Briefcase className="w-5 h-5" />,
      serviceKey: 'consulting',
    },
    profile_request: {
      title: 'Request a Cleansheet Profile',
      desc: 'Request a Cleansheet profile built from publicly available information (e.g., LinkedIn).',
      accentFrom: '#f97316',
      accentTo: '#ea580c',
      formType: 'general',
      headerIcon: <FiInfo className="w-5 h-5" />,
      serviceKey: 'profileBuilding',
    },
    cleansheet_quarter: {
      title: 'Cleansheet Quarter Preview',
      desc: 'Preview the 12-week engagement details.',
      accentFrom: '#0066CC',
      accentTo: '#004C99',
      formType: 'general',
      headerIcon: <FiEye className="w-5 h-5" />,
      serviceKey: 'cleansheet_quarter',
    },
  };

  function openInquiry(topicKey) {
    const base = INQUIRE_MAP[topicKey] || {
      title: 'Inquiry',
      desc: "Please tell us what you'd like to inquire about.",
      accentFrom: '#0066CC',
      accentTo: '#004C99',
      formType: 'general',
      headerIcon: <FiMessageCircle className="w-5 h-5" />,
      serviceKey: topicKey,
    };

    const serviceKey = base.serviceKey || topicKey;

    // service-specific consent metadata
    const consentText = getConsentText(serviceKey);
    const purpose = getDataProcessingPurpose(serviceKey);
    const scope = getDataScope(serviceKey);
    const recipients = getDataSharingRecipients(serviceKey);
    const sharingPurpose = getDataSharingPurpose(serviceKey);
    const retention = getRetentionPolicy(serviceKey);
    const requireAck = requiresExplicitAcknowledgement(serviceKey);

    setInquiryProps({
      key: topicKey,
      ...base,
      serviceKey,
      consentText,
      purpose,
      scope,
      recipients,
      sharingPurpose,
      retention,
      requireAck,
    });

    setShowInquiryModal(true);
  }

  function closeInquiry() {
    setShowInquiryModal(false);
    setInquiryProps(null);
  }

  function openRequest(topicKey) {
    const props = INQUIRE_MAP[topicKey] || {
      title: 'Request / Preview',
      desc: 'Provide details to request this service or preview it.',
      accentFrom: '#0066CC',
      accentTo: '#004C99',
      formType: 'general',
      headerIcon: <FiEye className="w-5 h-5" />,
      serviceKey: topicKey,
    };

    const serviceKey = props.serviceKey || topicKey;
    const consentText = getConsentText(serviceKey);
    const purpose = getDataProcessingPurpose(serviceKey);
    const scope = getDataScope(serviceKey);
    const recipients = getDataSharingRecipients(serviceKey);
    const sharingPurpose = getDataSharingPurpose(serviceKey);
    const retention = getRetentionPolicy(serviceKey);
    const requireAck = requiresExplicitAcknowledgement(serviceKey);

    setRequestProps({
      key: topicKey,
      ...props,
      serviceKey,
      consentText,
      purpose,
      scope,
      recipients,
      sharingPurpose,
      retention,
      requireAck,
    });

    setShowRequestModal(true);
  }

  function closeRequest() {
    setShowRequestModal(false);
    setRequestProps(null);
  }

  async function handleSubmitInquiry(payload) {
    try {
      await onRequest?.(inquiryProps?.key, payload);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    }
  }

  async function handleSubmitRequest(payload) {
    try {
      await onRequest?.(requestProps?.key, payload);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    }
  }

  const PLANS = [
    {
      id: 'member',
      title: 'Member',
      priceLabel: 'Free',
      subtitle: 'Always free, no credit card required',
      items: [
        'Career Experience Management',
        'Behavioral Story Journal (STAR)',
        'LLM Prompt Generation',
        'Local Storage (Browser-based)',
        'Cleansheet Library Access',
        'Career Path Navigator',
        'Job Role to Industry Decoder',
      ],
      actionText: 'Subscribe',
      primary: true,
      ctas: [],
    },
    {
      id: 'learner',
      title: 'Learner',
      priceLabel: (
        <>
          <span className="line-through opacity-50">$9</span>
          <span className="underline opacity-50 ml-1 text-lg">mo</span>
          <span className="ml-2 font-bold">FREE</span>
        </>
      ),
      subtitle: 'Free for limited time, no credit card required',
      items: [
        'Cleansheet Profile Service',
        'Mobile-Responsive Viewport',
        'Goal Management & Tracking',
        'Centralized Portfolio Management',
        'Diagrams & Documents',
        'Cloud-Based Storage',
        'Advanced Learning Resources',
        'Portfolio Coaching',
      ],
      actionText: 'Subscribe',
      primary: true,
      ctas: [],
    },
    {
      id: 'seeker',
      title: 'Job Seeker',
      priceLabel: (
        <>
          <span className="line-through opacity-50">$19</span>{' '}
          <span className="underline opacity-50 text-lg">mo</span>
          <span className="ml-2 font-bold">FREE</span>
        </>
      ),
      subtitle: 'Free for limited time, no credit card required',
      items: [
        'Job Opportunity Management',
        'LLM Prompt Management',
        'Application Asset Management',
        'Calendar Synchronization',
        'Cleansheet AI',
        'Company Research Tools',
        'Whiteboards and Presentations',
        'Recruiter Profile Sharing',
        'Portfolio Coaching',
      ],
      actionText: 'Subscribe',
      primary: true,
      ctas: [],
    },
  ];

  const inquireButtonBase =
    'inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold transform transition-transform';
  const inquireBtnBase =
    'inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold transform transition-transform hover:-translate-y-0.5 shadow-sm';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose} />

        <div
          className="relative w-full h-full md:h-[90vh] md:max-w-[1200px] bg-white md:rounded-lg shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-4 border-b bg-black text-white flex-wrap"
            style={{ borderColor: 'var(--color-neutral-border)' }}
          >
            <h2
              className="text-lg font-semibold min-w-0"
              style={{ fontFamily: 'var(--font-family-ui)' }}
            >
              Choose Your Cleansheet Plan
            </h2>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onClose()}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-white font-semibold text-sm shadow transform transition-transform hover:-translate-y-0.5"
                style={gradientStyleFor('#f97316', '#ea580c')}
                aria-label="Quick Start"
                type="button"
              >
                <FiZap /> <span>Quick Start</span>
              </button>

              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-white font-semibold text-sm shadow transform transition-transform hover:-translate-y-0.5"
                style={gradientStyleFor('#16a34a', '#15803d')}
                type="button"
              >
                <FiDownload /> <span>Install App</span>
              </button>

              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-white font-semibold text-sm shadow transform transition-transform hover:-translate-y-0.5"
                style={gradientStyleFor('#16a34a', '#15803d')}
                type="button"
              >
                <FiPlay /> <span>Start Tour</span>
              </button>

              <button
                onClick={onClose}
                className="relative w-10 h-10 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20"
                aria-label="Close subscription modal"
                type="button"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="px-6 py-5 overflow-y-auto flex-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === selectedPlan; // use selectedPlan state
                return (
                  <div
                    key={plan.id}
                    className={`text-left rounded-lg p-4 flex flex-col h-full ${
                      isCurrent
                        ? 'border-2 border-[var(--color-primary-blue)]'
                        : 'border-2 border-[var(--color-neutral-border)]'
                    }`}
                  >
                    <div
                      className="pb-3 border-b"
                      style={{ borderColor: 'var(--color-neutral-border)' }}
                    >
                      <h3
                        className="text-base  font-semibold text-center"
                        style={{ fontFamily: 'var(--font-family-ui)', color: 'var(--color-dark)' }}
                      >
                        {plan.title}
                      </h3>
                      <div
                        className="text-2xl font-extrabold text-[var(--color-primary-blue)] mt-2"
                        style={{ fontFamily: 'var(--font-family-ui)' }}
                      >
                        {plan.priceLabel}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-family-body)',
                          fontSize: 11,
                          color: plan.id === 'member' ? 'var(--color-neutral-text)' : '#16a34a',
                          fontWeight: plan.id === 'member' ? 'normal' : 600,
                          marginTop: 6,
                        }}
                      >
                        {plan.subtitle}
                      </div>
                    </div>

                    <div className="flex-1 py-3 min-h-0">
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ fontFamily: 'var(--font-family-ui)', color: 'var(--color-dark)' }}
                      >
                        {plan.id === 'member' ? 'Includes:' : 'Everything in Member, plus:'}
                      </div>
                      <div
                        className="flex flex-col gap-2 overflow-auto pr-1"
                        style={{ maxHeight: '40vh' }}
                      >
                        {plan.items.map((it, i) => {
                          const { Icon, color } = (() => {
                            const clockItems = [
                              'Cloud-Based Storage',
                              'Advanced Learning Resources',
                              'Application Asset Management',
                              'Calendar Synchronization',
                              'Cleansheet AI',
                              'Company Research Tools',
                              'Recruiter Profile Sharing',
                            ];
                            if (clockItems.includes(it)) return { Icon: PiClock, color: '#f59e0b' };
                            return { Icon: CheckCircle, color: 'var(--color-primary-blue)' };
                          })();
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1 text-xl" style={{ color }}>
                                <Icon size={20} />
                              </div>
                              <div
                                className="text-sm text-[var(--color-dark)]"
                                style={{ fontFamily: 'var(--font-family-body)', lineHeight: 1.5 }}
                              >
                                {it}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        onClick={() => {
                          if (plan.id === selectedPlan) return;
                          setSelectedPlan(plan.id);
                          onSubscribe(plan.id);
                        }}
                        type="button"
                        className={`w-full py-3 rounded-md font-semibold transition-colors ${
                          isCurrent
                            ? 'bg-white text-[var(--color-primary-blue)] border-2 border-[var(--color-primary-blue)]'
                            : 'bg-[var(--color-primary-blue)] text-white '
                        }`}
                      >
                        {isCurrent ? 'Current Plan' : plan.actionText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setEngagementsOpen((s) => !s)}
                type="button"
                className="w-full px-4 py-3 rounded-md border flex items-center justify-between
               bg-gradient-to-tr from-[#f8f9fa] to-[#e9ecef]
               border-[var(--color-neutral-border)]
               text-sm font-semibold"
                style={{ fontFamily: 'var(--font-family-ui)' }}
              >
                <span>Cleansheet Services & Partnerships</span>
                <CaretDown
                  size={20}
                  weight="regular"
                  style={{
                    transition: 'transform 0.3s',
                    transform: engagementsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {engagementsOpen && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className="p-3 rounded-lg border
                   bg-gradient-to-tr from-[#f8f9fa] to-[#e9ecef]
                   border-[var(--color-neutral-border)]"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ background: 'var(--color-primary-blue)' }}
                      >
                        <ChalkboardTeacher className="text-white text-2xl" />
                      </div>

                      <div className="flex-1">
                        <h4
                          className="font-semibold"
                          style={{ fontFamily: 'var(--font-family-ui)' }}
                        >
                          Cleansheet Quarter Engagement
                        </h4>

                        <p
                          className="text-sm mt-2"
                          style={{
                            color: 'var(--color-neutral-text)',
                            fontFamily: 'var(--font-family-body)',
                          }}
                        >
                          12-week structured coaching engagement with a Cleansheet Success Manager.
                          Includes goal setting, capstone project planning, virtual meetings, and
                          personalized guidance tailored to your objectives.
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <div className="text-xl font-bold text-[var(--color-primary-blue)] line-through opacity-60">
                            $1199 <span className="ml-2 font-normal no-underline">FREE</span>
                          </div>

                          <button
                            onClick={() => setShowModal(true)}
                            type="button"
                            className={`${inquireBtnBase} bg-gradient-to-tr from-[#0066CC] to-[#004C99] text-white`}
                            aria-label="Preview"
                          >
                            <FiEye /> <span>Preview</span>
                          </button>
                          <button
                            onClick={() => openInquiry('cleansheet_quarter_inquiry')}
                            type="button"
                            className={`${inquireBtnBase} bg-gradient-to-tr from-[#0066CC] to-[#004C99] text-white`}
                          >
                            <PiChatCircleDots /> <span>Inquire</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recruiter Partnership */}
                  <div
                    className="p-3 rounded-lg border
                   bg-gradient-to-tr from-[#f8f9fa] to-[#e9ecef]
                   border-[var(--color-neutral-border)]"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ background: '#16a34a' }}
                      >
                        <Handshake className="text-white text-2xl" />
                      </div>

                      <div className="flex-1">
                        <h4
                          className="font-semibold"
                          style={{ fontFamily: 'var(--font-family-ui)' }}
                        >
                          Recruiter Partnership
                        </h4>

                        <p
                          className="text-sm mt-2"
                          style={{
                            color: 'var(--color-neutral-text)',
                            fontFamily: 'var(--font-family-body)',
                          }}
                        >
                          We are exploring partnership opportunities with recruitment professionals
                          and agencies. We are very early in our business development cycle and
                          welcome conversations about potential collaboration models.
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <div className="font-semibold text-green-600">Early Stage</div>

                          <button
                            onClick={() => window.open('recruiter.html', '_blank')}
                            type="button"
                            className={`${inquireBtnBase} bg-gradient-to-tr from-[#16a34a] to-[#15803d] text-white`}
                          >
                            <PiCursorClick /> <span>Preview</span>
                          </button>

                          <button
                            onClick={() => openInquiry('recruiter_partnership')}
                            type="button"
                            className={`${inquireBtnBase} bg-gradient-to-tr from-[#16a34a] to-[#15803d] text-white`}
                          >
                            <PiChatCircleDots /> <span>Inquire</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cleansheet Professional */}
                  <div
                    className="p-3 rounded-lg border
                   bg-gradient-to-tr from-[#f8f9fa] to-[#e9ecef]
                   border-[var(--color-neutral-border)]"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ background: '#f59e0b' }}
                      >
                        <Kanban className="text-white text-2xl" />
                      </div>

                      <div className="flex-1">
                        <h4
                          className="font-semibold"
                          style={{ fontFamily: 'var(--font-family-ui)' }}
                        >
                          Cleansheet Professional
                        </h4>

                        <p
                          className="text-sm mt-2"
                          style={{
                            color: 'var(--color-neutral-text)',
                            fontFamily: 'var(--font-family-body)',
                          }}
                        >
                          Digital transformation canvas for managing work projects, documents, ML
                          pipelines and automation bots. Enterprise-grade tools for project
                          management and collaborative authoring workflows.
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <div className="text-lg font-bold text-[#f59e0b]">
                            $14-$49<span className="text-sm">/mo</span>
                          </div>

                          <button
                            onClick={() => openRequest('professional_services')}
                            type="button"
                            className={`${inquireBtnBase} bg-gradient-to-tr from-[#f59e0b] to-[#d97706] text-white`}
                          >
                            <PiCursorClick /> <span>Preview</span>
                          </button>

                          <button
                            onClick={() => openInquiry('professional_services')}
                            type="button"
                            className={`${inquireBtnBase} bg-gradient-to-tr from-[#f59e0b] to-[#d97706] text-white`}
                          >
                            <PiChatCircleDots /> <span>Inquire</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consulting */}
                  <div
                    className="p-3 rounded-lg border
                   bg-gradient-to-tr from-[#f8f9fa] to-[#e9ecef]
                   border-[var(--color-neutral-border)]"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ background: '#7c3aed' }}
                      >
                        <Briefcase className="text-white text-2xl" />
                      </div>

                      <div className="flex-1">
                        <h4
                          className="font-semibold"
                          style={{ fontFamily: 'var(--font-family-ui)' }}
                        >
                          Cleansheet Consulting Engagement
                        </h4>

                        <p
                          className="text-sm mt-2"
                          style={{
                            color: 'var(--color-neutral-text)',
                            fontFamily: 'var(--font-family-body)',
                          }}
                        >
                          Enterprise consulting services for digital transformation, data pipeline
                          architecture, and systems integration. Custom engagements tailored to your
                          organization's technical challenges and strategic objectives.
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <div className="text-lg font-bold text-[#7c3aed]">Custom Quote</div>

                          <button
                            onClick={() => openInquiry('consulting_services')}
                            type="button"
                            className={`${inquireBtnBase} bg-gradient-to-tr from-[#7c3aed] to-[#6d28d9] text-white`}
                          >
                            <PiChatCircleDots /> <span>Inquire</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="mt-4 p-3 rounded"
              style={{ background: '#e3f2fd', borderLeft: '3px solid var(--color-primary-blue)' }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-[var(--color-primary-blue)]">
                  <FiInfo />
                </div>
                <div
                  className="text-xs text-[var(--color-dark)]"
                  style={{ fontFamily: 'var(--font-family-body)' }}
                >
                  <strong>All plans include:</strong> Privacy-first architecture, STAR story
                  framework, career timeline visualization, and learning library. Upgrade/downgrade
                  anytime.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInquiryModal && inquiryProps && (
        <InquiryModal
          key={inquiryProps.key}
          title={inquiryProps.title}
          description={inquiryProps.desc}
          accentFrom={inquiryProps.accentFrom}
          accentTo={inquiryProps.accentTo}
          formType={inquiryProps.formType}
          headerIcon={inquiryProps.headerIcon}
          onClose={closeInquiry}
          onSubmit={handleSubmitInquiry}
          consentText={inquiryProps.consentText}
          purpose={inquiryProps.purpose}
          scope={inquiryProps.scope}
          recipients={inquiryProps.recipients}
          sharingPurpose={inquiryProps.sharingPurpose}
          retention={inquiryProps.retention}
          requireAck={inquiryProps.requireAck}
        />
      )}
      {showModal && (
        <CleansheetQuarterModal isOpen={showModal} onClose={() => setShowModal(false)} />
      )}
      {showRequestModal && requestProps && (
        <SubscriptionProfileRequestModal
          key={requestProps.key}
          isOpen={showRequestModal}
          title={requestProps.title}
          description={requestProps.desc}
          accentFrom={requestProps.accentFrom}
          accentTo={requestProps.accentTo}
          headerIcon={requestProps.headerIcon}
          onClose={closeRequest}
          onSubmit={handleSubmitRequest}
          // pass consent metadata if you want the request modal to also show it
          consentText={requestProps.consentText}
          purpose={requestProps.purpose}
          scope={requestProps.scope}
          recipients={requestProps.recipients}
          retention={requestProps.retention}
          requireAck={requestProps.requireAck}
        />
      )}
    </>
  );
}

function InquiryModal({
  title,
  description,
  accentFrom = '#0066CC',
  accentTo = '#004C99',
  formType = 'general',
  headerIcon = null,
  onClose,
  onSubmit,
  // consent props
  consentText = '',
  purpose = '',
  scope = [],
  recipients = [],
  sharingPurpose = '',
  retention = '',
  requireAck = true,
}) {
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [ack, setAck] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const closeBtnRef = useRef(null);
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function handleSubmit(e) {
    e?.preventDefault();
    setError(null);
    if (!email) {
      setError('Email is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (requireAck && !ack) {
      setError('Please acknowledge the consent text to proceed.');
      return;
    }

    setSending(true);

    const payload = {
      email: email.trim(),
      notes: notes.trim(),
      consentCaptured: !!ack,
      consent: {
        text: consentText,
        purpose,
        scope,
        recipients,
        sharingPurpose,
        retention,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const res = await onSubmit(payload);
      if (res && res.ok) {
        setSubmitted(true);
      } else {
        setError(res?.error?.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Inquiry submit error', err);
      setError('Submission failed');
    } finally {
      setSending(false);
    }
  }

  const badgeStyle = { background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)` };
  const ackBg = hexToRgba(accentFrom, 0.06);
  const ackBorder = accentFrom;
  const buttonStyle = btnHover
    ? gradientStyleFor(accentTo, accentFrom)
    : gradientStyleFor(accentFrom, accentTo);

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div
        className="relative w-full max-w-xl bg-white rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 bg-black text-white border-b px-5 py-4 flex items-center justify-between"
          style={{ borderColor: 'var(--color-neutral-border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {submitted ? (
              <CheckCircle size={20} className="text-[#16a34a]" />
            ) : (
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={badgeStyle}
              >
                <span className="text-white">{headerIcon}</span>
              </div>
            )}
            <div className="truncate font-semibold text-md">
              {submitted ? ' Coaching Inquiry Submitted' : title}
            </div>
          </div>

          <button
            onClick={onClose}
            ref={closeBtnRef}
            className="p-2 rounded-md bg-black/10 hover:bg-black/20 text-white"
            aria-label="Close inquiry modal"
            type="button"
          >
            <FiX />
          </button>
        </div>

        <div
          className="p-6 max-h-[70vh] overflow-y-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {!submitted && (
            <>
              {formType === 'coaching' && (
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-start gap-2 text-yellow-900">
                    <FiAlertTriangle className="w-5 h-5" />
                    <div className="text-sm leading-6">
                      <strong>Recommendation:</strong> For the best coaching experience, we
                      recommend having a populated career profile (ideally 4+ experiences). If your
                      profile is sparse, consider using the <strong>Profile Request</strong> service
                      first.
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-[var(--color-neutral-text)] mb-4">{description}</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Email Address *</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border rounded-md outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Additional Notes (Optional)</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Tell us about your coaching goals, specific challenges you're facing, or any questions you have..."
                    className="w-full px-3 py-2 border rounded-md outline-none resize-vertical"
                  />
                </label>

                <label className="block">
                  <div
                    className="flex items-start gap-3 rounded p-3"
                    style={{ background: ackBg, border: `2px solid ${ackBorder}` }}
                  >
                    <input
                      type="checkbox"
                      checked={ack}
                      onChange={(e) => setAck(e.target.checked)}
                      className="mt-1 w-4 h-4"
                      aria-label="Acknowledge terms"
                    />
                    <div className="text-sm">
                      <span className="">{consentText}</span>

                      <div className="text-xs text-slate-600">
                        {/* <div>
                          <strong>Purpose:</strong> {purpose}
                        </div>
                        <div>
                          <strong>Data scope:</strong> {scope.join(', ')}
                        </div>
                        <div>
                          <strong>Recipients:</strong> {recipients.join(', ')}
                        </div>
                        <div>
                          <strong>Retention:</strong> {retention}
                        </div> */}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--color-primary-blue)] underline font-semibold"
                        >
                          Terms of Service
                        </a>
                      </div>
                    </div>
                  </div>
                </label>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-4 py-3 rounded-md font-semibold text-white"
                  style={{ ...gradientStyleFor(accentFrom, accentTo) }}
                >
                  {sending ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            </>
          )}

          {submitted && (
            <div>
              <div className="bg-[#dcfce7] border-l-4 border-[#16a34a] p-4 rounded">
                <div className="flex items-center gap-1.5 text-[var(--color-dark)]">
                  <CheckCircle className="text-lg  text-[#15803d] align-middle" />
                  <p className="text-sm m-0 text-[#15803d]">
                    <strong>Thank you!</strong>{' '}
                    <span className="ml-0.25">
                      Your coaching inquiry has been successfully submitted.
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <CalendarCheck size={20} className=" text-[var(--color-primary-blue)]" />
                <h4
                  className="text-base font-semibold text-[var(--color-dark)]"
                  style={{ fontFamily: 'var(--font-family-ui)' }}
                >
                  What Happens Next
                </h4>
              </div>

              <div className="mt-3 bg-[#f8f9fa] rounded-lg p-4">
                <ol className="list-decimal pl-5 text-sm text-[var(--color-dark)] space-y-2">
                  <li className="break-words">
                    Our team will review your profile and coaching request
                  </li>
                  <li className="break-words">
                    We will match you with the best Cleansheet Success Manager for your goals
                  </li>
                  <li className="break-words">
                    You'll receive an email from{' '}
                    <strong className="text-[var(--color-primary-blue)]">
                      coaching@cleansheet.dev
                    </strong>{' '}
                    with next steps
                  </li>
                  <li className="break-words">
                    We typically respond within <strong>24-48 hours</strong>
                  </li>
                </ol>
              </div>
              <div className="mt-4 bg-[#e3f2fd] border-l-4 border-[var(--color-primary-blue)] p-3 rounded text-xs text-[#0c4a6e]">
                <div className="flex items-start gap-2.5">
                  <FiInfo className="text-xl" />
                  <div>
                    <strong>While you wait:</strong> Continue building your career canvas and
                    exploring the Cleansheet Library to prepare for your coaching session.
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={onClose}
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  className="w-full p-3 rounded-lg font-semibold text-white"
                  style={{ ...buttonStyle, fontFamily: 'var(--font-family-ui)', fontSize: 14 }}
                  type="button"
                >
                  Got It, Thanks!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
