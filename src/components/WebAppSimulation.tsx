import React, { useState, useEffect } from 'react';
import {
  Users,
  Sliders,
  Play,
  CheckCircle,
  AlertTriangle,
  Euro,
  Bot,
  Send,
  RefreshCw,
  Database,
  Layers,
  Search,
  ExternalLink,
  Shield,
  Activity,
  FileText,
  UserCheck,
  PlusCircle,
  Lock,
  Sparkles,
  MapPin,
  Tag,
  Wrench,
  Check,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Radio,
  Filter
} from 'lucide-react';
import { DbUserSettings, ExtractedListing, UserAccount, ListingAvailabilityStatus } from '../types';

const INITIAL_USERS: UserAccount[] = [
  {
    id: 1,
    username: "dortmund_flipper",
    email: "tech@repairflip.de",
    created_at: "2026-08-25 10:14:00",
    is_active: true,
    avatar_initials: "DF"
  },
  {
    id: 2,
    username: "bochum_bastler",
    email: "bastler@ruhr-tech.de",
    created_at: "2026-08-27 14:22:00",
    is_active: true,
    avatar_initials: "BB"
  }
];

const INITIAL_SETTINGS: Record<number, DbUserSettings> = {
  1: {
    id: 1,
    user_id: 1,
    execution_mode: "local",
    local_llm_provider: "ollama",
    local_llm_endpoint: "http://localhost:11434",
    local_llm_model: "llama3",
    fallback_to_cloud: true,
    telegram_bot_token: "7128919241:AAH8...k9x11",
    telegram_chat_id: "-10088921829",
    telegram_alerts_enabled: true,
    ai_provider: "google_gemini",
    ai_model: "gemini-2.5-flash",
    ai_api_key: "AIzaSyB902_DefectRepairScanner_Key",
    target_source: "kleinanzeigen",
    category: "Elektronik & Haushaltsgeräte",
    keywords: "defekt, für Bastler, an Bastler, Displayschaden, Ersatzteile",
    target_location: "Dortmund",
    location_id: "2078",
    radius_km: 20,
    min_price: 0,
    max_price: 250,
    min_profit_eur: 35,
    max_repair_budget: 150,
    verify_availability_before_save: true,
    skip_unavailable_in_alerts: true,
    auto_recheck_availability: true,
    auto_scrape_interval_minutes: 60,
    is_active: true,
    updated_at: "2026-08-29 14:10:00"
  },
  2: {
    id: 2,
    user_id: 2,
    execution_mode: "cloud",
    local_llm_provider: "lm_studio",
    local_llm_endpoint: "http://localhost:1234/v1",
    local_llm_model: "mistral",
    fallback_to_cloud: true,
    telegram_bot_token: "",
    telegram_chat_id: "",
    telegram_alerts_enabled: false,
    ai_provider: "google_gemini",
    ai_model: "gemini-2.5-flash",
    ai_api_key: "",
    target_source: "kleinanzeigen",
    category: "Werkzeuge & Maschinen",
    keywords: "makita defekt, bohrhammer bastler, bosch akku",
    target_location: "Bochum",
    location_id: "1946",
    radius_km: 15,
    min_price: 10,
    max_price: 180,
    min_profit_eur: 25,
    max_repair_budget: 80,
    verify_availability_before_save: true,
    skip_unavailable_in_alerts: true,
    auto_recheck_availability: true,
    auto_scrape_interval_minutes: 30,
    is_active: true,
    updated_at: "2026-08-28 09:30:00"
  }
};

