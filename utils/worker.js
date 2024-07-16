import { pipeline } from "@xenova/transformers";

self.onmessage = async (event) => {
  const input = event.data;
  try {
    const unmasker = await pipeline("fill-mask", "Xenova/bert-base-uncased");

    const strongBadString =
      "angry, hateful, terrifying, spiteful, death, threats, furious, enraged, bitter, hostile, malevolent, malicious, vengeful, wrathful, miserable, desolate, hopeless, gloomy, wretched, dreadful, cursed, tragic, ominous, fearsome, loathsome, brutal, cruel";
    const strongHappyString =
      "happy, joyful, peaceful, kind, loving, life, ecstatic, delighted, cheerful, blissful, radiant, content, euphoric, jubilant, serene, harmonious, grateful, blessed, enthusiastic, optimistic, vibrant, elated, thrilled, exhilarated, pleased, merry, glad, sunny";
    const eroticString =
      "seductive, sensual, intimate, passionate, arousing, enticing, provocative, erotic, lustful, steamy, sultry, sexy, amorous, libidinous, titillating, racy, alluring, suggestive, flirtatious, tantalizing, naughty, voluptuous, carnal, lascivious, stimulating, naked";
    const passiveString =
      "calm, serene, peaceful, relaxed, tranquil, quiet, subdued, mellow, gentle, placid, easygoing, still, restful, undisturbed, unruffled, low-key, docile, compliant, yielding, acquiescent, submissive, unobtrusive, mild, tame, laid-back";
    const eroticSentence =
      "The atmosphere was filled with seductive, intimate whispers and passionate, arousing glances. Every touch was electric, every look was filled with desire. The air was thick with the scent of anticipation, as hearts raced and breaths quickened. Soft, sensual music played in the background, setting the perfect mood for an evening of unbridled passion. The warm, inviting glow of candlelight flickered across their faces, highlighting the longing in their eyes. Bodies moved closer, drawn together by an irresistible magnetic pull, as the heat of the moment enveloped them completely.";
    const raunchyString =
      "The room was alive with wild, uninhibited energy, bodies tangled in a frenzy of lust and desire. Moans and gasps filled the air as hands roamed freely over bare skin. The scent of sweat and passion was thick, mingling with the raw, primal sounds of pleasure. Eyes locked in intense, carnal hunger, as clothes were discarded in a heated rush. Every movement was bold and shameless, driven by an insatiable need to indulge in the most forbidden fantasies. The atmosphere was electric with anticipation, as each moment grew more daring and provocative. Her tits bounced as their bodies fused.";

    const unmaskOutput = await unmasker(`${input}`, {
      topk: 20,
    });
    // const unmaskOutput = await unmasker(`${input}`, {
    //   topk: 20,
    // });

    const result = unmaskOutput
      .filter((item) => item.token >= 1998)
      .map((item) => item.token_str);

    self.postMessage({ result });
  } catch (error) {
    console.error("ONNX inference error:", error);
    self.postMessage({ error: error.message });
  }
};
