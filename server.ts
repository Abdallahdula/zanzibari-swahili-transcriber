import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;
const MAX_AUDIO_FILE_MB = 100;
const MAX_AUDIO_FILE_BYTES = MAX_AUDIO_FILE_MB * 1024 * 1024;
const MAX_AUDIO_FILE_ERROR =
  `Faili la sauti ni kubwa sana (max ${MAX_AUDIO_FILE_MB}MB). Tafadhali libane/compress kwanza kisha upakie tena.`;

// Allow base64 overhead for audio files up to 100MB.
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required. Please add it via Settings > Secrets."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function getBase64DecodedByteLength(base64Data: string): number {
  const normalizedData = base64Data.replace(/\s/g, "");
  const paddingLength = normalizedData.endsWith("==") ? 2 : normalizedData.endsWith("=") ? 1 : 0;
  return (normalizedData.length * 3) / 4 - paddingLength;
}

// Helper to execute generateContent with automatic retry, exponential backoff, and model fallback
async function generateContentWithRetry(ai: GoogleGenAI, params: any) {
  const maxAttempts = 3;
  const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Attempting transcription using model: ${model}, attempt: ${attempt}/${maxAttempts}`);
        const currentParams = {
          ...params,
          model: model,
        };
        const response = await ai.models.generateContent(currentParams);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMessage = err.message || "";
        console.warn(`Attempt ${attempt} for model ${model} failed with message:`, errMessage);

        // Detect transient errors like 503, 429, resource exhaustion, or high demand spikes
        const isTransient = 
          err.status === 503 || 
          err.statusCode === 503 || 
          err.status === 429 || 
          err.statusCode === 429 ||
          errMessage.includes("503") || 
          errMessage.includes("UNAVAILABLE") || 
          errMessage.includes("high demand") ||
          errMessage.includes("429") ||
          errMessage.includes("RESOURCE_EXHAUSTED") ||
          errMessage.includes("overloaded");

        // If it's a fatal non-transient error (like invalid API key, incorrect payload schema, or 400 Bad Request), fail early
        if (!isTransient && attempt === 1) {
          throw err;
        }

        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 600;
          console.log(`Transient error detected. Waiting ${delay.toFixed(0)}ms before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error("Mchakato wa kutafsiri umeshindwa baada ya majaribio kadhaa.");
}

