import React, { useState } from 'react';
import { X, Delete, CornerDownLeft, Globe2, Space, Eraser } from 'lucide-react';
import { LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../lib/i18n';

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onEnter: () => void;
  currentValue?: string;
}

// Layout definitions for all 10 languages
const KEYBOARD_LAYOUTS: Record<LanguageCode, { name: string; rows: string[][] }> = {
  en: {
    name: 'English',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '-']
    ]
  },
  hi: {
    name: 'हिन्दी (Hindi)',
    rows: [
      ['१', '२', '३', '४', '५', '६', '७', '८', '९', '०'],
      ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'ऋ'],
      ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'],
      ['ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न'],
      ['प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'],
      ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', '्', '़', '।']
    ]
  },
  ta: {
    name: 'தமிழ் (Tamil)',
    rows: [
      ['௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯', '௦'],
      ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'],
      ['க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம'],
      ['ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன', 'ஜ', 'ஷ', 'ஸ', 'ஹ'],
      ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்']
    ]
  },
  te: {
    name: 'తెలుగు (Telugu)',
    rows: [
      ['౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯', '౦'],
      ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం'],
      ['క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ఞ'],
      ['ట', 'ఠ', 'డ', 'ఢ', 'ణ', 'త', 'థ', 'ద', 'ధ', 'న'],
      ['ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ'],
      ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ', '్']
    ]
  },
  bn: {
    name: 'বাংলা (Bengali)',
    rows: [
      ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '০'],
      ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ'],
      ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ'],
      ['ট', 'ঠ', 'ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ध', 'ন'],
      ['প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ', 'ড়', 'ঢ়', 'য়'],
      ['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ', '্', 'ং', 'ঃ', 'ঁ']
    ]
  },
  mr: {
    name: 'मराठी (Marathi)',
    rows: [
      ['१', '२', '३', '४', '५', '६', '७', '८', '९', '०'],
      ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'],
      ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'],
      ['ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न'],
      ['प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ळ'],
      ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', '्', '़', '।']
    ]
  },
  kn: {
    name: 'ಕನ್ನಡ (Kannada)',
    rows: [
      ['೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯', '೦'],
      ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಅಂ'],
      ['ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ', 'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ'],
      ['ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ', 'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ'],
      ['ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ'],
      ['ಾ', 'ಿ', 'ೀ', 'ು', 'ೂ', 'ೆ', 'ೇ', 'ೈ', 'ೊ', 'ೋ', 'ೌ', '್', 'ಃ']
    ]
  },
  ml: {
    name: 'മലയാളം (Malayalam)',
    rows: [
      ['൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯', '൦'],
      ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'അം'],
      ['ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ'],
      ['ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന'],
      ['പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', 'ള', 'ഴ', 'റ'],
      ['ാ', 'ി', 'ീ', 'ു', 'ൂ', 'ൃ', 'െ', 'േ', 'ൈ', 'ൊ', 'ോ', 'ൗ', '്', 'ൺ', 'ൻ', 'ർ', 'ൽ', 'ൾ']
    ]
  },
  or: {
    name: 'ଓଡ଼ିଆ (Odia)',
    rows: [
      ['୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯', '୦'],
      ['ଅ', 'ଆ', 'ଇ', 'ଈ', 'ଉ', 'ଊ', 'ଋ', 'ଏ', 'ଐ', 'ଓ', 'ଔ'],
      ['କ', 'ଖ', 'ଗ', 'ଘ', 'ଙ', 'ଚ', 'ଛ', 'ଜ', 'ଝ', 'ଞ'],
      ['ଟ', 'ଠ', 'ଡ', 'ଢ', 'ଣ', 'ତ', 'ଥ', 'ଦ', 'ଧ', 'ନ'],
      ['ପ', 'ଫ', 'ବ', 'ଭ', 'ମ', 'ଯ', 'ର', 'ଳ', 'ୱ', 'ଶ', 'ଷ', 'ସ', 'ହ', 'ୟ', 'ଡ଼', 'ଢ଼'],
      ['ା', 'ି', 'ୀ', 'ୁ', 'ୂ', 'ୃ', 'େ', 'ୈ', 'ୋ', 'ୌ', '୍', 'ଂ', 'ଃ', 'ଁ']
    ]
  },
  ur: {
    name: 'اردو (Urdu)',
    rows: [
      ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰'],
      ['آ', 'ا', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ'],
      ['د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض'],
      ['ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'ں'],
      ['و', 'ہ', 'ھ', 'ء', 'ی', 'ے', 'ئ', 'ۓ', '۔', '،', '؟']
    ]
  }
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  onKeyPress,
  onBackspace,
  onClear,
  onEnter,
  currentValue
}) => {
  const [capsLock, setCapsLock] = useState(false);

  if (!isOpen) return null;

  const layout = KEYBOARD_LAYOUTS[currentLanguage] || KEYBOARD_LAYOUTS.en;
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const handleKeyClick = (char: string) => {
    onKeyPress(capsLock ? char.toUpperCase() : char);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 bg-slate-950/95 border-t border-slate-700/80 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Keyboard Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>⌨️</span>
              <span>{t.keybButton} ({layout.name})</span>
            </span>

            {/* Quick Switcher dropdown */}
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-0.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="or">ଓଡ଼ିଆ (Odia)</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>

          {currentValue !== undefined && (
            <div className="hidden sm:block text-slate-400 truncate max-w-xs font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {currentValue || '...'}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 cursor-pointer transition"
              title="Clear input text"
            >
              <Eraser className="w-3 h-3 text-rose-400" />
              <span>Clear</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
              title={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Keyboard Key Grid */}
        <div className="space-y-1.5 select-none" dir={currentLanguage === 'ur' ? 'rtl' : 'ltr'}>
          {layout.rows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5 flex-wrap">
              {row.map((char, cIdx) => (
                <button
                  key={cIdx}
                  type="button"
                  onClick={() => handleKeyClick(char)}
                  className="min-w-[28px] sm:min-w-[34px] h-9 sm:h-10 px-2 sm:px-2.5 bg-slate-900 hover:bg-slate-800 active:bg-amber-500 active:text-slate-950 text-slate-100 font-medium text-xs sm:text-sm rounded-lg border border-slate-700/80 shadow transition flex items-center justify-center cursor-pointer"
                >
                  {capsLock ? char.toUpperCase() : char}
                </button>
              ))}
            </div>
          ))}

          {/* Action Row: Caps, Space, Backspace, Enter */}
          <div className="flex justify-center gap-2 pt-1.5">
            {currentLanguage === 'en' && (
              <button
                type="button"
                onClick={() => setCapsLock(!capsLock)}
                className={`px-3 h-9 text-xs font-bold rounded-lg border transition cursor-pointer ${
                  capsLock
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                CAPS
              </button>
            )}

            <button
              type="button"
              onClick={() => onKeyPress(' ')}
              className="flex-1 max-w-sm h-9 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 shadow transition cursor-pointer"
            >
              <Space className="w-4 h-4" />
              <span>Space</span>
            </button>

            <button
              type="button"
              onClick={onBackspace}
              className="px-3.5 h-9 bg-slate-800 hover:bg-slate-700 active:bg-rose-500 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
              <span className="hidden sm:inline">Backspace</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onEnter();
                onClose();
              }}
              className="px-4 h-9 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              title={t.searchButton}
            >
              <CornerDownLeft className="w-4 h-4" />
              <span>Enter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
