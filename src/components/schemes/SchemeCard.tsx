import React from 'react';
import { 
  Building2, 
  ExternalLink, 
  FileText, 
  IndianRupee, 
  MapPin, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { LanguageCode, Scheme } from '../../types';
import { TRANSLATIONS, getSectorName, getLocalizedSchemeName } from '../../lib/i18n';

interface SchemeCardProps {
  scheme: Scheme;
  currentLanguage: LanguageCode;
  onOpenDetails: (scheme: Scheme) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  currentLanguage,
  onOpenDetails
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const isStateLevel = scheme.level === 'State';
  const localizedTitle = getLocalizedSchemeName(scheme, currentLanguage);
  const localizedSector = getSectorName(scheme.sector, currentLanguage);

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50 group">
      <div>
        {/* Badges bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            isStateLevel 
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' 
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}>
            {isStateLevel ? t.stateScheme : t.centralScheme}
          </span>

          <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
            {localizedSector}
          </span>

          {scheme.states.length > 0 && !scheme.states.includes('All') && (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
              <MapPin className="w-3 h-3" />
              {scheme.states.join(', ')}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition leading-snug mb-1">
          {localizedTitle}
        </h3>

        {/* Localized Subtitle if English title was replaced */}
        {localizedTitle !== scheme.name && (
          <p className="text-xs text-amber-300/80 font-medium mb-2">{scheme.name}</p>
        )}

        <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
          {scheme.description}
        </p>

        {/* Financial Benefit Highlight Banner */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl mb-4 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <IndianRupee className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <span className="block font-semibold text-slate-300 mb-0.5">{t.financialBenefit}:</span>
            <span className="text-amber-300 font-medium">{scheme.financialBenefit}</span>
          </div>
        </div>

        {/* Quick Criteria Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5 text-[11px] text-slate-400">
          {scheme.eligibility.gender && scheme.eligibility.gender !== 'All' && (
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              👩 {scheme.eligibility.gender === 'Female' ? t.genderFemale : scheme.eligibility.gender === 'Male' ? t.genderMale : t.genderOther} {t.onlyGender}
            </span>
          )}
          {scheme.eligibility.maxAnnualIncome && (
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              {t.maxIncome} &lt; ₹{(scheme.eligibility.maxAnnualIncome / 100000).toFixed(1)}L
            </span>
          )}
          {scheme.eligibility.minAge && (
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              {t.minAge} {scheme.eligibility.minAge}+ yrs
            </span>
          )}
          {scheme.eligibility.occupations && scheme.eligibility.occupations.length > 0 && (
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              {scheme.eligibility.occupations[0]}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => onOpenDetails(scheme)}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.viewDetails}</span>
        </button>

        <a
          href={scheme.officialPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center transition"
          title={t.applyNow}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
