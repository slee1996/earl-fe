"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@vercel/analytics/react";

export default function GenerationControls({
  components,
  selectedApi,
  setSelectedApi,
  songTitle,
  songDescription,
  setSongTitle,
  setSongDescription,
  setSong,
  setSongLoading,
  apiUrl,
}) {
  const changeTitle = (e) => {
    return setSongTitle(e.target.value);
  };

  const changeDescription = (e) => {
    return setSongDescription(e.target.value);
  };

  const fetchData = async ({ songComponents }) => {
    track("Generate Song");
    setSongLoading(true);

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

    await setSong(song);

    return setSongLoading(false);
  };

  const fetchDataWithEnforcement = async ({ songComponents }) => {
    track("Generate Song With Enforcement");
    setSongLoading(true);

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

    await setSong(song);

    return setSongLoading(false);
  };

  return (
    <div>
      <div className="flex flex-col space-y-4 mt-4">
        <button
          className="border hover:bg-white hover:text-black"
          onClick={() =>
            fetchData({
              songComponents: components,
            })
          }
        >
          Generate song
        </button>
        <button
          className="border hover:bg-white hover:text-black"
          onClick={() =>
            fetchDataWithEnforcement({
              songComponents: components,
            })
          }
        >
          Generate song with enforcement
        </button>
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
        <Accordion
          className={`border border-white p-4 m-5 w-80`}
          type="single"
          collapsible
          defaultValue="true"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>
              &quot;Generate Song With Enforcement&quot; explanation
            </AccordionTrigger>
            <AccordionContent>
              &quot;Generate Song With Enforcement&quot; will enforce meter
              restrictions during the generation process with programmattic
              metric detection and parsing. It takes longer, but provides
              stronger control than the simple prompting of generic
              &quot;Generate Song&quot;
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
