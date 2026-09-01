export interface ReplacementPart {
  part_name: string;
  cost_eur: number;
}

export interface AIProfitAnalysis {
  detected_issues: string[];
  estimated_replacement_parts: ReplacementPart[];
  estimated_repair_cost_total: number;
  estimated_refurbished_value: number;
  is_profitable: boolean;
  profit_margin_eur: number;
  reasoning_summary: string;
  analyzed_at?: string;
  model_used?: string;
  execution_time_ms?: number;
}

export type ListingAvailabilityStatus = 'ACTIVE' | 'RESERVED' | 'UNAVAILABLE' | 'CHECKING';

export interface ExtractedListing {
  listing_id: string;
  title: string;
  price: string;
  location: string;
  description: string;
  item_url: string;
  search_url?: string;
  posted_date: string;
  scraped_at: string;
  category?: string;
  isNew?: boolean;
  user_id?: number;
  source_platform?: string;
  telegram_notified?: boolean;
  availability_status: ListingAvailabilityStatus;
  last_availability_check?: string;
  availability_reason?: string;
  is_available?: boolean;
  ai_analysis?: AIProfitAnalysis;
}

export interface UserAccount {
  id: number;
  username: string;
  email: string;
  created_at: string;
  is_active: boolean;
  avatar_initials?: string;
}

export interface DbUserSettings {
  id: number;
  user_id: number;
  // Execution Mode (Dual Mode Architecture)
  execution_mode: "local" | "cloud";
  // Local LLM Config (Ollama / LM Studio / LocalAI)
  local_llm_provider: "ollama" | "lm_studio" | "localai" | "custom";
  local_llm_endpoint: string;
  local_llm_model: string;
  fallback_to_cloud: boolean;
  // Telegram Config
  telegram_bot_token: string;
  telegram_chat_id: string;
  telegram_alerts_enabled: boolean;
  // Cloud AI Model Config
  ai_provider: "google_gemini" | "openai" | "anthropic";
  ai_model: string;
  ai_api_key: string;
  // Target Source
  target_source: "kleinanzeigen" | "ebay_kleinanzeigen" | "willhaben" | "vinted";
  // Filter Parameters
  category: string;
  keywords: string;
  target_location: string;
  location_id: string;
  radius_km: number;
  min_price: number;
  max_price: number;
  // Profitability Thresholds
  min_profit_eur: number;
  max_repair_budget: number;
  // Availability Verification Engine
  verify_availability_before_save: boolean;
  skip_unavailable_in_alerts: boolean;
  auto_recheck_availability: boolean;
  // Automation Schedule
  auto_scrape_interval_minutes: number;
  is_active: boolean;
  updated_at: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG" | "SUCCESS";
  message: string;
  source?: string;
  details?: string;
}

export interface ScraperConfig {
  executionMode: "local" | "cloud";
  localLlmProvider: "ollama" | "lm_studio" | "localai" | "custom";
  localLlmEndpoint: string;
  localLlmModel: string;
  fallbackToCloud: boolean;
  keywords: string[];
  locationName: string;
  locationId: string;
  maxPages: number;
  headless: boolean;
  telegramToken?: string;
  telegramChatId?: string;
  proxyUrl?: string;
  geminiApiKey?: string;
  minProfitEur?: number;
  maxRepairBudget?: number;
}

export interface TestResult {
  id: string;
  name: string;
  description: string;
  category: "Smoke Test (30s)" | "Flask Web App & DB" | "AI Profitability Engine" | "Playwright Context" | "URL Generation" | "Deduplication" | "DOM Selectors";
  status: "pending" | "running" | "passed" | "failed";
  durationMs?: number;
  details?: string;
}


export interface ProjectFile {
  filename: string;
  title: string;
  language: "python" | "markdown" | "text" | "bash" | "env" | "html";
  description: string;
  content: string;
  badge?: string;
}

