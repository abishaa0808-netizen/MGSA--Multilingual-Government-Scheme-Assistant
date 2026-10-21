import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Keyboard as KeyboardIcon, 
  Sparkles, 
  RotateCcw, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../../types';
import { RAGQueryResult } from '../../lib/rag/types';
import { TRANSLATIONS } from '../../lib/i18n';

interface AgentMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  toolUsed?: string;
  timestamp: string;
  citations?: { name: string; url: string }[];
}

interface SchemeAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenVoiceModal: () => void;
  onOpenKeyboard: (
    currentVal: string, 
    onInsert: (val: string) => void,
    onBackspace?: () => void,
    onClear?: () => void
  ) => void;
  onOpenRAGTrace: (result?: RAGQueryResult) => void;
  stateFilter?: string;
}

const AGENT_SUGGESTIONS: Record<LanguageCode, string[]> = {
  en: [
    'What schemes are available for farmers in Tamil Nadu?',
    'Am I eligible for PM-JAY Ayushman Bharat?',
    'Required documents for PM Mudra loan',
    'What welfare schemes am I missing in Kerala?'
  ],
  hi: [
    'उत्तर प्रदेश में किसानों के लिए कौन सी योजनाएं हैं?',
    'क्या मैं पीएम आवास योजना का पात्र हूँ?',
    'पीएम विश्वकर्मा योजना के लाभ क्या हैं?',
    'बालिकाओं के लिए छात्रवृत्ति योजनाएं'
  ],
  ta: [
    'தமிழ்நாட்டில் விவசாயிகளுக்கான திட்டங்கள் என்ன?',
    'மகளிர் உரிமைத் தொகைக்கு விண்ணப்பிப்பது எப்படி?',
    'ஆயுஷ்மான் பாரத் அட்டை பெறுவது எப்படி?',
    'கல்லூரி மாணவிகளுக்கான புதுமைப் பெண் திட்டம்'
  ],
  te: [
    'తెలంగాణలో రైతులకు ఏయే పథకాలు ఉన్నాయి?',
    'ఆయుష్మాన్ భారత్ హెల్త్ కార్డ్ నిబంధనలు',
    'స్వయం ఉపాధి లోన్ కోసం దరఖాస్తు ఎలా చేయాలి?'
  ],
  bn: [
    'পশ্চিমবঙ্গে কৃষকদের জন্য কী প্রকল্প আছে?',
    'প্রধানমন্ত্রী আবাস যোজনার যোগ্যতা কী?'
  ],
  mr: [
    'महाराष्ट्रातील लाडकी बहीण योजनेची माहिती',
    'शेतकऱ्यांसाठी पीक विमा कसा मिळवावा?'
  ],
  kn: [
    'ಕರ್ನಾಟಕದಲ್ಲಿ ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಗೆ ಯಾರು ಅರ್ಹರು?',
    'ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ಸಬ್ಸಿಡಿ ಸಾಲಗಳು'
  ],
  ml: [
    'കേരളത്തിലെ കാരുണ്യ ആരോഗ്യ സുരക്ഷാ പദ്ധതി (KASP)',
    'കർഷകർക്കുള്ള സബ്സിഡി ആനുകൂല്യങ്ങൾ'
  ],
  or: [
    'ଓଡ଼ିଶାର କାଳିଆ ଯୋଜନାରେ କିପରି ଆବେଦନ କରିବେ?',
    'ବିଜୁ ସ୍ୱାସ୍ଥ୍ୟ କଲ୍ୟାଣ ଯୋଜନାର ଲାଭ'
  ],
  ur: [
    'کسانوں کے لیے سرکاری وظائف اور امداد',
    'آیوشمان بھارت ہیلتھ کارڈ کی تفصیلات'
  ]
};

