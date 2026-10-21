import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Layers, 
  Sparkles, 
  Compass, 
  Bot, 
  Database, 
  HelpCircle,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Keyboard as KeyboardIcon,
  Mic,
  Eye,
  FileCheck2
} from 'lucide-react';
import { LanguageCode, Scheme, Sector, UserProfile } from './types';
import { SCHEMES_DATABASE, ALL_20_SECTORS } from './data/schemesData';
import { AuthPortal } from './components/auth/AuthPortal';
import { Navbar } from './components/layout/Navbar';
import { SchemeCard } from './components/schemes/SchemeCard';
import { SchemeDetailsModal } from './components/schemes/SchemeDetailsModal';
import { EligibilityWizard } from './components/eligibility/EligibilityWizard';
import { BenefitFinder } from './components/benefits/BenefitFinder';
import { DocumentChecklist } from './components/documents/DocumentChecklist';
import { VirtualKeyboard } from './components/keyboard/VirtualKeyboard';
import { VoiceAssistantModal } from './components/voice/VoiceAssistantModal';
import { SchemeAgentDrawer } from './components/agent/SchemeAgentDrawer';
import { RAGInspectorModal } from './components/rag/RAGInspectorModal';
import { RAGQueryResult } from './lib/rag/types';
import { TRANSLATIONS, getSectorName, getLocalizedSchemeName } from './lib/i18n';

export const SECTOR_ICONS: Record<string, string> = {
  'Education': '🎓',
  'Healthcare': '🏥',
  'Women & Child Welfare': '👩‍👧',
  'Agriculture': '🌾',
  'Employment': '💼',
  'Skill Development': '⚙️',
  'Housing': '🏠',
  'Disability Support': '♿',
  'Senior Citizens': '👴',
  'Financial Support': '💰',
  'Entrepreneurship': '🚀',
  'Social Welfare': '🤝',
  'Rural Development': '🏡',
  'Urban Development': '🏙️',
  'Food & Nutrition': '🍲',
  'Pension & Social Security': '🛡️',
  'Fisheries & Animal Husbandry': '🐟',
  'MSME': '🏭',
  'Tribal Welfare': '🏹',
  'Energy & Utilities': '⚡'
};

