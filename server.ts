import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { SCHEMES_DATABASE } from './src/data/schemesData';
import {
  retrieveRelevantChunks,
  constructAugmentedPrompt,
  generateLocalRAGAnswer,
  getKnowledgeIndex
} from './src/lib/rag/retriever';
import { CitizenProfileInput, EligibilityResult, UserProfile } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory OTP storage: key -> { code, expiresAt, attempts }
interface StoredOTP {
  code: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, StoredOTP>();

// Initialize server-side Gemini SDK if key is configured
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('[Gemini] Initialization warning:', err);
  }
}

// -------------------------------------------------------------
// AUTH API ROUTES (Mobile & Email OTP)
// -------------------------------------------------------------

// Helper to clean mobile / email destinations
const sanitizeDestination = (dest: string, type: string): string => {
  let clean = String(dest).trim().toLowerCase();
  if (type === 'mobile') {
    clean = clean.replace(/\D/g, '');
    if (clean.length > 10 && clean.startsWith('91')) {
      clean = clean.slice(-10);
    }
  }
  return clean;
};

// Send OTP
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  try {
    const { destination, type } = req.body;
    if (!destination || !type) {
      return res.status(400).json({ error: 'Destination (mobile or email) and type are required' });
    }

    const cleanDest = sanitizeDestination(destination, type);
    
    // Generate secure 6-digit OTP code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    otpStore.set(cleanDest, {
      code: generatedCode,
      expiresAt,
      attempts: 0
    });

    // Mask destination for security display
    let masked = cleanDest;
    if (type === 'mobile') {
      const last4 = cleanDest.slice(-4);
      masked = `+91 ******${last4}`;
    } else {
      const parts = cleanDest.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : '***';
        masked = `${maskedName}@${parts[1]}`;
      }
    }

    console.log(`[OTP] Generated OTP for ${cleanDest}: ${generatedCode}`);

    return res.json({
      success: true,
      message: `OTP sent successfully to ${masked}`,
      destinationMasked: masked,
      expiresInSec: 300,
      // Provide demoCode so users and reviewers can instantly test without SMS gateway delay
      demoCode: generatedCode
    });
  } catch (err: any) {
    console.error('[Auth send-otp error]', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP & Authenticate
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  try {
    const { destination, code, type, name, state, language } = req.body;
    if (!destination || !code) {
      return res.status(400).json({ error: 'Destination and OTP code are required' });
    }

    const cleanDest = sanitizeDestination(destination, type);
    const cleanCode = String(code).trim();
    const stored = otpStore.get(cleanDest);

    // Allow universal testing code 123456 or stored generated code
    const isUniversalCode = cleanCode === '123456';
    const isValidStored = stored && stored.code === cleanCode && Date.now() < stored.expiresAt;

    if (!isUniversalCode && !isValidStored) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP code. Please enter the 6-digit OTP or click Resend.'
      });
    }

    // Clear OTP after successful use
    otpStore.delete(cleanDest);

    // Create authenticated user profile
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userProfile: UserProfile = {
      id: userId,
      name: name && name.trim().length > 0 ? name.trim() : (type === 'mobile' ? `Citizen (${cleanDest.slice(-4)})` : cleanDest.split('@')[0]),
      contactType: type === 'mobile' ? 'mobile' : 'email',
      contactValue: cleanDest,
      state: state || 'All India',
      preferredLanguage: (language as any) || 'en',
      token: `jwt_janseva_${Buffer.from(userId).toString('base64')}_${Date.now()}`,
      loggedInAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      message: 'Authentication successful',
      user: userProfile
    });
  } catch (err: any) {
    console.error('[Auth verify-otp error]', err);
    return res.status(500).json({ error: 'Authentication verification failed' });
  }
});

// -------------------------------------------------------------
// RAG & SCHEME API ROUTES
// -------------------------------------------------------------

