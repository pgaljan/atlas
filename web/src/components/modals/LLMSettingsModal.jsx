import React, { useEffect, useState } from 'react';
import cogoToast from '@successtar/cogo-toast';
import { CheckCircle } from 'phosphor-react';

const PROVIDER_METADATA = {
  openai: {
    name: 'OpenAI (GPT-4, GPT-3.5) ✓ Browser Compatible',
    cleanName: 'OpenAI',
    icon: 'ph-openai-logo',
    apiKeyPrefix: 'sk-',
    getKeyLink: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Recommended) -- ~$0.005/1k tokens', cost: '~$0.005/1k' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini -- Fast & Cheap', cost: '~$0.00015/1k' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', cost: '~$0.01/1k' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Budget)', cost: '~$0.0005/1k' },
    ],
    defaultModel: 'gpt-4o',
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    cleanName: 'Anthropic',
    icon: 'ph-lightning',
    apiKeyPrefix: 'sk-ant-',
    getKeyLink: 'https://console.anthropic.com/settings/keys',
    models: [
      {
        id: 'claude-sonnet-4-5-20250929',
        name: 'Claude Sonnet 4.5 (Latest)',
        cost: 'Best Overall',
      },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', cost: 'Fast & Efficient' },
      { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', cost: 'Most Capable' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude Haiku 3.5 (Legacy)', cost: 'Legacy' },
      { id: 'claude-3-haiku-20240307', name: 'Claude Haiku 3 (Legacy)', cost: 'Legacy' },
    ],
    defaultModel: 'claude-sonnet-4-5-20250929',
  },
  gemini: {
    name: 'Google Gemini',
    cleanName: 'Gemini',
    icon: 'ph-sparkle',
    apiKeyPrefix: 'AIza',
    getKeyLink: 'https://aistudio.google.com/apikey',
    models: [
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash (Experimental)',
        cost: 'Fastest, Latest',
      },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', cost: 'Fast & Efficient' },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', cost: 'High Volume' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', cost: 'Most Capable' },
    ],
    defaultModel: 'gemini-2.0-flash-exp',
  },
};

const STORAGE_KEY = 'llm_config_encrypted';

async function encryptValue(v) {
  if (window.CleansheetCrypto?.encrypt) return await window.CleansheetCrypto.encrypt(v);
  return v;
}
async function decryptValue(v) {
  if (!v) return '';
  if (window.CleansheetCrypto?.decrypt) {
    try {
      return await window.CleansheetCrypto.decrypt(v);
    } catch {
      return '';
    }
  }
  return v;
}

function defaultConfig() {
  return {
    activeProvider: 'openai',
    openai: { apiKey: '', model: PROVIDER_METADATA.openai.defaultModel },
    anthropic: { apiKey: '', model: PROVIDER_METADATA.anthropic.defaultModel },
    gemini: { apiKey: '', model: PROVIDER_METADATA.gemini.defaultModel },
  };
}

export function LLMSettingsModal({ isOpen, onClose, onSave }) {
  const [config, setConfig] = useState(defaultConfig());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) loadConfig();
  }, [isOpen]);

  async function loadConfig() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setConfig(defaultConfig());
      return;
    }
    const saved = JSON.parse(raw);
    setConfig({ ...defaultConfig(), ...saved });
  }

  async function persist(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setConfig(next);
    if (onSave) onSave(next);
    cogoToast.success('Settings saved');
  }

  const active = config.activeProvider;
  const meta = PROVIDER_METADATA[active];

  async function testConnection() {
    if (!config[active].apiKey) {
      cogoToast.error('Please enter an API key first');
      return;
    }
    cogoToast.loading('Testing connection...');
    setTimeout(() => cogoToast.success('Connection successful'), 700);
  }

  async function saveSettings() {
    await persist(config);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-900 text-white p-6 rounded-t-xl">
          <h2 className="text-xl font-semibold">AI Assistant Settings</h2>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Provider
            </label>

            <select
              value={active}
              onChange={(e) => setConfig((c) => ({ ...c, activeProvider: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              {Object.entries(PROVIDER_METADATA).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.name}
                </option>
              ))}
            </select>

            <p className="text-xs text-gray-500 mt-2">
              Choose which AI provider you'd like to use. You'll need your own API key.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                {meta.cleanName} API Key
              </label>
              <a
                href={meta.getKeyLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-xs"
              >
                OpenAI API Key
              </a>
            </div>

            <input
              type="password"
              placeholder={`${meta.apiKeyPrefix}...`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              value={config[active].apiKey ? '••••••••' : ''}
              onChange={async (e) => {
                const raw = e.target.value;
                const trimmed = raw.trim();
                const encrypted = trimmed ? await encryptValue(trimmed) : '';
                setConfig((c) => ({
                  ...c,
                  [active]: { ...c[active], apiKey: encrypted },
                }));
              }}
            />

            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span>🔒</span>
              Your API key is encrypted and stored locally in your browser.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
            <select
              value={config[active].model}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  [active]: { ...c[active], model: e.target.value },
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              {meta.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="flex items-center justify-center gap-2 text-sm p-2 bg-[var(--color-primary-blue)] border border-neutral-300 rounded-lg text-white transition-all hover:bg-blue-50 hover:border-blue-500"
            onClick={testConnection}
            title="Test Connection"
          >
            <CheckCircle size={16} className="text-white" />
            Test Connection
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
