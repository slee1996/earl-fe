import { pipeline } from "@xenova/transformers";

self.onmessage = async (event) => {
  const input = event.data;
  try {
    const unmasker = await pipeline("fill-mask", "Xenova/bert-base-uncased");

    const unmaskOutput = await unmasker(`${input}`, {
      topk: 10,
    });

    const result = unmaskOutput
      .filter((item) => item.token >= 1998)
      .map((item) => item.token_str);

    self.postMessage({ result });
  } catch (error) {
    console.error("ONNX inference error:", error);
    self.postMessage({ error: error.message });
  }
};
