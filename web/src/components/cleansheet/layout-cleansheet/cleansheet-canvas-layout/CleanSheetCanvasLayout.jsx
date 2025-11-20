import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import CleansheetSubscriptionModal from '../../../modals/CleanSheetSubscriptionModal';
import CleansheetCanvasHeader from './CleanSheetCanvasHeader';
import {
  User,
  Cloud,
  CloudSlash,
  Robot,
  ShieldCheck,
  ChartLineUp,
  Trash,
  Gear,
  UploadSimple,
  PaperPlaneTilt,
  CaretRight,
  Copy,
  Check,
  Star,
  ArrowLeft,
} from 'phosphor-react';
import { LLMSettingsModal } from '../../../modals/LLMSettingsModal';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const MESSAGE_STYLES = {
  user: 'bg-blue-600 text-white rounded-br-sm ml-auto',
  assistant: 'bg-gray-100 text-gray-900 rounded-bl-sm',
  system: 'bg-red-50 text-red-700 border-l-4 border-red-500',
};
const AVATAR_STYLES = {
  user: 'bg-blue-600',
  assistant: 'bg-green-600',
  system: 'bg-orange-600',
};

const ChatMessage = React.memo(function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${AVATAR_STYLES[message.role]}`}
      >
        {message.role === 'user' ? (
          <User size={16} />
        ) : message.role === 'assistant' ? (
          <Robot size={16} />
        ) : (
          '!'
        )}
      </div>
      <div className={`flex-1 max-w-[80%] relative group`}>
        <div
          className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${MESSAGE_STYLES[message.role]}`}
        >
          {message.content}
          {message.role === 'assistant' && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded-md p-1.5 hover:bg-blue-50 hover:border-blue-500"
            >
              {copied ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} className="text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default function CleansheetCanvasLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('seeker');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [llmConfig, setLLMConfig] = useState(null);
  const [authStatus, setAuthStatus] = useState({ authenticated: false, user: null });
  const [syncStatus, setSyncStatus] = useState('disabled');
  const messagesEndRef = useRef(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  function openSubscriptionModal() {
    setShowSubscriptionModal(true);
  }
  function closeSubscriptionModal() {
    setShowSubscriptionModal(false);
  }

  function handleSubscribe(planId) {
    setViewMode(planId);
    setShowSubscriptionModal(false);
  }

  function handleInquire(topicKey, payload) {
    console.log('Parent received inquiry:', topicKey, payload);
  }

  const capitalize = (s) => (typeof s === 'string' ? s[0].toUpperCase() + s.slice(1) : s);
  const handleModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveSettings = (config) => {
    setLLMConfig(config);
    setIsConfigured(true);
    setMessages([
      {
        id: generateId(),
        role: 'system',
        content: `AI Assistant configured with ${config.activeProvider}. You can now start chatting!`,
      },
    ]);
  };

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !isConfigured) return;

    const contentToSend = trimmed;

    setMessages((prev) => [...prev, { id: generateId(), role: 'user', content: contentToSend }]);

    setInputValue('');

    setTimeout(() => {
      const assistantMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I received your message: "${contentToSend}". This is a demo response. Connect your API key to get real AI responses.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  }, [inputValue, isConfigured]);

  const handleClearChat = () => {
    if (confirm('Clear all chat history?')) {
      setMessages([]);
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const PROVIDER_DISPLAY_NAMES = {
    openai: 'OpenAI',
    anthropic: 'Claude',
    gemini: 'Gemini',
  };

  const MODEL_SHORT_NAMES = {
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': '4o-mini',
    'gpt-4-turbo': '4-Turbo',
    'gpt-3.5-turbo': '3.5',
    'claude-3-5-sonnet-20241022': '3.5 Sonnet',
    'claude-3-5-haiku-20241022': '3.5 Haiku',
    'claude-3-opus-20240229': '3 Opus',
    'claude-3-sonnet-20240229': '3 Sonnet',
    'claude-3-haiku-20240307': '3 Haiku',
    'gemini-2.0-flash-exp': '2.0 Flash',
    'gemini-1.5-flash': '1.5 Flash',
    'gemini-1.5-flash-8b': '1.5-8B',
    'gemini-1.5-pro': '1.5 Pro',
  };

  const getProviderBadge = () => {
    if (!llmConfig) return null;

    const provider = llmConfig.activeProvider;
    const model = llmConfig[provider]?.model;

    const providerLabel = PROVIDER_DISPLAY_NAMES[provider] || provider;
    const modelLabel = MODEL_SHORT_NAMES[model] || model || 'unknown';

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300"
        title={`${providerLabel} — ${model}`}
      >
        {providerLabel} · {modelLabel}
      </span>
    );
  };

  const UsageStatsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
          <div className="bg-gray-900 text-white p-6 rounded-t-xl">
            <h2 className="text-xl font-semibold">Usage Statistics</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-center py-8">Usage tracking coming soon...</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ContextControlModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
          <div className="bg-gray-900 text-white p-6 rounded-t-xl">
            <h2 className="text-xl font-semibold">Context Control</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-center py-8">Context management coming soon...</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderedMessages = useMemo(() => {
    if (messages.length === 0) return null;
    return messages.map((msg) => <ChatMessage key={msg.id} message={msg} />);
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-[var(--color-neutral-background)] relative overflow-hidden">
      <CleansheetCanvasHeader viewMode={viewMode} onModeChange={handleModeChange} />

      <main className="flex-1 relative min-h-0">
        <div className="rounded-xl shadow-inner p-4 md:p-6 h-full min-h-0 flex flex-col relative overflow-hidden">
          <div
            className={`grid gap-4 transition-[grid-template-columns] duration-500 ease-in-out h-full ${
              collapsed ? 'grid-cols-[0px_1fr]' : 'grid-cols-[30%_70%]'
            }`}
          >
            <aside
              className={`flex flex-col gap-0 transition-all duration-500 bg-white rounded-xl shadow-lg h-full overflow-hidden ${
                collapsed
                  ? 'opacity-0 -translate-x-6 pointer-events-none hidden md:flex'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              <div className="p-5 bg-gray-900 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Welcome, <span>Marcus</span>
                  </h3>

                  <button
                    onClick={openSubscriptionModal}
                    className="px-3 py-1 rounded-full text-xs bg-[#0066CC] text-white"
                  >
                    {capitalize(viewMode)}
                  </button>
                </div>
              </div>

              <div className="px-3 py-3 bg-gray-50 border-b border-gray-200 flex gap-3 flex-shrink-0">
                <div className="flex-1 flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>Not signed in</span>
                </div>
                <div className="flex-1 flex items-center gap-2 text-sm text-gray-600">
                  <CloudSlash size={16} />
                  <span>Sync disabled</span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col p-5 bg-white min-h-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <Robot size={18} />
                        AI Career Assistant
                      </div>
                      {getProviderBadge()}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <button
                        onClick={() => setShowContextModal(true)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Context Control"
                      >
                        <ShieldCheck size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => setShowUsageModal(true)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Usage Statistics"
                      >
                        <ChartLineUp size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={handleClearChat}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Clear Chat"
                      >
                        <Trash size={18} className="text-gray-600" />
                      </button> */}
                      <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Settings"
                      >
                        <Gear size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 min-h-0">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Robot size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                          Configure your AI assistant to get started
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowSettingsModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition flex items-center gap-2"
                          >
                            <Gear size={16} />
                            Set Up Now
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {renderedMessages}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {isConfigured && (
                    <div className="pt-3 border-t border-gray-200 mt-3 flex-shrink-0">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your career, experiences, or goals..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <PaperPlaneTilt size={16} />
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <section className="relative overflow-hidden h-full min-h-0">
              <div className="h-full min-h-0 flex items-stretch">
                <Outlet context={{ viewMode }} />
              </div>
            </section>
          </div>

          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Open left panel' : 'Collapse left panel'}
            className={`absolute z-20 top-9/20 -translate-y-1/3 flex items-center justify-center w-10 h-12 bg-white border border-gray-300 shadow-lg hover:bg-[var(--color-primary-blue)] hover:text-white rounded-r-lg text-gray-700 transition-all duration-500 ease-in-out ${
              collapsed ? 'left-0' : 'left-[calc(30%+2px)]'
            }`}
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path d="M7 5l5 5-5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </main>

      <footer className="p-4 text-center text-gray-500 text-xs">
        © 2025 Cleansheet LLC. All rights reserved.
      </footer>

      <CleansheetSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={closeSubscriptionModal}
        currentPlan={viewMode}
        onSubscribe={handleSubscribe}
        onRequest={handleInquire}
      />

      <LLMSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSaveSettings}
      />
      <UsageStatsModal isOpen={showUsageModal} onClose={() => setShowUsageModal(false)} />
      <ContextControlModal isOpen={showContextModal} onClose={() => setShowContextModal(false)} />
    </div>
  );
}
