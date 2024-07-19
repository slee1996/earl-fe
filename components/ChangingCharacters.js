"use client";
import { useState, useEffect } from "react";

export const ChangingCharacters = () => {
  const [text, setText] = useState("");
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()ɑæɐɒʌəɛɪɔʊʉθðʃʒŋɥɸβʁχʀʕħɦɬɮʘǀǂǁǃ";

  useEffect(() => {
    const interval = setInterval(() => {
      let result = "";
      for (let i = 0; i < 40; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      setText(result);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return <p className="font-mono">{text}</p>;
};
