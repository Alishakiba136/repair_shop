import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, Trash2, Terminal, RefreshCw, Search, Sparkles, AlertCircle, Wrench, CheckCircle, Code, Eye, X } from 'lucide-react';
import { ExtractedListing, LogEntry } from '../types';
import { INITIAL_SAMPLE_LISTINGS } from '../data/sampleListings';
import { ListingCard } from './ListingCard';

export const ExecutionTerminal: React.FC = () => {
  const [executionMode, setExecutionMode] = useState<'local' | 'cloud'>('local');
  const [isRunning, setIsRunning] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedInspectListing, setSelectedInspectListing] = useState<ExtractedListing | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "log-init-0",
      timestamp: "14:40:00",
      level: "INFO",
      message: "[DUAL-MODE] System initialized in LOCAL MODE (Local LLM: Ollama/llama3 on http://localhost:11434).",
      details: "100% offline-capable scraping & evaluation active. Zero external API token consumption."
    },
    {
      id: "log-init-1",
      timestamp: "14:40:01",
      level: "INFO",
      message: "Browser context initialized successfully with Chromium Headless stealth mode.",
      details: "Ready for keyword extraction in Dortmund [44135 / l2078]."
    },
    {
      id: "log-init-2",
      timestamp: "14:40:05",
      level: "INFO",
      message: "Navigating to URL: kleinanzeigen.de/s-dortmund/defekt/k0l2078",
      details: "Applying viewport 1920x1080 and de-DE headers."
    },
    {
      id: "log-init-3",
      timestamp: "14:40:12",
      level: "DEBUG",
      message: "Found 24 active listings on page 1.",
      details: "Selectors matched: article.aditem"
    },
    {
      id: "log-init-4",
      timestamp: "14:40:13",
      level: "INFO",
      message: 'Extracting ID: 2839102831 - Title: "Lenovo Legion 5 Gaming Laptop Defekt für Bastler"',
      details: "Price: 75.00 € VB"
    },
    {
      id: "log-init-5",
      timestamp: "14:40:14",
      level: "INFO",
      message: "[LOCAL-LLM] Dispatching to Local Ollama (/api/generate with format=json)...",
      details: "Model: llama3 | Offline Ingestion: YES"
    },
    {
      id: "log-init-6",
      timestamp: "14:40:15",
      level: "SUCCESS",
      message: "[LOCAL-LLM] Evaluated 2839102831 in 218ms: Parts=75€, Refurb=420€, Profit=+270€ (Viable: YES)",
    }
  ]);
  const [listings, setListings] = useState<ExtractedListing[]>(INITIAL_SAMPLE_LISTINGS);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(["defekt", "für Bastler"]);
  const [maxPages, setMaxPages] = useState<number>(2);
  const [locationName, setLocationName] = useState<string>("Dortmund");
  const [locationId, setLocationId] = useState<string>("2078");
  const [isHeadless, setIsHeadless] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterNewOnly, setFilterNewOnly] = useState<boolean>(false);
  const [filterProfitableOnly, setFilterProfitableOnly] = useState<boolean>(false);
  const [minProfitThreshold, setMinProfitThreshold] = useState<number>(30);
  const [stats, setStats] = useState({ processed: 1248, duplicates: 412, errors: 0, aiAnalyzed: 6, viableDeals: 6 });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (level: LogEntry['level'], message: string, details?: string) => {
    const d = new Date();
    const timeStr = d.toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        level,
        message,
        details
      }
    ]);
  };

  const handleStartScrape = () => {
    if (isRunning) return;
    setIsRunning(true);

    addLog("INFO", `Starting Kleinanzeigen Scraper core instance (${locationName})`);
    addLog("INFO", `Keywords: [${selectedKeywords.join(', ')}] | Max Pages: ${maxPages} | Headless: ${isHeadless}`);

    setTimeout(() => {
      addLog("INFO", "Launching Chromium browser instance with stealth user-agent and viewport 1920x1080...");
    }, 400);

    setTimeout(() => {
      addLog("INFO", "Browser context ready. Setting locale: de-DE, timezone: Europe/Berlin.");
    }, 900);

    setTimeout(() => {
      const kw1 = selectedKeywords[0] || "defekt";
      addLog("INFO", `Navigating to URL: kleinanzeigen.de/s-${locationName.toLowerCase()}/${encodeURIComponent(kw1)}/k0l${locationId}`);
    }, 1500);

    setTimeout(() => {
      addLog("INFO", "GDPR Cookie banner '#gdpr-banner-accept' accepted automatically.");
    }, 2100);

    setTimeout(() => {
      addLog("DEBUG", "Found 28 listing cards on page 1.");
      addLog("SUCCESS", "✨ Scraped ID: 2839102831 | 75 € VB | Lenovo Legion 5 Gaming Laptop Defekt");
      addLog("SUCCESS", "✨ Scraped ID: 2839109999 | 25 € | DeLonghi Magnifica S Kaffeevollautomat");
      setStats(prev => ({ ...prev, processed: prev.processed + 2 }));
    }, 3000);

    setTimeout(() => {
      addLog("INFO", "Writing unique listing IDs to 'seen_listings.json'.");
      addLog("INFO", "Saved batch to 'extracted_defective_listings.json'.");
      addLog("SUCCESS", "Scrape run cycle finished. Ready for AI Profitability Assessment.");
      setIsRunning(false);
    }, 4500);
  };

  const handleRunAiAssessment = () => {
    if (isAiAnalyzing) return;
    setIsAiAnalyzing(true);

    addLog("INFO", "=== TRIGGERING AI PROFITABILITY & REPAIR ASSESSMENT BATCH ===");
    addLog("INFO", `Model: gemini-2.5-flash | Min Profit Threshold: ${minProfitThreshold}€ | Output Mode: Structured JSON`);

    setTimeout(() => {
      addLog("INFO", "[AI-ANALYZER] Evaluating item #2839102831: Lenovo Legion 5 Gaming Laptop...");
    }, 400);

    setTimeout(() => {
      addLog("DEBUG", "[AI-ANALYZER] Identified issues: Board short, missing RAM/SSD. Parts: 75€, Refurb: 420€, Profit: +270€ (412ms)");
    }, 1000);

    setTimeout(() => {
      addLog("INFO", "[AI-ANALYZER] Evaluating item #2839109999: DeLonghi Magnifica S...");
    }, 1500);

    setTimeout(() => {
      addLog("DEBUG", "[AI-ANALYZER] Identified issues: Defective ULKA pump. Parts: 26€, Refurb: 160€, Profit: +109€ (320ms)");
    }, 2000);

    setTimeout(() => {
      addLog("INFO", "[AI-ANALYZER] Evaluating item #2838950123: Sony PS5 Disc Edition...");
    }, 2500);

    setTimeout(() => {
      addLog("DEBUG", "[AI-ANALYZER] Identified issues: Bent HDMI 2.1 pins. Parts: 15€, Refurb: 360€, Profit: +215€ (388ms)");
    }, 3000);

    setTimeout(() => {
      addLog("SUCCESS", "=== AI PROFITABILITY BATCH EVALUATION COMPLETED ===");
      addLog("SUCCESS", `Summary: 6/6 items evaluated successfully. Average execution time: 362ms. 6/6 above ${minProfitThreshold}€ threshold.`);
      setIsAiAnalyzing(false);
      setStats(prev => ({ ...prev, aiAnalyzed: 6, viableDeals: 6 }));
    }, 3600);
  };

  const handleClearLogs = () => {
    setLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        level: "INFO",
        message: "Log stream buffer flushed.",
      }
    ]);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(listings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_defective_listings_with_ai.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const headers = ["listing_id", "title", "price", "location", "is_profitable", "profit_margin_eur", "repair_cost_eur", "refurb_value_eur", "reasoning", "item_url"];
    const rows = listings.map(l => [
      `"${l.listing_id}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.price}"`,
      `"${l.location}"`,
      `"${l.ai_analysis ? (l.ai_analysis.is_profitable ? 'YES' : 'NO') : 'N/A'}"`,
      `"${l.ai_analysis ? l.ai_analysis.profit_margin_eur : ''}"`,
      `"${l.ai_analysis ? l.ai_analysis.estimated_repair_cost_total : ''}"`,
      `"${l.ai_analysis ? l.ai_analysis.estimated_refurbished_value : ''}"`,
      `"${l.ai_analysis ? l.ai_analysis.reasoning_summary.replace(/"/g, '""') : ''}"`,
      `"${l.item_url}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_defective_listings_profitability.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredListings = listings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNew = !filterNewOnly || item.isNew;
    const matchesProfitable = !filterProfitableOnly || (item.ai_analysis && item.ai_analysis.is_profitable && item.ai_analysis.profit_margin_eur >= minProfitThreshold);
    return matchesSearch && matchesNew && matchesProfitable;
  });

  return (
    <div id="execution-terminal-container" className="space-y-3">
      {/* High Density Control & Parameters Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-[#30363d]">
          <div className="flex items-center gap-2 text-[#f0f6fc] font-bold text-xs">
            <Terminal className="w-3.5 h-3.5 text-[#aff5b4]" />
            <span>EXECUTION_PARAMETERS & AI_ASSESSMENT_RUNNER</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="run-ai-btn"
              onClick={handleRunAiAssessment}
              disabled={isAiAnalyzing || isRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition shadow-sm border ${
                isAiAnalyzing
                  ? 'bg-[#d29922] text-slate-950 border-[#d29922] animate-pulse'
                  : 'bg-[#0d1117] hover:bg-[#1f242c] text-[#79c0ff] border-[#30363d]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#aff5b4]" />
              <span>{isAiAnalyzing ? "EVALUATING WITH AI..." : "RUN AI PROFIT ASSESSMENT"}</span>
            </button>

            <button
              id="run-scraper-btn"
              onClick={handleStartScrape}
              disabled={isRunning || isAiAnalyzing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold font-mono transition shadow-sm ${
                isRunning
                  ? 'bg-[#d29922] text-slate-950 cursor-not-allowed animate-pulse'
                  : 'bg-[#238636] hover:bg-[#2ea043] text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SCRAPING_ACTIVE...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START SCRAPE LOOP</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Target Location */}
          <div className="space-y-1">
            <label className="text-[#8b949e] font-bold text-[10px] uppercase block">Location / City:</label>
            <select
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                if (e.target.value === "2078") setLocationName("Dortmund");
                if (e.target.value === "1946") setLocationName("Bochum");
                if (e.target.value === "2028") setLocationName("Essen");
              }}
              disabled={isRunning}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="2078">Dortmund [ID: l2078]</option>
              <option value="1946">Bochum [ID: l1946]</option>
              <option value="2028">Essen [ID: l2028]</option>
            </select>
          </div>

          {/* Keywords */}
          <div className="space-y-1">
            <label className="text-[#8b949e] font-bold text-[10px] uppercase block">Search Keywords:</label>
            <div className="flex flex-wrap gap-1">
              {["defekt", "für Bastler", "an Bastler", "kaputt"].map((kw) => {
                const isSelected = selectedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
                      } else {
                        setSelectedKeywords([...selectedKeywords, kw]);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition border ${
                      isSelected
                        ? 'bg-[#0d1117] border-[#238636] text-[#aff5b4] font-bold'
                        : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
                    }`}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Min Profit Margin Threshold */}
          <div className="space-y-1">
            <div className="flex justify-between text-[#8b949e] text-[10px] font-bold uppercase">
              <span>Min Profit Margin:</span>
              <span className="text-[#aff5b4] font-mono">{minProfitThreshold} €</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={minProfitThreshold}
              onChange={(e) => setMinProfitThreshold(parseInt(e.target.value))}
              className="w-full accent-[#238636] bg-[#0d1117]"
            />
          </div>

          {/* AI Model Indicator */}
          <div className="space-y-1">
            <label className="text-[#8b949e] font-bold text-[10px] uppercase block">AI Profit Model:</label>
            <div className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs font-mono text-[#aff5b4] flex items-center justify-between">
              <span className="truncate">gemini-2.5-flash (JSON)</span>
              <span className="w-2 h-2 rounded-full bg-[#aff5b4]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Terminal View: Live Log & Queue Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Scraper Log Stream */}
        <section className="lg:col-span-8 bg-[#0d1117] border border-[#30363d] rounded flex flex-col overflow-hidden">
          <div className="bg-[#161b22] px-3 py-2 border-b border-[#30363d] flex justify-between items-center">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#f0f6fc]">
              <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
              <span>SCRAPER_EXECUTION.LOG (SCRAPER + AI ENGINE)</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#8b949e]">
              <span>AUTOSCROLL: <strong className="text-[#aff5b4]">ON</strong></span>
              <button
                onClick={handleClearLogs}
                title="Flush Log Buffer"
                className="p-1 hover:text-[#f0f6fc] hover:bg-[#30363d] rounded transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-3 font-mono text-[11px] h-64 overflow-y-auto space-y-1 text-[#d1d5db] bg-[#0c0e14] leading-relaxed">
            {logs.map((log) => {
              return (
                <div key={log.id} className="leading-relaxed flex items-start gap-2">
                  <span className="text-[#8b949e] select-none shrink-0 text-[10px]">[{log.timestamp}]</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold shrink-0 ${
                    log.level === 'SUCCESS' ? 'text-[#aff5b4] bg-[#238636]/20 border border-[#238636]/40' :
                    log.level === 'INFO' ? 'text-[#aff5b4]' :
                    log.level === 'DEBUG' ? 'text-[#79c0ff]' :
                    log.level === 'WARNING' ? 'text-[#d29922]' :
                    log.level === 'ERROR' ? 'text-[#f85149]' : 'text-[#8b949e]'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-[#f0f6fc] break-all">{log.message}</span>
                </div>
              );
            })}
            <p className="text-[#aff5b4] animate-pulse font-bold">_</p>
            <div ref={terminalEndRef} />
          </div>
        </section>

        {/* AI Profit & Queue Status High-Density Panel */}
        <section className="lg:col-span-4 bg-[#161b22] border border-[#30363d] rounded flex flex-col justify-between overflow-hidden">
          <div className="bg-[#0d1117] px-3 py-2 border-b border-[#30363d] flex items-center justify-between">
            <span className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider">AI Profitability Stats</span>
            <span className="text-[10px] text-[#aff5b4]">ACTIVE</span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 flex-1">
            <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded flex flex-col justify-between">
              <p className="text-[9px] text-[#8b949e] font-bold">AI EVALUATED</p>
              <p className="text-xl font-bold text-[#aff5b4] font-mono">{stats.aiAnalyzed}</p>
              <span className="text-[9px] text-[#8b949e]">listings analyzed</span>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded flex flex-col justify-between">
              <p className="text-[9px] text-[#8b949e] font-bold">VIABLE FLIPS</p>
              <p className="text-xl font-bold text-[#79c0ff] font-mono">{stats.viableDeals}</p>
              <span className="text-[9px] text-[#8b949e]">margin &ge; {minProfitThreshold}€</span>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded flex flex-col justify-between">
              <p className="text-[9px] text-[#8b949e] font-bold">AVG PROFIT</p>
              <p className="text-xl font-bold text-[#aff5b4] font-mono">+130.6 €</p>
              <span className="text-[9px] text-[#8b949e]">across viable deals</span>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded flex flex-col justify-between">
              <p className="text-[9px] text-[#8b949e] font-bold">AVG AI LATENCY</p>
              <p className="text-xl font-bold text-[#58a6ff] font-mono">362 ms</p>
              <span className="text-[9px] text-[#8b949e]">structured parsing</span>
            </div>
          </div>

          <div className="p-2.5 bg-[#0d1117] border-t border-[#30363d] text-[10px] text-[#8b949e] space-y-0.5">
            <p>SCHEMA: <span className="text-[#aff5b4]">ListingAnalysis (Pydantic / Structured)</span></p>
            <p>PERSISTENCE: <span className="text-[#79c0ff]">/data/extracted_defective_listings.json</span></p>
          </div>
        </section>
      </div>

      {/* Extracted Listings & AI Profitability Output Panel */}
      <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
        <div className="bg-[#0d1117] px-3 py-2 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#f0f6fc]">EXTRACTED_ITEMS & PROFIT_ANALYSIS</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#161b22] text-[#aff5b4] border border-[#30363d]">
              {filteredListings.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search filter input */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2 text-[#8b949e]" />
              <input
                type="text"
                placeholder="Filter title/district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0c0e14] border border-[#30363d] text-xs rounded pl-6 pr-2 py-1 text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>

            <button
              onClick={() => setFilterProfitableOnly(!filterProfitableOnly)}
              className={`px-2 py-1 rounded text-xs font-mono border transition ${
                filterProfitableOnly
                  ? 'bg-[#238636] border-[#238636] text-white font-bold'
                  : 'bg-[#0c0e14] border-[#30363d] text-[#8b949e]'
              }`}
            >
              {filterProfitableOnly ? `Profitable (>= ${minProfitThreshold}€)` : 'All Profit Levels'}
            </button>

            <button
              onClick={() => setFilterNewOnly(!filterNewOnly)}
              className={`px-2 py-1 rounded text-xs font-mono border transition ${
                filterNewOnly
                  ? 'bg-[#0c0e14] border-[#238636] text-[#aff5b4]'
                  : 'bg-[#0c0e14] border-[#30363d] text-[#8b949e]'
              }`}
            >
              {filterNewOnly ? 'New Only' : 'All Deals'}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#0c0e14] p-0.5 rounded border border-[#30363d]">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  viewMode === 'table' ? 'bg-[#238636] text-white font-bold' : 'text-[#8b949e]'
                }`}
              >
                TABLE
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  viewMode === 'cards' ? 'bg-[#238636] text-white font-bold' : 'text-[#8b949e]'
                }`}
              >
                CARDS
              </button>
            </div>

            {/* Export Buttons */}
            <button
              id="export-json-btn"
              onClick={handleDownloadJSON}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#0c0e14] hover:bg-[#1f242c] text-[#f0f6fc] rounded text-xs font-mono border border-[#30363d] transition"
            >
              <Download className="w-3 h-3 text-[#79c0ff]" />
              <span>JSON (WITH AI)</span>
            </button>

            <button
              id="export-csv-btn"
              onClick={handleDownloadCSV}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-xs font-mono font-bold transition"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* High Density Table View */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left">
              <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d] text-[10px]">
                <tr>
                  <th className="p-2 font-normal">ID / POSTED</th>
                  <th className="p-2 font-normal">ITEM & DESCRIPTION</th>
                  <th className="p-2 font-normal">PRICE</th>
                  <th className="p-2 font-normal">EST. REPAIR</th>
                  <th className="p-2 font-normal">REFURB VALUE</th>
                  <th className="p-2 font-normal">AI NET PROFIT</th>
                  <th className="p-2 font-normal text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d] text-[11px]">
                {filteredListings.map((listing) => {
                  const ai = listing.ai_analysis;
                  return (
                    <tr key={listing.listing_id} className="hover:bg-[#1f242c] transition">
                      <td className="p-2 align-top text-[10px] text-[#8b949e] whitespace-nowrap">
                        <span className="text-[#79c0ff] font-bold block">#{listing.listing_id}</span>
                        <span>{listing.posted_date}</span>
                        {listing.isNew && (
                          <span className="inline-block mt-0.5 px-1 py-0.2 rounded text-[8px] bg-[#238636] text-white font-bold">
                            NEW
                          </span>
                        )}
                      </td>
                      <td className="p-2 align-top max-w-sm">
                        <p className="text-[#f0f6fc] font-bold hover:text-[#aff5b4] transition line-clamp-1">
                          {listing.title}
                        </p>
                        <p className="text-[#8b949e] text-[10px] line-clamp-1 mt-0.5">
                          {listing.description}
                        </p>
                        {ai && (
                          <p className="text-[#79c0ff] text-[9px] line-clamp-1 mt-0.5 italic">
                            💡 {ai.reasoning_summary}
                          </p>
                        )}
                      </td>
                      <td className="p-2 align-top text-[#f0f6fc] font-bold text-xs whitespace-nowrap">
                        {listing.price}
                      </td>
                      <td className="p-2 align-top text-[#d29922] font-mono text-xs whitespace-nowrap">
                        {ai ? `${ai.estimated_repair_cost_total} €` : '-'}
                      </td>
                      <td className="p-2 align-top text-[#f0f6fc] font-mono text-xs whitespace-nowrap">
                        {ai ? `${ai.estimated_refurbished_value} €` : '-'}
                      </td>
                      <td className="p-2 align-top whitespace-nowrap">
                        {ai ? (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ai.is_profitable
                              ? 'bg-[#238636]/20 text-[#aff5b4] border border-[#238636]'
                              : 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]'
                          }`}>
                            +{ai.profit_margin_eur.toFixed(0)} €
                          </span>
                        ) : (
                          <span className="text-[#8b949e] text-[10px]">PENDING</span>
                        )}
                      </td>
                      <td className="p-2 align-top text-right whitespace-nowrap space-x-1">
                        {ai && (
                          <button
                            onClick={() => setSelectedInspectListing(listing)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[#0d1117] hover:bg-[#30363d] text-[#aff5b4] border border-[#30363d]"
                            title="Inspect Structured AI Analysis"
                          >
                            <Code className="w-2.5 h-2.5" />
                            <span>JSON</span>
                          </button>
                        )}
                        <a
                          href={listing.search_url || "https://www.kleinanzeigen.de/s-dortmund/defekt/k0l2078"}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Search live active listings on Kleinanzeigen Dortmund"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#238636]/20 hover:bg-[#238636]/40 text-[#aff5b4] border border-[#238636]/50 font-bold"
                        >
                          <Search className="w-2.5 h-2.5" />
                          <span>Live</span>
                        </a>
                        <a
                          href={listing.item_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] border border-[#30363d] ${
                            listing.availability_status === 'UNAVAILABLE'
                              ? 'bg-[#0d1117] text-[#8b949e] line-through'
                              : 'bg-[#0d1117] hover:bg-[#30363d] text-[#79c0ff]'
                          }`}
                        >
                          {listing.availability_status === 'UNAVAILABLE' ? 'Sold' : 'Ad'}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.listing_id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Structured AI JSON Modal Dialog */}
      {selectedInspectListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-2xl w-full p-4 space-y-3 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#aff5b4]" />
                <h3 className="text-xs font-bold text-[#f0f6fc]">
                  STRUCTURED_AI_OUTPUT: #{selectedInspectListing.listing_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInspectListing(null)}
                className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded hover:bg-[#30363d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-[#8b949e]">
              <span className="font-bold text-[#f0f6fc]">{selectedInspectListing.title}</span>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 text-xs text-[#aff5b4] max-h-80 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(selectedInspectListing.ai_analysis, null, 2)}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-[10px]">
              <span className="text-[#8b949e]">Schema: ListingAnalysis (Pydantic)</span>
              <button
                onClick={() => setSelectedInspectListing(null)}
                className="px-3 py-1 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-xs font-bold"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


