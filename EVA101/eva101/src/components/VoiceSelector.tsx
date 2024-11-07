// src/components/VoiceSelector.tsx
import React from "react";
import { Select, Checkbox } from "@fluentui/react-components";

interface VoiceSelectorProps {
  selectedVoice: string;
  setSelectedVoice: React.Dispatch<React.SetStateAction<string>>;
  voices: SpeechSynthesisVoice[];
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  setSelectedVoice,
  voices,
  isVoiceEnabled,
  setIsVoiceEnabled,
}) => {
  return (
    <>
      <Select
        value={selectedVoice}
        onChange={(_, data) => {
          console.log("Selected voice changed:", data.value);
          setSelectedVoice(data.value);
          localStorage.setItem("selectedVoice", data.value); // Save selected voice to localStorage
        }}
        aria-label="Select voice"
        style={{ marginTop: "10px", width: "400px" }}
      >
        {voices.map((voice, index) => (
          <option key={index} value={voice.name}>
            {voice.name}
          </option>
        ))}
      </Select>
      <Checkbox
        label="Activate the Voice of the Scholarly Aide"
        checked={isVoiceEnabled}
        onChange={(_, data) => setIsVoiceEnabled(data.checked as boolean)}
        style={{ marginTop: "10px" }}
      />
    </>
  );
};

export default VoiceSelector;
