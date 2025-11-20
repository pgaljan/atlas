import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  UserCircleGear,
  Target,
  Lightbulb,
  Handshake,
  VideoCamera,
  ChatsCircle,
  CalendarCheck,
  Trophy,
  Clock,
  X,
  CaretLeft,
  ArrowRight,
  CalendarBlank,
  GraduationCap,
  RocketLaunch,
  ArrowLeft,
  CheckCircle,
} from 'phosphor-react';

export default function CleansheetQuarterPreviewModal({
  isOpen = false,
  onClose = () => {},
  onOpen = () => {},
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      onOpen?.();
      setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    } else {
      document.body.style.overflow = '';
      setShowSummary(false);
      setCurrentStep(1);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function onEsc(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (isOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen]);

  const stepToWeekMap = useMemo(() => ({ 1: 0, 2: 1, 3: 2, 4: 2, 5: 3, 6: 6, 7: 9, 8: 12 }), []);

  const weeks = useMemo(
    () => [
      { w: 0, type: 'milestone' },
      { w: 1, type: 'milestone' },
      { w: 2, type: 'milestone' },
      { w: 3, type: 'session' },
      { w: 4, type: 'ongoing' },
      { w: 5, type: 'ongoing' },
      { w: 6, type: 'session' },
      { w: 7, type: 'ongoing' },
      { w: 8, type: 'ongoing' },
      { w: 9, type: 'session' },
      { w: 10, type: 'ongoing' },
      { w: 11, type: 'ongoing' },
      { w: 12, type: 'session' },
    ],
    [],
  );

  const timelineItems = useMemo(
    () => [
      {
        badge: 'Week 0',
        title: 'Success Manager Consultation',
        desc: 'Begin your journey with a dedicated Success Manager who understands your career aspirations.',
        bullets: [
          'Initial career assessment',
          'Professional background review',
          'Learning style evaluation',
          'Success criteria discussion',
        ],
        Icon: UserCircleGear,
      },
      {
        badge: 'Week 1',
        title: 'Detailed Goal Setting',
        desc: 'Define clear, measurable objectives for your 12-week quarter.',
        bullets: [
          'SMART goal definition',
          'Skill development priorities',
          'Career milestone identification',
          'Success metrics establishment',
        ],
        Icon: Target,
      },
      {
        badge: 'Week 1-2',
        title: 'Capstone Project Planning',
        desc: 'Design a real-world project that demonstrates your skills.',
        bullets: [
          'Project scope definition',
          'Technical requirements mapping',
          'Deliverable timeline creation',
          'Resource needs assessment',
        ],
        Icon: Lightbulb,
      },
      {
        badge: 'Week 2',
        title: 'Coach Match on Profile & Goals',
        desc: 'Matched with an experienced coach based on your background and goals.',
        bullets: [
          'Industry expertise alignment',
          'Technical skill compatibility',
          'Mentoring style fit',
          'Coach introduction meeting',
        ],
        Icon: Handshake,
      },
      {
        badge: 'Week 3',
        title: 'First Coaching Session',
        desc: 'Kick off your coaching relationship with alignment and guidance.',
        meetingBadge: '30-45 minutes',
        bullets: [
          'Relationship building',
          'Quarter roadmap review',
          'Initial guidance session',
          'First milestone setting',
        ],
        Icon: VideoCamera,
      },
      {
        badge: 'Weeks 3-12',
        title: 'Ongoing Asynchronous Collaboration',
        desc: 'Work independently with continuous support.',
        bullets: [
          'Weekly progress updates',
          'Code/work reviews',
          'Q&A via messaging',
          'Resource recommendations',
          'Blocker troubleshooting',
        ],
        Icon: ChatsCircle,
      },
      {
        badge: 'Weeks 6, 9, 12',
        title: 'Three Additional Coaching Sessions',
        desc: 'Continue momentum with strategically scheduled meetings.',
        meetingBadge: '30-45 minutes each',
        bullets: [
          'Mid-quarter progress review (Week 6)',
          'Final push guidance (Week 9)',
          'Capstone completion (Week 12)',
        ],
        Icon: CalendarCheck,
      },
      {
        badge: 'Week 12',
        title: 'Quarter Completion & Next Steps',
        desc: 'Celebrate achievements and plan continued growth.',
        bullets: [
          'Capstone project presentation',
          'Goal achievement review',
          'Skills growth assessment',
          'Portfolio integration',
          'Next quarter planning (optional)',
        ],
        Icon: Trophy,
      },
    ],
    [],
  );

  if (!isOpen) return null;

  const weekProgress = ((stepToWeekMap[currentStep] || 0) / 12) * 100;
  const canPrev = currentStep > 1 || showSummary;
  const isLast = currentStep === timelineItems.length;
  const nextLabel = isLast || showSummary ? 'View Summary' : 'Next';

  function onPrev() {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  function onNext() {
    if (showSummary) return;
    if (!isLast) {
      setCurrentStep((s) => Math.min(s + 1, timelineItems.length));
    } else {
      setShowSummary(true);
    }
  }
  const translateX = `translateX(${(currentStep - 1) * -100}%)`;
  const nextIcon = isLast ? <CheckCircle size={18} weight="duotone" /> : <ArrowRight size={16} />;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:items-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className={`
          relative
          w-full
          h-[100vh]
          bg-white
          flex flex-col
          overflow-hidden
          animate-fadeIn
          md:rounded-xl md:max-w-[900px] md:max-h-[95vh] md:h-auto md:w-[95%]
        `}
        style={{ padding: 0, margin: 0 }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-[var(--color-dark)] border-b"
          style={{ borderColor: 'var(--color-neutral-border)', flexShrink: 0 }}
        >
          <div
            className="text-lg  text-white font-semibold"
            style={{ fontFamily: 'var(--font-family-ui)' }}
          >
            Cleansheet Quarters Preview
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            type="button"
            className="p-2 rounded hover:bg-white/10 text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-5 py-4 neutral-background"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{ background: 'var(--color-neutral-background)' }}
            >
              <div className="relative">
                <div className="absolute left-0 right-0 top-[6px] h-[2px] bg-[var(--color-neutral-border)]" />

                <div
                  className="absolute left-0 top-[6px] h-[2px] rounded transition-all duration-500"
                  style={{
                    width: `${weekProgress}%`,
                    background: 'linear-gradient(90deg, var(--color-primary-blue), #7c3aed)',
                  }}
                />

                <div className="relative flex items-center justify-between">
                  {weeks.map((pt, i) => {
                    const isMilestone = pt.type === 'milestone';
                    const isSession = pt.type === 'session';
                    const size = isMilestone || isSession ? 'w-4 h-4' : 'w-3 h-3';
                    const bg = isMilestone
                      ? 'var(--color-primary-blue)'
                      : isSession
                        ? '#dc2626'
                        : 'var(--color-neutral-border)';
                    const shadow = isMilestone
                      ? '0 2px 4px rgba(0, 102, 204, 0.3)'
                      : isSession
                        ? '0 2px 4px rgba(220, 38, 38, 0.3)'
                        : 'none';
                    const labelColor =
                      isMilestone || isSession
                        ? 'var(--color-dark)'
                        : 'var(--color-neutral-text-light)';

                    return (
                      <div key={i} className="flex flex-col items-center" style={{ zIndex: 2 }}>
                        <div
                          className={`${size} rounded-full`}
                          style={{ background: bg, boxShadow: shadow }}
                        />
                        <div
                          className="text-[11px] mt-2 font-semibold"
                          style={{ fontFamily: 'var(--font-family-ui)', color: labelColor }}
                        >
                          {`W${pt.w}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
              <div
                className="flex items-center gap-2 text-xs"
                style={{
                  color: 'var(--color-neutral-text)',
                  fontFamily: 'var(--font-family-body)',
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: 'var(--color-primary-blue)' }}
                />
                <span>Milestones</span>
              </div>

              <div
                className="flex items-center gap-2 text-xs"
                style={{
                  color: 'var(--color-neutral-text)',
                  fontFamily: 'var(--font-family-body)',
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#dc2626' }} />
                <span>Coaching Sessions</span>
              </div>

              <div
                className="flex items-center gap-2 text-xs"
                style={{
                  color: 'var(--color-neutral-text)',
                  fontFamily: 'var(--font-family-body)',
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#d1d5db' }} />
                <span>Ongoing Work</span>
              </div>
            </div>

            <div
              className="mt-4 text-sm text-center"
              style={{
                fontFamily: 'var(--font-family-ui)',
                color: 'var(--color-neutral-text-light)',
              }}
            >
              {`Step ${currentStep} of ${timelineItems.length}`}
            </div>

            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                onClick={onPrev}
                disabled={!canPrev}
                type="button"
                className="px-4 py-2 rounded-md border text-sm font-semibold bg-white disabled:opacity-40 transition"
                style={{
                  fontFamily: 'var(--font-family-ui)',
                  borderColor: 'var(--color-neutral-border)',
                  color: 'var(--color-neutral-text)',
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft size={16} /> Previous
                </span>
              </button>

              <button
                onClick={onNext}
                type="button"
                className="px-4 py-2 rounded-md text-sm font-semibold text-white transition hover:shadow-md"
                style={{
                  fontFamily: 'var(--font-family-ui)',
                  background: 'var(--color-primary-blue)',
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {nextLabel} {nextIcon}
                </span>
              </button>
            </div>
          </div>

          {!showSummary && (
            <div className="mt-6">
              <div className="relative overflow-hidden min-h-[500px] md:min-h-[300px]">
                <div
                  className="flex transition-transform duration-500 ease-in-out w-full"
                  style={{ transform: translateX }}
                >
                  {timelineItems.map(
                    ({ badge, title, desc, bullets = [], meetingBadge, Icon }, idx) => {
                      const isActive = currentStep - 1 === idx;
                      return (
                        <div
                          key={idx}
                          className={`min-w-full flex-shrink-0 p-6 flex flex-col items-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                          <div
                            className="bg-white rounded-xl p-6 max-w-[700px] w-full mx-auto border shadow-sm"
                            style={{
                              borderColor: 'var(--color-neutral-border)',
                              boxShadow: isActive
                                ? '0 8px 24px rgba(0,102,204,0.15)'
                                : '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className="w-10 h-10 rounded-md flex items-center justify-center"
                                style={{ background: '#e3f2fd' }}
                              >
                                {Icon ? (
                                  <Icon className="text-[var(--color-primary-blue)]" size={22} />
                                ) : null}
                              </div>

                              <div className="flex-1">
                                <div
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    background: '#e3f2fd',
                                    color: 'var(--color-primary-blue)',
                                    fontFamily: 'var(--font-family-ui)',
                                  }}
                                >
                                  {badge}
                                </div>

                                <h3
                                  className="mt-3 text-xl font-semibold text-[var(--color-dark)]"
                                  style={{ fontFamily: 'var(--font-family-ui)' }}
                                >
                                  {title}
                                </h3>

                                <p
                                  className="mt-2 text-sm"
                                  style={{
                                    color: 'var(--color-neutral-text)',
                                    fontFamily: 'var(--font-family-body)',
                                  }}
                                >
                                  {desc}
                                </p>

                                {meetingBadge && (
                                  <div
                                    className="mt-2 inline-flex items-center gap-2 text-xs px-2 py-1 rounded"
                                    style={{
                                      background: '#f3f4f6',
                                      color: 'var(--color-neutral-text)',
                                    }}
                                  >
                                    <Clock size={14} />
                                    <span className="font-semibold">{meetingBadge}</span>
                                  </div>
                                )}

                                <ul className="mt-4 space-y-2">
                                  {bullets.map((b, i) => (
                                    <li
                                      key={i}
                                      className="relative pl-6 text-[var(--color-dark)] text-sm"
                                      style={{ fontFamily: 'var(--font-family-body)' }}
                                    >
                                      <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                        style={{ background: 'var(--color-primary-blue)' }}
                                      />
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          )}

          {showSummary && (
            <div className="mt-6">
              <div
                className="bg-white rounded-xl p-8 shadow-sm border text-center mx-auto max-w-[900px] summary-card"
                style={{ borderColor: 'var(--color-neutral-border)' }}
              >
                <h2
                  className="text-2xl md:text-[28px] font-semibold"
                  style={{ fontFamily: 'var(--font-family-ui)', color: 'var(--color-dark)' }}
                >
                  Ready to Start Your Cleansheet Quarter?
                </h2>

                <p
                  className="mt-2 text-sm"
                  style={{ color: '#666', fontFamily: 'var(--font-family-body)' }}
                >
                  Transform your career with personalized coaching, hands-on project work, and
                  professional mentorship.
                </p>

                <div className="mt-8 summary-grid grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="summary-item">
                    <div
                      className="icon w-[60px] h-[60px] rounded-lg mx-auto flex items-center justify-center"
                      style={{
                        background: '#e3f2fd',
                        color: 'var(--color-primary-blue)',
                        fontSize: 28,
                      }}
                    >
                      <CalendarBlank size={28} weight="fill" />
                    </div>
                    <h3
                      className="mt-3 text-lg font-semibold"
                      style={{ fontFamily: 'var(--font-family-ui)', color: 'var(--color-dark)' }}
                    >
                      12 Weeks
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: 'var(--color-neutral-text)',
                        fontFamily: 'var(--font-family-body)',
                      }}
                    >
                      Structured engagement timeline
                    </p>
                  </div>

                  <div className="summary-item">
                    <div
                      className="icon w-[60px] h-[60px] rounded-lg mx-auto flex items-center justify-center"
                      style={{
                        background: '#e3f2fd',
                        color: 'var(--color-primary-blue)',
                        fontSize: 28,
                      }}
                    >
                      <VideoCamera size={28} />
                    </div>
                    <h3
                      className="mt-3 text-lg font-semibold"
                      style={{ fontFamily: 'var(--font-family-ui)', color: 'var(--color-dark)' }}
                    >
                      4 Sessions
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: 'var(--color-neutral-text)',
                        fontFamily: 'var(--font-family-body)',
                      }}
                    >
                      30-45 min virtual meetings
                    </p>
                  </div>

                  <div className="summary-item">
                    <div
                      className="icon w-[60px] h-[60px] rounded-lg mx-auto flex items-center justify-center"
                      style={{
                        background: '#e3f2fd',
                        color: 'var(--color-primary-blue)',
                        fontSize: 28,
                      }}
                    >
                      <ChatsCircle size={28} />
                    </div>
                    <h3
                      className="mt-3 text-lg font-semibold"
                      style={{ fontFamily: 'var(--font-family-ui)', color: 'var(--color-dark)' }}
                    >
                      Continuous Support
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: 'var(--color-neutral-text)',
                        fontFamily: 'var(--font-family-body)',
                      }}
                    >
                      Asynchronous collaboration
                    </p>
                  </div>

                  <div className="summary-item">
                    <div
                      className="icon w-[60px] h-[60px] rounded-lg mx-auto flex items-center justify-center"
                      style={{
                        background: '#e3f2fd',
                        color: 'var(--color-primary-blue)',
                        fontSize: 28,
                      }}
                    >
                      <GraduationCap size={28} />
                    </div>
                    <h3
                      className="mt-3 text-lg font-semibold"
                      style={{ fontFamily: 'var(--font-family-ui)', color: 'var(--color-dark)' }}
                    >
                      Capstone Project
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: 'var(--color-neutral-text)',
                        fontFamily: 'var(--font-family-body)',
                      }}
                    >
                      Portfolio-ready deliverable
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white transition hover:shadow-md"
                    onClick={() => alert('Enrollment coming soon!')}
                    style={{
                      background: 'var(--color-primary-blue)',
                      fontFamily: 'var(--font-family-ui)',
                    }}
                  >
                    <RocketLaunch size={18} />
                    <span>Enroll in a Quarter</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
