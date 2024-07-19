import { pipeline } from "@xenova/transformers";

self.onmessage = async (event) => {
  const input = event.data;
  try {
    const generator = await pipeline("text-generation", "Xenova/gpt2");
    const generationOutput = await generator(
      `Complete these original song lyrics: ${input}`,
      {
        temperature: 0.8,
        repetition_penalty: 1.5,
        num_return_sequences: 1,
        no_repeat_ngram_size: 2,
        num_beams: 2,
        max_new_tokens: 16,
      }
    );

    const result = generationOutput.map((item) => {
      // Remove the original input from the generated text
      const generatedText = item.generated_text;
      const outputWithoutInput = generatedText
        .replace(`Complete these original song lyrics: ${input}`, "")
        .trim();
      return outputWithoutInput;
    });

    self.postMessage({ result: result[0] });
  } catch (error) {
    console.error("ONNX inference error:", error);
    self.postMessage({ error: error.message });
  }
};
