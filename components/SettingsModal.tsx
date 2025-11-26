import React from 'react';
import { BotId, AppSettings } from '../types';
import { BOTS, AVAILABLE_MODELS } from '../constants';
import { X, Key, Cpu, MessageSquare, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const handleModelChange = (botId: BotId, value: string) => {
    onUpdateSettings({
      ...settings,
      models: { ...settings.models, [botId]: value }
    });
  };

  const handlePromptChange = (botId: BotId, value: string) => {
    onUpdateSettings({
      ...settings,
      systemPrompts: { ...settings.systemPrompts, [botId]: value }
    });
  };

  const handleApiKeyChange = (botId: BotId, value: string) => {
    onUpdateSettings({
      ...settings,
      apiKeys: { ...settings.apiKeys, [botId]: value }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-white px-4 py-4 sm:px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h3 className="text-xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Key size={20} />
              </div>
              Bot Configuration
            </h3>
            <button 
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start gap-3">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p>
                  Configure models, API keys, and system instructions. 
                  <br/>
                  <span className="text-gray-400 text-xs mt-1 block">
                    Note: Your API keys are stored locally in your browser session. 
                    For this demo environment, cross-origin requests to OpenAI/Anthropic may be simulated via Gemini if direct calls are blocked by browser security policies.
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {Object.values(BOTS).map((bot) => (
                  <div key={bot.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
                      <img src={bot.avatar} alt={bot.name} className="w-8 h-8 rounded-full bg-white shadow-sm p-0.5" />
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg ${bot.color}`}>{bot.name}</h4>
                        <p className="text-xs text-gray-400">{bot.description}</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Model Selection */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Cpu size={14} /> Model
                          </label>
                          <select
                            value={settings.models[bot.id] || bot.defaultModel}
                            onChange={(e) => handleModelChange(bot.id, e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                          >
                            {AVAILABLE_MODELS[bot.id].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        {/* API Key Input */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                             <Key size={14} /> API Key
                          </label>
                          <input
                            type="password"
                            value={settings.apiKeys[bot.id] || ''}
                            onChange={(e) => handleApiKeyChange(bot.id, e.target.value)}
                            placeholder={bot.id === BotId.GEMINI ? 'Enter your Gemini API key' : 'sk-...'}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* System Prompt */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                           <MessageSquare size={14} /> System Instruction
                        </label>
                        <textarea
                          rows={2}
                          value={settings.systemPrompts[bot.id] || ''}
                          onChange={(e) => handlePromptChange(bot.id, e.target.value)}
                          placeholder={`Define how ${bot.name} should behave...`}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200 flex flex-row-reverse shrink-0">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto transition-colors"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
