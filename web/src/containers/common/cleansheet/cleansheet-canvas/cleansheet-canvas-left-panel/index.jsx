import React, { useEffect, useState } from 'react';
import { FaRobot, FaPaperPlane, FaUserCircle, FaCloud, FaCog, FaCaretLeft } from 'react-icons/fa';

export default function LeftPanel({ collapsed, setCollapsed }) {
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [rapidOpen, setRapidOpen] = useState(false);
  const [erasureOpen, setErasureOpen] = useState(false);

  const [llmConfigured, setLlmConfigured] = useState(false);
  const [providerBadge, setProviderBadge] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cleansheet_profile')) || null;
    } catch {
      return null;
    }
  });

  const subscriptionTier = localStorage.getItem('subscription_tier') || 'seeker';

  useEffect(() => {
    const cfg = localStorage.getItem('llm_config_encrypted');
    if (cfg) {
      setLlmConfigured(true);
      setProviderBadge({ label: 'OpenAI · 4o-mini', bg: 'bg-blue-50 text-blue-800' });
    } else {
      setLlmConfigured(false);
      setProviderBadge(null);
    }
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cleansheet_profile') {
        try {
          setProfile(JSON.parse(e.newValue));
        } catch {
          setProfile(null);
        }
      }
      if (e.key === 'llm_config_encrypted') {
        setLlmConfigured(Boolean(e.newValue));
      }
      if (e.key === 'subscription_tier') {
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const openSubscriptionModal = () => {
    setSubscriptionOpen(true);
  };
  const closeSubscriptionModal = () => {
    setSubscriptionOpen(false);
  };

  const openRapidOnboardingModal = () => {
    setRapidOpen(true);
  };
  const closeRapidOnboardingModal = () => {
    setRapidOpen(false);
  };

  const openErasureModal = () => {
    setErasureOpen(true);
  };
  const closeErasureModal = () => {
    setErasureOpen(false);
  };

  const saveRapidOnboardingProfile = (ev) => {
    ev?.preventDefault?.();

    const form = ev?.target || document;
    const firstName = form.rapidOnboardingFirstName?.value?.trim?.() || '';
    const lastName = form.rapidOnboardingLastName?.value?.trim?.() || '';
    const profession = form.rapidOnboardingProfession?.value?.trim?.() || '';
    const goal = form.rapidOnboardingGoal?.value?.trim?.() || '';

    if (!firstName || !lastName) {
      alert('Please enter your first and last name.');
      return;
    }

    const p = { firstName, lastName, profession, goal };
    localStorage.setItem('cleansheet_profile', JSON.stringify(p));
    setProfile(p);

    const keysToClear = [
      'userGoals_member',
      'userPortfolio_member',
      'jobOpportunities_member',
      'applicationMaterials',
      'cleansheet_experiences',
      'cleansheet_stories',
      'behavioralStories',
    ];
    keysToClear.forEach((k) => localStorage.removeItem(k));

    alert(`Welcome, ${firstName}! Your profile has been created.`);

    setRapidOpen(false);
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;

    setChatMessages((s) => [...s, { role: 'user', text }]);
    setChatInput('');

    if (!llmConfigured) {
      setChatMessages((s) => [
        ...s,
        { role: 'system', text: 'Please configure AI Assistant first.' },
      ]);
      setTimeout(() => openSubscriptionModal(), 300);
      return;
    }

    setChatMessages((s) => [...s, { role: 'assistant', text: '...' }]);
    const simulateResponse = `Assistant response to: ${text}`;
    setTimeout(() => {
      setChatMessages((s) => {
        const updated = [...s];
        const lastIndex = updated.map((m) => m.role).lastIndexOf('assistant');
        if (lastIndex >= 0) updated[lastIndex] = { role: 'assistant', text: simulateResponse };
        return updated;
      });
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const selectPlan = (tier) => {
    localStorage.setItem('subscription_tier', tier);
    setSubscriptionOpen(false);
  };

  const authState = { label: 'Not signed in', detail: '', iconColor: 'text-gray-400' };
  const syncState = { label: 'Sync disabled', detail: '', iconColor: 'text-gray-400' };

  return (
    <>
      <aside
        aria-hidden={collapsed}
        className={`flex flex-col gap-4 transition-all duration-300 ease-in-out transform h-full min-h-0
          bg-white rounded-xl shadow p-0 overflow-hidden relative
          ${collapsed ? 'opacity-0 -translate-x-6 pointer-events-none w-0' : 'opacity-100 translate-x-0 w-full'}
        `}
        style={{ minWidth: 0 }}
      >
        <div className="px-5 py-4 bg-[#111827] text-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[18px] font-semibold">
              Welcome, <span className="capitalize">{profile?.firstName || 'Guest'}</span>
            </h3>
            <button
              onClick={openSubscriptionModal}
              className="ml-2 px-3 py-1 text-[11px] font-semibold uppercase rounded-full shadow-sm tracking-wide"
              style={{ background: '#0066CC', color: 'white' }}
              title="Open subscription modal"
            >
              {localStorage.getItem('subscription_tier') || 'Seeker'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Close left panel"
              className="p-2 rounded hover:bg-white/10 transition"
            >
              <FaCaretLeft />
            </button>
          </div>
        </div>

        <div className="px-3 py-3 bg-gray-50 border-b border-gray-200 flex gap-3">
          <div
            onClick={() => alert('Auth action (placeholder)')}
            className="status-item clickable flex items-center gap-3 p-2 rounded-md flex-1 min-w-0 cursor-pointer hover:bg-blue-50"
          >
            <div className={`text-2xl ${authState.iconColor}`}>
              <FaUserCircle />
            </div>
            <div className="status-text min-w-0">
              <div className="text-xs font-semibold text-gray-700 truncate">{authState.label}</div>
              <div className="text-[11px] text-gray-500 truncate">{authState.detail}</div>
            </div>
          </div>

          <div
            onClick={() => alert('Sync action (placeholder)')}
            className="status-item clickable flex items-center gap-3 p-2 rounded-md flex-1 min-w-0 cursor-pointer hover:bg-blue-50"
          >
            <div className={`text-2xl ${syncState.iconColor}`}>
              <FaCloud />
            </div>
            <div className="status-text min-w-0">
              <div className="text-xs font-semibold text-gray-700 truncate">{syncState.label}</div>
              <div className="text-[11px] text-gray-500 truncate">{syncState.detail}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-white min-h-0 flex flex-col">
          <div className="chat-container flex flex-col h-full">
            <div className="chat-header flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-3">
                  <FaRobot className="text-base" />
                  AI Career Assistant
                </h4>

                {providerBadge ? (
                  <div
                    id="providerModelBadge"
                    className={`hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold`}
                    style={{ display: providerBadge ? 'inline-flex' : 'none' }}
                    title="Provider badge"
                  >
                    {providerBadge.label}
                  </div>
                ) : null}
              </div>

              <button
                onClick={() => alert('Open LLM settings (placeholder)')}
                title="Settings"
                className="p-2 rounded hover:bg-gray-100"
              >
                <FaCog />
              </button>
            </div>

            <div id="chatMessages" className="chat-messages flex-1 overflow-y-auto py-4">
              {chatMessages.length === 0 ? (
                <div
                  id="chatEmptyState"
                  className="chat-empty-state flex flex-col items-center justify-center h-full gap-3 text-center px-3"
                >
                  <FaRobot className="text-4xl text-gray-300" />
                  <p className="text-sm text-gray-600">
                    Configure your AI assistant to get started
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openSubscriptionModal()}
                      className="px-3 py-2 rounded-md bg-[#0066CC] text-white font-semibold"
                    >
                      <FaCog className="inline mr-2" />
                      Set Up Now
                    </button>
                    <button
                      onClick={() => openRapidOnboardingModal()}
                      className="px-3 py-2 rounded-md bg-gray-100 text-gray-800 font-semibold"
                    >
                      Quick Start
                    </button>
                  </div>
                </div>
              ) : (
                chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`chat-message flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`chat-message-avatar w-8 h-8 rounded-full flex items-center justify-center text-white ${m.role === 'assistant' ? 'bg-green-600' : m.role === 'user' ? 'bg-blue-600' : 'bg-orange-500'}`}
                    >
                      {m.role === 'user' ? (
                        <FaUserCircle />
                      ) : m.role === 'assistant' ? (
                        <FaRobot />
                      ) : (
                        '!'
                      )}
                    </div>

                    <div className="chat-message-content bg-gray-50 p-3 rounded-lg max-w-full break-words">
                      <div
                        className={`${m.role === 'user' ? 'text-white bg-blue-600 rounded-lg p-3' : ''}`}
                      >
                        {m.text}
                      </div>
                      {m.role !== 'user' && (
                        <div className="text-xs text-gray-400 mt-1">{m.role}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              id="chatInputContainer"
              className={`chat-input-container border-t border-gray-100 pt-3 ${llmConfigured ? '' : 'hidden'}`}
            >
              <textarea
                id="chatInput"
                rows={2}
                placeholder="Ask about your career, experiences, or goals..."
                className="w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="mt-2">
                <button
                  id="sendButton"
                  onClick={sendChatMessage}
                  className="w-full px-3 py-2 rounded-md bg-[#0066CC] text-white font-semibold flex items-center justify-center gap-2"
                >
                  <FaPaperPlane />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Toggle left panel"
        className={`left-panel-toggle absolute z-50 top-1/2 transform -translate-y-1/2 bg-white border rounded-r-lg p-3 shadow
          ${collapsed ? 'left-0' : 'left-[calc(360px+8px)]'}
          transition-all duration-300`}
        style={{ borderColor: 'rgba(229,231,235,1)' }}
      >
        <FaCaretLeft className={`${collapsed ? 'rotate-180 transform' : ''}`} />
      </button>

      {subscriptionOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && closeSubscriptionModal()}
        >
          <div className="bg-white rounded-xl w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold mb-3">Choose a plan</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button onClick={() => selectPlan('seeker')} className="p-4 border rounded-lg">
                Seeker
              </button>
              <button onClick={() => selectPlan('learner')} className="p-4 border rounded-lg">
                Learner
              </button>
              <button onClick={() => selectPlan('planner')} className="p-4 border rounded-lg">
                Planner
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeSubscriptionModal} className="px-4 py-2 rounded-md border">
                Cancel
              </button>
              <button
                onClick={() => selectPlan(localStorage.getItem('subscription_tier') || 'seeker')}
                className="px-4 py-2 rounded-md bg-[#0066CC] text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {rapidOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && closeRapidOnboardingModal()}
        >
          <form
            onSubmit={saveRapidOnboardingProfile}
            className="bg-white rounded-xl w-full max-w-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-3">Quick Startup</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                id="rapidOnboardingFirstName"
                name="rapidOnboardingFirstName"
                placeholder="First name"
                className="border rounded px-3 py-2"
              />
              <input
                id="rapidOnboardingLastName"
                name="rapidOnboardingLastName"
                placeholder="Last name"
                className="border rounded px-3 py-2"
              />
            </div>

            <div className="mb-3">
              <input
                id="rapidOnboardingProfession"
                name="rapidOnboardingProfession"
                placeholder="Profession"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-3">
              <textarea
                id="rapidOnboardingGoal"
                name="rapidOnboardingGoal"
                placeholder="Goal"
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRapidOnboardingModal}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-[#0066CC] text-white">
                Create Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {erasureOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && closeErasureModal()}
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3">Erasure Request</h3>
            <div className="mb-3">
              <input
                id="erasureRequestName"
                placeholder="Full name"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-3">
              <input
                id="erasureRequestEmail"
                placeholder="Email address"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={closeErasureModal} className="px-4 py-2 rounded border">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Erasure request submitted (placeholder)');
                  closeErasureModal();
                }}
                className="px-4 py-2 rounded bg-[#0066CC] text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
