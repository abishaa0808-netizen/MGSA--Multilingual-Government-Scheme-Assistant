export interface DocumentChunk {
  id: string;
  schemeId: string;
  schemeName: string;
  ministry: string;
  sector: string;
  states: string[];
  chunkType: 'overview' | 'eligibility' | 'benefits' | 'procedure' | 'documents';
  title: string;
  content: string;
  keywords: string[];
  officialUrl: string;
}

export interface RetrievedChunk {
  chunk: DocumentChunk;
  score: number; // 0 to 1
  matchReasons: string[];
}

export interface Citation {
  sourceId: string;
  schemeName: string;
  section: string;
  url: string;
  excerpt: string;
}

export interface RAGQueryResult {
  query: string;
  answer: string;
  retrievedChunks: RetrievedChunk[];
  citations: Citation[];
  confidence: number; // 0 to 100
  language: string;
  augmentedPromptSample?: string;
  sourceType: 'gemini-grounded' | 'hybrid-rag-engine';
  executionTimeMs: number;
}
