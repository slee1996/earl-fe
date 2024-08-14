"use client";
import React, { useState, useEffect } from "react";
import LyricRegenPopup from "../LyricRegenPopup";
import { runGpt2Worker } from "@/utils/runGpt2Worker";
import { ChangingCharacters } from "../ChangingCharacters";
import { SongComponent } from "../SongComponent";
import { copyText } from "@/lib/copy-text";
import { track } from "@vercel/analytics";
import GenerationControls from "./GenerationControls";
import CompositionControls from "./CompositionControls";
import { USER_PROMPTS as userPrompts } from "@/lib/constants/user-prompts";
import MDEditorWithPopup from "./GeneratedSong/MDEditorWithPopup";

const systemPrompts = {
  popstar: "popstar",
  rapper: "rapper",
  electropopStar: "electropopStar",
  rockstar: "rockstar",
  countryArtist: "countryArtist",
  custom: "custom",
};

const ComponentDefault = {
  lineLimit: 8,
  meter: [[1, 0, 1, 0, 1, 0, 1, 0]],
  selectedUserPrompt: userPrompts.verse,
  selectedSystemPrompt: systemPrompts.popstar,
  customSystemPrompt: "",
  rhymeScheme: "",
};

const CustomMarkdown = ({ children }) => {
  return <div onClick={() => console.log(e.target.value)}>{children}</div>;
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
      rhymeScheme: "",
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
  const [rhymeScheme, setRhymeScheme] = useState("");
  const [songToEdit, setSongToEdit] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!editMode) {
      const formattedSong = song
        .map((component) => [
          `[${component.component.toUpperCase()}]`,
          ...component.lyrics,
        ])
        .flat()
        .join("\n");
      setSongToEdit(formattedSong);
    }
  }, [song, editMode]);

  const setSongAndUpdateEdit = (newSongOrUpdateFunction) => {
    setSong((prevSong) => {
      const updatedSong =
        typeof newSongOrUpdateFunction === "function"
          ? newSongOrUpdateFunction(prevSong)
          : newSongOrUpdateFunction;

      console.log("Updated song:", updatedSong);

      const formattedSong = updatedSong
        .map((component) => [
          `[${component.component.toUpperCase()}]`,
          ...component.lyrics,
        ])
        .flat()
        .join("\n");

      setSongToEdit(formattedSong);
      setEditMode(false);

      return updatedSong;
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

    const newLine = await runGpt2Worker({
      input: lastTwoElements,
      temperature: gpt2Temp,
      max_new_tokens: maxNewTokens,
    });

    const update = (prevSong) => {
      console.log("prev ", prevSong);
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
      console.log("prev ", updatedSong);
      return updatedSong;
    };

    setSongAndUpdateEdit((prevSong) => update(prevSong));

    setNewLineLoading(false);
  };

  const handleTemperatureChange = (e) => {
    const newTemp = parseFloat(e.target.value);
    setGpt2Temp(newTemp);
  };

  const handleChangeNewTokens = (e) => {
    const newMaxTokens = parseFloat(e.target.value);
    setMaxTokens(newMaxTokens);
  };

  const onChange = (value) => {
    const structureElements = [
      "VERSE",
      "CHORUS",
      "BRIDGE",
      "INTRO",
      "OUTRO",
      "ARBITRARY",
      "PRECHORUS",
    ];

    let processedValue = value;

    structureElements.forEach((element) => {
      const regex = new RegExp(`\\/\\/${element.charAt(0)}`, "gi");
      processedValue = processedValue.replace(regex, `[${element}]`);
    });

    setSongToEdit(processedValue);
    if (!editMode) {
      setEditMode(true);
    }
  };

  return (
    <div className="text-white flex flex-col md:flex-row">
      <GenerationControls
        components={components}
        selectedApi={selectedApi}
        setSelectedApi={setSelectedApi}
        songTitle={songTitle}
        songDescription={songDescription}
        setSongTitle={setSongTitle}
        setSongDescription={setSongDescription}
        setSongAndUpdateEdit={setSongAndUpdateEdit}
        setSongLoading={setSongLoading}
        apiUrl={apiUrl}
        rhymeScheme={rhymeScheme}
      />
      <CompositionControls
        setComponents={setComponents}
        ComponentDefault={ComponentDefault}
        apiUrl={apiUrl}
      >
        {components.map((component, i) => {
          console.log(component);
          return (
            <SongComponent
              key={i}
              component={component}
              i={i}
              setComponents={setComponents}
              songLength={components.length}
            />
          );
        })}
      </CompositionControls>
      {/* SONG DISPLAY */}
      <div className="flex flex-col justify-top items-left w-full text-left md:px-32">
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
          <button
            className={
              editMode ? `bg-red-500 my-4 px-2 border` : "my-4 px-2 border"
            }
            onClick={() => {
              if (editMode) {
                // Parse songToEdit and update song state
                const lines = songToEdit.split("\n");
                const newSong = [];
                let currentComponent = null;

                lines.forEach((line) => {
                  if (line.startsWith("[") && line.endsWith("]")) {
                    if (currentComponent) {
                      newSong.push(currentComponent);
                    }
                    currentComponent = {
                      component: line.slice(1, -1).toLowerCase(),
                      lyrics: [],
                    };
                  } else if (currentComponent && line.trim() !== "") {
                    currentComponent.lyrics.push(line);
                  }
                });

                if (currentComponent) {
                  newSong.push(currentComponent);
                }

                setSongAndUpdateEdit(newSong);
                setEditMode(false);
              } else {
                setEditMode(true);
              }
            }}
          >
            {editMode ? "Save Changes" : "Edit Lyrics"}
          </button>
          <MDEditorWithPopup
            value={songToEdit}
            onChange={(value) => onChange(value)}
          />
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
