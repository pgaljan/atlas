import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiMessageCircle, FiAlertTriangle } from 'react-icons/fi';

export default function CenterInquiryModal({
  title,
  description,
  accentFrom = '#0066CC',
  accentTo = '#004C99',
  formType = 'general',
  onClose,
  onSubmit,
}) {
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [ack, setAck] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const closeBtnRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!email) return setError('Email is required.');
    if (formType === 'coaching' && !ack) return setError('Please acknowledge the terms.');
    setSending(true);
    try {
      const res = await onSubmit({ email, notes, ack });
      if (res?.ok) setSubmitted(true);
      else setError(res?.error?.message || 'Submission failed');
    } catch {
      setError('Submission failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)` }}
            >
              <FiMessageCircle className="text-white w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-family-ui)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            ref={closeBtnRef}
            className="p-2 rounded-md bg-black/10 hover:bg-black/20"
            aria-label="Close inquiry modal"
            type="button"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <p className="mb-4 text-sm text-gray-700">{description}</p>

          {formType === 'coaching' && (
            <div className="mb-4 bg-[#fffbeb] border-l-4 border-[#f59e0b] p-4 rounded text-[#92400e] text-sm">
              <div className="flex items-start gap-2">
                <FiAlertTriangle className="mt-0.5 w-5 h-5 flex-shrink-0" />
                <div>
                  We recommend having at least 4 career experiences in your profile for the best
                  coaching experience.
                </div>
              </div>
            </div>
          )}

          {submitted ? (
            <div className="text-center p-4 bg-green-50 text-green-700 rounded">
              Your inquiry has been submitted successfully.
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Tell us about your goals, challenges, or questions..."
                />
              </div>

              {formType === 'coaching' && (
                <label className="flex items-start gap-2 text-sm bg-blue-50 border-2 border-blue-500 p-3 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                    className="mt-1 w-4 h-4"
                  />
                  <span className="text-blue-700 text-sm">
                    I acknowledge sharing my profile information to facilitate the coach match
                    process and agree to the{' '}
                    <a
                      href="/terms-of-service"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      Terms of Service
                    </a>
                    .
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={sending}
                className="mt-2 w-full py-2 rounded-md font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)`,
                }}
              >
                {sending ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
