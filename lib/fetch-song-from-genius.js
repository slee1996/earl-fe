"use server";
import cheerio from "cheerio";
import { USER_PROMPTS } from "./constants/user-prompts";

export const parseLyrics = (html) => {
  const $ = cheerio.load(html);
  const lyricsElements = $("[data-lyrics-container='true']"); // Adjust selector as needed
  $("br", lyricsElements).replaceWith("\n");
  const lyrics = [];

  lyricsElements.each((_, element) => {
    const text = $(element).text();
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    lyrics.push(...lines);
  });

  return lyrics.map((line) => {
    if (!line.includes("[")) return line;

    const lowerLine = line.toLowerCase();

    switch (true) {
      case lowerLine.includes("verse"):
        return `[${USER_PROMPTS.verse}]`;
      case lowerLine.includes("pre"):
        return `[${USER_PROMPTS.prechorus}]`;
      case lowerLine.includes("chorus"):
        return `[${USER_PROMPTS.chorus}]`;
      case lowerLine.includes("bridge"):
        return `[${USER_PROMPTS.bridge}]`;
      case lowerLine.includes("intro"):
        return `[${USER_PROMPTS.intro}]`;
      case lowerLine.includes("outro"):
        return `[${USER_PROMPTS.outro}]`;
      default:
        return `[${USER_PROMPTS.verse}]`;
    }
  });
};

// Function to fetch lyrics from a Genius link
export const fetchGeniusLink = async ({ geniusLink }) => {
  const res = await fetch(geniusLink, { method: "GET" });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const html = await res.text();
  return parseLyrics(html);
};
