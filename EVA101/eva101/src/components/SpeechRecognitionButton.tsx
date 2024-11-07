import React from "react";
import { Button } from "@fluentui/react-components";
import { Mic24Filled } from "@fluentui/react-icons";

interface SpeechRecognitionButtonProps {
  onClick: () => void;
}

const SpeechRecognitionButton: React.FC<SpeechRecognitionButtonProps> = ({
  onClick,
}) => {
  return (
    <Button
      icon={<Mic24Filled />}
      onClick={onClick}
      aria-label="Commence Auditory Reception"
      style={{ margin: "10px" }}
    >
      Commence Auditory Reception
    </Button>
  );
};

export default SpeechRecognitionButton;
