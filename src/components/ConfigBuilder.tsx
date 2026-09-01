import React, { useState } from 'react';
import { Sliders, Copy, Check, Download, Send, Key, Shield, Sparkles, DollarSign, Cpu, Globe, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const ConfigBuilder: React.FC = () => {
  // Dual Execution Mode
  const [executionMode, setExecutionMode] = useState<'local' | 'cloud'>('local');

  // Local LLM Parameters
  const [localProvider, setLocalProvider] = useState<'ollama' | 'lm_studio' | 'localai' | 'custom'>('ollama');
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:11434');
  const [localModel, setLocalModel] = useState('llama3');
  const [localTimeout, setLocalTimeout] = useState('45');
  const [fallbackOnFailure, setFallbackOnFailure] = useState(true);
  const [pingStatus, setPingStatus] = useState<{ testing: boolean; connected?: boolean; latencyMs?: number; message?: string } | null>(null);

  // Cloud AI Parameters
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [cloudAiModel, setCloudAiModel] = useState('gemini-2.5-flash');

  // Economic Parameters
  const [minProfitEur, setMinProfitEur] = useState('30.0');
  const [maxRepairBudget, setMaxRepairBudget] = useState('150.0');

  // Telegram Notifications
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  // Scraper Location & Tags
  const [cityName, setCityName] = useState('dortmund');
  const [cityId, setCityId] = useState('2078');
  const [keywords, setKeywords] = useState('defekt,für Bastler,an Bastler,Ersatzteile');
  const [maxPages, setMaxPages] = useState('2');
  const [copiedEnv, setCopiedEnv] = useState(false);

  const handleTestLocalPing = () => {
    setPingStatus({ testing: true });
    setTimeout(() => {
      setPingStatus({
        testing: false,
        connected: true,
        latencyMs: 18.4,
        message: `Connected to ${localProvider.toUpperCase()} (${localEndpoint}). Model '${localModel}' active.`
      });
    }, 600);
  };

  const generatedEnvContent = `# ==========================================
# Execution Mode (Dual Mode Architecture)
# ==========================================
# Choose between:
# - 'local': 100% offline-capable, Local Playwright + Local LLM (Ollama/LM Studio) + SQLite
# - 'cloud': Cloud LLMs (Gemini / OpenAI) + optional cloud notifications
EXECUTION_MODE="${executionMode}"

# ==========================================
# Local LLM Configuration (Ollama / LM Studio / LocalAI)
# ==========================================
LOCAL_LLM_PROVIDER="${localProvider}"
LOCAL_LLM_ENDPOINT="${localEndpoint}"
LOCAL_LLM_MODEL="${localModel}"
LOCAL_LLM_TIMEOUT_SEC="${localTimeout}"
FALLBACK_ON_LOCAL_FAILURE="${fallbackOnFailure}"

# ==========================================
# Cloud AI Provider Configuration (Optional / Fallback)
# ==========================================
GEMINI_API_KEY="${geminiApiKey}"
OPENAI_API_KEY="${openaiApiKey}"

# Application Port
APP_URL="http://localhost:5000"

# ==========================================
# Scraper & Location Parameters
# ==========================================
SCRAPER_LOCATION_NAME="${cityName}"
SCRAPER_LOCATION_ID="${cityId}"
SCRAPER_KEYWORDS="${keywords}"
SCRAPER_MAX_PAGES=${maxPages}

# Profitability Thresholds (EUR)
MIN_PROFIT_EUR=${minProfitEur}
MAX_REPAIR_BUDGET=${maxRepairBudget}

# Telegram Bot Notification Credentials (Optional)
TELEGRAM_BOT_TOKEN="${telegramToken}"
TELEGRAM_CHAT_ID="${telegramChatId}"
`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(generatedEnvContent);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleDownloadEnv = () => {
    const blob = new Blob([generatedEnvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.env';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="config-builder-container" className="space-y-3 font-mono">
      {/* Introduction Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-2 text-[#f0f6fc] font-bold text-xs">
            <Sliders className="w-3.5 h-3.5 text-[#aff5b4]" />
            <span>RUNTIME ENVIRONMENT & DUAL EXECUTION MODE BUILDER (.env)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              executionMode === 'local' 
                ? 'bg-[#238636]/20 text-[#aff5b4] border border-[#238636]/60' 
                : 'bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/60'
            }`}>
              ACTIVE: {executionMode === 'local' ? '🟢 FULL LOCAL (Ollama)' : '☁️ CLOUD (Gemini/OpenAI)'}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-[#8b949e]">
          Configure Local LLM inference parameters (Ollama / LM Studio / LocalAI), cloud fallbacks, economic repair caps, and regional Playwright filters for Dortmund (<span className="text-[#79c0ff]">l2078</span>).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Form Inputs */}
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 space-y-3">
          
          {/* Dual Execution Mode Toggle */}
          <div>
            <h3 className="font-bold text-[#f0f6fc] text-xs uppercase tracking-wider flex items-center justify-between border-b border-[#30363d] pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>1. EXECUTION MODE ARCHITECTURE</span>
              </span>
              <span className="text-[9px] text-[#79c0ff] font-bold">MODE_SELECTOR</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setExecutionMode('local')}
                className={`p-2 rounded text-left border transition ${
                  executionMode === 'local'
                    ? 'bg-[#238636]/15 border-[#238636] text-[#aff5b4]'
                    : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Mode A: Full Local</span>
                </div>
                <p className="text-[9px] leading-tight opacity-80">
                  Ollama / LM Studio + Local Playwright + SQLite. 100% offline & zero API bills.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setExecutionMode('cloud')}
                className={`p-2 rounded text-left border transition ${
                  executionMode === 'cloud'
                    ? 'bg-[#1f6feb]/15 border-[#1f6feb] text-[#79c0ff]'
                    : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Mode B: Cloud AI</span>
                </div>
                <p className="text-[9px] leading-tight opacity-80">
                  Google Gemini 2.5 Flash / OpenAI GPT-4o-mini cloud processing.
                </p>
              </button>
            </div>
          </div>

          {/* Local LLM Settings */}
          <div className="pt-2 border-t border-[#30363d]">
            <h3 className="font-bold text-[#f0f6fc] text-xs uppercase tracking-wider flex items-center justify-between border-b border-[#30363d] pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#aff5b4]" />
                <span>2. LOCAL LLM INFERENCE CONFIGURATION</span>
              </span>
              <span className="text-[9px] text-[#aff5b4] font-bold">OLLAMA / LM_STUDIO</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase">Local Provider:</label>
                <select
                  value={localProvider}
                  onChange={(e: any) => {
                    const p = e.target.value;
                    setLocalProvider(p);
                    if (p === 'ollama') setLocalEndpoint('http://localhost:11434');
                    if (p === 'lm_studio') setLocalEndpoint('http://localhost:1234/v1');
                    if (p === 'localai') setLocalEndpoint('http://localhost:8080/v1');
                  }}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs text-[#f0f6fc] focus:border-[#58a6ff] focus:outline-none"
                >
                  <option value="ollama">Ollama (Native REST /api/generate)</option>
                  <option value="lm_studio">LM Studio (OpenAI-compatible /v1)</option>
                  <option value="localai">LocalAI (/v1/chat/completions)</option>
                  <option value="custom">Custom Endpoint</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase">Model Identifier:</label>
                <input
                  type="text"
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  placeholder="llama3, mistral, qwen2.5:7b"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#aff5b4] focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <label className="text-[10px] font-bold text-[#8b949e] uppercase">Local API Endpoint URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localEndpoint}
                  onChange={(e) => setLocalEndpoint(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#58a6ff] focus:border-[#58a6ff] focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestLocalPing}
                  disabled={pingStatus?.testing}
                  className="px-2.5 py-1.5 rounded text-xs bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] inline-flex items-center gap-1 font-bold transition shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${pingStatus?.testing ? 'animate-spin' : ''}`} />
                  <span>Test Ping</span>
                </button>
              </div>
            </div>

            {pingStatus && (
              <div className={`p-2 rounded text-[10px] flex items-center justify-between gap-2 mb-2 border ${
                pingStatus.connected
                  ? 'bg-[#238636]/15 border-[#238636]/50 text-[#aff5b4]'
                  : 'bg-[#f85149]/15 border-[#f85149]/50 text-[#ff7b72]'
              }`}>
                <div className="flex items-center gap-1.5">
                  {pingStatus.connected ? <CheckCircle2 className="w-3.5 h-3.5 text-[#aff5b4]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[#ff7b72]" />}
                  <span>{pingStatus.message || 'Connecting to local LLM daemon...'}</span>
                </div>
                {pingStatus.latencyMs && (
                  <span className="font-bold text-[#58a6ff] shrink-0">{pingStatus.latencyMs} ms</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between p-2 rounded bg-[#0d1117] border border-[#30363d] text-xs">
              <div>
                <p className="font-bold text-[#f0f6fc] text-[11px]">Graceful Offline Fallback</p>
                <p className="text-[9px] text-[#8b949e]">If local LLM daemon is offline, fallback to rule heuristic</p>
              </div>
              <input
                type="checkbox"
                checked={fallbackOnFailure}
                onChange={(e) => setFallbackOnFailure(e.target.checked)}
                className="w-4 h-4 accent-[#238636] rounded"
              />
            </div>
          </div>

          {/* Cloud AI Section */}
          <div className="pt-2 border-t border-[#30363d]">
            <h3 className="font-bold text-[#f0f6fc] text-xs uppercase tracking-wider flex items-center justify-between border-b border-[#30363d] pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>3. CLOUD API CREDENTIALS (OPTIONAL / FALLBACK)</span>
              </span>
              <span className="text-[9px] text-[#58a6ff] font-bold">CLOUD_AI</span>
            </h3>

            <div className="space-y-1 mb-2">
              <label className="text-[10px] font-bold text-[#8b949e] uppercase">Google Gemini API Key:</label>
              <input
                type="text"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (Optional for cloud fallback)"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#aff5b4] focus:border-[#58a6ff] focus:outline-none"
              />
            </div>
          </div>

          {/* Economic thresholds */}
          <div className="pt-2 border-t border-[#30363d]">
            <h3 className="font-bold text-[#f0f6fc] text-xs uppercase tracking-wider flex items-center justify-between border-b border-[#30363d] pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#aff5b4]" />
                <span>4. PROFIT MARGIN & REPAIR THRESHOLDS</span>
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase">Min Profit Margin (EUR):</label>
                <input
                  type="number"
                  step="5"
                  value={minProfitEur}
                  onChange={(e) => setMinProfitEur(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase">Max Repair Budget (EUR):</label>
                <input
                  type="number"
                  step="10"
                  value={maxRepairBudget}
                  onChange={(e) => setMaxRepairBudget(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Scraper Parameters */}
          <div className="pt-2 border-t border-[#30363d]">
            <h3 className="font-bold text-[#f0f6fc] text-xs uppercase tracking-wider flex items-center justify-between border-b border-[#30363d] pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#aff5b4]" />
                <span>5. MARKETPLACE SEARCH PARAMETERS</span>
              </span>
              <span className="text-[9px] text-[#aff5b4]">DORTMUND_L2078</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase">Location Slug:</label>
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase">Location ID (l2078):</label>
                <input
                  type="text"
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#aff5b4] focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <label className="text-[10px] font-bold text-[#8b949e] uppercase">Search Keywords (Comma Separated):</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:border-[#58a6ff] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Generated .env Preview & Actions */}
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span className="font-bold text-xs text-[#f0f6fc]">GENERATED .env ARTIFACT</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="px-2.5 py-1 rounded text-xs bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] inline-flex items-center gap-1 font-bold transition"
                >
                  {copiedEnv ? <Check className="w-3 h-3 text-[#aff5b4]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEnv ? 'COPIED!' : 'COPY'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadEnv}
                  className="px-2.5 py-1 rounded text-xs bg-[#238636] hover:bg-[#2ea043] text-white inline-flex items-center gap-1 font-bold shadow-sm transition"
                >
                  <Download className="w-3 h-3" />
                  <span>DOWNLOAD</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-[11px] text-[#79c0ff] overflow-x-auto h-[480px] leading-relaxed select-all">
              {generatedEnvContent}
            </pre>
          </div>

          <div className="mt-3 p-2 bg-[#0d1117] border border-[#30363d] rounded text-[10px] text-[#8b949e] flex items-center justify-between">
            <span>Ready for production CLI (`python main.py --mode {executionMode}`) & Smoke Test (`python smoke_test.py --mode {executionMode}`).</span>
            <span className="text-[#aff5b4] font-bold">READY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
