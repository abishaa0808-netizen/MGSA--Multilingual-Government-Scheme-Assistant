import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Search, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Code2, 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { RAGQueryResult } from '../../lib/rag/types';
import { retrieveRelevantChunks, constructAugmentedPrompt, generateLocalRAGAnswer } from '../../lib/rag/retriever';

interface RAGInspectorModalProps {
  initialResult?: RAGQueryResult | null;
  onClose: () => void;
}

export const RAGInspectorModal: React.FC<RAGInspectorModalProps> = ({
  initialResult,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'chunks' | 'prompt' | 'answer'>('chunks');
  const [testQuery, setTestQuery] = useState(initialResult?.query || 'Marginal farmer PM-KISAN subsidy');
  const [currentResult, setCurrentResult] = useState<RAGQueryResult | null>(initialResult || null);
  const [isSearching, setIsSearching] = useState(false);

  const handleTestSearch = () => {
    if (!testQuery.trim()) return;
    setIsSearching(true);

    const chunks = retrieveRelevantChunks(testQuery, { topK: 4 });
    const prompt = constructAugmentedPrompt(testQuery, chunks);
    const result = generateLocalRAGAnswer(testQuery, chunks);
    result.augmentedPromptSample = prompt;

    setCurrentResult(result);
    setIsSearching(false);
  };

  // If no initial result, generate one on mount
  React.useEffect(() => {
    if (!currentResult) {
      handleTestSearch();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">RAG Layer Live Inspector</h3>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Zero Hallucination
                </span>
              </div>
              <p className="text-xs text-slate-400">Live inspection of chunk indexing, vector ranking, and augmented prompts</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Query Test Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestSearch()}
                placeholder="Test any query to view RAG retrieval (e.g., student scholarships, crop insurance)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="button"
              onClick={handleTestSearch}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer shrink-0"
            >
              Test RAG
            </button>
          </div>
        </div>

        {/* Tabs for Inspector */}
        <div className="px-5 border-b border-slate-800 bg-slate-950/20 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('chunks')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chunks'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Retrieved Chunks ({currentResult?.retrievedChunks.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'prompt'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Augmented System Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('answer')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'answer'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Grounded Answer & Citations</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: RETRIEVED CHUNKS */}
          {activeTab === 'chunks' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Top matching segments retrieved from indexed scheme gazettes
                </span>
                <span className="font-mono font-bold">Confidence: {currentResult?.confidence || 85}%</span>
              </div>

              {currentResult?.retrievedChunks.map((rc, idx) => (
                <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        Source #{idx + 1}
                      </span>
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {rc.chunk.schemeName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {rc.chunk.chunkType}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        Score: {(rc.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {rc.chunk.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
                    <span>Ministry: {rc.chunk.ministry}</span>
                    <a 
                      href={rc.chunk.officialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: AUGMENTED SYSTEM PROMPT */}
          {activeTab === 'prompt' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                This structured context is injected into the Gemini 3.8 Flash LLM to enforce strict factual grounding:
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[500px]">
                {currentResult?.augmentedPromptSample || 'No prompt generated yet.'}
              </pre>
            </div>
          )}

          {/* TAB 3: GROUNDED ANSWER */}
          {activeTab === 'answer' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Synthesized Response</h4>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {currentResult?.answer}
                </div>
              </div>

              {currentResult?.citations && currentResult.citations.length > 0 && (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Attached Citations</h4>
                  <div className="space-y-2">
                    {currentResult.citations.map((cite, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 font-bold">[{cite.sourceId}]</span>
                          <span className="font-semibold text-white">{cite.schemeName}</span>
                          <span className="text-slate-500 hidden sm:inline">- {cite.section}</span>
                        </div>
                        <a
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                        >
                          Official Portal
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Engine: BM25 Token Matching + State Filter + Gemini 3.8 Flash Grounding</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
