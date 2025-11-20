import React, { useEffect, useRef, useState } from 'react';
import {
  FiX,
  FiCheckCircle as FiCheckCircleIcon,
  FiInfo,
  FiAlertTriangle,
  FiSend,
} from 'react-icons/fi';
import { UserFocus, ShieldCheck } from 'phosphor-react';
const SubscriptionProfileRequestModal = ({
  isOpen,
  title = 'Request a Cleansheet Profile',
  description = 'Request a Cleansheet profile built from publicly available information.',
  accentFrom = '#f97316',
  accentTo = '#ea580c',
  headerIcon = null,
  onClose = () => {},
  onSubmit = async () => ({ ok: true }),
}) => {
  const [email, setEmail] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const closeBtnRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtnRef.current?.focus?.(), 0);

      const onKey = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener('keydown', onKey);
      };
    }
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function gradientStyleFor(from, to) {
    return { background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` };
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setError(null);

    if (!email || !linkedIn) {
      setError('Please fill required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!linkedIn.includes('linkedin.com')) {
      setError('Please enter a valid LinkedIn profile URL.');
      return;
    }

    if (!acknowledged) {
      setError('You must acknowledge and agree to the terms.');
      return;
    }

    setSending(true);
    try {
      const res = await onSubmit({ email, linkedIn });
      if (res && res.ok) {
        setSubmitted(true);
      } else {
        setError(res?.error?.message || 'Request failed');
      }
    } catch (err) {
      setError(err?.message || 'Request failed');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10002] flex items-end md:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:w-auto max-w-[550px] bg-white rounded-t-xl md:rounded-lg overflow-hidden flex flex-col h-[92vh] md:max-h-[80vh] md:h-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-black text-white">
          <h2 className="text-lg font-semibold flex items-center gap-3">
            <span className="text-orange-400 flex items-center">
              <UserFocus className="text-[#f97316]" aria-hidden="true" />
            </span>
            <span>{title}</span>
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-md hover:bg-white/20 focus:outline-none"
            aria-label="Close request modal"
          >
            <FiX className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="bg-[#fff7ed] border-l-4 border-[#f97316] p-4 rounded">
            <p className="text-xs text-[#92400e] flex items-start gap-2">
              <FiInfo className="mt-[2px] text-base" aria-hidden="true" />
              <span className="leading-[1.45]">{description}</span>
            </p>
          </div>

          {!submitted ? (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-dark)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-[10px] border-2 border-[#f97316] rounded-md text-sm font-body focus:outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
                <div className="text-xs text-[#92400e] mt-1 flex items-center gap-1">
                  <FiAlertTriangle className="w-3 h-3" aria-hidden="true" />
                  <span>
                    You must control this email address. 2FA will be leveraged for verification.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-dark)] mb-1">
                  LinkedIn Profile URL *
                </label>
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="w-full px-3 py-[10px] border-2 border-[#f97316] rounded-md text-sm font-[var(--font-family-body)] focus:outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
              </div>

              <div>
                <label className="grid grid-cols-[auto_1fr] gap-5 cursor-pointer p-3 bg-white border-2 border-[#f97316] rounded-md text-xs leading-[1.5] font-[var(--font-family-body)] items-start">
                  <input
                    type="checkbox"
                    className="mt-[2px] w-4 h-4 flex-shrink-0 cursor-pointer"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    required
                  />

                  <span className="block text-[#92400e] whitespace-normal break-words text-xs">
                    I acknowledge that I am requesting a profile only for myself, I authorize
                    Cleansheet to perform an AI-assisted open source search based on my current
                    profile and the information provided in this form, and I agree to the
                    <a
                      href="/terms-of-service"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#ea580c] underline font-semibold inline mx-1"
                    >
                      Terms of Service
                    </a>
                    . *
                  </span>
                </label>
              </div>

              <div className="bg-[#fffbeb] border border-[#fbbf24] p-3 rounded-md">
                <div
                  className="flex items-center gap-1 mb-2 text-[11px] font-semibold text-[#92400e]"
                  style={{ fontFamily: 'var(--font-family-ui)' }}
                >
                  <ShieldCheck
                    size={14}
                    weight="regular"
                    className="text-[#92400e]"
                    aria-hidden="true"
                  />
                  Privacy Notice
                </div>

                <ul className="text-[11px] text-[#92400e] leading-[1.5] font-[var(--font-family-body)] list-disc pl-[18px] space-y-1">
                  <li>
                    Cleansheet will conduct an open source search to minimally populate your
                    professional and educational profile
                  </li>
                  <li>Cleansheet will retain this data to provide the requested service</li>
                  <li>You can submit erasure requests from the user menu</li>
                  <li>
                    This is an experimental preview service and data accuracy is not guaranteed
                  </li>
                </ul>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 p-3 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow transform transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={gradientStyleFor ? gradientStyleFor(accentFrom, accentTo) : {}}
                >
                  <FiSend aria-hidden="true" />
                  {sending ? 'Sending...' : 'Submit Request'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 text-sm border border-[var(--color-neutral-border)] text-[var(--color-neutral-text)] rounded-lg font-semibold hover:border-[var(--color-primary-blue)] hover:text-[var(--color-primary-blue)] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
                <div className="flex items-center gap-3 text-emerald-800">
                  <FiCheckCircleIcon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  <div>
                    <div className="font-semibold">Request received</div>
                    <div className="text-sm">We'll contact you soon.</div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 rounded-md font-semibold text-white"
                  style={gradientStyleFor ? gradientStyleFor(accentFrom, accentTo) : {}}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionProfileRequestModal;