const INITIAL_LISTINGS: Record<number, ExtractedListing[]> = {
  1: [
    {
      listing_id: "2840192831",
      user_id: 1,
      title: "DeLonghi Magnifica S Kaffeevollautomat - pumpt kein Wasser mehr",
      price: "25 € VB",
      location: "Dortmund Innenstadt-Ost (44135)",
      description: "Verkaufe unsere DeLonghi Magnifica S ECAM 22.110.B. Gerät geht an, mahlt Kaffee, aber es kommt kein Wasser aus dem Auslauf. Pumpe brummt nur leise. An Bastler oder als Ersatzteilspender.",
      item_url: "https://www.kleinanzeigen.de/s-anzeige/delonghi-magnifica-s-defekt/2840192831-176-2078",
      posted_date: "Heute, 12:45",
      scraped_at: "2026-08-29 13:15:00",
      source_platform: "kleinanzeigen",
      telegram_notified: true,
      availability_status: "ACTIVE",
      is_available: true,
      last_availability_check: "2026-08-29 14:15:00",
      availability_reason: "HTTP 200 OK • Live Listing Verified Active",
      ai_analysis: {
        detected_issues: [
          "Defective ULKA EX5 high pressure vibration pump",
          "Calcified thermoblock valve & clogged flow meter",
          "Brittle silicone piston gaskets"
        ],
        estimated_replacement_parts: [
          { part_name: "ULKA EX5 48W Water Pump", cost_eur: 16.50 },
          { part_name: "Food-grade EPDM O-ring gasket set", cost_eur: 5.50 },
          { part_name: "Amidosulfonic acid descaler (1L)", cost_eur: 4.00 }
        ],
        estimated_repair_cost_total: 26.00,
        estimated_refurbished_value: 165.00,
        is_profitable: true,
        profit_margin_eur: 114.00,
        reasoning_summary: "Classic ULKA pump valve failure. Low parts cost (26 €) and high market demand for refurbished Magnifica S units (~165 €) yields an excellent +114 € profit margin."
      }
    },
    {
      listing_id: "2840187410",
      user_id: 1,
      title: "Sony PlayStation 5 Digital Edition - HDMI Port Schaden",
      price: "120 €",
      location: "Dortmund Hörde (44263)",
      description: "PS5 startet normal mit weißem Licht, aber HDMI Buchse ist eingedrückt und Pins verbogen, kein Bild. Ohne Controller.",
      item_url: "https://www.kleinanzeigen.de/s-anzeige/ps5-defekt-bastler/2840187410-279-2078",
      posted_date: "Heute, 11:20",
      scraped_at: "2026-08-29 12:30:00",
      source_platform: "kleinanzeigen",
      telegram_notified: false,
      availability_status: "RESERVED",
      is_available: false,
      last_availability_check: "2026-08-29 14:10:00",
      availability_reason: "Marketplace badge: 'Reserviert' - buyer agreed on pickup",
      ai_analysis: {
        detected_issues: [
          "Broken HDMI 2.1 port connector pin array",
          "Liquid metal refresh recommended during disassembly"
        ],
        estimated_replacement_parts: [
          { part_name: "OEM PS5 HDMI 2.1 Port Socket", cost_eur: 6.50 },
          { part_name: "Liquid Metal Thermal Compound", cost_eur: 9.50 }
        ],
        estimated_repair_cost_total: 16.00,
        estimated_refurbished_value: 280.00,
        is_profitable: true,
        profit_margin_eur: 144.00,
        reasoning_summary: "Standard micro-soldering HDMI replacement. However currently marked RESERVED by seller."
      }
    },
    {
      listing_id: "2840165521",
      user_id: 1,
      title: "Samsung 65 Zoll 4K QLED TV - Display gebrochen",
      price: "40 €",
      location: "Dortmund Wickede (44319)",
      description: "Beim Umzug ist der Fernseher umgekippt. Panel hat Sprung, Streifen im Bild. Mainboard und Netzteil funktionieren einwandfrei.",
      item_url: "https://www.kleinanzeigen.de/s-anzeige/samsung-65-zoll-display-riss/2840165521-175-2078",
      posted_date: "Gestern, 18:30",
      scraped_at: "2026-08-29 10:00:00",
      source_platform: "kleinanzeigen",
      telegram_notified: false,
      availability_status: "UNAVAILABLE",
      is_available: false,
      last_availability_check: "2026-08-29 14:05:00",
      availability_reason: "HTTP 404 Not Found - Listing deleted by seller (Sold)",
      ai_analysis: {
        detected_issues: [
          "Physically cracked OLED/QLED substrate matrix",
          "Irreparable panel glass fracture"
        ],
        estimated_replacement_parts: [
          { part_name: "OEM 65-inch Replacement Panel (exceeds item value)", cost_eur: 420.00 }
        ],
        estimated_repair_cost_total: 420.00,
        estimated_refurbished_value: 320.00,
        is_profitable: false,
        profit_margin_eur: -140.00,
        reasoning_summary: "Unprofitable for repair. Panel replacement cost (420 €) exceeds refurbished market value."
      }
    },
    {
      listing_id: "2840154911",
      user_id: 1,
      title: "Lenovo ThinkPad T480 i7 - Akku & Ladebuchse defekt",
      price: "60 € VB",
      location: "Dortmund Dorstfeld (44149)",
      description: "Lädt nicht mehr über USB-C (bekannter Thunderbolt Firmware Fehler). Tastatur und FHD Display top.",
      item_url: "https://www.kleinanzeigen.de/s-anzeige/thinkpad-t480-defekt/2840154911-278-2078",
      posted_date: "Vor 2 Stunden",
      scraped_at: "2026-08-29 13:40:00",
      source_platform: "kleinanzeigen",
      telegram_notified: true,
      availability_status: "ACTIVE",
      is_available: true,
      last_availability_check: "2026-08-29 14:20:00",
      availability_reason: "HTTP 200 OK • Live Ad Verified Active",
      ai_analysis: {
        detected_issues: [
          "Corrupted Thunderbolt 3 EEPROM firmware chip",
          "Burned USB-C PD power delivery controller"
        ],
        estimated_replacement_parts: [
          { part_name: "CH341A Programmer & Winbond SPI BIOS Flash Chip", cost_eur: 11.00 },
          { part_name: "Internal 24Wh Bridge Battery", cost_eur: 24.00 }
        ],
        estimated_repair_cost_total: 35.00,
        estimated_refurbished_value: 230.00,
        is_profitable: true,
        profit_margin_eur: 135.00,
        reasoning_summary: "Known T480 Thunderbolt issue easily resolved with SPI chip flash. High profit margin of +135 €."
      }
    }
  ],
  2: [
    {
      listing_id: "2840177654",
      user_id: 2,
      title: "Makita DHR243 Akku-Kombihammer 18V - Schlägt nicht mehr",
      price: "35 €",
      location: "Bochum Mitte (44787)",
      description: "Motor läuft einwandfrei auf beiden Stufen, aber das Schlagwerk hämmert nicht mehr. Vermutlich O-Ringe im Kolben oder Getrieberad abgenutzt.",
      item_url: "https://www.kleinanzeigen.de/s-anzeige/makita-dhr243-defekt/2840177654-84-1946",
      posted_date: "Heute, 09:15",
      scraped_at: "2026-08-29 11:00:00",
      source_platform: "kleinanzeigen",
      telegram_notified: false,
      availability_status: "ACTIVE",
      is_available: true,
      last_availability_check: "2026-08-29 14:18:00",
      availability_reason: "HTTP 200 OK • Live Ad Active",
      ai_analysis: {
        detected_issues: [
          "Worn striker piston fluororubber O-ring seal",
          "Dried out lithium gearbox lubricant"
        ],
        estimated_replacement_parts: [
          { part_name: "Makita OEM Striker Piston O-Ring", cost_eur: 4.80 },
          { part_name: "Makita Special Hammer Grease (30g)", cost_eur: 7.50 }
        ],
        estimated_repair_cost_total: 12.30,
        estimated_refurbished_value: 125.00,
        is_profitable: true,
        profit_margin_eur: 77.70,
        reasoning_summary: "Straightforward mechanical service. Replacing piston O-ring restores impact. +77.70 € net margin."
      }
    }
  ]
};

