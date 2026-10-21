import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Database, 
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../lib/i18n';
import { RAGQueryResult } from '../../lib/rag/types';

interface RAGAssistantProps {
  user: UserProfile;
  currentLanguage: LanguageCode;
  onOpenRAGInspector: (result?: RAGQueryResult) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  ragResult?: RAGQueryResult;
  timestamp: string;
}

const SPEECH_LANG_MAP: Record<LanguageCode, string> = {
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

const LANGUAGE_NAME_MAP: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
  mr: 'Marathi',
  kn: 'Kannada',
  ml: 'Malayalam',
  or: 'Odia',
  ur: 'Urdu'
};

const SAMPLE_PROMPTS = [
  'Farmer in Tamil Nadu with 2 acres, which schemes can I apply for?',
  'What are the benefits of PM Vishwakarma for artisans and tailors?',
  'College scholarships for girl students studying B.E. or Diploma',
  'How to get Ayushman Bharat cashless ₹5 Lakh health card?',
  'Loans without collateral for street vendors or small shopkeepers'
];

export const RAGAssistant: React.FC<RAGAssistantProps> = ({
  user,
  currentLanguage,
  onOpenRAGInspector
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaste ${user.name}! I am MGSA (Multilingual Government Scheme Assistant), powered by a verified Government Schemes RAG Knowledge Layer. Ask me any question about central and state schemes, eligibility, subsidy amounts, or required certificates. Every answer is grounded directly in official government gazettes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition (Mic)
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
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
    recognition.lang = SPEECH_LANG_MAP[currentLanguage] || 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
    };

    recognition.start();
  };

  // Text-To-Speech (Read Aloud)
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
    utterance.lang = SPEECH_LANG_MAP[currentLanguage] || 'en-IN';
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
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
          query,
          state: user.state,
          language: LANGUAGE_NAME_MAP[currentLanguage] || 'English',
          topK: 4
        })
      });

      const data: RAGQueryResult = await res.json();
      if (!res.ok) {
        throw new Error((data as any).error || 'Failed to process RAG query');
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        ragResult: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('RAG Query frontend catch:', err);
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered a temporary connection glitch. Please check your query or explore the schemes catalog directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[78vh] bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">MGSA RAG Assistant</h2>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-2.5 h-2.5" />
                Grounded Model
              </span>
            </div>
            <p className="text-xs text-slate-400">Trained on Central & State official guidelines for {user.state}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenRAGInspector()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Inspect RAG Context</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-lg'
              }`}
            >
              {/* Message text with formatting */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* RAG Citations and Source links if available */}
              {msg.ragResult && msg.ragResult.citations && msg.ragResult.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Verified Source Documents ({msg.ragResult.citations.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenRAGInspector(msg.ragResult)}
                      className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                    >
                      View Live Chunks & Score
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {msg.ragResult.citations.map((cite, idx) => (
                      <a
                        key={idx}
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-lg text-xs text-slate-300 hover:text-white transition"
                      >
                        <span className="font-mono text-amber-400 font-bold">[{cite.sourceId}]</span>
                        <span className="truncate max-w-[140px]">{cite.schemeName}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp & Text-to-speech button */}
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>

                {msg.sender === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => handleToggleSpeak(msg.id, msg.text)}
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                    title={isSpeakingId === msg.id ? 'Stop Speaking' : 'Read Aloud'}
                  >
                    {isSpeakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl max-w-md">
            <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold block text-amber-400">MGSA RAG Engine in progress:</span>
              <span>Retrieving relevant government circulars and synthesizing grounded answer...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts carousel */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Try asking:</span>
        {SAMPLE_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700/70 whitespace-nowrap transition cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form with Speech Recognition */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl border transition cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Speak your question'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your query (e.g. Farmer loan in Tamil Nadu or Ayushman Bharat eligibility)..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
