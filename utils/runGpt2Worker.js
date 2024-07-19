export function runGpt2Worker({
  input,
  temperature = 0.1,
  max_new_tokens = 16,
}) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./gpt2Worker.js", import.meta.url));

    worker.onmessage = (event) => {
      const { result, error } = event.data;
      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(new Error(`Worker error: ${error.message}`));
      worker.terminate();
    };

    worker.postMessage({ input, temperature, max_new_tokens });
  });
}