export const WebAppSimulation: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [activeUserId, setActiveUserId] = useState<number>(1);
  const [userSettings, setUserSettings] = useState<Record<number, DbUserSettings>>(INITIAL_SETTINGS);
  const [listings, setListings] = useState<Record<number, ExtractedListing[]>>(INITIAL_LISTINGS);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'settings' | 'listings' | 'logs'>('dashboard');

  // Filter state for listings tab
  const [listingFilter, setListingFilter] = useState<'all' | 'active_only' | 'profitable' | 'reserved' | 'unavailable'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Background Scraper Execution state
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeLog, setScrapeLog] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Individual verification state
  const [checkingListingId, setCheckingListingId] = useState<string | null>(null);
  const [isBatchChecking, setIsBatchChecking] = useState(false);

  // Settings form draft state
  const currentSettings = userSettings[activeUserId] || INITIAL_SETTINGS[1];
  const [formSettings, setFormSettings] = useState<DbUserSettings>(currentSettings);

  // Sync draft when active user changes
  useEffect(() => {
    if (userSettings[activeUserId]) {
      setFormSettings(userSettings[activeUserId]);
    }
  }, [activeUserId, userSettings]);

  const activeUser = users.find(u => u.id === activeUserId) || users[0];
  const activeUserListings = listings[activeUserId] || [];

  // Metrics
  const totalScraped = activeUserListings.length;
  const activeAvailableListings = activeUserListings.filter(l => l.availability_status === 'ACTIVE');
  const activeAvailableCount = activeAvailableListings.length;
  const reservedCount = activeUserListings.filter(l => l.availability_status === 'RESERVED').length;
  const unavailableCount = activeUserListings.filter(l => l.availability_status === 'UNAVAILABLE').length;

  const activeProfitableListings = activeAvailableListings.filter(l => l.ai_analysis?.is_profitable);
  const activeProfitableCount = activeProfitableListings.length;
  const activePotentialProfit = activeProfitableListings.reduce((sum, l) => sum + (l.ai_analysis?.profit_margin_eur || 0), 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setUserSettings(prev => ({
      ...prev,
      [activeUserId]: {
        ...formSettings,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    }));
    showToast(`Settings & Availability verification rules saved to SQLite for '${activeUser.username}'!`);
  };

  // Single Item Availability Check Handler
  const handleCheckSingleItem = (listingId: string) => {
    setCheckingListingId(listingId);
    
    setTimeout(() => {
      setListings(prev => {
        const userList = prev[activeUserId] || [];
        const updated = userList.map(item => {
          if (item.listing_id === listingId) {
            // Toggle or simulate check
            const statuses: ListingAvailabilityStatus[] = ['ACTIVE', 'ACTIVE', 'RESERVED', 'UNAVAILABLE'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const isAvail = newStatus === 'ACTIVE';
            const reason = newStatus === 'ACTIVE'
              ? 'HTTP 200 OK • Live Ad Confirmed • In Stock'
              : newStatus === 'RESERVED'
              ? 'Seller added "RESERVIERT" badge on Kleinanzeigen'
              : 'HTTP 404 • "Diese Anzeige ist leider nicht mehr verfügbar"';

            return {
              ...item,
              availability_status: newStatus,
              is_available: isAvail,
              availability_reason: reason,
              last_availability_check: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
          }
          return item;
        });
        return { ...prev, [activeUserId]: updated };
      });

      setCheckingListingId(null);
      showToast(`Live availability verified for listing #${listingId}!`);
    }, 900);
  };

  // Batch Availability Check Handler
  const handleBatchVerifyAll = () => {
    if (isBatchChecking) return;
    setIsBatchChecking(true);

    showToast(`Starting batch verification for ${activeUserListings.length} history items...`);

    setTimeout(() => {
      setListings(prev => {
        const userList = prev[activeUserId] || [];
        const updated = userList.map((item, idx) => {
          // Keep first active, simulate fresh check on others
          const status = idx === 2 ? 'UNAVAILABLE' : idx === 1 ? 'RESERVED' : 'ACTIVE';
          return {
            ...item,
            availability_status: status as ListingAvailabilityStatus,
            is_available: status === 'ACTIVE',
            availability_reason: status === 'ACTIVE'
              ? 'HTTP 200 OK • Live Listing Active'
              : status === 'RESERVED'
              ? 'Marked as "Reserviert" by seller'
              : 'HTTP 404 • Ad deleted / Sold',
            last_availability_check: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        });
        return { ...prev, [activeUserId]: updated };
      });

      setIsBatchChecking(false);
      showToast(`Batch verification completed: Updated all ${activeUserListings.length} listings!`);
    }, 1600);
  };

  const handleTriggerScraper = () => {
    if (isScraping) return;
    setIsScraping(true);
    setScrapeProgress(10);
    setScrapeLog([
      `[HTTP 202] Spawning background worker thread for user_id=${activeUserId} (${activeUser.username})...`,
      `[WORKER] Loaded settings from SQLite: Location='${formSettings.target_location}' (ID:${formSettings.location_id}), MinProfit=${formSettings.min_profit_eur}€`,
      `[AVAILABILITY_GUARD] Pre-save verification enabled: ${formSettings.verify_availability_before_save ? 'YES (Strict)' : 'NO'}`
    ]);

    setTimeout(() => {
      setScrapeProgress(35);
      setScrapeLog(prev => [
        ...prev,
        `[PLAYWRIGHT] Chromium launched in stealth headless mode. Navigating to Kleinanzeigen search...`,
        `[PLAYWRIGHT] URL: https://www.kleinanzeigen.de/s-dortmund/defekt/k0l${formSettings.location_id}`,
        `[PLAYWRIGHT] Extracted 4 raw items from current search results page.`
      ]);
    }, 1100);

    setTimeout(() => {
      setScrapeProgress(65);
      setScrapeLog(prev => [
        ...prev,
        `[AVAILABILITY_CHECK] Inspecting item 1/4 (Makita Bohrhammer): HTTP 200 OK -> Verified ACTIVE.`,
        `[AVAILABILITY_CHECK] Inspecting item 2/4 (iPhone 12 Pro Defekt): Status HTTP 404 / Deactivated -> SKIPPED (Outdated)!`,
        `[AVAILABILITY_CHECK] Inspecting item 3/4 (Bosch GSR 18V-60 C): HTTP 200 OK -> Verified ACTIVE.`,
        `[AI_ANALYZER] Running Gemini structured profit evaluation on ACTIVE items only...`
      ]);
    }, 2400);

    setTimeout(() => {
      const newListing: ExtractedListing = {
        listing_id: `284029${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: activeUserId,
        title: `Bosch Professional GSR 18V-60 C - Getriebeschaden / Knackt`,
        price: "20 € VB",
        location: `${formSettings.target_location} Zentrum`,
        description: "Bosch Blau 18V Akkuschrauber. Motor dreht sauber, aber das Bohrfutter rutscht unter Last durch. Mit Koffer, ohne Akkus.",
        item_url: `https://www.kleinanzeigen.de/s-anzeige/bosch-gsr-18v-defekt/2840291001-84-${formSettings.location_id}`,
        posted_date: "Vor 5 Minuten",
        scraped_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        source_platform: formSettings.target_source,
        telegram_notified: formSettings.telegram_alerts_enabled,
        availability_status: "ACTIVE",
        is_available: true,
        last_availability_check: new Date().toISOString().replace('T', ' ').substring(0, 19),
        availability_reason: "HTTP 200 OK • Pre-Save Verified Live & Available",
        ai_analysis: {
          detected_issues: [
            "Worn planetary torque clutch gear ring",
            "Slipping metal reduction planetary stage"
          ],
          estimated_replacement_parts: [
            { part_name: "Bosch OEM 2-Speed Gearbox Assembly (1600A00xxx)", cost_eur: 18.00 },
            { part_name: "Heavy-duty synthetic grease", cost_eur: 4.50 }
          ],
          estimated_repair_cost_total: 22.50,
          estimated_refurbished_value: 85.00,
          is_profitable: true,
          profit_margin_eur: 42.50,
          reasoning_summary: "High demand Bosch Professional 18V tool. Gearbox replacement takes 15 minutes. Net profit +42.50 € easily exceeds threshold."
        }
      };

      setListings(prev => ({
        ...prev,
        [activeUserId]: [newListing, ...(prev[activeUserId] || [])]
      }));

      setScrapeProgress(100);
      setScrapeLog(prev => [
        ...prev,
        `[SQLITE] INSERT INTO scraped_listings (listing_id, availability_status='ACTIVE') -> ID 105`,
        `[SQLITE] INSERT INTO ai_analysis_records (is_profitable=True, profit_margin_eur=42.50) -> OK`,
        formSettings.telegram_alerts_enabled
          ? `[TELEGRAM] Dispatched HTML alert for ACTIVE item to Chat ID '${formSettings.telegram_chat_id}' -> 200 OK`
          : `[TELEGRAM] Alerts disabled.`,
        `[SUCCESS] Scraper cycle completed. 1 active verified listing saved to database.`
      ]);
      setIsScraping(false);
      showToast("Scraper completed! 1 verified active listing saved (outdated items filtered).");
    }, 3800);
  };

  // Filtered listings
  const filteredListings = activeUserListings.filter(item => {
    if (listingFilter === 'active_only' && item.availability_status !== 'ACTIVE') return false;
    if (listingFilter === 'profitable' && (item.availability_status !== 'ACTIVE' || !item.ai_analysis?.is_profitable)) return false;
    if (listingFilter === 'reserved' && item.availability_status !== 'RESERVED') return false;
    if (listingFilter === 'unavailable' && item.availability_status !== 'UNAVAILABLE') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.availability_reason && item.availability_reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Toast notification */}
      {toastMessage && (
        <div className="bg-[#238636] border border-[#2ea043] text-white px-4 py-2 rounded text-xs flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="opacity-75 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* Top Multi-User Account Bar & Route Tabs */}
      <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Active User Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#8b949e] font-bold">
            <Users className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>ACTIVE USER:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setActiveUserId(u.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition ${
                  activeUserId === u.id
                    ? 'bg-[#238636] text-white'
                    : 'bg-[#0d1117] text-[#8b949e] hover:text-white border border-[#30363d]'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">
                  {u.avatar_initials}
                </span>
                <span>{u.username}</span>
                {activeUserId === u.id && <Check className="w-3 h-3 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Web App Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded border border-[#30363d] text-xs">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3 py-1 rounded font-medium transition ${
              activeSubTab === 'dashboard'
                ? 'bg-[#58a6ff] text-white font-bold'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            Dashboard (/dashboard)
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1 rounded font-medium transition ${
              activeSubTab === 'settings'
                ? 'bg-[#58a6ff] text-white font-bold'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            Settings (/settings)
          </button>
          <button
            onClick={() => setActiveSubTab('listings')}
            className={`px-3 py-1 rounded font-medium transition ${
              activeSubTab === 'listings'
                ? 'bg-[#58a6ff] text-white font-bold'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            Listing History ({activeUserListings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1 rounded font-medium transition ${
              activeSubTab === 'logs'
                ? 'bg-[#58a6ff] text-white font-bold'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            Server Logs
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DASHBOARD TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-3">
          {/* Quick Action Header */}
          <div className="bg-[#161b22] border border-[#30363d] rounded p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#aff5b4]" />
                User Dashboard: {activeUser.username}
              </h2>
              <p className="text-[11px] text-[#8b949e] mt-0.5">
                Target: <span className="text-[#79c0ff] font-bold">{formSettings.target_location} (ID: {formSettings.location_id})</span> &bull; 
                Live Availability Guard: <span className="text-[#aff5b4] font-bold">ACTIVE</span> &bull; 
                Min Margin: <span className="text-[#aff5b4] font-bold">&ge; {formSettings.min_profit_eur} €</span> &bull; 
                Telegram: <span className={formSettings.telegram_alerts_enabled ? "text-[#aff5b4] font-bold" : "text-[#8b949e]"}>{formSettings.telegram_alerts_enabled ? "Active" : "Disabled"}</span>
              </p>
            </div>

            <button
              onClick={handleTriggerScraper}
              disabled={isScraping}
              className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 shadow-sm transition ${
                isScraping
                  ? 'bg-[#30363d] text-[#8b949e] cursor-not-allowed'
                  : 'bg-[#238636] hover:bg-[#2ea043] text-white'
              }`}
            >
              {isScraping ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Playwright Worker Active ({scrapeProgress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Trigger Playwright Scraper & AI</span>
                </>
              )}
            </button>
          </div>

          {/* Scraper Run Progress Box when active */}
          {isScraping && (
            <div className="bg-[#0d1117] border border-[#238636] rounded p-3 space-y-2 animate-fade-in">
              <div className="flex justify-between text-xs">
                <span className="text-[#aff5b4] font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Asynchronous Scraper & Availability Engine Running
                </span>
                <span className="text-[#58a6ff] font-bold">{scrapeProgress}%</span>
              </div>
              <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden border border-[#30363d]">
                <div
                  className="bg-[#238636] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${scrapeProgress}%` }}
                />
              </div>
              <div className="bg-[#161b22] p-2 rounded text-[11px] font-mono text-[#d1d5db] space-y-1 max-h-28 overflow-y-auto">
                {scrapeLog.map((log, idx) => (
                  <div key={idx} className="text-[#79c0ff]">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Grid with Availability Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
              <div className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider">Total Scraped</div>
              <div className="text-2xl font-bold text-[#f0f6fc] mt-1">{totalScraped}</div>
              <div className="text-[10px] text-[#8b949e] mt-0.5">Stored in SQLite</div>
            </div>

            <div className="bg-[#161b22] border border-[#238636]/40 rounded p-3 bg-[#238636]/5">
              <div className="text-[10px] text-[#aff5b4] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse"></span>
                Active (Available)
              </div>
              <div className="text-2xl font-bold text-[#aff5b4] mt-1">{activeAvailableCount}</div>
              <div className="text-[10px] text-[#8b949e] mt-0.5">Verified live on Kleinanzeigen</div>
            </div>

            <div className="bg-[#161b22] border border-[#da3633]/40 rounded p-3 bg-[#da3633]/5">
              <div className="text-[10px] text-[#f85149] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#da3633]"></span>
                Outdated / Sold
              </div>
              <div className="text-2xl font-bold text-[#f85149] mt-1">{unavailableCount}</div>
              <div className="text-[10px] text-[#8b949e] mt-0.5">Deleted or expired (404)</div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
              <div className="text-[10px] text-[#79c0ff] font-bold uppercase tracking-wider">Active Net Margin</div>
              <div className="text-2xl font-bold text-[#79c0ff] mt-1">+{activePotentialProfit.toFixed(2)} €</div>
              <div className="text-[10px] text-[#8b949e] mt-0.5">Across {activeProfitableCount} live deals</div>
            </div>
          </div>

          {/* Top Opportunities Highlight */}
          <div className="bg-[#161b22] border border-[#30363d] rounded p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
              <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#e3b341]" />
                Top Verified Live Opportunities (Active Only)
              </h3>
              <button
                onClick={() => { setActiveSubTab('listings'); setListingFilter('profitable'); }}
                className="text-xs text-[#58a6ff] hover:underline"
              >
                View All Active ({activeProfitableCount}) &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeProfitableListings.map(item => (
                <div key={item.listing_id} className="bg-[#0d1117] border border-[#30363d] rounded p-3 flex flex-col justify-between hover:border-[#58a6ff] transition">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-[#f0f6fc] line-clamp-1">{item.title}</h4>
                      <span className="bg-[#238636]/20 border border-[#238636] text-[#aff5b4] px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                        +{item.ai_analysis?.profit_margin_eur.toFixed(2)} €
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#aff5b4] bg-[#238636]/20 px-1.5 py-0.2 rounded border border-[#238636]/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#aff5b4] animate-pulse"></span>
                        ACTIVE
                      </span>
                      <span className="text-[11px] text-[#8b949e]">
                        Listed at <strong className="text-[#f0f6fc]">{item.price}</strong> &bull; {item.location}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#d1d5db] mt-2 line-clamp-2">{item.description}</p>
                    
                    {/* Detected parts */}
                    {item.ai_analysis?.estimated_replacement_parts && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.ai_analysis.estimated_replacement_parts.map((p, idx) => (
                          <span key={idx} className="bg-[#161b22] border border-[#30363d] text-[#79c0ff] px-1.5 py-0.5 rounded text-[10px]">
                            {p.part_name} (~{p.cost_eur}€)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#21262d] flex items-center justify-between text-[11px]">
                    <span className="text-[#d29922]">Repair Parts: ~{item.ai_analysis?.estimated_repair_cost_total} €</span>
                    <a
                      href={item.item_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#58a6ff] hover:underline flex items-center gap-1 font-medium"
                    >
                      Open Listing <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SETTINGS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-3">
          <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#58a6ff]" />
                User Settings Dashboard (/settings)
              </h2>
              <p className="text-[11px] text-[#8b949e] mt-0.5">
                Configuring SQLite parameters for account: <strong className="text-[#79c0ff]">{activeUser.username}</strong> ({activeUser.email})
              </p>
            </div>
            <button
              type="submit"
              className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Save Settings to SQLite</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Live Availability Verification Engine */}
            <section className="bg-[#161b22] border border-[#30363d] rounded p-3 space-y-2.5">
              <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#30363d] pb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#aff5b4]" />
                1. Listing Availability Guard
              </h3>

              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-[#0d1117] transition">
                  <input
                    type="checkbox"
                    checked={formSettings.verify_availability_before_save}
                    onChange={e => setFormSettings({ ...formSettings, verify_availability_before_save: e.target.checked })}
                    className="mt-0.5 rounded bg-[#0d1117] border-[#30363d] text-[#238636]"
                  />
                  <div>
                    <span className="text-[#f0f6fc] text-xs font-bold">Verify Live Availability Before Saving</span>
                    <p className="text-[10px] text-[#8b949e]">Filters out HTTP 404/deleted listings and avoids paying AI analysis tokens for dead ads.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-[#0d1117] transition">
                  <input
                    type="checkbox"
                    checked={formSettings.skip_unavailable_in_alerts}
                    onChange={e => setFormSettings({ ...formSettings, skip_unavailable_in_alerts: e.target.checked })}
                    className="mt-0.5 rounded bg-[#0d1117] border-[#30363d] text-[#238636]"
                  />
                  <div>
                    <span className="text-[#f0f6fc] text-xs font-bold">Suppress Telegram Alerts for Sold/Reserved</span>
                    <p className="text-[10px] text-[#8b949e]">Only dispatch phone notifications if listing is 100% active and available to buy.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-[#0d1117] transition">
                  <input
                    type="checkbox"
                    checked={formSettings.auto_recheck_availability}
                    onChange={e => setFormSettings({ ...formSettings, auto_recheck_availability: e.target.checked })}
                    className="mt-0.5 rounded bg-[#0d1117] border-[#30363d] text-[#238636]"
                  />
                  <div>
                    <span className="text-[#f0f6fc] text-xs font-bold">Auto-Recheck History Periodically</span>
                    <p className="text-[10px] text-[#8b949e]">Scans past listings in your history and marks newly sold ones as UNAVAILABLE.</p>
                  </div>
                </label>
              </div>
            </section>

            {/* 2. Telegram Config */}
            <section className="bg-[#161b22] border border-[#30363d] rounded p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-1.5">
                <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#58a6ff]" />
                  2. Telegram Alert Config
                </h3>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formSettings.telegram_alerts_enabled}
                    onChange={e => setFormSettings({ ...formSettings, telegram_alerts_enabled: e.target.checked })}
                    className="rounded bg-[#0d1117] border-[#30363d] text-[#238636]"
                  />
                  <span className="text-[#aff5b4] text-[11px] font-bold">Enabled</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8b949e] uppercase mb-1">Telegram Bot Token</label>
                <input
                  type="text"
                  value={formSettings.telegram_bot_token}
                  onChange={e => setFormSettings({ ...formSettings, telegram_bot_token: e.target.value })}
                  placeholder="7128919241:AAH8..."
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#f0f6fc] font-mono focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8b949e] uppercase mb-1">Telegram Chat ID</label>
                <input
                  type="text"
                  value={formSettings.telegram_chat_id}
                  onChange={e => setFormSettings({ ...formSettings, telegram_chat_id: e.target.value })}
                  placeholder="-10088921829"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#f0f6fc] font-mono focus:border-[#58a6ff]"
                />
              </div>
            </section>

            {/* 3. AI Model & API Key */}
            <section className="bg-[#161b22] border border-[#30363d] rounded p-3 space-y-2.5">
              <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#30363d] pb-1.5">
                <Bot className="w-3.5 h-3.5 text-[#aff5b4]" />
                3. AI Model & Credentials
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#8b949e] uppercase mb-1">AI Provider</label>
                  <select
                    value={formSettings.ai_provider}
                    onChange={e => setFormSettings({ ...formSettings, ai_provider: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs text-[#f0f6fc]"
                  >
                    <option value="google_gemini">Google Gemini (Recommended)</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8b949e] uppercase mb-1">Model Name</label>
                  <input
                    type="text"
                    value={formSettings.ai_model}
                    onChange={e => setFormSettings({ ...formSettings, ai_model: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#f0f6fc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8b949e] uppercase mb-1">AI API Key (Saved in SQLite)</label>
                <input
                  type="password"
                  value={formSettings.ai_api_key}
                  onChange={e => setFormSettings({ ...formSettings, ai_api_key: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#aff5b4] font-mono focus:border-[#58a6ff]"
                />
              </div>
            </section>

            {/* 4. Profitability Thresholds */}
            <section className="bg-[#161b22] border border-[#30363d] rounded p-3 space-y-2.5">
              <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#30363d] pb-1.5">
                <Euro className="w-3.5 h-3.5 text-[#aff5b4]" />
                4. Economic Thresholds
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#8b949e] uppercase mb-1">Min Profit (EUR)</label>
                  <input
                    type="number"
                    value={formSettings.min_profit_eur}
                    onChange={e => setFormSettings({ ...formSettings, min_profit_eur: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#aff5b4] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8b949e] uppercase mb-1">Max Repair Budget (EUR)</label>
                  <input
                    type="number"
                    value={formSettings.max_repair_budget}
                    onChange={e => setFormSettings({ ...formSettings, max_repair_budget: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#f0f6fc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8b949e] uppercase mb-1">Target Location & Keywords</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formSettings.target_location}
                    onChange={e => setFormSettings({ ...formSettings, target_location: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-[#f0f6fc]"
                  />
                  <input
                    type="text"
                    value={formSettings.keywords}
                    onChange={e => setFormSettings({ ...formSettings, keywords: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-[#f0f6fc]"
                  />
                </div>
              </div>
            </section>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 3. LISTINGS HISTORY TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'listings' && (
        <div className="space-y-3">
          {/* Live Link & Availability Guidance Banner */}
          <div className="bg-[#161b22] border border-[#30363d] rounded p-3 text-xs">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#f0f6fc]">
                  <ShieldCheck className="w-4 h-4 text-[#aff5b4]" />
                  <span>Real-Time Listing Availability & Live Search Queries</span>
                </div>
                <p className="text-[11px] text-[#8b949e] max-w-2xl leading-relaxed">
                  Defective items with high flip margins (e.g. 25€ coffee machines, 75€ laptops) sell fast on Kleinanzeigen. 
                  If a direct link shows <span className="text-[#f85149] font-bold">"Diese Anzeige ist leider nicht mehr verfügbar"</span>, 
                  use the <span className="text-[#aff5b4] font-bold">🟢 Search Live</span> button to query real-time live inventory in Dortmund (<span className="text-[#79c0ff]">ID: l2078</span>).
                </p>
              </div>

              {/* Quick Launchers for Real Live Kleinanzeigen Searches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <a
                  href="https://www.kleinanzeigen.de/s-dortmund/defekt/k0l2078"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-[#238636]/20 hover:bg-[#238636]/40 text-[#aff5b4] border border-[#238636]/60 transition font-bold"
                >
                  <Search className="w-3 h-3" />
                  <span>Live Dortmund "Defekt"</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <a
                  href="https://www.kleinanzeigen.de/s-dortmund/bastler/k0l2078"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-[#21262d] hover:bg-[#30363d] text-[#79c0ff] border border-[#30363d] transition font-bold"
                >
                  <Search className="w-3 h-3" />
                  <span>Live Dortmund "Bastler"</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#8b949e]" />
              <input
                type="text"
                placeholder="Search titles, location, reason..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-[#f0f6fc] w-64 focus:border-[#58a6ff]"
              />
            </div>

            {/* Batch Re-verify & Availability Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBatchVerifyAll}
                disabled={isBatchChecking}
                className="bg-[#21262d] hover:bg-[#30363d] text-[#79c0ff] border border-[#30363d] px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBatchChecking ? 'animate-spin' : ''}`} />
                <span>Re-verify All ({activeUserListings.length})</span>
              </button>

              <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded border border-[#30363d] text-xs">
                <button
                  onClick={() => setListingFilter('all')}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    listingFilter === 'all' ? 'bg-[#238636] text-white font-bold' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  All ({activeUserListings.length})
                </button>
                <button
                  onClick={() => setListingFilter('active_only')}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    listingFilter === 'active_only' ? 'bg-[#238636] text-white font-bold' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  🟢 Active ({activeAvailableCount})
                </button>
                <button
                  onClick={() => setListingFilter('profitable')}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    listingFilter === 'profitable' ? 'bg-[#238636] text-white font-bold' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  🔥 Profitable ({activeProfitableCount})
                </button>
                <button
                  onClick={() => setListingFilter('reserved')}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    listingFilter === 'reserved' ? 'bg-[#238636] text-white font-bold' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  🟡 Reserved ({reservedCount})
                </button>
                <button
                  onClick={() => setListingFilter('unavailable')}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    listingFilter === 'unavailable' ? 'bg-[#238636] text-white font-bold' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  🔴 Outdated ({unavailableCount})
                </button>
              </div>
            </div>
          </div>

          {/* Listings Table with Real-time Availability verification */}
          <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
            {filteredListings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#0d1117] border-b border-[#30363d] text-[#8b949e] uppercase font-bold text-[10px]">
                      <th className="py-2.5 px-3">Availability Status</th>
                      <th className="py-2.5 px-3">Item / Description</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Repair Parts</th>
                      <th className="py-2.5 px-3">Refurb Value</th>
                      <th className="py-2.5 px-3">Net Margin</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    {filteredListings.map(item => {
                      const isItemChecking = checkingListingId === item.listing_id;
                      const isOutdated = item.availability_status === 'UNAVAILABLE';
                      const isReserved = item.availability_status === 'RESERVED';

                      return (
                        <tr
                          key={item.listing_id}
                          className={`hover:bg-[#0d1117]/60 transition ${
                            isOutdated ? 'bg-red-950/10 opacity-70' : isReserved ? 'bg-amber-950/10' : ''
                          }`}
                        >
                          {/* Availability Badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {item.availability_status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#238636]/20 text-[#aff5b4] border border-[#238636]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#aff5b4] animate-pulse"></span>
                                ACTIVE (Available)
                              </span>
                            ) : item.availability_status === 'RESERVED' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#d29922]/20 text-[#e3b341] border border-[#d29922]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#e3b341]"></span>
                                RESERVED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#da3633]/20 text-[#f85149] border border-[#da3633]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f85149]"></span>
                                OUTDATED / DELETED
                              </span>
                            )}
                            <div className="text-[9px] text-[#8b949e] mt-1 max-w-[200px] truncate" title={item.availability_reason}>
                              {item.availability_reason || 'Checked via HTTP'}
                            </div>
                          </td>

                          {/* Title & Description */}
                          <td className="py-3 px-3 max-w-sm">
                            <div className="font-bold text-[#f0f6fc]">{item.title}</div>
                            <div className="text-[10px] text-[#8b949e] mt-0.5">
                              {item.location} &bull; Scraped: {item.scraped_at}
                            </div>
                            {item.ai_analysis?.reasoning_summary && (
                              <p className="text-[10px] text-[#8b949e] mt-1 line-clamp-1 italic">
                                "{item.ai_analysis.reasoning_summary}"
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-3 font-bold text-[#f0f6fc] whitespace-nowrap">
                            {item.price}
                          </td>

                          <td className="py-3 px-3 text-[#d29922] whitespace-nowrap">
                            ~{item.ai_analysis?.estimated_repair_cost_total} €
                          </td>

                          <td className="py-3 px-3 text-[#79c0ff] whitespace-nowrap">
                            ~{item.ai_analysis?.estimated_refurbished_value} €
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            {item.ai_analysis?.is_profitable ? (
                              <span className="bg-[#238636]/20 border border-[#238636] text-[#aff5b4] font-bold px-2 py-0.5 rounded text-[11px]">
                                +{item.ai_analysis.profit_margin_eur.toFixed(2)} €
                              </span>
                            ) : (
                              <span className="bg-[#da3633]/20 border border-[#da3633] text-[#f85149] font-bold px-2 py-0.5 rounded text-[11px]">
                                {item.ai_analysis?.profit_margin_eur.toFixed(2)} €
                              </span>
                            )}
                          </td>

                          {/* Action Buttons: Check live & Open */}
                          <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => handleCheckSingleItem(item.listing_id)}
                              disabled={isItemChecking}
                              className="bg-[#21262d] hover:bg-[#30363d] text-[#79c0ff] px-2 py-1 rounded text-[10px] font-medium inline-flex items-center gap-1 border border-[#30363d] transition"
                            >
                              <RefreshCw className={`w-3 h-3 ${isItemChecking ? 'animate-spin' : ''}`} />
                              <span>{isItemChecking ? 'Checking...' : 'Check'}</span>
                            </button>

                            {/* Guaranteed Live Search Query */}
                            <a
                              href={item.search_url || "https://www.kleinanzeigen.de/s-dortmund/defekt/k0l2078"}
                              target="_blank"
                              rel="noreferrer"
                              title="Search live active listings on Kleinanzeigen Dortmund"
                              className="bg-[#238636]/20 hover:bg-[#238636]/40 text-[#aff5b4] border border-[#238636]/50 px-2 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 transition"
                            >
                              <Search className="w-2.5 h-2.5" />
                              <span>Search Live</span>
                            </a>

                            {/* Direct Ad URL */}
                            <a
                              href={item.item_url}
                              target="_blank"
                              rel="noreferrer"
                              className={`px-2 py-1 rounded text-[10px] font-medium inline-flex items-center gap-1 border border-[#30363d] transition ${
                                isOutdated
                                  ? 'bg-[#0d1117] text-[#8b949e] line-through'
                                  : 'bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff]'
                              }`}
                            >
                              <span>{isOutdated ? 'Ad (Sold)' : 'Open Ad'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-[#8b949e]">
                <p>No listings match the selected availability filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SERVER LOGS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'logs' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
            <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
              Live Server Execution Log (web_app_execution.log)
            </h3>
            <span className="text-[10px] text-[#aff5b4] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#aff5b4] animate-pulse" />
              AVAILABILITY_GUARD_ACTIVE
            </span>
          </div>

          <div className="bg-[#0d1117] p-3 rounded text-[11px] font-mono space-y-1 max-h-96 overflow-y-auto text-[#d1d5db]">
            <div className="text-[#8b949e]">[2026-08-29 13:00:01] [INFO] [PID 40922] [KleinanzeigenWebApp]: Initialized SQLite database engine at instance/scraper_webapp.db</div>
            <div className="text-[#8b949e]">[2026-08-29 13:00:02] [INFO] [PID 40922] [KleinanzeigenWebApp]: Starting Kleinanzeigen Multi-User Web Server on port 5000</div>
            <div className="text-[#79c0ff]">[2026-08-29 13:05:14] [INFO] [PID 40922] [KleinanzeigenWebApp]: User login successful: 'dortmund_flipper' (ID: 1)</div>
            <div className="text-[#8b949e]">[2026-08-29 13:05:15] [INFO] [PID 40922] [KleinanzeigenWebApp]: HTTP GET /dashboard (Status 200 OK)</div>
            <div className="text-[#aff5b4]">[2026-08-29 13:10:44] [INFO] [PID 40922] [KleinanzeigenWebApp]: Updated availability verification settings for user 'dortmund_flipper'</div>
            <div className="text-[#79c0ff]">[2026-08-29 13:15:20] [INFO] [PID 40922] [ScraperWorker]: === Starting Scraper &amp; Availability Guard Job for User 'dortmund_flipper' ===</div>
            <div className="text-[#8b949e]">[2026-08-29 13:15:22] [INFO] [PID 40922] [ScraperWorker]: Playwright Chromium navigated to https://www.kleinanzeigen.de/s-dortmund/defekt/k0l2078</div>
            <div className="text-[#aff5b4]">[2026-08-29 13:15:24] [INFO] [PID 40922] [AvailabilityChecker]: Listing 2840192831: HTTP 200 OK &rarr; Verified ACTIVE.</div>
            <div className="text-[#f85149]">[2026-08-29 13:15:25] [WARN] [PID 40922] [AvailabilityChecker]: Listing 2840165521: HTTP 404 / Deleted banner &rarr; Tagged UNAVAILABLE (Skipped from alert).</div>
            <div className="text-[#aff5b4]">[2026-08-29 13:15:28] [INFO] [PID 40922] [ListingProfitAnalyzer]: AI assessment for 'DeLonghi Magnifica S' evaluated net profit margin = +114.00 EUR (PROFITABLE)</div>
            <div className="text-[#58a6ff]">[2026-08-29 13:15:29] [INFO] [PID 40922] [ScraperWorker]: Telegram alert sent successfully to chat ID -10088921829 for verified active listing</div>
            <div className="text-[#aff5b4]">[2026-08-29 13:15:30] [INFO] [PID 40922] [ScraperWorker]: === Completed Scraper Job: Saved active listings to SQLite DB ===</div>
          </div>
        </div>
      )}
    </div>
  );
};
