import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  IndianRupee, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { LanguageCode, Scheme, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../lib/i18n';

interface BenefitFinderProps {
  user: UserProfile;
  currentLanguage: LanguageCode;
  onOpenDetails: (scheme: Scheme) => void;
}

interface BenefitStack {
  id: string;
  title: string;
  subtitle: string;
  targetPersona: string;
  combinedAnnualValue: string;
  schemesIncluded: string[];
  description: string;
  actionItems: string[];
}

const BENEFIT_STACKS: BenefitStack[] = [
  {
    id: 'farmer-stack',
    title: 'Comprehensive Farmer Welfare Stack',
    subtitle: 'Direct Cash + Crop Insurance + Subsidized 4% Agri-Credit',
    targetPersona: 'Small & Marginal Landholding Farmers (0 to 5 Acres)',
    combinedAnnualValue: '₹28,000+ in Direct Subsidies & Risk Protection',
    schemesIncluded: [
      'PM-KISAN (₹6,000/year DBT in 3 installments)',
      'Pradhan Mantri Fasal Bima Yojana (Full crop damage protection)',
      'Kisan Credit Card (Agri loan up to ₹3 Lakhs at 4% subsidized interest)',
      'Subsidized Fertilizer & Micro-Irrigation Solar Pumps (PM-KUSUM)'
    ],
    description: 'Farmers receiving PM-KISAN often miss out on claiming the linked Kisan Credit Card (KCC) or insuring their Kharif/Rabi crops under PMFBY at nominal 1.5-2% premiums.',
    actionItems: [
      'Ensure e-KYC is active on pmkisan.gov.in using Aadhaar OTP.',
      'Submit KCC one-page form at your local bank to get ₹1.6 Lakhs collateral-free credit.',
      'Insure sown crops within 14 days of sowing at the local PACS / cooperative bank.'
    ]
  },
  {
    id: 'women-stack',
    title: 'Women Basic Income & Financial Autonomy Stack',
    subtitle: 'Monthly Allowance + Maternity Grant + 8.2% Tax-Free Savings',
    targetPersona: 'Women Heads of Family & Mothers',
    combinedAnnualValue: '₹18,000 to ₹35,000/year',
    schemesIncluded: [
      'State Monthly Aid (₹1,000/mo TN Magalir Urimai or ₹1,500/mo Maha Ladki Bahin)',
      'Sukanya Samriddhi Yojana (8.2% compounding interest for daughters)',
      'Pradhan Mantri Matru Vandana Yojana (₹5,000 maternity grant)',
      'Ayushman Bharat Golden Card (₹5 Lakh family cashless healthcare)'
    ],
    description: 'Women beneficiaries who receive state cash transfers can stack national maternity benefits and open postal savings accounts with highest government interest rates.',
    actionItems: [
      'Link Smart Family Ration card with single women-only bank account.',
      'Open Sukanya Samriddhi account at nearest Post Office for any girl child under 10.',
      'Claim PMMVY installments during ante-natal checks at local Anganwadi/PHC.'
    ]
  },
  {
    id: 'artisan-stack',
    title: 'Artisans & Traditional Craftsmen Stack',
    subtitle: '₹15,000 Toolkit + 5% Collateral-Free Enterprise Loans',
    targetPersona: 'Carpenters, Weavers, Potters, Tailors, Masons, Blacksmiths (18 trades)',
    combinedAnnualValue: '₹15,000 Toolkit Voucher + ₹3 Lakhs Enterprise Loan at 5%',
    schemesIncluded: [
      'PM Vishwakarma Digital Certificate & Identity Card',
      '₹15,000 e-RUPI toolkit incentive voucher',
      '₹500/day stipend during 5-day skill training',
      'Collateral-free loan: Tranche 1 (₹1 Lakh) and Tranche 2 (₹2 Lakhs) at 5% interest'
    ],
    description: 'Traditional artisans frequently take high-interest private debt. The Vishwakarma scheme provides end-to-end recognition, modern toolkits, and institutional bank finance.',
    actionItems: [
      'Visit nearest CSC center with Aadhaar and bank details for biometric registration.',
      'Select your specific trade out of the 18 eligible trades.',
      'Complete 5 days skill upgrading and redeem the ₹15,000 digital toolkit voucher.'
    ]
  },
  {
    id: 'student-stack',
    title: 'Technical & Higher Education Student Stack',
    subtitle: '100% Tuition Waiver + ₹50,000 Annual Grant + Monthly Living Aid',
    targetPersona: 'Undergraduate, Diploma, ITI, and Engineering College Students',
    combinedAnnualValue: '₹50,000 to ₹1,20,000/year',
    schemesIncluded: [
      'AICTE Pragati Scholarship for Girls (₹50,000/year for technical courses)',
      'National Scholarship Portal (NSP) Post-Matric SC/ST/OBC full fee reimbursement',
      'Tamil Nadu Pudhumai Penn (₹1,000/month for college girls from govt schools)',
      'PM Vidya Lakshmi Portal (Easy education loan access)'
    ],
    description: 'Eligible college students can legally combine tuition fee waiver programs with living expense stipends and state higher education support schemes.',
    actionItems: [
      'Obtain Bonafide and Fee Structure certificate from college registrar.',
      'Create OTR (One Time Registration) on scholarships.gov.in before deadlines.',
      'Ensure college Nodal Officer verifies application before state approval.'
    ]
  }
];

export const BenefitFinder: React.FC<BenefitFinderProps> = ({
  user,
  currentLanguage,
  onOpenDetails
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const [selectedStackId, setSelectedStackId] = useState<string>('farmer-stack');

  const selectedStack = BENEFIT_STACKS.find(s => s.id === selectedStackId) || BENEFIT_STACKS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.tabMissingBenefits}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t.stacksTitle}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t.stacksSubtitle}
          </p>
        </div>

        {/* Stack Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800">
          {BENEFIT_STACKS.map((stack) => (
            <button
              key={stack.id}
              type="button"
              onClick={() => setSelectedStackId(stack.id)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                selectedStackId === stack.id
                  ? 'border-amber-400 bg-amber-500/10 text-white'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block font-bold text-xs sm:text-sm text-white mb-1">
                {stack.title}
              </span>
              <span className="text-[11px] text-amber-400 font-semibold block">
                {stack.combinedAnnualValue}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Stack Details Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {selectedStack.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              {t.targetBeneficiary}: <strong className="text-slate-200">{selectedStack.targetPersona}</strong>
            </p>
          </div>

          <div className="p-3 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30 rounded-xl text-xs shrink-0">
            <span className="text-slate-400 block mb-0.5">{t.potentialValue}:</span>
            <span className="font-mono text-base font-bold text-amber-300">{selectedStack.combinedAnnualValue}</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {selectedStack.description}
        </p>

        {/* Schemes Included in Stack */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>{t.schemesIncludedLabel}</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedStack.schemesIncluded.map((sch, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <span className="text-xs sm:text-sm text-slate-200 leading-snug">{sch}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Steps */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.recommendedAction}</span>
          </h4>
          <div className="space-y-2.5">
            {selectedStack.actionItems.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300">
                <span className="font-mono font-bold text-amber-400 shrink-0">Step {idx + 1}:</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
