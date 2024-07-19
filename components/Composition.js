"use client";

import { useEffect, useState } from "react";
import LyricRegenPopup from "./LyricRegenPopup";
import { runGpt2Worker } from "@/utils/runGpt2Worker";

const userPrompts = {
  verse: "VERSE",
  chorus: "CHORUS",
  // bridge: "BRIDGE",
};

const systemPrompts = {
  popstar: "popstar",
  rapper: "rapper",
  electropopStar: "electropopStar",
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

  const saveNewLine = ({ lineToSave, lineIndex, componentIndex }) => {
    setSong((prevSong) => {
      const updatedSong = [...prevSong];
      updatedSong[componentIndex].lyrics[lineIndex] = lineToSave;
      return updatedSong;
    });
  };

  const fetchData = async ({ songComponents }) => {
    console.log(process.env);
    const response = await fetch(`${apiUrl}generate-song`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        songComponents,
      }),
    });
    const song = await response.json();

    return setSong(song);
  };

  const fetchDataWithEnforcement = async ({ songComponents }) => {
    const response = await fetch(`${apiUrl}generate-song-with-enforcement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        songComponents,
      }),
    });
    const song = await response.json();

    return setSong(song);
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

  const handleSystemPromptChange = (i, e) => {
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

  const copyText = (lyrics) => {
    var textToCopy = lyrics.join("\n");

    navigator.clipboard
      .writeText(textToCopy)
      .then(function () {
        console.log("Text copied to clipboard");
      })
      .catch(function (error) {
        console.error("Error copying text: ", error);
      });
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

    const newLine = await runGpt2Worker(lastTwoElements);

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

  return (
    <div className="text-white flex flex-row">
      <div>
        <div className="flex flex-col space-y-4 mt-4">
          <button
            className="bg-white text-black hover:bg-black hover:text-white hover:outline hover:outline-white px-8 py-2 rounded-full"
            onClick={() =>
              fetchData({
                songComponents: components,
              })
            }
          >
            Generate song
          </button>
          <button
            className="bg-white text-black px-8 py-2 rounded-full hover:bg-black hover:text-white hover:outline hover:outline-white"
            onClick={() =>
              fetchDataWithEnforcement({
                songComponents: components,
              })
            }
          >
            Generate song with enforcement
          </button>
          <button
            className="bg-white text-black px-8 py-2 rounded-full hover:bg-black hover:text-white hover:outline hover:outline-white"
            onClick={() => {
              setComponents((currentVal) => [...currentVal, ComponentDefault]);
            }}
          >
            Add Component
          </button>
        </div>
      </div>
      <div>
        <h1>Components</h1>
        <div className="max-h-[90vh] overflow-y-scroll">
          {components.map((component, i) => (
            <div
              key={i}
              className={`border border-white p-10 m-5 w-80 hover:bg-red-600 peer component-${i.toString()} group`}
            >
              <div>
                Line Limit:{" "}
                <input
                  type="number"
                  value={component.lineLimit}
                  onChange={(e) => handleLineLimitChange(i, e)}
                  min="1"
                  className="bg-black text-white border border-white rounded px-2 w-12"
                />
              </div>
              <div>
                Songwriter personality:{" "}
                <select
                  value={component.selectedSystemPrompt}
                  onChange={(e) => handleSystemPromptChange(i, e)}
                  className="bg-black text-white border border-white rounded px-2"
                >
                  {Object.entries(systemPrompts).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                User Prompt:{" "}
                <select
                  value={component.selectedUserPrompt}
                  onChange={(e) => handleUserPromptChange(i, e)}
                  className="bg-black text-white border border-white rounded px-2"
                >
                  {Object.entries(userPrompts).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-center items-center">
                <h1>Meter</h1>
                <div className="flex flex-col justify-center items-center">
                  {component.meter.map((meter, j) => (
                    <div
                      key={j}
                      className="flex flex-col px-3 justify-center items-center"
                    >
                      <input
                        type="range"
                        min="1"
                        max="16"
                        value={meter.length}
                        onChange={(e) => handleRangeChange(i, j, e)}
                      />
                      <div className="flex flex-row">
                        {meter.map((value, k) => (
                          <button
                            key={k}
                            className={
                              value === 0
                                ? "rotate-180 text-xl px-1 hover:bg-white hover:text-black"
                                : "text-xl px-1 hover:bg-white hover:text-black"
                            }
                            onClick={() => handleMeterClick(i, j, k)}
                          >
                            ^
                          </button>
                        ))}
                        <span className="mx-4">{meter.length}</span>
                      </div>
                      <button
                        className={
                          "bg-red-500 text-white px-2 py-1 rounded mt-2 disabled:bg-gray-500"
                        }
                        onClick={() => handleRemoveMeter(i, j)}
                        disabled={component.meter.length === 1}
                      >
                        Remove Meter
                      </button>
                    </div>
                  ))}
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded mt-2"
                    onClick={() => handleAddMeter(i)}
                  >
                    Add Meter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-top items-left w-full text-left px-40">
        <h1>Generated Song</h1>
        <button
          className="border hover:bg-white hover:text-black"
          onClick={() =>
            copyText(
              song.flatMap((component) => [
                `[${component.component.toUpperCase()}]`,
                ...component.lyrics,
              ])
            )
          }
        >
          copy song to clipboard
        </button>
        <div className="max-h-[90vh] overflow-y-scroll">
          {song.length > 0
            ? song.map((component, componentIndex) => {
                return (
                  <div
                    key={
                      component.component +
                      componentIndex.toString() +
                      component.lyrics[0][0]
                    }
                    className="group-hover:bg-red-600"
                  >
                    <h2 className="uppercase">{component.component}</h2>
                    {component.lyrics.map((lyric, lineIndex) => {
                      console.log(lyric);
                      return (
                        <div
                          key={lyric + lineIndex.toString()}
                          className="group-hover:bg-red-600"
                        >
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
                        </div>
                      );
                    })}
                  </div>
                );
              })
            : null}
          <button
            className="border px-4 py-1 my-4 hover:bg-white hover:text-black"
            onClick={() => addNewLine()}
            disabled={newLineLoading}
          >
            {newLineLoading ? "line loading" : "add new line"}
          </button>
        </div>
      </div>
    </div>
  );
}