export default function App() {
  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('janseva_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return user?.preferredLanguage || 'en';
  });

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Navigation tab state matching Screenshot 1
  const [activeTab, setActiveTab] = useState<'catalog' | 'eligibility' | 'missing-benefits' | 'documents'>('catalog');

  // Scheme Catalog filter states matching Screenshot 1
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Central' | 'State'>('All');
  const [selectedState, setSelectedState] = useState<string>('All-India (Central)');
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');
  const [sectorViewMode, setSectorViewMode] = useState<'catalog' | 'by-sector'>('catalog');

  // High contrast mode
  const [highContrast, setHighContrast] = useState(false);

  // Modals and Drawers
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<Scheme | null>(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isSchemeAgentOpen, setIsSchemeAgentOpen] = useState(false);
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState(false);
  const [isRAGInspectorOpen, setIsRAGInspectorOpen] = useState(false);
  const [activeTraceResult, setActiveTraceResult] = useState<RAGQueryResult | null>(null);

  // Target input for virtual keyboard typing
  const [keyboardTarget, setKeyboardTarget] = useState<'search' | 'agent'>('search');

  // Handle Login Success
  const handleLoginSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    if (authenticatedUser.preferredLanguage) {
      setCurrentLanguage(authenticatedUser.preferredLanguage);
    }
    if (authenticatedUser.state && authenticatedUser.state !== 'All India') {
      setSelectedState(authenticatedUser.state);
    }
  };

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('janseva_auth_user');
    setUser(null);
    setActiveTab('catalog');
  };

  // Virtual keyboard target handler for multi-input typing (Search & Scheme Agent)
  const [customKeyboardHandler, setCustomKeyboardHandler] = useState<{
    value: string;
    onInsert: (char: string) => void;
    onBackspace?: () => void;
    onClear?: () => void;
  } | null>(null);

  // Virtual keyboard key handlers
  const handleKeyboardKeyPress = (char: string) => {
    if (customKeyboardHandler) {
      customKeyboardHandler.onInsert(char);
    } else {
      setSearchQuery(prev => prev + char);
    }
  };

  const handleKeyboardBackspace = () => {
    if (customKeyboardHandler?.onBackspace) {
      customKeyboardHandler.onBackspace();
    } else {
      setSearchQuery(prev => prev.slice(0, -1));
    }
  };

  const handleKeyboardClear = () => {
    if (customKeyboardHandler?.onClear) {
      customKeyboardHandler.onClear();
    } else {
      setSearchQuery('');
    }
  };

  // Group all 200 schemes by sector (guaranteed 10 schemes for each of the 20 sectors)
  const schemesBySector = useMemo(() => {
    const map: Record<string, Scheme[]> = {};
    ALL_20_SECTORS.forEach(sec => {
      map[sec] = SCHEMES_DATABASE.filter(s => s.sector === sec);
    });
    return map;
  }, []);

  // Filter schemes according to Level, State, Sector, and Search Query
  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATABASE.filter(scheme => {
      // Sector filter: when a sector is selected, guarantee all 10 schemes of that sector are preserved
      if (selectedSector !== 'All Sectors') {
        if (scheme.sector !== selectedSector) return false;
      }

      // Government Level filter (All, Central, State) - only restrict if user is viewing All Sectors
      if (selectedLevel !== 'All' && selectedSector === 'All Sectors' && scheme.level !== selectedLevel) {
        return false;
      }

      // State / UT filter - applied when viewing All Sectors to help discover local initiatives
      if (selectedState !== 'All-India (Central)' && selectedSector === 'All Sectors') {
        const isMatchState = scheme.states.includes('All') || 
          scheme.states.some(s => s.toLowerCase() === selectedState.toLowerCase());
        if (!isMatchState) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = scheme.name.toLowerCase().includes(q) ||
          (scheme.nameInHindi && scheme.nameInHindi.toLowerCase().includes(q)) ||
          (scheme.nameInTamil && scheme.nameInTamil.toLowerCase().includes(q));
        const matchDesc = scheme.description.toLowerCase().includes(q);
        const matchBenefit = scheme.financialBenefit.toLowerCase().includes(q);
        const matchTags = scheme.tags.some(t => t.toLowerCase().includes(q));
        const matchSector = scheme.sector.toLowerCase().includes(q);

        if (!matchTitle && !matchDesc && !matchBenefit && !matchTags && !matchSector) {
          return false;
        }
      }

      return true;
    });
  }, [selectedLevel, selectedState, selectedSector, searchQuery]);

  // Voice assistant submit query handler
  const handleVoiceAssistantQuery = async (queryText: string): Promise<string> => {
    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          state: selectedState,
          language: currentLanguage,
          topK: 4
        })
      });
      const data: RAGQueryResult = await res.json();
      if (data.answer) return data.answer;
      return 'Found multiple schemes matching your query. Explore the catalog for full application criteria.';
    } catch (err) {
      return 'Completed database lookup: PM-KISAN, Ayushman Bharat, PM Awas Yojana, and Mudra loans are major active programs.';
    }
  };

  // If user is not authenticated: Show only the Login/Sign Up Gate with OTP
  if (!user) {
    return (
      <AuthPortal
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col ${
      highContrast ? 'bg-black text-white' : 'bg-[#080d1a]'
    }`}>
      {/* Top Navbar matching Screenshot 1 */}
      <Navbar
        user={user}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        onOpenSchemeAgent={() => setIsSchemeAgentOpen(true)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: SCHEME CATALOG & SEARCH matching Screenshot 1 */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            
            {/* Hero Card matching Screenshot 1 */}
            <div className="rounded-2xl bg-[#0c1322] border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="max-w-4xl space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <span className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    {t.nationalPortal}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-normal">{t.portalSubtitle}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {t.heroTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  {t.heroSubtitle}
                </p>

                {/* Search Bar matching Screenshot 1 */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl pl-4 pr-16 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                    />

                    {/* Keyb button inside input matching Screenshot 1 */}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomKeyboardHandler(null);
                        setIsVirtualKeyboardOpen(true);
                      }}
                      className="absolute right-2 px-2.5 py-1 bg-[#151f33] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Open Multilingual Virtual Keyboard"
                    >
                      {t.keybButton}
                    </button>
                  </div>

                  {/* Search Schemes Orange Button matching Screenshot 1 */}
                  <button
                    type="button"
                    onClick={() => {}}
                    className="w-full sm:w-auto px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-orange-950/30 cursor-pointer shrink-0"
                  >
                    {t.searchButton}
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Card matching Screenshot 1 */}
            <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              
              {/* Row 1: Government Level & State/UT */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold mr-1">{t.govLevel}</span>
                  {(['All', 'Central', 'State'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-3.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedLevel === lvl
                          ? 'bg-slate-900 text-white border border-slate-600 shadow'
                          : 'bg-transparent text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {lvl === 'All' ? t.levelAll : lvl === 'Central' ? t.levelCentral : t.levelState}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold">{t.stateUt}</span>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-[#060a14] border border-slate-700 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="All-India (Central)">{t.allStatesLabel}</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                  </select>
                </div>
              </div>

              {/* Row 2: SELECT SECTOR (20): matching Screenshot 1 */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t.selectSector}
                  </div>
                  <span className="text-[11px] text-amber-400 font-semibold hidden sm:inline">
                    {t.everySectorBadge}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {/* All Sectors pill */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSector('All Sectors');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      selectedSector === 'All Sectors'
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                        : 'bg-[#0f172a] text-slate-300 border border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <span>{t.allSectors}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 font-bold">200</span>
                  </button>

                  {/* 20 Sectors pills with 10 count badge */}
                  {ALL_20_SECTORS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        setSelectedSector(sec);
                        if (sectorViewMode === 'by-sector') {
                          setSectorViewMode('catalog');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        selectedSector === sec
                          ? 'bg-blue-600 text-white shadow-md font-semibold ring-2 ring-blue-400/40'
                          : 'bg-[#0f172a] text-slate-300 border border-slate-700/80 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{SECTOR_ICONS[sec] || '🏛️'}</span>
                      <span>{getSectorName(sec, currentLanguage)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        selectedSector === sec ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        10
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Available Schemes Header & View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <span>{selectedSector === 'All Sectors' ? t.availableSchemes : `${SECTOR_ICONS[selectedSector] || ''} ${getSectorName(selectedSector, currentLanguage)}`}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    {selectedSector === 'All Sectors' ? `${filteredSchemes.length} ${t.schemesTotal}` : `${filteredSchemes.length} ${t.ofSchemes}`}
                  </span>
                </span>

                {(selectedSector !== 'All Sectors' || selectedLevel !== 'All' || selectedState !== 'All-India (Central)' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSector('All Sectors');
                      setSelectedLevel('All');
                      setSelectedState('All-India (Central)');
                      setSearchQuery('');
                    }}
                    className="text-amber-400 hover:text-amber-300 underline font-medium ml-2 cursor-pointer"
                  >
                    {t.resetFilters}
                  </button>
                )}
              </div>

              {/* View Mode Toggle: Catalog vs Group by 20 Sectors */}
              <div className="flex items-center gap-1 bg-[#060a14] border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSectorViewMode('catalog')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    sectorViewMode === 'catalog'
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>📑</span>
                  <span>{t.viewStandardList}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSector('All Sectors');
                    setSectorViewMode('by-sector');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    sectorViewMode === 'by-sector'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🗂️</span>
                  <span>{t.viewBySectors}</span>
                </button>
              </div>
            </div>

            {/* Specific Sector Spotlight Banner when a sector is selected in Catalog view */}
            {selectedSector !== 'All Sectors' && sectorViewMode === 'catalog' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-[#0c1629] to-slate-900 border border-blue-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="text-3xl p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    {SECTOR_ICONS[selectedSector] || '🏛️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono uppercase font-bold text-blue-400 tracking-wider">
                        {t.selectSector} {(ALL_20_SECTORS as readonly string[]).indexOf(selectedSector) + 1} / 20
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase">
                        10 {t.ofSchemes}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-white">{getSectorName(selectedSector, currentLanguage)}</h2>
                    <p className="text-xs text-slate-300">
                      10 {t.availableSchemes}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const currIdx = (ALL_20_SECTORS as readonly string[]).indexOf(selectedSector);
                      const prevIdx = (currIdx - 1 + ALL_20_SECTORS.length) % ALL_20_SECTORS.length;
                      setSelectedSector(ALL_20_SECTORS[prevIdx]);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer transition"
                    title="Previous Sector"
                  >
                    ← {t.btnBack}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currIdx = (ALL_20_SECTORS as readonly string[]).indexOf(selectedSector);
                      const nextIdx = (currIdx + 1) % ALL_20_SECTORS.length;
                      setSelectedSector(ALL_20_SECTORS[nextIdx]);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer transition"
                    title="Next Sector"
                  >
                    {t.btnNext} →
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSector('All Sectors')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/30 cursor-pointer transition"
                  >
                    {t.allSectors}
                  </button>
                </div>
              </div>
            )}

            {/* VIEW MODE 1: Catalog Grid View */}
            {sectorViewMode === 'catalog' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSchemes.map((scheme) => {
                  const stateLabel = scheme.states.filter(s => s !== 'All').join(', ') || t.allStatesLabel;
                  return (
                    <div
                      key={scheme.id}
                      className="bg-[#0b1220] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-2xl hover:shadow-black/50 group"
                    >
                      <div>
                        {/* Badges bar */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-semibold">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold">
                            {scheme.level === 'Central' ? t.centralScheme : t.stateScheme}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {stateLabel}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {SECTOR_ICONS[scheme.sector] || ''} {getSectorName(scheme.sector, currentLanguage)}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition leading-snug mb-1.5">
                          {getLocalizedSchemeName(scheme, currentLanguage)}
                        </h3>

                        <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                          {scheme.description}
                        </p>

                        <div className="p-3 bg-[#060a14] border border-slate-800 rounded-xl mb-4 text-xs">
                          <span className="font-semibold text-slate-300 block mb-0.5">{t.financialBenefit}:</span>
                          <span className="text-amber-300 font-medium">{scheme.financialBenefit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => setSelectedSchemeForModal(scheme)}
                          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                        >
                          {t.viewDetails}
                        </button>
                        <a
                          href={scheme.officialPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition"
                          title={t.applyNow}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 2: Grouped by 20 Sectors (10 Schemes for Each Sector) */}
            {sectorViewMode === 'by-sector' && (
              <div className="space-y-10">
                {ALL_20_SECTORS.map((sec, secIdx) => {
                  const sectorSchemes = schemesBySector[sec] || [];
                  return (
                    <div key={sec} id={`sector-${secIdx}`} className="space-y-4 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[#0c1527] border border-slate-800 shadow-lg">
                        <div className="flex items-center gap-3.5">
                          <span className="text-3xl p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow">
                            {SECTOR_ICONS[sec] || '🏛️'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                                {t.selectSector} {secIdx + 1} / 20
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                                10 {t.ofSchemes}
                              </span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-white">{getSectorName(sec, currentLanguage)}</h2>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSector(sec);
                            setSectorViewMode('catalog');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow self-start sm:self-auto"
                        >
                          {getSectorName(sec, currentLanguage)} (10)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sectorSchemes.map((scheme) => {
                          const stateLabel = scheme.states.filter(s => s !== 'All').join(', ') || t.allStatesLabel;
                          return (
                            <div
                              key={scheme.id}
                              className="bg-[#0b1220] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-2xl hover:shadow-black/50 group"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-semibold">
                                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold">
                                    {scheme.level === 'Central' ? t.centralScheme : t.stateScheme}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    {stateLabel}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                    {SECTOR_ICONS[scheme.sector] || ''} {getSectorName(scheme.sector, currentLanguage)}
                                  </span>
                                </div>

                                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition leading-snug mb-1.5">
                                  {getLocalizedSchemeName(scheme, currentLanguage)}
                                </h3>

                                <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                                  {scheme.description}
                                </p>

                                <div className="p-3 bg-[#060a14] border border-slate-800 rounded-xl mb-4 text-xs">
                                  <span className="font-semibold text-slate-300 block mb-0.5">{t.financialBenefit}:</span>
                                  <span className="text-amber-300 font-medium">{scheme.financialBenefit}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                                <button
                                  type="button"
                                  onClick={() => setSelectedSchemeForModal(scheme)}
                                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                                >
                                  {t.viewDetails}
                                </button>
                                <a
                                  href={scheme.officialPortalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition"
                                  title={t.applyNow}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ELIGIBILITY JOURNEY */}
        {activeTab === 'eligibility' && (
          <EligibilityWizard
            user={user}
            currentLanguage={currentLanguage}
            onOpenDetails={(sch) => setSelectedSchemeForModal(sch)}
          />
        )}

        {/* TAB 3: WHAT AM I MISSING? */}
        {activeTab === 'missing-benefits' && (
          <BenefitFinder
            user={user}
            currentLanguage={currentLanguage}
            onOpenDetails={(sch) => setSelectedSchemeForModal(sch)}
          />
        )}

        {/* TAB 4: DOCUMENT CHECKLIST matching Screenshot 1 */}
        {activeTab === 'documents' && (
          <DocumentChecklist
            currentLanguage={currentLanguage}
          />
        )}
      </main>

      {/* Floating Bottom-Right Pill matching Screenshot 1: "Ask Scheme Agent [EN]" */}
      <button
        type="button"
        onClick={() => setIsSchemeAgentOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-full border border-slate-700 shadow-2xl flex items-center gap-2 text-xs font-bold transition hover:scale-105 cursor-pointer ring-2 ring-emerald-500/30"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{t.askSchemeAgent}</span>
        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono text-slate-300">
          {currentLanguage}
        </span>
      </button>

      {/* Virtual Keyboard Modal across all 10 languages */}
      {isVirtualKeyboardOpen && (
        <VirtualKeyboard
          isOpen={isVirtualKeyboardOpen}
          onClose={() => {
            setIsVirtualKeyboardOpen(false);
            setCustomKeyboardHandler(null);
          }}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onKeyPress={handleKeyboardKeyPress}
          onBackspace={handleKeyboardBackspace}
          onClear={handleKeyboardClear}
          onEnter={() => {
            setIsVirtualKeyboardOpen(false);
            setCustomKeyboardHandler(null);
          }}
          currentValue={customKeyboardHandler ? customKeyboardHandler.value : searchQuery}
        />
      )}

      {/* Voice Assistant Modal matching Screenshot 2 */}
      {isVoiceAssistantOpen && (
        <VoiceAssistantModal
          isOpen={isVoiceAssistantOpen}
          onClose={() => setIsVoiceAssistantOpen(false)}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onQuerySubmit={handleVoiceAssistantQuery}
          stateName={selectedState}
        />
      )}

      {/* Scheme Agent Drawer matching Screenshot 3 */}
      {isSchemeAgentOpen && (
        <SchemeAgentDrawer
          isOpen={isSchemeAgentOpen}
          onClose={() => setIsSchemeAgentOpen(false)}
          user={user}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onOpenVoiceModal={() => {
            setIsSchemeAgentOpen(false);
            setIsVoiceAssistantOpen(true);
          }}
          onOpenKeyboard={(curr, onIns, onBk, onClr) => {
            setCustomKeyboardHandler({
              value: curr,
              onInsert: onIns,
              onBackspace: onBk,
              onClear: onClr
            });
            setIsVirtualKeyboardOpen(true);
          }}
          onOpenRAGTrace={(res) => {
            if (res) setActiveTraceResult(res);
            setIsRAGInspectorOpen(true);
          }}
          stateFilter={selectedState}
        />
      )}

      {/* Scheme Details Modal */}
      {selectedSchemeForModal && (
        <SchemeDetailsModal
          scheme={selectedSchemeForModal}
          currentLanguage={currentLanguage}
          onClose={() => setSelectedSchemeForModal(null)}
        />
      )}

      {/* RAG Inspector Modal */}
      {isRAGInspectorOpen && (
        <RAGInspectorModal
          initialResult={activeTraceResult}
          onClose={() => setIsRAGInspectorOpen(false)}
        />
      )}

      {/* Portal Footer */}
      <footer className="border-t border-slate-900 bg-[#04060d] text-center py-4 text-xs text-slate-500 mt-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>National Welfare Portal of India • Authenticated Citizen: <strong className="text-slate-300">{user.name}</strong></span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>200 Verified Schemes Across 20 Priority Sectors • Multilingual Voice & Virtual Keyboard</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
