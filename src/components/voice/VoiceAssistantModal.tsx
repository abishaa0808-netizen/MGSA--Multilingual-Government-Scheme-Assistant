import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../lib/i18n';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onQuerySubmit: (query: string) => Promise<string>;
  stateName?: string;
}

const VOICE_LANG_MAP: Record<LanguageCode, { label: string; code: string; defaultQuestions: string[] }> = {
  en: {
    label: 'English (English)',
    code: 'en-IN',
    defaultQuestions: [
      'What schemes are available for farmers?',
      'Am I eligible for PM-JAY Ayushman Bharat?',
      'Required documents for PM Mudra loan',
      'What welfare schemes am I missing?'
    ]
  },
  hi: {
    label: 'हिन्दी (Hindi)',
    code: 'hi-IN',
    defaultQuestions: [
      'किसानों के लिए कौन सी योजनाएं उपलब्ध हैं?',
      'क्या मैं आयुष्मान भारत योजना का पात्र हूँ?',
      'पीएम मुद्रा लोन के लिए आवश्यक दस्तावेज',
      'मेरी कौन सी सरकारी योजनाएं छूट गई हैं?'
    ]
  },
  ta: {
    label: 'தமிழ் (Tamil)',
    code: 'ta-IN',
    defaultQuestions: [
      'விவசாயிகளுக்கான அரசு திட்டங்கள் என்னென்ன?',
      'ஆயுஷ்மான் பாரத் அட்டைக்கு நான் தகுதியானவரா?',
      'முத்ரா கடன் வாங்க என்ன ஆவணங்கள் வேண்டும்?',
      'எனக்கு கிடைக்கக்கூடிய மற்ற சலுகைகள் என்ன?'
    ]
  },
  te: {
    label: 'తెలుగు (Telugu)',
    code: 'te-IN',
    defaultQuestions: [
      'రైతులకు ఏయే పథకాలు అందుబాటులో ఉన్నాయి?',
      'నేను ఆయుష్మాన్ భారత్ పథకానికి అర్హుడనా?',
      'ముద్రా లోన్ కోసం కావాల్సిన పత్రాలు ఏమిటి?',
      'నాకు ఇంకా రాని ప్రభుత్వ పథకాలు ఏమిటి?'
    ]
  },
  bn: {
    label: 'বাংলা (Bengali)',
    code: 'bn-IN',
    defaultQuestions: [
      'কৃষকদের জন্য কী কী সরকারি প্রকল্প আছে?',
      'আমি কি আয়ুষ্মান ভারত প্রকল্পের জন্য যোগ্য?',
      'পিএম মুদ্রা লোনের জন্য কী কী নথি প্রয়োজন?',
      'আমার জন্য আর কী কী সুযোগ-সুবিধা রয়েছে?'
    ]
  },
  mr: {
    label: 'मराठी (Marathi)',
    code: 'mr-IN',
    defaultQuestions: [
      'शेतकऱ्यांसाठी कोणत्या योजना उपलब्ध आहेत?',
      'मी आयुष्यमान भारत योजनेसाठी पात्र आहे का?',
      'मुद्रा कर्जासाठी कोणती कागदपत्रे लागतील?',
      'माझ्यासाठी इतर कोणत्या शासकीय योजना आहेत?'
    ]
  },
  kn: {
    label: 'ಕನ್ನಡ (Kannada)',
    code: 'kn-IN',
    defaultQuestions: [
      'ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಯೋಜನೆಗಳು ಯಾವುವು?',
      'ನಾನು ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಯೋಜನೆಗೆ ಅರ್ಹನೇ?',
      'ಮುದ್ರಾ ಸಾಲಕ್ಕೆ ಬೇಕಾದ ಅಗತ್ಯ ದಾಖಲೆಗಳು ಯಾವುವು?',
      'ನನಗೆ ಲಭ್ಯವಿರುವ ಇತರ ಸರ್ಕಾರಿ ಸೌಲಭ್ಯಗಳು ಯಾವುವು?'
    ]
  },
  ml: {
    label: 'മലയാളം (Malayalam)',
    code: 'ml-IN',
    defaultQuestions: [
      'കർഷകർക്കായി എന്തെല്ലാം പദ്ധതികൾ ലഭ്യമാണ്?',
      'ഞാൻ ആയുഷ്മാൻ ഭാരത് പദ്ധതിക്ക് അർഹനാണോ?',
      'മുദ്ര വായ്പയ്ക്ക് ആവശ്യമായ രേഖകൾ എന്തൊക്കെ?',
      'എനിക്ക് ലഭിക്കാവുന്ന മറ്റ് ആനുകൂല്യങ്ങൾ ഏതെല്ലാം?'
    ]
  },
  or: {
    label: 'ଓଡ଼ିଆ (Odia)',
    code: 'or-IN',
    defaultQuestions: [
      'କୃଷକମାନଙ୍କ ପାଇଁ କେଉଁ ସବୁ ଯୋଜନା ଉପଲବ୍ଧ?',
      'ମୁଁ ଆୟୁଷ୍ମାନ ଭାରତ ଯୋଜନା ପାଇଁ ଯୋଗ୍ୟ କି?',
      'ମୁଦ୍ରା ଋଣ ପାଇଁ କେଉଁ ଦସ୍ତାବିଜ ଆବଶ୍ୟକ?',
      'ମୋ ପାଇଁ ଆଉ କେଉଁ ସରକାରୀ ଯୋଜନା ଅଛି?'
    ]
  },
  ur: {
    label: 'اردو (Urdu)',
    code: 'ur-IN',
    defaultQuestions: [
      'کسانوں کے لیے کون سی اسکیمیں دستیاب ہیں؟',
      'کیا میں آیوشمان بھارت اسکیم کا اہل ہوں؟',
      'پی ایم مدرا لون کے لیے کون سے دستاویزات درکار ہیں؟',
      'میرے لیے کون سے سرکاری فوائد دستیاب ہیں؟'
    ]
  }
};

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  onQuerySubmit,
  stateName = 'All-India'
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const voiceMeta = VOICE_LANG_MAP[currentLanguage] || VOICE_LANG_MAP.en;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const transcriptRef = React.useRef<string>('');

  // Stop synthesis on close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [recognitionInstance]);

  if (!isOpen) return null;

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceMeta.code;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsProcessing(true);
    setAnswer(null);

    try {
      const response = await onQuerySubmit(queryText);
      setAnswer(response);
      speakText(response);
    } catch (err) {
      setAnswer('Sorry, I encountered a temporary network delay. Please try again or tap the quick questions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by your browser. Please type or click the quick questions below.');
      return;
    }

    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = voiceMeta.code;

    recognition.onstart = () => {
      setIsListening(true);
      transcriptRef.current = '';
      setTranscript('');
      setAnswer(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = finalTranscript;
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      const spokenText = transcriptRef.current;
      if (spokenText && spokenText.trim()) {
        handleProcessQuery(spokenText);
      }
    };

    setRecognitionInstance(recognition);
    recognition.start();
  };

  const handleQuickQuestionClick = (q: string) => {
    setTranscript(q);
    handleProcessQuery(q);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Screenshot 2 */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.voiceAssistant} ({currentLanguage.toUpperCase()})
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              {voiceMeta.label} ({voiceMeta.code})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            [X]
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Language Selector Dropdown matching Screenshot 2 */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-700">{t.language}</span>
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="en">English (English)</option>
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
          </div>

          {/* Large Circular Speak Button matching Screenshot 2 */}
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all cursor-pointer relative ${
                isListening
                  ? 'bg-rose-600 scale-105 ring-8 ring-rose-200 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 hover:scale-105 ring-4 ring-slate-100'
              }`}
            >
              <Mic className="w-8 h-8 mb-1 text-white" />
              <span className="font-bold text-sm tracking-wide text-center px-2">
                {isListening ? t.voiceListening : t.voiceTapToSpeak}
              </span>
              <span className="text-[10px] text-slate-300">
                {isListening ? 'Tap to Stop' : 'Tap to Talk'}
              </span>
            </button>
          </div>

          {/* Spoken Transcript Box matching Screenshot 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[90px] flex flex-col justify-center shadow-inner">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1">
              SPOKEN TRANSCRIPT:
            </span>
            <p className="text-sm text-slate-800 italic">
              {transcript || '(Your spoken question will appear here...)'}
            </p>
          </div>

          {/* Answer Box if returned */}
          {isProcessing && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
              <span>{t.voiceProcessing}</span>
            </div>
          )}

          {answer && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Government Scheme Response:</span>
                </span>
                <button
                  type="button"
                  onClick={() => speakText(answer)}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop' : 'Replay Voice'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {answer}
              </p>
            </div>
          )}

          {/* Quick Voice Questions matching Screenshot 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              QUICK VOICE QUESTIONS (CLICK TO ASK):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {voiceMeta.defaultQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickQuestionClick(q)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-left transition cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer matching Screenshot 2 */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Uses browser Web Speech API for recognition and synthesis</span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
