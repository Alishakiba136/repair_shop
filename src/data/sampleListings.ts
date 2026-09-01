import { ExtractedListing } from '../types';

export const INITIAL_SAMPLE_LISTINGS: ExtractedListing[] = [
  {
    listing_id: "2839102831",
    title: "Lenovo Legion 5 Gaming Laptop Defekt für Bastler",
    price: "75 € VB",
    location: "44137 Dortmund - Mitte",
    description: "Laptop geht nach kurzem Lüfteranlauf wieder aus. Display und Gehäuse in gutem Zustand, ohne SSD und RAM. Für Bastler oder Ersatzteile.",
    item_url: "https://www.kleinanzeigen.de/s-anzeige/lenovo-legion-5-gaming-laptop-defekt-fuer-bastler/2839102831-278-2078",
    search_url: "https://www.kleinanzeigen.de/s-dortmund/lenovo-defekt/k0l2078",
    posted_date: "Heute, 14:15",
    scraped_at: new Date().toISOString(),
    category: "Elektronik & PCs",
    isNew: true,
    availability_status: "ACTIVE",
    is_available: true,
    last_availability_check: new Date().toISOString(),
    availability_reason: "HTTP 200 OK • Live Ad Verified • Seller Online",
    ai_analysis: {
      detected_issues: [
        "Motherboard power rail short circuit or BIOS corruption (shutdown after fan spin)",
        "Missing RAM memory modules",
        "Missing NVMe SSD storage"
      ],
      estimated_replacement_parts: [
        { part_name: "16GB DDR4 SO-DIMM RAM (2x8GB)", cost_eur: 25.0 },
        { part_name: "512GB M.2 NVMe SSD", cost_eur: 30.0 },
        { part_name: "Power rail MOSFET / BIOS chip replacement", cost_eur: 15.0 },
        { part_name: "Thermal grizzly paste & consumables", cost_eur: 5.0 }
      ],
      estimated_repair_cost_total: 75.0,
      estimated_refurbished_value: 420.0,
      is_profitable: true,
      profit_margin_eur: 270.0,
      reasoning_summary: "High resale demand for Lenovo Legion 5 with RTX graphics. Replacing RAM/SSD and repairing the board power rail yields a high profit margin of ~270€.",
      analyzed_at: new Date().toISOString(),
      model_used: "gemini-2.5-flash-structured",
      execution_time_ms: 412
    }
  },
  {
    listing_id: "2839109999",
    title: "DeLonghi Magnifica S Kaffeevollautomat defekt an Bastler",
    price: "25 €",
    location: "44225 Dortmund - Hombruch",
    description: "Zieht kein Wasser mehr und Fehlermeldung Allgemeine Störung leuchtet rot. Brühgruppe wurde regelmäßig gereinigt. Ideal zur Reparatur.",
    item_url: "https://www.kleinanzeigen.de/s-anzeige/delonghi-magnifica-s-kaffeevollautomat-defekt-an-bastler/2839109999-176-2078",
    search_url: "https://www.kleinanzeigen.de/s-dortmund/delonghi-defekt/k0l2078",
    posted_date: "Heute, 13:40",
    scraped_at: new Date().toISOString(),
    category: "Haushaltsgeräte",
    isNew: true,
    availability_status: "ACTIVE",
    is_available: true,
    last_availability_check: new Date().toISOString(),
    availability_reason: "HTTP 200 OK • Live Ad Active • In Stock",
    ai_analysis: {
      detected_issues: [
        "Defective ULKA electromagnetic water pump",
        "Calcified or blocked thermoblock solenoid valve",
        "Worn brew group pressure O-rings"
      ],
      estimated_replacement_parts: [
        { part_name: "ULKA EP5 48W Water Pump", cost_eur: 14.0 },
        { part_name: "Food-grade silicone gasket O-ring maintenance kit", cost_eur: 8.0 },
        { part_name: "Citric acid commercial descaler", cost_eur: 4.0 }
      ],
      estimated_repair_cost_total: 26.0,
      estimated_refurbished_value: 160.0,
      is_profitable: true,
      profit_margin_eur: 109.0,
      reasoning_summary: "Classic DeLonghi pump pressure defect. Low-cost replacement pump and O-rings restore full functionality with ~109€ net profit.",
      analyzed_at: new Date().toISOString(),
      model_used: "gemini-2.5-flash-structured",
      execution_time_ms: 320
    }
  },
  {
    listing_id: "2838950123",
    title: "Sony PlayStation 5 Disc Edition mit HDMI Port Schaden defekt",
    price: "130 € VB",
    location: "44263 Dortmund - Hörde",
    description: "PS5 startet normal mit blauem/weißem Licht, aber HDMI Port Pins sind verbogen, daher kein Bild am TV. Ohne Controller.",
    item_url: "https://www.kleinanzeigen.de/s-anzeige/sony-playstation-5-disc-edition-mit-hdmi-port-schaden-defekt/2838950123-279-2078",
    search_url: "https://www.kleinanzeigen.de/s-dortmund/ps5-defekt/k0l2078",
    posted_date: "Heute, 11:20",
    scraped_at: new Date().toISOString(),
    category: "Konsolen & Gaming",
    isNew: true,
    availability_status: "RESERVED",
    is_available: false,
    last_availability_check: new Date().toISOString(),
    availability_reason: "Marked as 'RESERVIERT' by seller on Kleinanzeigen",
    ai_analysis: {
      detected_issues: [
        "Bent / broken internal pins inside HDMI 2.1 port connector",
        "Missing original DualSense controller"
      ],
      estimated_replacement_parts: [
        { part_name: "OEM Sony PS5 HDMI 2.1 connector socket", cost_eur: 6.0 },
        { part_name: "Thermal liquid metal refresh & solder flux", cost_eur: 9.0 }
      ],
      estimated_repair_cost_total: 15.0,
      estimated_refurbished_value: 360.0,
      is_profitable: true,
      profit_margin_eur: 215.0,
      reasoning_summary: "Unit powers up normally indicating intact APU and power supply. Standard micro-soldering HDMI swap yields ~215€ margin.",
      analyzed_at: new Date().toISOString(),
      model_used: "gemini-2.5-flash-structured",
      execution_time_ms: 388
    }
  },
  {
    listing_id: "2837648910",
    title: "Makita Akku-Bohrschrauber DDF484 defekt / Getriebeschaden",
    price: "15 €",
    location: "44329 Dortmund - Derne",
    description: "Motor dreht, aber Bohrfutter blockiert im 2. Gang. Verkaufe ausdrücklich als defektes Bastlergerät ohne Akku.",
    item_url: "https://www.kleinanzeigen.de/s-anzeige/makita-akku-bohrschrauber-ddf484-defekt-getriebeschaden/2837648910-84-2078",
    search_url: "https://www.kleinanzeigen.de/s-dortmund/makita-defekt/k0l2078",
    posted_date: "Gestern, 19:30",
    scraped_at: new Date().toISOString(),
    category: "Werkzeug & Heimwerken",
    isNew: false,
    availability_status: "ACTIVE",
    is_available: true,
    last_availability_check: new Date().toISOString(),
    availability_reason: "HTTP 200 OK • Listing Live & Available",
    ai_analysis: {
      detected_issues: [
        "Stripped / jammed 2-speed planetary gearbox assembly",
        "Worn chuck bearing lock"
      ],
      estimated_replacement_parts: [
        { part_name: "Makita OEM DDF484 Gearbox Unit", cost_eur: 22.0 },
        { part_name: "13mm Keyless Röhm Chuck", cost_eur: 12.0 }
      ],
      estimated_repair_cost_total: 34.0,
      estimated_refurbished_value: 85.0,
      is_profitable: true,
      profit_margin_eur: 36.0,
      reasoning_summary: "Motor is fully functional. Replacing the mechanical gearbox produces an easy flip with ~36€ profit above the 30€ threshold.",
      analyzed_at: new Date().toISOString(),
      model_used: "gemini-2.5-flash-structured",
      execution_time_ms: 295
    }
  },
  {
    listing_id: "2836512309",
    title: "Apple iPhone 13 Pro 128GB Displayglas gesprungen defekt",
    price: "160 € VB",
    location: "44139 Dortmund - Innenstadt-West",
    description: "Glas vorne und hinten gebrochen nach Sturz. Touch reagiert noch teilweise, Face ID funktioniert. iCloud wird vor Übergabe entfernt.",
    item_url: "https://www.kleinanzeigen.de/s-anzeige/apple-iphone-13-pro-128gb-displayglas-gesprungend-defekt/2836512309-173-2078",
    search_url: "https://www.kleinanzeigen.de/s-dortmund/iphone-defekt/k0l2078",
    posted_date: "Gestern, 16:45",
    scraped_at: new Date().toISOString(),
    category: "Smartphones",
    isNew: false,
    availability_status: "UNAVAILABLE",
    is_available: false,
    last_availability_check: new Date().toISOString(),
    availability_reason: "HTTP 404 / 'Diese Anzeige ist nicht mehr verfügbar' (Sold/Deleted by seller)",
    ai_analysis: {
      detected_issues: [
        "Cracked OLED 120Hz Super Retina XDR front screen",
        "Shattered rear back glass backplate"
      ],
      estimated_replacement_parts: [
        { part_name: "OLED 120Hz ProMotion screen replacement with IC transfer", cost_eur: 135.0 },
        { part_name: "Rear back glass housing panel", cost_eur: 28.0 },
        { part_name: "Waterproof IP68 perimeter seal adhesive", cost_eur: 4.0 }
      ],
      estimated_repair_cost_total: 167.0,
      estimated_refurbished_value: 380.0,
      is_profitable: true,
      profit_margin_eur: 53.0,
      reasoning_summary: "Working Face ID and logic board preserves core value. After OLED and rear glass replacement, net return is ~53€.",
      analyzed_at: new Date().toISOString(),
      model_used: "gemini-2.5-flash-structured",
      execution_time_ms: 450
    }
  },
  {
    listing_id: "2835904421",
    title: "Dyson V11 Absolute Staubsauger Akku/Hauptmodul defekt",
    price: "40 €",
    location: "44309 Dortmund - Brackel",
    description: "Trigger klickt, aber Motor pulsiert 7 Mal und stoppt. Filter neu gereinigt. Abholung in Dortmund Brackel.",
    item_url: "https://www.kleinanzeigen.de/s-anzeige/dyson-v11-absolute-staubsauger-akku-hauptmodul-defekt/2835904421-176-2078",
    search_url: "https://www.kleinanzeigen.de/s-dortmund/dyson-defekt/k0l2078",
    posted_date: "27.08.2026",
    scraped_at: new Date().toISOString(),
    category: "Haushaltsgeräte",
    isNew: false,
    availability_status: "UNAVAILABLE",
    is_available: false,
    last_availability_check: new Date().toISOString(),
    availability_reason: "Ad deactivated / Deleted after sale",
    ai_analysis: {
      detected_issues: [
        "BMS cell depletion / internal resistance error (7-pulse diagnostic LED code)"
      ],
      estimated_replacement_parts: [
        { part_name: "25.2V 3600mAh High-capacity Screw-in Battery Pack", cost_eur: 45.0 },
        { part_name: "Washable post-motor HEPA filter", cost_eur: 9.0 }
      ],
      estimated_repair_cost_total: 54.0,
      estimated_refurbished_value: 195.0,
      is_profitable: true,
      profit_margin_eur: 101.0,
      reasoning_summary: "The 7-pulse LED indicates battery BMS protection trigger. A simple 3-screw battery replacement yields ~101€ profit.",
      analyzed_at: new Date().toISOString(),
      model_used: "gemini-2.5-flash-structured",
      execution_time_ms: 310
    }
  }
];
