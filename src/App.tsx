import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileCode,
  Terminal,
  ShieldCheck,
  Sliders,
  ExternalLink,
  MapPin,
  CheckCircle,
  Activity,
  Cpu,
  Database,
  Radio,
  Users
} from 'lucide-react';
import { FileViewer } from './components/FileViewer';
import { ExecutionTerminal } from './components/ExecutionTerminal';
import { TestRunner } from './components/TestRunner';
import { ConfigBuilder } from './components/ConfigBuilder';
import { WebAppSimulation } from './components/WebAppSimulation';

type ActiveTab = 'webapp' | 'files' | 'terminal' | 'tests' | 'config';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('webapp');
  const [uptimeSeconds, setUptimeSeconds] = useState(15240);
  const [systemTime, setSystemTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
      setSystemTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#d1d5db] font-mono flex flex-col selection:bg-[#238636] selection:text-white">
      {/* High Density Terminal Header */}
      <header className="sticky top-0 z-50 bg-[#161b22]/95 backdrop-blur border-b border-[#2d333b] px-3 py-2 sm:px-4">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & PID */}
          <div className="flex items-center gap-3">
            <div className="bg-[#238636] text-white px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ONLINE
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-sm font-bold tracking-tight text-[#f0f6fc]">
                KLEINANZEIGEN_FLIP_CORE <span className="text-[#58a6ff] text-xs">v5.0</span>
              </h1>
              <span className="text-[#8b949e] text-xs">
                Flask &bull; SQLite &bull; Multi-User &bull; Dortmund [<span className="text-[#aff5b4]">l2078</span>]
              </span>
            </div>
          </div>

          {/* Telemetry Status Right */}
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right hidden sm:block">
              <p className="text-[#8b949e] text-[10px]">WEB_SERVER</p>
              <p className="text-[#58a6ff] font-bold">PORT 5000 (WSGI)</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[#8b949e] text-[10px]">UPTIME</p>
              <p className="text-[#aff5b4] font-bold">{formatUptime(uptimeSeconds)}</p>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-[#0d1117] p-1 rounded border border-[#30363d]">
              <button
                id="nav-webapp"
                onClick={() => setActiveTab('webapp')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                  activeTab === 'webapp'
                    ? 'bg-[#238636] text-white font-bold'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Web App UI</span>
              </button>

              <button
                id="nav-files"
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                  activeTab === 'files'
                    ? 'bg-[#238636] text-white font-bold'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Python Source</span>
              </button>

              <button
                id="nav-terminal"
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                  activeTab === 'terminal'
                    ? 'bg-[#238636] text-white font-bold'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Worker & Logs</span>
              </button>

              <button
                id="nav-tests"
                onClick={() => setActiveTab('tests')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                  activeTab === 'tests'
                    ? 'bg-[#238636] text-white font-bold'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pytest Suite</span>
              </button>

              <button
                id="nav-config"
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                  activeTab === 'config'
                    ? 'bg-[#238636] text-white font-bold'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Env Builder</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 space-y-3">
        {/* High Density Telemetry & Environment Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Environment Parameters */}
          <section className="md:col-span-4 bg-[#161b22] border border-[#30363d] rounded p-3">
            <h2 className="text-[#f0f6fc] text-xs font-bold mb-2 uppercase tracking-widest border-b border-[#30363d] pb-1 flex items-center justify-between">
              <span>Flask & DB Architecture</span>
              <span className="text-[#aff5b4] text-[10px]">SQLITE ACTIVE</span>
            </h2>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8b949e]">WEB FRAMEWORK:</span>
                <span className="text-[#79c0ff]">Flask 3.0 + Jinja2 + Flask-Login</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b949e]">DATABASE ENGINE:</span>
                <span className="text-[#79c0ff]">SQLite / SQLAlchemy (instance/scraper_webapp.db)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b949e]">SCRAPER RUNNER:</span>
                <span className="text-[#d29922]">Playwright (Async Background Thread)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b949e]">AI EVAL ENGINE:</span>
                <span className="text-[#aff5b4]">Google Gemini (Pydantic Schema)</span>
              </div>
            </div>
          </section>

          {/* Multi-Tenant Features */}
          <section className="md:col-span-4 bg-[#161b22] border border-[#30363d] rounded p-3 flex flex-col justify-between">
            <div>
              <h2 className="text-[#f0f6fc] text-xs font-bold mb-2 uppercase tracking-widest border-b border-[#30363d] pb-1 flex items-center justify-between">
                <span>Multi-User Config Scope</span>
                <span className="text-[#8b949e] text-[10px]">USER ISOLATED</span>
              </h2>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="bg-[#0d1117] border border-[#30363d] px-2 py-0.5 rounded text-[10px] text-[#aff5b4]">Custom Telegram Token & Chat ID</span>
                <span className="bg-[#0d1117] border border-[#30363d] px-2 py-0.5 rounded text-[10px] text-[#aff5b4]">AI Model & Key</span>
                <span className="bg-[#0d1117] border border-[#30363d] px-2 py-0.5 rounded text-[10px] text-[#aff5b4]">Keywords & Search Tags</span>
                <span className="bg-[#0d1117] border border-[#30363d] px-2 py-0.5 rounded text-[10px] text-[#aff5b4]">Min Profit Threshold (EUR)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8b949e] pt-2 border-t border-[#30363d] mt-2 flex justify-between">
              <span>LOG_TRACE:</span>
              <span className="text-[#79c0ff]">web_app_execution.log</span>
            </div>
          </section>

          {/* Live Telemetry */}
          <section className="md:col-span-4 bg-[#161b22] border border-[#30363d] rounded p-3">
            <h2 className="text-[#f0f6fc] text-xs font-bold mb-2 uppercase tracking-widest border-b border-[#30363d] pb-1 flex items-center justify-between">
              <span>Worker State</span>
              <span className="text-[#58a6ff] text-[10px]">READY</span>
            </h2>
            <div className="space-y-2 text-[11px]">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#8b949e]">THREAD POOL ALLOCATION</span>
                  <span className="text-[#aff5b4]">4 Workers Available</span>
                </div>
                <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden border border-[#30363d]">
                  <div className="bg-[#238636] h-full w-[25%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#8b949e]">SQLITE TRANSACTION LOCKS</span>
                  <span className="text-[#aff5b4]">0 Active Locks (WAL Mode)</span>
                </div>
                <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden border border-[#30363d]">
                  <div className="bg-[#238636] h-full w-[10%] rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px]">
                <span className="text-[#8b949e]">TELEGRAM DISPATCHER:</span>
                <span className="text-[#aff5b4] font-bold">READY (Async HTTPS Post)</span>
              </div>
            </div>
          </section>
        </div>

        {/* Tab Content View */}
        {activeTab === 'webapp' && <WebAppSimulation />}
        {activeTab === 'files' && <FileViewer />}
        {activeTab === 'terminal' && <ExecutionTerminal />}
        {activeTab === 'tests' && <TestRunner />}
        {activeTab === 'config' && <ConfigBuilder />}
      </main>

      {/* High Density Terminal Footer */}
      <footer className="bg-[#0d1117] border-t border-[#30363d] px-4 py-2 mt-4 text-[10px] text-[#8b949e]">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span><strong className="text-[#f0f6fc]">WEB_SERVER:</strong> Flask v3.0 (Python 3.11)</span>
            <span><strong className="text-[#f0f6fc]">DB:</strong> SQLite / SQLAlchemy 2.0</span>
            <span><strong className="text-[#f0f6fc]">SCRAPER:</strong> Playwright Async Worker</span>
            <span><strong className="text-[#f0f6fc]">AI_ENGINE:</strong> Google Gemini 2.5 Flash</span>
          </div>
          <div>
            System Clock: <span className="text-[#58a6ff] font-bold">{systemTime}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

