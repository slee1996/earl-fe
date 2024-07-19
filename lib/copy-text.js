import { toast } from "sonner";

export const copyText = (lyrics) => {
  var textToCopy = lyrics.join("\n");

  navigator.clipboard
    .writeText(textToCopy)
    .then(function () {
      console.log("Text copied to clipboard");
      toast("Text copied to clipboard.");
    })
    .catch(function (error) {
      console.error("Error copying text: ", error);
    });
};
