import React, { useState } from "react";
import { SUNO_OPTIMAL } from "@/lib/constants/suno-max";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { USER_PROMPTS } from "@/lib/constants/user-prompts";
import { fetchGeniusLink } from "@/lib/fetch-song-from-genius";
import { toast } from "sonner";

export default function CompositionControls({
  children,
  setComponents,
  ComponentDefault,
  apiUrl,
}) {
  const [songLyrics, setSongLyrics] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [geniusLink, setGeniusLink] = useState("");

  const generateSongStructure = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${apiUrl}create-song-structure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songLyrics: parseSongLyrics(songLyrics) }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate song structure");
      }

      const data = await response.json();

      setComponents(
        data.songStructure.map((fragment) => ({
          ...fragment,
          selectedUserPrompt: USER_PROMPTS[fragment.selectedUserPrompt],
        }))
      );
    } catch (error) {
      console.error("Error generating song structure:", error);
      toast("Error generating song structure.");
    } finally {
      setIsGenerating(false);
    }
  };

  const parseSongLyrics = (lyrics) => {
    const parts = lyrics.split(
      /\[((?:OUTRO|VERSE|CHORUS|BRIDGE|INTRO|PRECHORUS)(?:\s*\d+)?)\]/i
    );
    const parsedLyrics = [];

    for (let i = 1; i < parts.length; i += 2) {
      parsedLyrics.push({
        songPartTitle: parts[i].toLowerCase(),
        lines: parts[i + 1].trim().split("\n"),
      });
    }

    return parsedLyrics;
  };

  return (
    <div className="w-1/4">
      <h1>Components</h1>
      <div className="flex flex-col space-y-2">
        <Dialog>
          <DialogTrigger className="border hover:bg-white hover:text-black px-2">
            Generate Structure from Existing Song
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paste Song Below</DialogTitle>
              <DialogDescription>
                <sub>
                  Include [VERSE], [CHORUS], and [BRIDGE] delimiters to ensure
                  song is parsed properly
                </sub>
                <textarea
                  className="w-full my-4 border p-2 min-h-80"
                  value={songLyrics}
                  onChange={(e) => setSongLyrics(e.target.value)}
                />
                <div className="flex flex-col space-y-1">
                  <input
                    className="border"
                    value={geniusLink}
                    onChange={(e) => setGeniusLink(e.target.value)}
                  />
                  <button
                    type="submit"
                    onClick={async () => {
                      const lyrics = await fetchGeniusLink({ geniusLink });

                      setSongLyrics(lyrics.join("\n"));
                    }}
                    className="border hover:bg-white hover:text-black px-2 py-1"
                  >
                    {isGenerating ? "Generating..." : "Pull Song From Genius"}
                  </button>
                  <sub>
                    *Paste a link from Genius in the input above to get your
                    song structure
                  </sub>
                </div>
                <DialogTrigger>
                  <button
                    type="submit"
                    onClick={generateSongStructure}
                    disabled={isGenerating}
                    className="border hover:bg-white hover:text-black px-2 py-1 my-4"
                  >
                    {isGenerating ? "Generating..." : "Generate Song Structure"}
                  </button>
                </DialogTrigger>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div className="max-h-[90vh] overflow-y-scroll py-4">{children}</div>
    </div>
  );
}
