//TODO: More moods...
export const moodOptions = [
  { key: "neutral", text: "😐 Neutral" },
  { key: "happy", text: "😊 Happy" },
  { key: "excited", text: "😃 Excited" },
  { key: "sad", text: "😭 Sad" },
  { key: "angry", text: "😠 Angry" },
  { key: "frustrated", text: "😤 Frustrated" },
  { key: "annoyed", text: "😒 Annoyed" },
  { key: "sarcastic", text: "🤨 Sarcastic" },
  { key: "pompous", text: "🧐 Pompous" },
  { key: "amused", text: "🤭 Amused" },
  { key: "cynical", text: "😬 Cynical" },
  { key: "inquisitive", text: "🤔 Inquisitive" },
];

// Adjust pitch and rate based on mood
//TODO: Eventually have more parameter options
export const getMoodParameters = (mood: string) => {
  let pitch = 1.0; // Default (neutral) pitch (lower for deeper sound)
  let rate = 1.0; // Default (neutral) rate (higher rate for quicker speech)

  switch (mood) {
    case "happy":
      pitch += 0.5;
      rate += 0.2;
      break;

    case "excited":
      pitch += 0.4;
      rate += 0.3;
      break;

    case "sad":
      pitch += -0.2;
      rate += -0.2;
      break;

    case "angry":
      pitch += 0.2;
      rate += 0.5;
      break;

    case "frustrated":
      pitch += -0.1;
      rate += 0.4;
      break;

    case "annoyed":
      pitch += -0.1;
      rate += 0.2;
      break;

    case "sarcastic":
      pitch += -0.3;
      rate += -0.1;
      break;

    case "pompous":
      pitch += 0.3;
      rate += -0.1;
      break;

    case "amused":
      pitch += 0.2;
      rate += 0.2;
      break;

    case "cynical":
      pitch += -0.2;
      rate += -0.2;
      break;

    case "inquisitive":
      pitch += 0.1;
      rate += 0.1;
      break;

    case "neutral":
      break;

    default:
      console.warn("SpeakText - Unknown mood: " + mood);
      break;
  }

  return { pitch: pitch, rate: rate };
};
