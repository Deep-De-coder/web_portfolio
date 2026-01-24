// WebLLM Client Wrapper - Singleton for local LLM inference
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { createWebLLMWorker } from "./createWebLLMWorker";

// Model ID - using a small instruction-tuned model
// Options: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC" (smallest, ~700MB)
//          "Phi-3-mini-4k-instruct-q4f16_1-MLC" (~2.3GB)
//          "Llama-3.2-1B-Instruct-q4f16_1-MLC" (~700MB)
const DEFAULT_MODEL_ID = "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC";

let engine = null;
let isInitializing = false;
let initPromise = null;

/**
 * Check if WebGPU is supported
 */
export function isWebGPUSupported() {
  if (typeof navigator === "undefined") return false;
  return "gpu" in navigator;
}

/**
 * Initialize the WebLLM engine
 * @param {Function} onProgress - Callback for progress updates (progress: number)
 * @returns {Promise<Object>} The initialized engine
 */
export async function init(onProgress) {
  // Only run in browser
  if (typeof window === "undefined") {
    throw new Error("WebLLM only works in browser environment");
  }

  if (!isWebGPUSupported()) {
    throw new Error("WebGPU not supported in this browser");
  }

  if (engine) {
    return engine;
  }

  if (isInitializing) {
    return initPromise;
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      // Create worker using blob URL for Create React App compatibility
      const worker = createWebLLMWorker();

      // Create engine with progress callback
      engine = await CreateWebWorkerMLCEngine(
        worker,
        DEFAULT_MODEL_ID,
        {
          initProgressCallback: (report) => {
            if (onProgress) {
              const progress = Math.min(
                100,
                Math.round((report.progress / report.text.length) * 100)
              );
              onProgress(progress);
            }
          },
        }
      );

      isInitializing = false;
      return engine;
    } catch (error) {
      isInitializing = false;
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Stream chat completion
 * @param {Object} params
 * @param {string} params.systemPrompt - System prompt
 * @param {Array} params.history - Chat history [{role, content}]
 * @param {string} params.userPrompt - User's message
 * @param {Function} params.onToken - Callback for each token (token: string)
 * @returns {Promise<string>} Full response text
 */
export async function streamChat({ systemPrompt, history, userPrompt, onToken }) {
  if (!engine) {
    throw new Error("Engine not initialized. Call init() first.");
  }

  const messages = [];
  
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  // Add history
  if (history && history.length > 0) {
    messages.push(...history);
  }

  // Add current user message
  messages.push({ role: "user", content: userPrompt });

  let fullText = "";

  try {
    const stream = await engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        fullText += delta;
        if (onToken) {
          onToken(delta);
        }
      }
    }

    return fullText;
  } catch (error) {
    throw new Error(`Streaming error: ${error.message}`);
  }
}

/**
 * Interrupt current generation
 */
export function interruptGenerate() {
  if (engine && engine.interruptGenerate) {
    engine.interruptGenerate();
  }
}

/**
 * Reset chat (clear KV cache)
 */
export async function resetChat() {
  if (engine && engine.resetChat) {
    await engine.resetChat();
  }
}

/**
 * Unload the engine
 */
export function unload() {
  if (engine) {
    if (engine.unload) {
      engine.unload();
    }
    engine = null;
    isInitializing = false;
    initPromise = null;
  }
}

/**
 * Get current model ID
 */
export function getModelId() {
  return DEFAULT_MODEL_ID;
}
