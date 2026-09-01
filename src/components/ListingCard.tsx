import React, { useState } from 'react';
import {
  ExternalLink,
  MapPin,
  Clock,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Wrench,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Search,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { ExtractedListing } from '../types';

interface ListingCardProps {
  listing: ExtractedListing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const [copied, setCopied] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(listing.listing_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ai = listing.ai_analysis;
  const isOutdated = listing.availability_status === 'UNAVAILABLE';
  const isReserved = listing.availability_status === 'RESERVED';
  const searchUrl = listing.search_url || `https://www.kleinanzeigen.de/s-dortmund/defekt/k0l2078`;

  return (
    <div
      id={`listing-card-${listing.listing_id}`}
      className={`border rounded p-3 transition-all font-mono flex flex-col justify-between ${
        isOutdated
          ? 'bg-[#161b22]/70 border-red-900/40 opacity-80'
          : isReserved
          ? 'bg-[#161b22] border-amber-900/40'
          : 'bg-[#161b22] border-[#30363d] hover:border-[#58a6ff]/50'
      }`}
    >
      <div>
        {/* Top Header: ID, Date, Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleCopyId}
              title="Click to copy Listing ID"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#0d1117] text-[#79c0ff] hover:text-[#f0f6fc] border border-[#30363d] transition font-bold"
            >
              <span>#{listing.listing_id}</span>
              {copied ? <Check className="w-2.5 h-2.5 text-[#aff5b4]" /> : <Copy className="w-2.5 h-2.5 text-[#8b949e]" />}
            </button>

            {/* Availability Status Indicator */}
            {listing.availability_status === 'ACTIVE' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#238636]/20 text-[#aff5b4] border border-[#238636]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#aff5b4] animate-pulse"></span>
                ACTIVE
              </span>
            ) : listing.availability_status === 'RESERVED' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#d29922]/20 text-[#e3b341] border border-[#d29922]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e3b341]"></span>
                RESERVED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f85149]"></span>
                EXPIRED / SOLD
              </span>
            )}

            {ai && (
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                ai.is_profitable
                  ? 'bg-[#238636]/20 text-[#aff5b4] border-[#238636]'
                  : 'bg-[#f85149]/20 text-[#f85149] border-[#f85149]'
              }`}>
                {ai.is_profitable ? `+${ai.profit_margin_eur.toFixed(0)}€ PROFIT` : 'LOW MARGIN'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-[#8b949e]">
            <Clock className="w-3 h-3 text-[#8b949e]" />
            <span>{listing.posted_date}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[#f0f6fc] text-xs leading-snug line-clamp-2 mb-2">
          {listing.title}
        </h3>

        {/* Availability Reason Note */}
        {listing.availability_reason && (
          <div className={`mb-2 text-[9px] px-2 py-1 rounded border flex items-center gap-1.5 ${
            isOutdated
              ? 'bg-red-950/20 text-[#f85149] border-red-900/30'
              : isReserved
              ? 'bg-amber-950/20 text-[#e3b341] border-amber-900/30'
              : 'bg-emerald-950/20 text-[#aff5b4] border-emerald-900/30'
          }`}>
            <span className="shrink-0">{isOutdated ? '⚠️' : isReserved ? '🟡' : '✅'}</span>
            <span className="truncate">{listing.availability_reason}</span>
          </div>
        )}

        {/* Price & Location Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#0d1117] text-[#aff5b4] border border-[#238636]">
            {listing.price}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
            <MapPin className="w-3 h-3 text-[#8b949e]" />
            <span className="truncate">{listing.location}</span>
          </div>
        </div>

        {/* Description Snippet */}
        <p className="text-[10px] text-[#8b949e] line-clamp-2 leading-relaxed mb-2 bg-[#0d1117] p-2 rounded border border-[#30363d]/60">
          {listing.description || "Keine zusätzliche Beschreibung vorhanden."}
        </p>

        {/* AI Profitability Assessment Box */}
        {ai && (
          <div className="mb-2 bg-[#0d1117] border border-[#30363d] rounded p-2 text-[10px]">
            <button
              onClick={() => setShowAiDetails(!showAiDetails)}
              className="w-full flex items-center justify-between text-left text-[#58a6ff] hover:text-[#79c0ff] font-bold"
            >
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#aff5b4]" />
                <span>AI PROFITABILITY ASSESSMENT</span>
              </span>
              {showAiDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Concise Economic Metrics */}
            <div className="grid grid-cols-3 gap-1.5 mt-1.5 pt-1.5 border-t border-[#30363d] text-center">
              <div className="bg-[#161b22] p-1 rounded">
                <span className="text-[#8b949e] text-[8px] block">REFURB VALUE</span>
                <span className="text-[#f0f6fc] font-bold">{ai.estimated_refurbished_value} €</span>
              </div>
              <div className="bg-[#161b22] p-1 rounded">
                <span className="text-[#8b949e] text-[8px] block">REPAIR COST</span>
                <span className="text-[#d29922] font-bold">{ai.estimated_repair_cost_total} €</span>
              </div>
              <div className={`p-1 rounded font-bold ${ai.is_profitable ? 'bg-[#238636]/30 text-[#aff5b4]' : 'bg-[#f85149]/30 text-[#f85149]'}`}>
                <span className="text-[8px] block opacity-80">NET PROFIT</span>
                <span>+{ai.profit_margin_eur.toFixed(1)} €</span>
              </div>
            </div>

            {/* Expanded Detailed Breakdown */}
            {showAiDetails && (
              <div className="mt-2 pt-2 border-t border-[#30363d] space-y-2">
                {/* Reasoning Summary */}
                <div>
                  <span className="text-[#8b949e] text-[9px] uppercase font-bold block mb-0.5">AI Assessment Verdict:</span>
                  <p className="text-[#aff5b4] text-[10px] bg-[#161b22] p-1.5 rounded border border-[#30363d]/60 leading-normal">
                    {ai.reasoning_summary}
                  </p>
                </div>

                {/* Detected Issues */}
                <div>
                  <span className="text-[#8b949e] text-[9px] uppercase font-bold flex items-center gap-1 mb-0.5">
                    <AlertCircle className="w-2.5 h-2.5 text-[#d29922]" />
                    <span>Detected Faults:</span>
                  </span>
                  <ul className="list-disc list-inside text-[#8b949e] space-y-0.5 pl-1">
                    {ai.detected_issues.map((issue, idx) => (
                      <li key={idx} className="text-[#d1d5db]">{issue}</li>
                    ))}
                  </ul>
                </div>

                {/* Replacement Parts */}
                <div>
                  <span className="text-[#8b949e] text-[9px] uppercase font-bold flex items-center gap-1 mb-0.5">
                    <Wrench className="w-2.5 h-2.5 text-[#79c0ff]" />
                    <span>Required Replacement Parts:</span>
                  </span>
                  <div className="space-y-0.5">
                    {ai.estimated_replacement_parts.map((part, pIdx) => (
                      <div key={pIdx} className="flex justify-between text-[9px] bg-[#161b22] px-1.5 py-0.5 rounded">
                        <span className="text-[#d1d5db] truncate pr-1">{part.part_name}</span>
                        <span className="text-[#aff5b4] font-bold shrink-0">{part.cost_eur.toFixed(1)} €</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry info */}
                <div className="text-[8px] text-[#8b949e] flex justify-between pt-1 border-t border-[#30363d]/40">
                  <span>MODEL: {ai.model_used || "gemini-2.5-flash"}</span>
                  <span>EXEC: {ai.execution_time_ms}ms</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-[#30363d] flex items-center justify-between gap-2 text-[10px]">
        <span className="text-[#8b949e] truncate">
          {new Date(listing.scraped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Guaranteed Live Search Query Link */}
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Search live, currently active listings on Kleinanzeigen Dortmund"
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-[#238636]/20 hover:bg-[#238636]/40 text-[#aff5b4] border border-[#238636]/50 transition font-bold"
          >
            <Search className="w-2.5 h-2.5" />
            <span>Search Live</span>
          </a>

          {/* Direct Listing URL */}
          <a
            href={listing.item_url}
            target="_blank"
            rel="noopener noreferrer"
            title="Direct link to specific item ad"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition font-bold ${
              isOutdated
                ? 'bg-[#0d1117] text-[#8b949e] border-[#30363d] line-through hover:text-white'
                : 'bg-[#0d1117] hover:bg-[#30363d] text-[#79c0ff] border-[#30363d]'
            }`}
          >
            <span>{isOutdated ? 'Ad Link (Sold)' : 'Open Ad'}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};


