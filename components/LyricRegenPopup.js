import { useState } from "react";
import { runOnnxInference } from "@/utils/onnxUtils";

export default function LyricRegenPopup({
  lyricSwapFn,
  lyric,
  word,
  lineIndex,
  componentIndex,
  componentLyrics,
  isOpen,
  setOpenPopupIndex,
  popupId,
}) {
  const [editedWord, setEditedWord] = useState(word);
  const [suggestions, setSuggestions] = useState([]);

  const handleClick = async (lyric, word, lineIndex) => {
    // const lyricsCopy = [...componentLyrics];
    // const words = lyric.split(" ");
    // const maskWordIndex = words.indexOf(word);

    // if (maskWordIndex !== -1) {
    //   words[maskWordIndex] = "[MASK]";
    // }
    setOpenPopupIndex(popupId);
    // lyricsCopy[lineIndex] = words.join(" ");
    // const newSuggestions = await runOnnxInference(lyricsCopy.join("\n"));
    // setSuggestions(newSuggestions);
  };

  const preloadSuggestions = async (lyric, word, lineIndex) => {
    const lyricsCopy = [...componentLyrics];
    const words = lyric.split(" ");
    const maskWordIndex = words.indexOf(word);

    if (maskWordIndex !== -1) {
      words[maskWordIndex] = "[MASK]";
    }

    lyricsCopy[lineIndex] = words.join(" ");
    const newSuggestions = await runOnnxInference(lyricsCopy.join("\n"));
    setSuggestions(newSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    const words = lyric.split(" ");
    const wordIndex = words.indexOf(word);
    if (wordIndex !== -1) {
      words[wordIndex] = suggestion;
    }
    const newLine = words.join(" ");
    lyricSwapFn({ lineIndex, componentIndex, lineToSave: newLine });
    setOpenPopupIndex(null);
  };

  const handleTextChange = (e) => {
    setEditedWord(e.target.value);
  };

  const handleTextSubmit = () => {
    const words = lyric.split(" ");
    const wordIndex = words.indexOf(word);
    if (wordIndex !== -1) {
      words[wordIndex] = editedWord;
    }
    const newLine = words.join(" ");
    lyricSwapFn({ lineIndex, componentIndex, lineToSave: newLine });
    setOpenPopupIndex(null);
  };

  return (
    <>
      <button
        onClick={() => handleClick(lyric, word, lineIndex)}
        onMouseEnter={() => preloadSuggestions(lyric, word, lineIndex)}
        className="px-1 hover:bg-white hover:text-black"
      >
        {word}
      </button>
      {isOpen && (
        <div className="absolute z-40 w-60 min-h-40 bg-white text-black p-2 border border-gray-300 max-h-[400px] overflow-y-scroll">
          <div className=" bg-white drop-shadow-md">
            <button onClick={() => setOpenPopupIndex(null)}>Close popup</button>
            <input
              type="text"
              value={editedWord}
              onChange={handleTextChange}
              className="w-full p-1 border border-gray-300"
            />
            <button
              onClick={handleTextSubmit}
              className="mt-1 p-1 bg-blue-500 text-white"
            >
              Save
            </button>
          </div>
          <div className="flex flex-row flex-wrap py-4">
            {suggestions.length > 0
              ? suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block text-left p-1 hover:bg-gray-200 border"
                  >
                    {suggestion}
                  </button>
                ))
              : <span>Loading suggestions</span>}
          </div>
        </div>
      )}
    </>
  );
}
