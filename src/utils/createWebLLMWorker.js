// Create WebLLM worker for Create React App (webpack 5).
// IMPORTANT: webpack only emits a bundled worker chunk when it sees the
// literal pattern `new Worker(new URL('./path', import.meta.url))` in one
// expression. Hoisting the URL into a variable defeats the static analysis,
// so the worker file would load untranspiled and fail on its bare
// `@mlc-ai/web-llm` import. Keep this as a single literal expression.
export function createWebLLMWorker() {
  return new Worker(new URL('../workers/webllm.worker.js', import.meta.url), { type: 'module' });
}