export const SchemeAgentDrawer: React.FC<SchemeAgentDrawerProps> = ({
  isOpen,
  onClose,
  user,
  currentLanguage,
  onLanguageChange,
  onOpenVoiceModal,
  onOpenKeyboard,
  onOpenRAGTrace,
  stateFilter = 'All-India'
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const sessionId = useRef(`sess_${Math.random().toString(36).substring(2, 9)}`).current;

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: t.agentGreeting,
      toolUsed: 'Tool: Official Government Source',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langVoiceMap: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      or: 'or-IN',
      ur: 'ur-IN'
    };
    utterance.lang = langVoiceMap[currentLanguage] || 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);
    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleMicToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by your browser. Please type or use the Virtual Keyboard.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    const langVoiceMap: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      or: 'or-IN',
      ur: 'ur-IN'
    };
    recognition.lang = langVoiceMap[currentLanguage] || 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
    };

    recognition.start();
  };

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: AgentMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          state: stateFilter,
          language: currentLanguage,
          topK: 4
        })
      });

      const data: RAGQueryResult = await res.json();
      const botMsg: AgentMessage = {
        id: `bot_${Date.now()}`,
        sender: 'agent',
        text: data.answer || 'I evaluated your query against official government gazettes.',
        toolUsed: `Tool: Retrieval Augmented Generation (${data.retrievedChunks?.length || 4} Sources)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations?.map(c => ({ name: c.schemeName, url: c.url }))
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'agent',
          text: 'Unable to reach the government intelligence agent. Please check your query or explore the catalog.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        text: 'Started a fresh session. Ask any question about scheme eligibility, application deadlines, or financial grants.',
        toolUsed: 'Tool: Official Government Source',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const suggestions = AGENT_SUGGESTIONS[currentLanguage] || AGENT_SUGGESTIONS.en;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:max-w-lg bg-slate-950 text-white shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Drawer Header matching Screenshot 3 */}
      <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="font-extrabold text-sm sm:text-base tracking-wide text-white uppercase flex items-center gap-1.5">
              <span>{t.agentTitle}</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              {t.stateUt} {stateFilter}
            </p>
          </div>
        </div>

        {/* Action Header Buttons matching Screenshot 3 */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-medium transition cursor-pointer"
          >
            {t.voiceAssistant}
          </button>

          <button
            type="button"
            onClick={handleNewChat}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            {t.btnRecalculate}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg font-mono transition cursor-pointer"
          >
            [X]
          </button>
        </div>
      </div>

      {/* Language Selector Bar matching Screenshot 3 */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Language:</span>
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
          className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
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

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.sender === 'user' ? (
              <div className="max-w-[85%] bg-amber-500 text-slate-950 font-medium p-3 rounded-2xl rounded-tr-none text-xs sm:text-sm shadow">
                {msg.text}
                <div className="text-[10px] text-slate-800 text-right mt-1 font-mono">
                  {msg.timestamp}
                </div>
              </div>
            ) : (
              /* Agent message card matching Screenshot 3 */
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-xs sm:text-sm text-slate-200 space-y-2.5">
                
                {/* Tool Badge header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    {msg.toolUsed || 'Tool: Official Government Source'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenRAGTrace()}
                    className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                  >
                    View Trace
                  </button>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.citations.map((c, idx) => (
                      <a
                        key={idx}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-950 text-slate-300 hover:text-white border border-slate-700/80 rounded text-[11px]"
                      >
                        <span className="truncate max-w-[150px]">{c.name}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Listen Voice & Timestamp footer matching Screenshot 3 */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleToggleSpeak(msg.id, msg.text)}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {isSpeakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400">Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen Voice</span>
                      </>
                    )}
                  </button>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
            <span>Agent selecting verified welfare tools and validating gazette criteria...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips Bar matching Screenshot 3 */}
      <div className="px-3 py-2 border-t border-slate-800 bg-slate-900/60 overflow-x-auto flex gap-2 text-xs no-scrollbar">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(sug)}
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-lg text-slate-300 hover:text-white whitespace-nowrap transition cursor-pointer text-[11px]"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input bar with Keyb, Mic, and Send matching Screenshot 3 */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={t.agentPlaceholder}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />

            {/* Keyb and Mic buttons inside input container */}
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onOpenKeyboard(
                  inputQuery,
                  (val) => setInputQuery(prev => prev + val),
                  () => setInputQuery(prev => prev.slice(0, -1)),
                  () => setInputQuery('')
                )}
                className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded text-[10px] font-semibold transition cursor-pointer"
                title="Open Virtual Keyboard"
              >
                {t.keybButton}
              </button>

              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-1.5 rounded transition cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isListening ? 'Stop Mic' : 'Voice Input'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shrink-0"
          >
            {t.agentSend}
          </button>
        </form>
      </div>
    </div>
  );
};
