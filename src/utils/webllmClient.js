// WebLLM Client Wrapper - Singleton for local LLM inference
// The host library is ~5MB. Imported dynamically inside init() so it stays
// out of the entry chunk and only downloads once a visitor opens the chat.
import { createWebLLMWorker } from "./createWebLLMWorker";

// The model has one job: answer questions about one person from a short
// brief, without adding anything. That is a grounding task, and grounding is
// where the very small models fall down. Asked where Deep studied,
// Llama-3.2-1B invented an education history outright, naming universities he
// never attended. Qwen2.5-1.5B holds to the brief.
//
// Sizes, since a visitor pays for this once before the chat answers:
//   Qwen2.5-1.5B-Instruct-q4f16_1-MLC   ~1.1GB   current
//   Llama-3.2-1B-Instruct-q4f16_1-MLC   ~0.7GB   too loose with the facts
//   Llama-3.2-3B-Instruct-q4f16_1-MLC   ~2.2GB   better still, twice the wait
const DEFAULT_MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

let engine = null;
let worker = null;
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
      // Create the module worker (kept module-level so unload() can terminate it)
      worker = createWebLLMWorker();

      // Create engine with progress callback
      const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");
    engine = await CreateWebWorkerMLCEngine(
        worker,
        DEFAULT_MODEL_ID,
        {
          initProgressCallback: (report) => {
            if (onProgress) {
              // WebLLM progress callback structure
              // report.progress is the current progress value
              // report.text contains status messages
              let progress = 0;
              
              // Try to extract progress from the report.
              // WebLLM reports progress as a fraction 0-1; convert to percent.
              if (typeof report.progress === 'number') {
                progress = Math.min(100, Math.max(0, Math.round(report.progress * 100)));
              } else if (report.text) {
                // If progress is in text format, try to parse it
                const match = report.text.match(/(\d+)%/);
                if (match) {
                  progress = parseInt(match[1], 10);
                }
              }
              
              // Always call onProgress to update UI
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
      if (worker) {
        worker.terminate();
        worker = null;
      }
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Drop a trailing fragment, so an answer that ran out of tokens still ends on
 * a complete sentence or a complete bullet. Keeps the fragment if cutting
 * would throw away most of the answer: half a thought beats almost nothing.
 *
 * @param {string} text
 * @returns {string}
 */
function trimToLastSentence(text) {
  const trimmed = text.trimEnd();
  const stop = Math.max(
    trimmed.lastIndexOf("."),
    trimmed.lastIndexOf("!"),
    trimmed.lastIndexOf("?")
  );
  if (stop === trimmed.length - 1) return trimmed;
  const cut = Math.max(stop + 1, trimmed.lastIndexOf("\n"));
  return cut > trimmed.length * 0.4 ? trimmed.slice(0, cut).trimEnd() : trimmed;
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
  let finishReason = null;

  try {
    const stream = await engine.chat.completions.create({
      messages,
      stream: true,
      // Greedy decoding. The job is to restate a brief, not to write, so
      // there is nothing for sampling to contribute and every sampled token
      // is a chance to drift: at 0.2 the model moved a start date from Dec
      // 2021 to May 2021.
      temperature: 0,
      top_p: 1,
      // The model holds to the brief for the first few sentences and starts
      // embroidering after that: given 640 tokens on Deep's work history it
      // opened with four accurate sentences, then invented a date range, a
      // figure and a comparison that were never in front of it. 260 is enough
      // for a complete answer to every question the chat is actually asked,
      // and short enough to end before the drift. Running out mid-sentence
      // reads as a crash, so trimToLastSentence below clears the fragment.
      max_tokens: 260,
      // No repetition penalties. They were added to stop an earlier model
      // looping on an invented bibliography, but they punish exactly what is
      // wanted here: a faithful answer repeats "Niti Pharma", "AI Engineer"
      // and the numbers from the brief, and a penalty pushes the model to
      // reach for different words instead, which is where the facts bend.
      // Greedy decoding handles the looping on its own.
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (choice?.finish_reason) {
        finishReason = choice.finish_reason;
      }
      const delta = choice?.delta?.content || "";
      if (delta) {
        fullText += delta;
        if (onToken) {
          onToken(delta);
        }
      }
    }

    // Hitting the cap leaves a dangling clause. The caller replaces the
    // streamed text with whatever comes back here, so the visitor is left
    // with whole sentences.
    return finishReason === "length" ? trimToLastSentence(fullText) : fullText;
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
export async function unload() {
  if (engine) {
    if (engine.unload) {
      try {
        await engine.unload();
      } catch (e) {
        // Engine may already be in a broken state; still tear down the worker.
      }
    }
    engine = null;
  }
  if (worker) {
    worker.terminate();
    worker = null;
  }
  isInitializing = false;
  initPromise = null;
}

/**
 * Get current model ID
 */
export function getModelId() {
  return DEFAULT_MODEL_ID;
}
