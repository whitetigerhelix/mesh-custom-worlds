import { useState, useRef, useEffect } from "react";

const useVoice = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const populateVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      console.debug("Available voices:", availableVoices);
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        const savedVoice = localStorage.getItem("selectedVoice");
        console.log("Saved voice:", savedVoice);
        if (savedVoice) {
          setSelectedVoice(savedVoice);
        } else {
          setSelectedVoice(availableVoices[0].name);
        }
      }
    };

    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, []);

  // Wait for voices to be ready
  const waitForVoices = () =>
    new Promise<void>((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
      } else {
        speechSynthesis.onvoiceschanged = () => {
          resolve();
        };
      }
    });

  const speakText = async (
    text: string,
    voiceName: string,
    pitch: number = 1.0, // Lower pitch for deeper sound
    rate: number = 1.5 // Higher rate for quicker speech
  ) => {
    if (currentUtterance.current) {
      speechSynthesis.cancel();
    }

    await waitForVoices();

    const utterance = new SpeechSynthesisUtterance(text);

    const selectedVoice = speechSynthesis
      .getVoices()
      .find((voice) => voice.name === voiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.pitch = pitch; //TODO: Doesn't seem to work
    utterance.rate = rate;

    console.log(
      "SpeakText - VoiceName: " +
        voiceName +
        " | Selected voice:" +
        selectedVoice +
        " | Pitch: " +
        pitch +
        ", Rate: " +
        rate
    );

    currentUtterance.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stopTalking = () => {
    speechSynthesis.cancel();
    console.log("Voice stopped");
  };

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    isVoiceEnabled,
    setIsVoiceEnabled,
    speakText,
    stopTalking,
  };
};

export default useVoice;