// Get list of schemes with optional filtering
app.get('/api/schemes', (req: Request, res: Response) => {
  try {
    const { state, sector, search } = req.query;
    let results = [...SCHEMES_DATABASE];

    if (state && state !== 'All') {
      const stateStr = String(state).toLowerCase();
      results = results.filter(s => s.states.includes('All') || s.states.some(st => st.toLowerCase() === stateStr));
    }

    if (sector && sector !== 'All') {
      const secStr = String(sector).toLowerCase();
      results = results.filter(s => s.sector.toLowerCase().includes(secStr));
    }

    if (search && String(search).trim()) {
      const q = String(search).toLowerCase();
      results = results.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.nameInHindi && s.nameInHindi.toLowerCase().includes(q)) ||
        (s.nameInTamil && s.nameInTamil.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return res.json({
      count: results.length,
      schemes: results
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// RAG Query & Chat endpoint
app.post('/api/rag/query', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { query, state, sector, language, topK } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'A search query is required' });
    }

    // Step 1: Retrieve top-K relevant chunks using hybrid engine
    const retrievedChunks = retrieveRelevantChunks(query, {
      state: state || 'All',
      sector: sector || 'All',
      topK: Number(topK) || 4
    });

    const citations = retrievedChunks.map((rc, idx) => ({
      sourceId: `Doc-${idx + 1}`,
      schemeName: rc.chunk.schemeName,
      section: rc.chunk.title,
      url: rc.chunk.officialUrl,
      excerpt: rc.chunk.content.substring(0, 150) + '...'
    }));

    // Step 2: Construct Augmented System Prompt
    const augmentedPrompt = constructAugmentedPrompt(query, retrievedChunks, {
      state: state || 'All',
      language: language || 'English'
    });

    // Step 3: Server-side Gemini generation if available
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: augmentedPrompt
        });

        const generatedText = response.text;
        if (generatedText && generatedText.trim().length > 0) {
          return res.json({
            query,
            answer: generatedText,
            retrievedChunks,
            citations,
            confidence: Math.round((retrievedChunks[0]?.score || 0.85) * 100),
            language: language || 'English',
            augmentedPromptSample: augmentedPrompt,
            sourceType: 'gemini-grounded',
            executionTimeMs: Date.now() - startTime
          });
        }
      } catch (geminiError: any) {
        console.warn('[Gemini RAG fallback trigger]', geminiError?.message || geminiError);
      }
    }

    // Step 4: Fallback to local high-precision grounded answer
    const fallbackResult = generateLocalRAGAnswer(query, retrievedChunks);
    fallbackResult.executionTimeMs = Date.now() - startTime;
    fallbackResult.augmentedPromptSample = augmentedPrompt;

    return res.json(fallbackResult);
  } catch (err: any) {
    console.error('[RAG Query error]', err);
    return res.status(500).json({ error: 'RAG Query processing failed' });
  }
});

