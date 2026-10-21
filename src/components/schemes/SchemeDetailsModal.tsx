import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Phone, 
  Building2, 
  FileCheck2, 
  CheckCircle2, 
  MapPin, 
  IndianRupee, 
  Users, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { LanguageCode, Scheme } from '../../types';
import { TRANSLATIONS, getSectorName, getLocalizedSchemeName } from '../../lib/i18n';

interface SchemeDetailsModalProps {
  scheme: Scheme | null;
  currentLanguage: LanguageCode;
  onClose: () => void;
}

export const SchemeDetailsModal: React.FC<SchemeDetailsModalProps> = ({
  scheme,
  currentLanguage,
  onClose
}) => {
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  if (!scheme) return null;
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const toggleDoc = (index: number) => {
    setCheckedDocs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const isStateLevel = scheme.level === 'State';
  const localizedTitle = getLocalizedSchemeName(scheme, currentLanguage);
  const localizedSector = getSectorName(scheme.sector, currentLanguage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {isStateLevel ? t.stateScheme : t.centralScheme}
              </span>
              <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                {localizedSector}
              </span>
              <span className="text-xs text-slate-400">
                {scheme.ministry}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {localizedTitle}
            </h2>
            {localizedTitle !== scheme.name && (
              <p className="text-xs text-amber-300/80 font-medium mt-1">{scheme.name}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">{t.overview}</h4>
            <p className="leading-relaxed text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              {scheme.description}
            </p>
          </div>

          {/* Financial Grant details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4" />
              <span>{t.financialBenefit}</span>
            </h4>
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl text-amber-200 font-medium">
              {scheme.financialBenefit}
            </div>
          </div>

          {/* Eligibility Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              {t.eligibilityCriteria}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">Applicable States:</span>
                <span className="font-semibold text-white">
                  {scheme.states.includes('All') ? t.allStatesLabel : scheme.states.join(', ')}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">Target Gender:</span>
                <span className="font-semibold text-white">
                  {scheme.eligibility.gender === 'Female' ? t.genderFemale : scheme.eligibility.gender === 'Male' ? t.genderMale : scheme.eligibility.gender || 'All Genders'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">Age Criterion:</span>
                <span className="font-semibold text-white">
                  {scheme.eligibility.minAge || scheme.eligibility.maxAge 
                    ? `${scheme.eligibility.minAge || 0} - ${scheme.eligibility.maxAge || 100} yrs` 
                    : 'Universal'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">{t.maxIncome}:</span>
                <span className="font-semibold text-white">
                  {scheme.eligibility.maxAnnualIncome 
                    ? `Up to ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}` 
                    : 'Open across all income brackets'}
                </span>
              </div>
            </div>
          </div>

          {/* Documents Required Checklist (Interactive!) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                <span>{t.documentsRequired}</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                {Object.values(checkedDocs).filter(Boolean).length} of {scheme.documentsRequired.length} ready
              </span>
            </div>

            <div className="space-y-2">
              {scheme.documentsRequired.map((doc, idx) => (
                <label 
                  key={idx} 
                  onClick={() => toggleDoc(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    checkedDocs[idx] 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedDocs[idx]}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm">{doc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Application Walkthrough */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              {t.process}
            </h4>
            <div className="space-y-2.5">
              {scheme.applicationProcess.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Helpline and Portal info */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            {scheme.helplineNumber && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{t.helpline}: <strong className="text-emerald-300 font-mono">{scheme.helplineNumber}</strong></span>
              </div>
            )}
            <div className="text-slate-400 text-[11px]">
              Last verified against official gazette: {scheme.lastUpdated}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            {t.close}
          </button>

          <a
            href={scheme.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition"
          >
            <span>{t.applyNow}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
