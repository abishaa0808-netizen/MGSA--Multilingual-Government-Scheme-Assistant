import React from 'react';
import { 
  Building2, 
  Globe2, 
  LogOut, 
  Mic, 
  Bot, 
  Eye, 
  MapPin, 
  ExternalLink,
  Layers,
  Compass,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../lib/i18n';

interface NavbarProps {
  user: UserProfile;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  selectedState: string;
  onStateChange: (st: string) => void;
  activeTab: 'catalog' | 'eligibility' | 'missing-benefits' | 'documents';
  onTabChange: (tab: 'catalog' | 'eligibility' | 'missing-benefits' | 'documents') => void;
  onOpenVoiceAssistant: () => void;
  onOpenSchemeAgent: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onSignOut: () => void;
}

const INDIAN_STATES_AND_UTS = [
  'All-India (Central)',
  'Tamil Nadu',
  'Kerala',
  'Odisha',
  'Maharashtra',
  'Karnataka',
  'Uttar Pradesh',
  'Telangana',
  'Andhra Pradesh',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Madhya Pradesh',
  'Bihar',
  'Punjab',
  'Haryana',
  'Jammu & Kashmir',
  'Assam',
  'Delhi (NCT)'
];

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English (English)',
  hi: 'हिन्दी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  bn: 'বাংলা (Bengali)',
  mr: 'मराठी (Marathi)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളം (Malayalam)',
  or: 'ଓଡ଼ିଆ (Odia)',
  ur: 'اردو (Urdu)'
};

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentLanguage,
  onLanguageChange,
  selectedState,
  onStateChange,
  activeTab,
  onTabChange,
  onOpenVoiceAssistant,
  onOpenSchemeAgent,
  highContrast,
  onToggleHighContrast,
  onSignOut
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 bg-[#070b14] border-b border-slate-800 text-white select-none">
      
      {/* Topmost Micro Bar matching Screenshot 1 */}
      <div className="border-b border-slate-800/80 bg-[#050811] px-4 lg:px-8 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 uppercase tracking-wider">{t.nationalPortal}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">{t.portalSubtitle}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleHighContrast}
            className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1 text-[11px]"
            title="Toggle High Contrast"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{highContrast ? t.standardContrast : t.highContrast}</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden md:inline">{t.officialLinks}</span>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={onSignOut}
            className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            title="Sign out of citizen session"
          >
            {t.signOut}
          </button>
        </div>
      </div>

      {/* Main Navbar Section matching Screenshot 1 */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div 
          onClick={() => onTabChange('catalog')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          {/* Orange Accent Bar from screenshot */}
          <div className="w-2.5 h-8 bg-amber-500 rounded-sm" />
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight">
              {t.appTitle}
            </h1>
            <p className="text-[11px] text-slate-400">
              {t.appSub}
            </p>
          </div>
        </div>

        {/* Right Controls: State, Language, Voice Assistant, Ask Scheme Agent */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* State / UT Dropdown matching Screenshot 1 */}
          <div className="flex items-center bg-[#0d1424] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 mr-1.5 font-medium">{t.stateUt}</span>
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-white">
                  {st === 'All-India (Central)' ? t.allStatesLabel : st}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector Dropdown matching Screenshot 1 */}
          <div className="flex items-center bg-[#0d1424] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 mr-1.5 font-medium">{t.language}</span>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900">English (English)</option>
              <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
              <option value="ta" className="bg-slate-900">தமிழ் (Tamil)</option>
              <option value="te" className="bg-slate-900">తెలుగు (Telugu)</option>
              <option value="bn" className="bg-slate-900">বাংলা (Bengali)</option>
              <option value="mr" className="bg-slate-900">मराठी (Marathi)</option>
              <option value="kn" className="bg-slate-900">ಕನ್ನಡ (Kannada)</option>
              <option value="ml" className="bg-slate-900">മലയാളം (Malayalam)</option>
              <option value="or" className="bg-slate-900">ଓଡ଼ିଆ (Odia)</option>
              <option value="ur" className="bg-slate-900">اردو (Urdu)</option>
            </select>
          </div>

          {/* Voice Assistant Button matching Screenshot 1 */}
          <button
            type="button"
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-slate-100 border border-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{t.voiceAssistant}</span>
          </button>

          {/* Ask Scheme Agent Button matching Screenshot 1 */}
          <button
            type="button"
            onClick={onOpenSchemeAgent}
            className="px-4 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] active:bg-[#9a3412] text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-md"
          >
            {t.askSchemeAgent}
          </button>
        </div>
      </div>

      {/* Navigation Tabs matching Screenshot 1 */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 border-t border-slate-800/80 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => onTabChange('catalog')}
          className={`py-3 relative transition whitespace-nowrap cursor-pointer ${
            activeTab === 'catalog'
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t.tabCatalog}</span>
          {activeTab === 'catalog' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('eligibility')}
          className={`py-3 relative transition whitespace-nowrap cursor-pointer ${
            activeTab === 'eligibility'
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t.tabEligibility}</span>
          {activeTab === 'eligibility' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('missing-benefits')}
          className={`py-3 relative transition whitespace-nowrap cursor-pointer ${
            activeTab === 'missing-benefits'
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t.tabMissingBenefits}</span>
          {activeTab === 'missing-benefits' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('documents')}
          className={`py-3 relative transition whitespace-nowrap cursor-pointer ${
            activeTab === 'documents'
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t.tabDocuments}</span>
          {activeTab === 'documents' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
};
