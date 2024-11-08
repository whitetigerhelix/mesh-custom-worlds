import { useState, useRef, useEffect } from "react";
import VoiceReactiveEffect from "../components/VoiceReactiveEffect";
import { getMoodParameters } from "../utils/mood";

const useVoice = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceReactiveEffectRef = useRef<VoiceReactiveEffect | null>(null);

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
    const { pitch, rate } = getMoodParameters(mood);

    utterance.pitch = pitch; //TODO: Doesn't seem to do much? Particularly when using non-1.0 rate at the same time?
    utterance.rate = rate;

    console.log(
      "SpeakText - voiceName: " +
        voiceName +
        ", Selected voice: " +
        selectedVoice +
        " | Mood: " +
        mood +
        ", Pitch: " +
        pitch +
        ", Rate: " +
        rate
    );

    utterance.onstart = () => {
      console.log("SpeakText - Utterance started: " + text);

      setIsSpeaking(true);

      if (voiceReactiveEffectRef.current) {
        voiceReactiveEffectRef.current.start(mood);
      }
    };

    utterance.onend = () => {
      console.log("SpeakText - Utterance ended: " + text);

      setIsSpeaking(false);

      if (voiceReactiveEffectRef.current) {
        voiceReactiveEffectRef.current.stop();
      }
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
    console.log("Voice stopped");

    speechSynthesis.cancel();

    if (voiceReactiveEffectRef.current) {
      voiceReactiveEffectRef.current.stop();
    }
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
