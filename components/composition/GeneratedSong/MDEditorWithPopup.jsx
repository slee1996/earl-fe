import React, { useState, useRef, useCallback, useEffect } from "react";
import MDEditor, {
  components as defaultComponents,
} from "@uiw/react-md-editor";
import { runOnnxInference } from "@/utils/onnxUtils";
import { Button } from "@/components/ui/button";

const Popup = ({ word, onClose, song, onSuggestionClick }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateSuggestions = async (text, maskWord = true) => {
    setLoading(true);
    setError(null);
    try {
      let processedText = text;
      if (maskWord) {
        const words = text.split(" ");
        const maskWordIndex = words.findIndex((w) =>
          w.toLowerCase().includes(word.toLowerCase())
        );
        if (maskWordIndex !== -1) {
          words[maskWordIndex] = words[maskWordIndex].replace(word, "[MASK]");
          processedText = words.join(" ");
        } else {
          throw new Error("Selected word not found in the text.");
        }
      }
      const newSuggestions = await runOnnxInference(processedText);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setError(error.message);
      setSuggestions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    generateSuggestions(song);
  }, [word, song]);

  return (
    <div
      style={{
        position: "absolute",
        left: `-1000`,
        bottom: `0`,
        backgroundColor: "white",
        border: "1px solid black",
        padding: "10px",
        zIndex: 1000,
        maxWidth: "300px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <p className="text-black font-bold mb-2">Selected word: {word}</p>
      {loading ? (
        <p className="text-black">Loading suggestions...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <p className="text-black font-semibold mb-1">Suggestions:</p>

          <div className="flex flex-row flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                className="block text-left px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black"
                onClick={() => onSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="flex justify-between mt-2">
        <button
          className="text-white bg-red-500 hover:bg-red-700 font-bold py-1 px-2 rounded text-sm"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const MDEditorWithPopup = ({ value, onChange }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({
    word: "",
    position: { x: 0, y: 0 },
  });
  const editorRef = useRef(null);

  const handleRightClick = useCallback((event) => {
    event.preventDefault();
    const selection = window.getSelection().toString().trim();
    if (selection) {
      setPopupData({
        word: selection,
        position: { x: event.clientX, y: event.clientY },
      });
      setShowPopup(true);
    }
  }, []);

  const closePopup = () => setShowPopup(false);

  const handleSuggestionClick = (suggestion) => {
    const newValue = value.replace(popupData.word, suggestion);
    onChange(newValue);
    closePopup();
  };

  return (
    <div ref={editorRef} onContextMenu={handleRightClick} className="relative">
      <MDEditor
        value={value}
        onChange={onChange}
        preview="edit"
        className="min-h-96"
        previewOptions={{
          components: {
            ...defaultComponents,
          },
        }}
      />
      {showPopup && (
        <Popup
          word={popupData.word}
          position={popupData.position}
          onClose={closePopup}
          song={value}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};

export default MDEditorWithPopup;
