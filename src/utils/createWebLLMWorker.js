// Create WebLLM worker for Create React App
// CRA 5.0+ supports workers, but we need to handle the path correctly
export function createWebLLMWorker() {
  // Try using import.meta.url (works in modern bundlers including CRA 5+)
  try {
    const workerUrl = new URL('../workers/webllm.worker.js', import.meta.url);
    return new Worker(workerUrl, { type: "module" });
  } catch (e) {
    // Fallback for older CRA or if import.meta.url fails
    // Use blob with inline code that imports from node_modules via CDN
    // Note: This requires the package to be available via CDN
    const workerCode = `
      import { WebWorkerMLCEngineHandler } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.48/dist/index.js";
      
      const handler = new WebWorkerMLCEngineHandler();
      
      self.onmessage = (msg) => {
        handler.onmessage(msg);
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl, { type: "module" });
    
    // Clean up blob URL after worker is created (optional, but good practice)
    // Note: We can't revoke immediately, so we'll keep it
    return worker;
  }
}