// API Route: Transcribe audio using gemini-3.5-flash with high reliability
app.post("/api/transcribe", async (req: express.Request, res: express.Response) => {
  try {
    const { audioData, fileName, mimeType, meetingContext } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: "No audio data provided." });
    }

    if (getBase64DecodedByteLength(audioData) > MAX_AUDIO_FILE_BYTES) {
      return res.status(413).json({ error: MAX_AUDIO_FILE_ERROR });
    }

    const ai = getGeminiClient();

    // Enforce structured JSON output using Type enums
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "A descriptive meeting title generated from the content (e.g., 'Review ya Kikao cha Kilimo cha Maembe Zanzibar').",
        },
        duration: {
          type: Type.STRING,
          description: "Approximate meeting duration inferred or specified by the file content.",
        },
        summary: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.STRING,
              description: "A comprehensive 3-5 sentence meeting overview detailing who was involved, the main topics, and general outcome.",
            },
            agenda: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Identified list of central meeting agenda items.",
            },
            decisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key resolutions, decisions, and agreements made.",
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING, description: "Detailed task description." },
                  assignee: { type: Type.STRING, description: "The person assigned to the task (e.g. Salim, Halima, or 'TBD')." },
                  status: { type: Type.STRING, description: "Task progress status, initialized as 'Pending'." },
                },
                required: ["task", "assignee", "status"],
              },
            },
          },
          required: ["overview", "agenda", "decisions", "actionItems"],
        },
        transcript: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING, description: "Speaker identifier (e.g., Salim, Khamis, Speaker A)." },
              text: { type: Type.STRING, description: "Exact verbatim coastal Zanzibari Swahili transcription. Capture original words, dialect, slang, and important audible non-speech events. If a patient coughs, write exactly: A patient coughs." },
              timestamp: { type: Type.STRING, description: "Inferred timeline of speakers' turn in format MM:SS." },
            },
            required: ["speaker", "text", "timestamp"],
          },
          description: "The turn-by-turn chronological transcript dialog. Keep sentences dense and accurate.",
        },
        dialectGloss: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: "The specific Zanzibarian dialect word, slang phrase, or Arabic coastal loanword found in the audio (e.g., viwalo, mambo yange, maskani, kuzengeana, shoga, shehe)." },
              meaningSwahili: { type: Type.STRING, description: "Standard (Sanifu) Swahili equivalent/translation." },
              meaningEnglish: { type: Type.STRING, description: "English translation including nuances." },
              explanation: { type: Type.STRING, description: "Linguistic or cultural details of how this word operates in Zanzibari culture." },
              exampleSentence: { type: Type.STRING, description: "The sentence from the transcript where this word was observed." },
            },
            required: ["word", "meaningSwahili", "meaningEnglish", "explanation", "exampleSentence"],
          },
          description: "Glossary of unique coastal Zanzibari Swahili slang, terms, and distinct regional expressions.",
        },
      },
      required: ["title", "duration", "summary", "transcript", "dialectGloss"],
    };

    const systemInstruction = `You are a world-class linguist, coastal East African anthropologist, and professional transcriber specializing in Zanzibarian Swahili (Kiunguja, coastal slang, Arabic loanwords, youth vijiwe/maskani terms, and coastal idioms).
Your goal is to transcribe coastal Swahili recordings with absolute accuracy.

Follow these strict rules:
1. DIALECT & SLANG: Capture the exact dialect features of Zanzibar (e.g., using 'potezea', 'mambo yange', 'kuzengeana', 'mshkaji', Arabic phrases, greetings, 'shehe'). Do NOT sanitize or translate regional slang into standard Swahili in the transcript itself. Write verbatim what they say, and document the slang in the dialectGloss array!
2. SPEAKER DIARIZATION: Segment who is speaking. If names are mentioned (Salim, Halima, Sumayya, Fatma, etc.), use their names as speaker labels instead of generic labels.
3. CONCISE DENSITY FOR LONG RECORDINGS: If files are excessively long (such as a full 39 min meeting), synthesize repetitive circular loops, but preserve all relevant dialogue, core decisions, arguments, and Zanzibari slang terms with precise turn-by-turn timestamps in format MM:SS.
4. TRANSCRIPT LANGUAGE: Keep the transcript itself in Swahili/Kiunguja exactly as spoken. Do not translate the spoken transcript into English, even if the application interface is English.
5. PATIENT COUGH EVENTS: If a patient coughs, add it as its own transcript turn at the correct timestamp. Set the text to exactly "A patient coughs." Do not write only "[cough]" or "(cough)".
6. SUMMARY: Provide high-quality meeting summaries, lists of decisions, and actionable items.`;

    const promptText = `Please transcribe the provided Swahili meeting audio file.
File Name: ${fileName || "recording.mp3"}
Context: ${meetingContext || "Zanzibari Swahili meeting with potential local slang"}`;

    const response = await generateContentWithRetry(ai, {
      contents: [
        {
          inlineData: {
            mimeType: mimeType || "audio/mp3",
            data: audioData,
          },
        },
        { text: promptText },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received an empty response from the transcription model.");
    }

    try {
      const parsed = JSON.parse(responseText.trim());
      res.json(parsed);
    } catch (parseErr) {
      console.error("JSON Parsing Error from Gemini Response:", responseText);
      res.status(502).json({
        error: "Failed to parse the structured structured data from the transcription model.",
        rawText: responseText,
      });
    }

  } catch (error: any) {
    console.error("Transcription API Error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during transcription.",
    });
  }
});

// Robust error handler to format exceptions as JSON instead of HTML
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Uncaught Middleware/Router Error:", err);
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: MAX_AUDIO_FILE_ERROR });
  }

  res.status(err.status || err.statusCode || 500).json({
    error: err.message || "Hitilafu imetokea kwenye seva. Tafadhali jaribu tena.",
  });
});

// Setup dev and production gateways
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Zanzibari Swahili backend running on http://localhost:${PORT}`);
  });
}

startServer();
