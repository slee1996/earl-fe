import { toast } from "sonner";

export const copyText = (lyrics) => {
  var textToCopy = lyrics.join("\n");

  navigator.clipboard
    .writeText(textToCopy)
    .then(function () {
      toast("Text copied to clipboard.");
    })
    .catch(function (error) {
      console.error("Error copying text: ", error);
      toast.error("Error copying text, see console for more details.");
    });
};