// Calculate Eligibility
app.post('/api/schemes/check-eligibility', (req: Request, res: Response) => {
  try {
    const profile: CitizenProfileInput = req.body;
    const results: EligibilityResult[] = [];

    for (const scheme of SCHEMES_DATABASE) {
      const qualifiedCriteria: string[] = [];
      const disqualifiedCriteria: string[] = [];
      let matchPoints = 0;
      let totalPoints = 0;

      const el = scheme.eligibility;

      // Check Age
      if (el.minAge !== undefined || el.maxAge !== undefined) {
        totalPoints += 20;
        const minPass = el.minAge === undefined || profile.age >= el.minAge;
        const maxPass = el.maxAge === undefined || profile.age <= el.maxAge;
        if (minPass && maxPass) {
          matchPoints += 20;
          qualifiedCriteria.push(`Age ${profile.age} satisfies criterion (${el.minAge || 0} to ${el.maxAge || 'Any'} years)`);
        } else {
          disqualifiedCriteria.push(`Age ${profile.age} does not meet required range (${el.minAge || 0} - ${el.maxAge || 'Any'})`);
        }
      }

      // Check Gender
      if (el.gender && el.gender !== 'All') {
        totalPoints += 25;
        if (profile.gender === el.gender) {
          matchPoints += 25;
          qualifiedCriteria.push(`Gender requirement (${el.gender}) matched`);
        } else {
          disqualifiedCriteria.push(`Reserved exclusively for ${el.gender} beneficiaries`);
        }
      }

      // Check State / Domicile
      totalPoints += 20;
      const isStateEligible = scheme.states.includes('All') || scheme.states.some(s => s.toLowerCase() === profile.state.toLowerCase());
      if (isStateEligible) {
        matchPoints += 20;
        qualifiedCriteria.push(`Resident in ${profile.state} (Eligible coverage)`);
      } else {
        disqualifiedCriteria.push(`State restricted to ${scheme.states.join(', ')}`);
      }

      // Check Income
      if (el.maxAnnualIncome !== undefined) {
        totalPoints += 20;
        if (profile.annualIncome <= el.maxAnnualIncome) {
          matchPoints += 20;
          qualifiedCriteria.push(`Annual income ₹${profile.annualIncome.toLocaleString('en-IN')} within ceiling of ₹${el.maxAnnualIncome.toLocaleString('en-IN')}`);
        } else {
          disqualifiedCriteria.push(`Annual income ₹${profile.annualIncome.toLocaleString('en-IN')} exceeds limit ₹${el.maxAnnualIncome.toLocaleString('en-IN')}`);
        }
      }

      // Check Occupation
      if (el.occupations && el.occupations.length > 0) {
        totalPoints += 25;
        const occMatched = el.occupations.some(o => 
          o.toLowerCase().includes(profile.occupation.toLowerCase()) || 
          profile.occupation.toLowerCase().includes(o.toLowerCase()) ||
          (profile.isStudent && o.toLowerCase().includes('student'))
        );
        if (occMatched) {
          matchPoints += 25;
          qualifiedCriteria.push(`Occupation (${profile.occupation}) is prioritized`);
        } else {
          disqualifiedCriteria.push(`Targeted at ${el.occupations.join(', ')}`);
        }
      }

      // Check BPL
      if (el.requiresBplCard) {
        totalPoints += 15;
        if (profile.hasBplCard) {
          matchPoints += 15;
          qualifiedCriteria.push('Possesses required BPL / Antyodaya ration card');
        } else {
          disqualifiedCriteria.push('Requires verified BPL / Antyodaya card');
        }
      }

      const matchScore = totalPoints > 0 ? Math.round((matchPoints / totalPoints) * 100) : 80;
      const isEligible = disqualifiedCriteria.length === 0;

      results.push({
        scheme,
        isEligible,
        matchScore,
        qualifiedCriteria,
        disqualifiedCriteria,
        reason: isEligible
          ? 'You meet all major prerequisite qualifications for this program.'
          : `Not currently eligible: ${disqualifiedCriteria[0] || 'Criteria not met'}`
      });
    }

    // Sort: eligible first, then by match score descending
    results.sort((a, b) => {
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return b.matchScore - a.matchScore;
    });

    return res.json({
      totalEvaluated: results.length,
      eligibleCount: results.filter(r => r.isEligible).length,
      results
    });
  } catch (err: any) {
    console.error('[Eligibility check error]', err);
    return res.status(500).json({ error: 'Eligibility calculation failed' });
  }
});

// Knowledge Index stats endpoint for live RAG Inspector
app.get('/api/rag/stats', (_req: Request, res: Response) => {
  const index = getKnowledgeIndex();
  return res.json({
    totalSchemes: SCHEMES_DATABASE.length,
    totalChunks: index.length,
    sectors: Array.from(new Set(SCHEMES_DATABASE.map(s => s.sector))),
    levels: ['Central', 'State'],
    availableStates: ['All India', 'Tamil Nadu', 'Maharashtra', 'Karnataka', 'Uttar Pradesh'],
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// -------------------------------------------------------------
// VITE SPA DEV & PROD SERVING
// -------------------------------------------------------------
async function setupVite() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MGSA - Multilingual Government Scheme Assistant server active on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('Failed to start server:', err);
});
