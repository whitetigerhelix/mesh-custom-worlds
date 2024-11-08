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
        checked={isVoiceEnabled}
        onChange={(_, data) => {
          setIsVoiceEnabled(data.checked as boolean);
          localStorage.setItem("isVoiceEnabled", JSON.stringify(data.checked)); // Save isVoiceEnabled to localStorage
        }}
        style={{
          marginTop: "10px",
        }}
      />
      <label
        htmlFor="inputField"
        style={{
          color: "white",
          marginRight: "10px",
          padding: "5px",
          alignSelf: "start",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.5rem",
          textShadow: "1px 1px 2px #000000",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
      >
        Activate the Voice of the Scholarly Aide
      </label>
    </>
  );
};

export default VoiceSelector;
