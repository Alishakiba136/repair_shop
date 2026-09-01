import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, FileText, Terminal, ShieldCheck, Info } from 'lucide-react';
import { PROJECT_FILES } from '../data/projectFiles';
import { ProjectFile } from '../types';

export const FileViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="file-viewer-container" className="space-y-3">
      {/* File Selection Tabs */}
      <div className="bg-[#161b22] border border-[#30363d] rounded p-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2 pb-1.5 border-b border-[#30363d]">
          <div className="flex items-center gap-2 text-[#f0f6fc] font-bold text-xs">
            <FileCode className="w-3.5 h-3.5 text-[#aff5b4]" />
            <span>PROJECT_DELIVERABLES & SOURCE_FILES</span>
          </div>
          <span className="text-[10px] text-[#8b949e]">
            6 FILES READY • UTF-8 • PYTHON 3.11
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {PROJECT_FILES.map((file) => {
            const isActive = activeFile.filename === file.filename;
            return (
              <button
                key={file.filename}
                id={`tab-${file.filename.replace('.', '-')}`}
                onClick={() => setActiveFile(file)}
                className={`flex flex-col text-left p-2 rounded transition-all text-xs font-mono border ${
                  isActive
                    ? 'bg-[#0d1117] border-[#238636] text-[#aff5b4]'
                    : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:bg-[#1f242c] hover:text-[#f0f6fc]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="font-bold truncate text-[11px]">{file.filename}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#aff5b4] animate-pulse" />}
                </div>
                <span className="text-[9px] text-[#8b949e] truncate">{file.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active File Header and Actions */}
      <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
        <div className="bg-[#0d1117] px-3 py-2 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-[#161b22] text-[#aff5b4] rounded border border-[#30363d]">
              {activeFile.language === 'python' ? (
                <FileCode className="w-3.5 h-3.5" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-xs font-bold text-[#f0f6fc]">{activeFile.filename}</h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161b22] text-[#79c0ff] border border-[#30363d]">
                  {activeFile.title}
                </span>
              </div>
              <p className="text-[10px] text-[#8b949e]">{activeFile.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-file-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#161b22] hover:bg-[#1f242c] text-[#f0f6fc] rounded border border-[#30363d] transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#aff5b4]" />
                  <span className="text-[#aff5b4]">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#8b949e]" />
                  <span>COPY</span>
                </>
              )}
            </button>
            <button
              id="download-file-btn"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#238636] hover:bg-[#2ea043] text-white rounded transition font-bold"
            >
              <Download className="w-3 h-3" />
              <span>DOWNLOAD</span>
            </button>
          </div>
        </div>

        {/* Code / Markdown Content Box with Line Numbers */}
        <div className="relative bg-[#0d1117] p-3 font-mono text-[11px] overflow-x-auto max-h-[560px] leading-relaxed text-[#d1d5db] selection:bg-[#238636] selection:text-white">
          <pre className="table w-full">
            <code>
              {activeFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-[#161b22]">
                  <span className="table-cell pr-3 text-right select-none text-[#8b949e] text-[10px] w-8 border-r border-[#30363d]/40 mr-2">
                    {idx + 1}
                  </span>
                  <span className="table-cell pl-3 whitespace-pre-wrap">{line || '\n'}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* Engineering Architecture Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded">
          <div className="flex items-center gap-2 text-[#aff5b4] mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0f6fc]">Stealth Anti-Bot Strategy</h4>
          </div>
          <p className="text-[11px] text-[#8b949e] leading-relaxed">
            Uses real desktop viewport, German Accept-Language headers, Sec-CH-UA client hints, and removes AutomationControlled flags to bypass bot shields.
          </p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded">
          <div className="flex items-center gap-2 text-[#79c0ff] mb-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0f6fc]">Atomic Deduplication</h4>
          </div>
          <p className="text-[11px] text-[#8b949e] leading-relaxed">
            Tracks unique listing IDs (`data-adid`) in `seen_listings.json`. Prevents duplicate processing and notifications across multiple runs.
          </p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded">
          <div className="flex items-center gap-2 text-[#d29922] mb-1.5">
            <Info className="w-3.5 h-3.5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0f6fc]">Comprehensive Traceability</h4>
          </div>
          <p className="text-[11px] text-[#8b949e] leading-relaxed">
            Dual logging streams to stdout and `scraper_execution.log` with timestamps, URL routes, cookie modal events, and extracted payload counts.
          </p>
        </div>
      </div>
    </div>
  );
};

