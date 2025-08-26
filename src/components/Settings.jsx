// src/components/Settings.jsx - InterMAX-UI Version
import React, { useState } from 'react';
import { Settings as SettingsIcon, X, Key, Palette, Info, Cpu, Zap, DollarSign } from 'lucide-react';
import { OPENAI_MODELS, formatModelInfo } from '../services/openai';

const Settings = ({ theme, setTheme, isOpen, onClose, selectedModel, setSelectedModel }) => {
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_OPENAI_API_KEY || '');
  
  if (!isOpen) return null;

  const themes = [
    { id: 'cyan', name: 'Cyan Neon', color: 'bg-cyan-400', preview: 'border-cyan-400 text-cyan-400' },
    { id: 'green', name: 'Matrix Green', color: 'bg-green-400', preview: 'border-green-400 text-green-400' },
    { id: 'blue', name: 'Electric Blue', color: 'bg-blue-400', preview: 'border-blue-400 text-blue-400' },
    { id: 'purple', name: 'Synthwave', color: 'bg-purple-400', preview: 'border-purple-400 text-purple-400' },
  ];

  const handleSaveApiKey = () => {
    console.log('API Key saved:', apiKey ? 'sk-***' : 'No key provided');
    alert('API Key saved! Restart the application to use the new key.');
  };

  const selectedModelInfo = formatModelInfo(selectedModel);

  const getModelIcon = (modelId) => {
    if (modelId.includes('gpt-4')) return <Zap className="w-4 h-4 text-yellow-400" />;
    if (modelId.includes('gpt-3.5')) return <Cpu className="w-4 h-4 text-blue-400" />;
    return <Cpu className="w-4 h-4 text-gray-400" />;
  };

  const getModelBadge = (modelId) => {
    if (modelId === 'gpt-4o' || modelId === 'gpt-4') return 'PREMIUM';
    if (modelId === 'gpt-4o-mini' || modelId === 'gpt-4-turbo') return 'BALANCED';
    return 'EFFICIENT';
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'PREMIUM': return 'text-yellow-400 border-yellow-400';
      case 'BALANCED': return 'text-green-400 border-green-400';
      case 'EFFICIENT': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 border border-gray-700 p-6 max-w-4xl w-full m-4 neon-border max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-mono text-cyan-400 font-bold">InterMAX CONFIGURATION</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Model Selection */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-mono text-gray-300 font-bold">AI MODEL SELECTION</h3>
            </div>
            
            {/* Current Model Info */}
            <div className="bg-black/40 border border-gray-800 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getModelIcon(selectedModel)}
                  <span className="font-mono text-cyan-400 font-bold">{selectedModelInfo.name}</span>
                  <span className={`text-xs px-2 py-1 border font-mono ${getBadgeColor(getModelBadge(selectedModel))}`}>
                    {getModelBadge(selectedModel)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <DollarSign className="w-3 h-3" />
                  {selectedModelInfo.cost}
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{selectedModelInfo.description}</p>
              <div className="text-xs text-gray-500">
                Max tokens: {selectedModelInfo.maxTokens}
              </div>
            </div>

            {/* Model Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OPENAI_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`text-left p-4 border transition-all duration-300 font-mono text-sm ${
                    selectedModel === model.id 
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' 
                      : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:bg-black/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getModelIcon(model.id)}
                      <span className="font-bold">{model.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 border ${getBadgeColor(getModelBadge(model.id))}`}>
                        {getModelBadge(model.id)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ${model.costPer1kTokens}/1K
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{model.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Max: {model.maxTokens.toLocaleString()} tokens</span>
                    <span>{selectedModel === model.id ? 'ACTIVE' : 'Available'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Theme */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-mono text-gray-300 font-bold">VISUAL THEME</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-3 p-3 border transition-all duration-300 font-mono text-sm ${
                    theme === t.id 
                      ? `${t.preview} bg-black/40 shadow-lg` 
                      : 'border-gray-700 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 ${t.color} border border-black rounded`}></div>
                  <span>{t.name}</span>
                  {theme === t.id && <span className="ml-auto text-xs">ACTIVE</span>}
                </button>
              ))}
            </div>
          </div>

          {/* API Configuration */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-mono text-gray-300 font-bold">API CONFIGURATION</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-black border border-gray-700 p-3 font-mono text-sm text-white placeholder-gray-500 focus:border-cyan-400 outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleSaveApiKey}
                className="w-full px-4 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-colors font-mono text-sm"
              >
                SAVE API KEY
              </button>
              <div className="flex items-start gap-2 p-3 bg-black/40 border border-gray-800">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-400">
                  <p className="mb-1">Get your API key from OpenAI Platform</p>
                  <p className="text-cyan-400">platform.openai.com/api-keys</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-mono text-gray-300 font-bold">SYSTEM STATUS</h3>
          </div>
          <div className="bg-black/40 border border-gray-800 p-4 font-mono text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-400">
              <div className="space-y-1">
                <div className="text-gray-500">Version:</div>
                <div className="text-cyan-400">InterMAX-UI v2.2.8</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">Framework:</div>
                <div className="text-cyan-400">React 18.2.0</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">API Status:</div>
                <div className={apiKey ? "text-green-400" : "text-red-400"}>
                  {apiKey ? "CONFIGURED" : "NOT CONFIGURED"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">Active Model:</div>
                <div className="text-cyan-400">{selectedModelInfo.name}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-600 text-gray-300 hover:bg-gray-600/20 transition-colors font-mono text-sm"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;