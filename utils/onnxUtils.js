export function runOnnxInference(input) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.js', import.meta.url));

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

    worker.postMessage(input);
  });
}