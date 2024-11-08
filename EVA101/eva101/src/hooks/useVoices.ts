import { useState, useRef, useEffect } from "react";

const useVoice = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const DEFAULT_PITCH = 1.0; // Default pitch (lower for deeper sound)
  const DEFAULT_RATE = 1.3; // Default rate (higher rate for quicker speech)

  const speakText = async (text: string, voiceName: string, mood: string) => {
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

    // Adjust pitch and rate based on mood
    //TODO: Support more moods
    let pitch = DEFAULT_PITCH;
    let rate = DEFAULT_RATE;
    switch (mood) {
      case "happy":
        pitch = DEFAULT_PITCH + 0.5;
        rate = DEFAULT_RATE + 0.2;
        break;
      case "sad":
        pitch = DEFAULT_PITCH - 0.2;
        rate = DEFAULT_RATE - 0.2;
        break;
      case "angry":
        pitch = DEFAULT_PITCH + 0.2;
        rate = DEFAULT_RATE + 0.5;
        break;
      /*default:
        pitch = DEFAULT_RATE;
        rate = DEFAULT_RATE;
        break;*/
    }

    utterance.pitch = pitch; //TODO: Doesn't seem to work
    utterance.rate = rate;

    utterance.onstart = () => {
      console.log("Utterance started");
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      console.log("Utterance ended");
      setIsSpeaking(false);
    };

    console.log(
      "SpeakText - VoiceName: " +
        voiceName +
        " | Selected voice:" +
        selectedVoice +
        " | Mood: " +
        mood +
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
    isSpeaking,
  };
};

export default useVoice;
