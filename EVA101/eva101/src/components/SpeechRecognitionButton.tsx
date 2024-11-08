import React from "react";
import { Button } from "@fluentui/react-components";
import { Mic24Filled } from "@fluentui/react-icons";

interface SpeechRecognitionButtonProps {
  onClick: () => void;
  onError: (error: string) => void;
}

const SpeechRecognitionButton: React.FC<SpeechRecognitionButtonProps> = ({
  onClick,
  onError,
}) => {
  const handleClick = () => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      onError("Speech recognition is not supported in this browser.");
      return;
    }
    onClick();
  };

  return (
    <Button
      icon={<Mic24Filled />}
      onClick={handleClick}
      aria-label="Commence Auditory Reception"
      style={{ margin: "10px", fontSize: "1.5rem", padding: "10px" }}
    >
      Commence Auditory Reception
    </Button>
  );
};

export default SpeechRecognitionButton;
