import React, { useState } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  Download, 
  Building2 
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../lib/i18n';

interface DocumentChecklistProps {
  currentLanguage: LanguageCode;
}

interface CommonDocItem {
  id: string;
  name: string;
  description: string;
  issuingAuthority: string;
  schemesUsingThis: string;
  portalUrl: string;
}

const COMMON_DOCS: CommonDocItem[] = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card (with active Mobile Linkage & NPCI Bank Seeding)',
    description: 'Mandatory primary identity document used for Direct Benefit Transfer (DBT) and biometric electronic Know Your Customer (e-KYC).',
    issuingAuthority: 'Unique Identification Authority of India (UIDAI)',
    schemesUsingThis: 'PM-KISAN, Ayushman Bharat, PMAY Housing, PM Vishwakarma, Magalir Urimai, Subsidies',
    portalUrl: 'https://myaadhaar.uidai.gov.in'
  },
  {
    id: 'ration-card',
    name: 'Smart Family Ration Card / BPL / Antyodaya Card',
    description: 'Valid proof of household family composition, socioeconomic tier, and subsidized food grain entitlement.',
    issuingAuthority: 'Civil Supplies & Consumer Protection Department (State)',
    schemesUsingThis: 'PMGKAY, PMAY-G, Gruha Lakshmi, Karunya KASP, One Nation One Ration Card',
    portalUrl: 'https://nfsa.gov.in'
  },
  {
    id: 'bank-passbook',
    name: 'Bank Savings Account Passbook / Cancelled Cheque',
    description: 'Copy showing clear Account Number, IFSC Code, Branch Name, and active Aadhaar-NPCI direct seeding status.',
    issuingAuthority: 'Nationalized Commercial Bank / Post Office / Regional Rural Bank',
    schemesUsingThis: 'All Central and State DBT grant transfers (PM-KISAN, Scholarships, Pensions)',
    portalUrl: 'https://dbtbharat.gov.in'
  },
  {
    id: 'income-certificate',
    name: 'Annual Family Income Certificate (Tahsil / Revenue Authority)',
    description: 'Legal certificate verifying total household income does not exceed statutory welfare eligibility ceiling (e.g. ₹2.5 Lakhs or ₹3 Lakhs).',
    issuingAuthority: 'Revenue Department / Tahsildar / Sub-Divisional Magistrate (SDM)',
    schemesUsingThis: 'NSP Post-Matric Scholarships, Pragati Scheme, Ladki Bahin, Kanya Sumangala',
    portalUrl: 'https://serviceonline.gov.in'
  },
  {
    id: 'caste-certificate',
    name: 'Community / Caste Certificate (SC / ST / OBC / EWS / Minority)',
    description: 'Formal digital revenue certificate proving caste category for reservation benefits and fee waivers.',
    issuingAuthority: 'Revenue Divisional Officer / Tahsildar / District Magistrate',
    schemesUsingThis: 'Post-Matric SC/ST Scholarships, Stand-Up India, Babu Jagjivan Ram Schemes',
    portalUrl: 'https://serviceonline.gov.in'
  },
  {
    id: 'land-records',
    name: 'Agricultural Land Record (Patta / Khasra-Khatauni / RoR)',
    description: 'Proof of landholding acreage, survey/dag number, and agricultural cultivator title.',
    issuingAuthority: 'State Land Revenue Department / Land Records Portal',
    schemesUsingThis: 'PM-KISAN, PM Fasal Bima (PMFBY), Kisan Credit Card (KCC), PM-KUSUM Solar',
    portalUrl: 'https://dilrmp.gov.in'
  },
  {
    id: 'udid-card',
    name: 'Unique Disability ID (UDID) Card & Medical Disability Certificate',
    description: 'Nationwide certified smart card specifying percentage and type of benchmark physical or intellectual disability.',
    issuingAuthority: 'District Medical Board / Department of Empowerment of Persons with Disabilities',
    schemesUsingThis: 'ADIP Free Tricycles/Aids, IGNDPS Disability Pension, Niramaya Insurance',
    portalUrl: 'https://www.swavlambancard.gov.in'
  },
  {
    id: 'student-bonafide',
    name: 'College Admission Fee Receipt & Bonafide Certificate',
    description: 'Issued by college registrar verifying active student enrollment, course discipline, and academic year.',
    issuingAuthority: 'Recognized School, College, Polytechnic, or University Administration',
    schemesUsingThis: 'AICTE Pragati, NSP Scholarships, Pudhumai Penn, Yuva Nidhi Scheme',
    portalUrl: 'https://scholarships.gov.in'
  }
];

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ currentLanguage }) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [checkedStatus, setCheckedStatus] = useState<Record<string, boolean>>({
    aadhaar: true,
    'bank-passbook': true
  });

  const toggleCheck = (id: string) => {
    setCheckedStatus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalCount = COMMON_DOCS.length;
  const readyCount = Object.values(checkedStatus).filter(Boolean).length;
  const completionPercent = Math.round((readyCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold mb-2">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{t.tabDocuments}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.docsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {t.docsSubtitle}
            </p>
          </div>

          <div className="bg-[#060a14] border border-slate-800 p-4 rounded-xl text-center shrink-0 min-w-[180px]">
            <span className="text-xs text-slate-400 block mb-1">Checklist Readiness:</span>
            <div className="text-2xl font-mono font-bold text-emerald-400">{completionPercent}% Ready</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{readyCount} of {totalCount} prepared</div>
          </div>
        </div>
      </div>

      {/* Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMMON_DOCS.map((doc) => {
          const isReady = !!checkedStatus[doc.id];
          return (
            <div 
              key={doc.id}
              onClick={() => toggleCheck(doc.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isReady
                  ? 'bg-[#0a1222] border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : 'bg-[#070c18] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isReady}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer accent-emerald-500"
                    />
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {doc.name}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isReady
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isReady ? t.statusAvailable : t.statusPending}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {doc.description}
                </p>

                <div className="p-2.5 bg-[#050812] border border-slate-800/80 rounded-xl space-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-500">{t.issuingAuthorityLabel}: </span>
                    <span className="text-slate-300 font-medium">{doc.issuingAuthority}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t.schemesUsedIn}: </span>
                    <span className="text-amber-300">{doc.schemesUsingThis}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">{isReady ? t.markHaveDoc : t.markNeedDoc}</span>
                <a
                  href={doc.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-xs"
                >
                  <span>{t.applyOnlineOfficial}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
