"use client";

import { useState } from "react";
import LyricRegenPopup from "./LyricRegenPopup";
import { runGpt2Worker } from "@/utils/runGpt2Worker";
import { ChangingCharacters } from "./ChangingCharacters";
import { SongComponent } from "./SongComponent";
import { copyText } from "@/lib/copy-text";
import { SUNO_OPTIMAL } from "@/lib/constants/suno-max";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@vercel/analytics";

const systemPrompts = {
  popstar: "popstar",
  rapper: "rapper",
  electropopStar: "electropopStar",
  rockstar: "rockstar",
  countryArtist: "countryArtist",
  custom: "custom",
};

const userPrompts = {
  verse: "VERSE",
  chorus: "CHORUS",
  bridge: "BRIDGE",
};

const ComponentDefault = {
  lineLimit: 8,
  meter: [[1, 0, 1, 0, 1, 0, 1, 0]],
  selectedUserPrompt: userPrompts.verse,
  selectedSystemPrompt: systemPrompts.popstar,
};

export default function Composition({ apiUrl }) {
  const [components, setComponents] = useState([
    {
      lineLimit: 8,
      meter: [
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
      ],
      selectedSystemPrompt: systemPrompts.rapper,
      selectedUserPrompt: userPrompts.verse,
      customSystemPrompt: "",
    },
  ]);
  const [song, setSong] = useState([
    {
      component: "verse",
      lyrics: [
        "Underneath the neon skies",
        "Where the shadows come to play",
        "City lights will tell their lies",
        "People hidden, night and day",
        "In these streets where dreams collide",
        "Hopes are drifting, low and high",
        "Got my heart and pride inside",
        "Facing doubts, I reach the sky",
      ],
    },
  ]);
  const [openPopupIndex, setOpenPopupIndex] = useState(null);
  const [newLineLoading, setNewLineLoading] = useState(false);
  const [songLoading, setSongLoading] = useState(false);
  const [gpt2Temp, setGpt2Temp] = useState(0.1);
  const [maxNewTokens, setMaxTokens] = useState(16);
  const [songTitle, setSongTitle] = useState("");
  const [songDescription, setSongDescription] = useState("");
  const [selectedApi, setSelectedApi] = useState("openai");

  const changeTitle = (e) => {
    return setSongTitle(e.target.value);
  };

  const changeDescription = (e) => {
    return setSongDescription(e.target.value);
  };

  const saveNewLine = ({ lineToSave, lineIndex, componentIndex }) => {
    setSong((prevSong) => {
      const updatedSong = [...prevSong];
      updatedSong[componentIndex].lyrics[lineIndex] = lineToSave;
      return updatedSong;
    });
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

  const handleMeterClick = (i, j, k) => {
    setComponents((prevComponents) => {
      return prevComponents.map((component, index) => {
        if (index !== i) return component;

        const updatedMeter = component.meter.map((meterRow, rowIndex) => {
          if (rowIndex !== j) return meterRow;

          return meterRow.map((value, colIndex) => {
            return colIndex === k ? (value === 0 ? 1 : 0) : value;
          });
        });

        return {
          ...component,
          meter: updatedMeter,
        };
      });
    });
  };

  const handleRangeChange = async (i, j, e) => {
    const newLength = parseInt(e.target.value, 10);

    await setComponents((prevComponents) => {
      return prevComponents.map((component, index) => {
        if (index !== i) return component;

        const updatedMeter = component.meter.map((meterRow, rowIndex) => {
          if (rowIndex !== j) return meterRow;

          const currentLength = meterRow.length;
          if (newLength > currentLength) {
            const lastDigit = meterRow[currentLength - 1];
            const fillValue = lastDigit === 0 ? 1 : 0;
            return [
              ...meterRow,
              ...Array(newLength - currentLength).fill(fillValue),
            ];
          } else {
            return meterRow.slice(0, newLength);
          }
        });

        return {
          ...component,
          meter: updatedMeter,
        };
      });
    });
  };

  const handleLineLimitChange = (i, e) => {
    const newLineLimit = parseInt(e.target.value, 10);
    setComponents((prevComponents) =>
      prevComponents.map((component, index) =>
        index === i ? { ...component, lineLimit: newLineLimit } : component
      )
    );
  };

  const handleCustomSystemPromptChange = (i, e) => {
    const newSystemPrompt = e.target.value;
    setComponents((prevComponents) =>
      prevComponents.map((component, index) =>
        index === i
          ? { ...component, customSystemPrompt: newSystemPrompt }
          : component
      )
    );
  };

  const handleSystemPromptChange = (i, e) => {
    track(`new system prompt chosen: ${e.target.value}`);
    const newSystemPrompt = e.target.value;
    setComponents((prevComponents) =>
      prevComponents.map((component, index) =>
        index === i
          ? { ...component, selectedSystemPrompt: newSystemPrompt }
          : component
      )
    );
  };

  const handleUserPromptChange = (i, e) => {
    track(`new user prompt chosen: ${e.target.value}`);
    const newUserPrompt = e.target.value;
    setComponents((prevComponents) =>
      prevComponents.map((component, index) =>
        index === i
          ? { ...component, selectedUserPrompt: newUserPrompt }
          : component
      )
    );
  };

  const handleAddMeter = (i) => {
    setComponents((prevComponents) =>
      prevComponents.map((component, index) =>
        index === i
          ? {
              ...component,
              meter: [...component.meter, [1, 0, 1, 0, 1, 0, 1, 0]],
            }
          : component
      )
    );
  };

  const handleRemoveMeter = (i, j) => {
    setComponents((prevComponents) =>
      prevComponents.map((component, index) => {
        if (index !== i) return component;
        return {
          ...component,
          meter: component.meter.filter((_, rowIndex) => rowIndex !== j),
        };
      })
    );
  };

  const addNewLine = async () => {
    setNewLineLoading(true);

    const flattenedSong = song.flatMap((component) => [
      `[${component.component.toUpperCase()}]`,
      ...component.lyrics,
    ]);
    const lastTwoElements = flattenedSong
      .slice((-1 * flattenedSong.length) % 3)
      .join(". ");

    const newLine = await runGpt2Worker({
      input: lastTwoElements,
      temperature: gpt2Temp,
      max_new_tokens: maxNewTokens,
    });

    setSong((prevSong) => {
      const updatedSong = [...prevSong];
      const lastComponent = updatedSong[updatedSong.length - 1];

      const cleanedNewLine = newLine
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");

      if (!lastComponent.lyrics.includes(cleanedNewLine)) {
        lastComponent.lyrics.push(cleanedNewLine);
      } else {
        console.warn("New line is already present, not adding again.");
      }

      return updatedSong;
    });

    setNewLineLoading(false);
  };

  const deleteLine = ({ lineIndex }) => {
    setSong((prevSong) => {
      const updatedSong = [...prevSong];
      const lastComponent = updatedSong[updatedSong.length - 1];

      if (lineIndex >= 0 && lineIndex < lastComponent.lyrics.length) {
        lastComponent.lyrics.splice(lineIndex, 1);
      } else {
        console.warn("Invalid line index, no line deleted.");
      }

      return updatedSong;
    });
  };

  const handleTemperatureChange = (e) => {
    const newTemp = parseFloat(e.target.value);
    setGpt2Temp(newTemp);
  };

  const handleChangeNewTokens = (e) => {
    const newMaxTokens = parseFloat(e.target.value);
    setMaxTokens(newMaxTokens);
  };

  return (
    <div className="text-white flex flex-col md:flex-row">
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
      <div className="px-4">
        <h1>Components</h1>
        <div className="flex flex-col space-y-2">
          <button
            className="border hover:bg-white hover:text-black px-2"
            onClick={() => {
              setComponents((currentVal) => [...currentVal, ComponentDefault]);
            }}
          >
            Add Component
          </button>

          <button
            className="border hover:bg-white hover:text-black px-2"
            onClick={() => setComponents(SUNO_OPTIMAL)}
          >
            Max Suno Length
          </button>
        </div>
        <div className="max-h-[90vh] overflow-y-scroll py-4">
          {components.map((component, i) => (
            <SongComponent
              key={i}
              component={component}
              i={i}
              handleLineLimitChange={handleLineLimitChange}
              handleSystemPromptChange={handleSystemPromptChange}
              handleUserPromptChange={handleUserPromptChange}
              handleRangeChange={handleRangeChange}
              handleMeterClick={handleMeterClick}
              handleRemoveMeter={handleRemoveMeter}
              handleAddMeter={handleAddMeter}
              handleCustomSystemPromptChange={handleCustomSystemPromptChange}
              setComponents={setComponents}
              songLength={components.length}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-top items-left w-full text-left md:px-40">
        <h1>Generated Song</h1>
        <button
          className="border hover:bg-white hover:text-black focus:border-yellow-400"
          onClick={() => {
            track("copy song");
            copyText(
              song.flatMap((component) => [
                `[${component.component.toUpperCase()}]`,
                ...component.lyrics,
              ])
            );
          }}
        >
          copy song to clipboard
        </button>
        <div className="max-h-[90vh] overflow-y-scroll">
          {song.length > 0 && !songLoading ? (
            song.map((component, componentIndex) => {
              return (
                <div
                  key={
                    component.component +
                    componentIndex.toString() +
                    component.lyrics[0][0]
                  }
                  className="group-hover:bg-red-600 w-full"
                >
                  <h2 className="uppercase">{component.component}</h2>
                  {component.lyrics.map((lyric, lineIndex) => {
                    return (
                      <div
                        key={lyric + lineIndex.toString()}
                        className="group-hover:bg-red-600 flex flex-row justify-between my-1"
                      >
                        <span>
                          {lyric.split(" ").map((word, wordIndex) => {
                            return (
                              <LyricRegenPopup
                                key={`${componentIndex}-${lineIndex}-${wordIndex}`}
                                lyric={lyric}
                                word={word}
                                lineIndex={lineIndex}
                                componentIndex={componentIndex}
                                lyricSwapFn={saveNewLine}
                                componentLyrics={component.lyrics}
                                isOpen={
                                  openPopupIndex ===
                                  `${componentIndex}-${lineIndex}-${wordIndex}`
                                }
                                setOpenPopupIndex={setOpenPopupIndex}
                                popupId={`${componentIndex}-${lineIndex}-${wordIndex}`}
                              />
                            );
                          })}
                        </span>
                        <button
                          className="px-2 bg-red-500"
                          onClick={() => deleteLine({ lineIndex })}
                        >
                          x
                        </button>
                      </div>
                    );
                  })}
                  {newLineLoading ? <ChangingCharacters /> : null}
                </div>
              );
            })
          ) : songLoading ? (
            <div className="py-12">
              <ChangingCharacters />
              <ChangingCharacters />
              <ChangingCharacters />
              <ChangingCharacters />
              <ChangingCharacters />
              <ChangingCharacters />
            </div>
          ) : null}
          <div className="flex flex-col">
            <button
              className={`border px-4 py-1 my-4 hover:bg-white hover:text-black ${
                newLineLoading ? "bg-red-500 text-white" : ""
              }`}
              onClick={() => addNewLine()}
              disabled={newLineLoading}
            >
              {newLineLoading ? "line loading" : "add new line"}
            </button>
            <h4 className="w-full text-center">New Line Settings</h4>
            <div className="flex flex-row w-full justify-between space-x-4">
              <div className="flex flex-col w-1/2 text-center">
                <label>temperature: </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={gpt2Temp}
                  onChange={handleTemperatureChange}
                />
                <span>{gpt2Temp}</span>
              </div>
              <div className="flex flex-col w-1/2 text-center">
                <label>max new tokens: </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={maxNewTokens}
                  onChange={handleChangeNewTokens}
                />
                <span>{maxNewTokens}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
