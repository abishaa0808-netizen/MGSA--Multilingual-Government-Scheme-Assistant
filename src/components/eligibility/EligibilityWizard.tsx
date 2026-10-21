import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  IndianRupee, 
  ExternalLink,
  Users,
  Briefcase,
  Home,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { CitizenProfileInput, EligibilityResult, LanguageCode, Scheme, UserProfile } from '../../types';
import { TRANSLATIONS, getLocalizedSchemeName } from '../../lib/i18n';

interface EligibilityWizardProps {
  user: UserProfile;
  currentLanguage: LanguageCode;
  onOpenDetails: (scheme: Scheme) => void;
}

const INDIAN_STATES = [
  'Tamil Nadu',
  'Maharashtra',
  'Karnataka',
  'Uttar Pradesh',
  'Telangana',
  'Andhra Pradesh',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Kerala',
  'Madhya Pradesh',
  'Bihar',
  'Punjab',
  'Haryana',
  'Odisha',
  'All India'
];

const OCCUPATIONS = [
  'Farmer / Agricultural Cultivator',
  'Student (School / College / Polytechnic)',
  'Artisan / Craftsperson / Weaver / Carpenter',
  'Street Vendor / Hawker',
  'Small Business Owner / Shopkeeper',
  'Unorganized Sector Worker / Laborer',
  'Homemaker / Women Head of Family',
  'Self-employed / Service Provider'
];

export const EligibilityWizard: React.FC<EligibilityWizardProps> = ({
  user,
  currentLanguage,
  onOpenDetails
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<CitizenProfileInput>({
    age: 28,
    gender: 'Female',
    state: user.state !== 'All India' ? user.state : 'Tamil Nadu',
    areaType: 'Rural',
    occupation: 'Farmer / Agricultural Cultivator',
    annualIncome: 180000,
    category: 'OBC',
    landholdingAcres: 2.0,
    hasBplCard: true,
    isStudent: false,
    hasDisability: false
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<EligibilityResult[] | null>(null);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch('/api/schemes/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');

      setResults(data.results || []);
    } catch (err) {
      console.warn('Fallback local eligibility calculation');
      // Minimal fallback
      setResults([]);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>{t.tabEligibility}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t.wizardTitle}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t.wizardSubtitle}
          </p>
        </div>

        {/* Step Progress indicators */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-8 pt-6 border-t border-slate-800">
          {[
            { num: 1, label: t.step1Title },
            { num: 2, label: t.step2Title },
            { num: 3, label: t.step3Title },
            { num: 4, label: t.step4Title }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                currentStep === s.num
                  ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                  : currentStep > s.num
                  ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400'
                  : 'border-slate-800 bg-slate-950/40 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  currentStep === s.num
                    ? 'bg-amber-400 text-slate-950'
                    : currentStep > s.num
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {s.num}
                </span>
                <span className="hidden sm:inline line-clamp-1">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Card Body */}
      {!results ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          
          {/* STEP 1: DEMOGRAPHICS */}
          {currentStep === 1 && (
            <div className="space-y-5 max-w-xl">
              <h3 className="text-lg font-bold text-white">{t.step1Title}</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.ageLabel}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={15}
                    max={85}
                    value={profile.age}
                    onChange={(e) => setProfile(p => ({ ...p, age: Number(e.target.value) }))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <span className="font-mono text-lg font-bold text-amber-400 w-12 text-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    {profile.age}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t.genderLabel}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Female', 'Male', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, gender: g }))}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                        profile.gender === g
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {g === 'Female' ? `👩 ${t.genderFemale}` : g === 'Male' ? `👨 ${t.genderMale}` : `🧑 ${t.genderOther}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & CATEGORY */}
          {currentStep === 2 && (
            <div className="space-y-5 max-w-xl">
              <h3 className="text-lg font-bold text-white">{t.step2Title}</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.stateOfResidence}
                </label>
                <select
                  value={profile.state}
                  onChange={(e) => setProfile(p => ({ ...p, state: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s === 'All India' ? t.allStatesLabel : s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t.areaTypeLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Rural', 'Urban'] as const).map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, areaType: area }))}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                        profile.areaType === area
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {area === 'Rural' ? `🌾 ${t.areaRural}` : `🏙️ ${t.areaUrban}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t.categoryLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, category: cat }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        profile.category === cat
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: OCCUPATION & INCOME */}
          {currentStep === 3 && (
            <div className="space-y-5 max-w-xl">
              <h3 className="text-lg font-bold text-white">{t.step3Title}</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.occupationLabel}
                </label>
                <select
                  value={profile.occupation}
                  onChange={(e) => setProfile(p => ({ ...p, occupation: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {OCCUPATIONS.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.incomeLabel}
                  </label>
                  <span className="font-mono text-sm font-bold text-amber-400">
                    ₹{profile.annualIncome.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={25000}
                  max={1200000}
                  step={25000}
                  value={profile.annualIncome}
                  onChange={(e) => setProfile(p => ({ ...p, annualIncome: Number(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>₹25,000 (BPL)</span>
                  <span>₹2.5 Lakhs (EWS)</span>
                  <span>₹8.0 Lakhs (OBC NCL)</span>
                  <span>₹12+ Lakhs</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: LANDHOLDING & SPECIAL STATUS */}
          {currentStep === 4 && (
            <div className="space-y-5 max-w-xl">
              <h3 className="text-lg font-bold text-white">{t.step4Title}</h3>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.landholdingLabel}
                  </label>
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {profile.landholdingAcres} Acres
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={profile.landholdingAcres}
                  onChange={(e) => setProfile(p => ({ ...p, landholdingAcres: Number(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>0 (Landless)</span>
                  <span>Up to 2.5 Acres (Marginal)</span>
                  <span>5 Acres (Small)</span>
                  <span>10+ Acres</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={profile.hasBplCard}
                    onChange={(e) => setProfile(p => ({ ...p, hasBplCard: e.target.checked }))}
                    className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">{t.bplLabel}</span>
                    <span className="text-slate-400">Qualifies for food security, free housing, and specialized grants</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={profile.isStudent}
                    onChange={(e) => setProfile(p => ({ ...p, isStudent: e.target.checked }))}
                    className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">{t.studentLabel}</span>
                    <span className="text-slate-400">Unlocks AICTE Pragati, Post-Matric, and national scholarships</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-800 mt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.btnBack}</span>
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>{t.btnNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCalculate}
                disabled={isCalculating}
                className="py-2.5 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.calculating}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.btnCalculate}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* RESULTS VIEW */
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h3 className="text-xl font-bold text-white">
                  {t.resultsTitle} ({results.filter(r => r.isEligible).length} Eligible)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {t.resultsSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setResults(null)}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer shrink-0"
            >
              {t.btnRecalculate}
            </button>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res, idx) => (
              <div 
                key={idx}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  res.isEligible 
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20' 
                    : 'bg-slate-950/50 border-slate-800 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      res.isEligible 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {res.isEligible ? `✅ ${t.qualified}` : t.disqualified}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {t.matchedScore}: {res.matchScore}%
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">
                    {getLocalizedSchemeName(res.scheme, currentLanguage)}
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {res.scheme.description}
                  </p>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-amber-300 mb-3 font-medium">
                    {t.financialBenefit}: {res.scheme.financialBenefit}
                  </div>

                  {/* Qualified Criteria list */}
                  <div className="space-y-1 mb-4 text-xs">
                    {res.qualifiedCriteria.slice(0, 3).map((crit, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(res.scheme)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    {t.viewDetails}
                  </button>

                  <a
                    href={res.scheme.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition"
                    title={t.applyNow}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
