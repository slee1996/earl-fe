"use client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Switch } from "@/components/ui/switch";
import { track } from "@vercel/analytics/react";
import { Button } from "../ui/button";
import { DEFAULT_COMPONENT, SUNO_OPTIMAL } from "@/lib/constants";
import { useState } from "react";

export default function GenerationControls({
  components,
  selectedApi,
  setSelectedApi,
  songTitle,
  songDescription,
  setSongTitle,
  setSongDescription,
  setSongAndUpdateEdit,
  apiUrl,
  setComponents,
  setSongLoading
}) {
  const [enforcementChecked, setEnforcementChecked] = useState(false);

  const changeTitle = (e) => {
    return setSongTitle(e.target.value);
  };

  const changeDescription = (e) => {
    return setSongDescription(e.target.value);
  };

  const fetchData = async ({ songComponents }) => {
    track("Generate Song");
    setSongLoading(true)

    const response = await fetch(`${apiUrl}generate-song`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        songComponents,
        songTitle,
        songDescription,
        clientChoice: selectedApi,
      }),
    });
    const song = await response.json();

    setSongLoading(false)
    return setSongAndUpdateEdit(song); // Changed from setSong
  };

  const fetchDataWithEnforcement = async ({ songComponents }) => {
    track("Generate Song With Enforcement");
    setSongLoading(true)

    const response = await fetch(`${apiUrl}generate-song-with-enforcement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        songComponents,
        songTitle,
        songDescription,
        clientChoice: selectedApi,
      }),
    });
    const song = await response.json();

    setSongLoading(false)
    return setSongAndUpdateEdit(song);
  };

  return (
    <div className="px-4 w-1/4">
      <div className="flex flex-col space-y-4 mt-4">
        <div className="flex flex-row justify-between items-center">
          <Button
            className="border hover:bg-white hover:text-black"
            onClick={() =>
              enforcementChecked
                ? fetchDataWithEnforcement({
                    songComponents: components,
                  })
                : fetchData({
                    songComponents: components,
                  })
            }
          >
            Generate song
          </Button>
          <span className="flex flex-row justify-between items-center space-x-1">
            <HoverCard>
              <HoverCardTrigger className="underline cursor-pointer text-blue-200">
                Enforce Constraints
              </HoverCardTrigger>
              <HoverCardContent className="font-light">
                Toggling Enforce Constraints on will enforce meter and rhyme
                restrictions during the generation process with programmatic
                metric detection and parsing. It takes longer, but provides
                stronger control than the simple prompting of generating without
                it.
              </HoverCardContent>
            </HoverCard>
            <Switch
              id="enforce-constraints"
              value={enforcementChecked}
              onClick={() => setEnforcementChecked((currentVal) => !currentVal)}
            />
          </span>
        </div>

        <select
          value={selectedApi}
          onChange={(e) => setSelectedApi(e.target.value)}
          className="bg-black text-white border border-white rounded px-2"
        >
          {[
            { title: "OpenAI", value: "openai" },
            { title: "Anthropic", value: "anthropic" },
            { title: "Llama 3.1", value: "llama" },
          ].map((option) => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
        <h4>Song Title</h4>
        <input
          className="text-black p-1"
          placeholder="Drive It Like You Stole It"
          value={songTitle}
          onChange={changeTitle}
        />
        <h4>Song Description</h4>
        <textarea
          className="text-black p-1"
          value={songDescription}
          onChange={changeDescription}
        />
        <Button
          onClick={() => {
            setComponents((currentVal) => [...currentVal, DEFAULT_COMPONENT]);
          }}
        >
          Add Component
        </Button>
        <Button onClick={() => setComponents(SUNO_OPTIMAL)}>
          Max Suno Length
        </Button>
      </div>
    </div>
  );
}
