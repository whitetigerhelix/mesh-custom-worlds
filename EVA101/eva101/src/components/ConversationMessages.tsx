import React from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    backgroundColor: "brown",
    opacity: 1,
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "column-reverse", // Change to column-reverse for reversed order
    gap: "10px",
    maxHeight: "50vh",
    overflowY: "auto",
  },
  message: {
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
    ...shorthands.padding("10px"),
    ...shorthands.borderRadius("20px"),
    marginBottom: "10px",
    marginLeft: "10px",
    marginRight: "10px",
    transition: "transform 0.3s ease, opacity 0.3s ease, padding 0.3s ease",
    opacity: 0.7,
    "&:hover": {
      transform: "scale(1.05)",
      opacity: 1,
    },
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "blue",
    opacity: 1,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "green",
    opacity: 1,
  },
  highlightedMessage: {
    transform: "scale(1.05)",
    opacity: 1,
    ...shorthands.padding("15px"),
  },
  collapsedMessage: {
    maxHeight: "25px",
    minHeight: "25px",
    overflow: "hidden",
    cursor: "pointer",
    fontSize: "0.7em",
    ...shorthands.padding("0px"),
    ...shorthands.margin("0px"),
  },
  moodLabel: {
    display: "block",
    fontSize: "0.8em",
    color: "#FFD700",
    marginTop: "5px",
  },
  happy: {
    backgroundColor: "#FFD700",
  },
  sad: {
    backgroundColor: "#1E90FF",
  },
  angry: {
    backgroundColor: "#FF4500",
  },
  frustrated: {
    backgroundColor: "#FF6347",
  },
  annoyed: {
    backgroundColor: "#FFA500",
  },
  sarcastic: {
    backgroundColor: "#8A2BE2",
  },
  pompous: {
    backgroundColor: "#DAA520",
  },
  amused: {
    backgroundColor: "#FF69B4",
  },
  cynical: {
    backgroundColor: "#708090",
  },
  inquisitive: {
    backgroundColor: "#00CED1",
  },
  neutral: {
    backgroundColor: "#1e1e1e",
  },
});

interface ConversationMessagesProps {
  conversation: { role: "user" | "assistant"; content: string; mood: string }[];
}

const ConversationMessages: React.FC<ConversationMessagesProps> = ({
  conversation,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {conversation
        .slice()
        .reverse()
        .map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage
            } ${styles[message.mood]} ${
              index === conversation.length - 1 ||
              index === conversation.length - 2
                ? styles.highlightedMessage
                : styles.collapsedMessage
            }`}
            onMouseEnter={(e) => {
              if (index < conversation.length - 2) {
                const element = e.currentTarget;
                element.className = `${styles.message} ${
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                } ${styles[message.mood]} ${styles.highlightedMessage}`;
              }
            }}
            onMouseLeave={(e) => {
              if (index < conversation.length - 2) {
                const element = e.currentTarget;
                element.className = `${styles.message} ${
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                } ${styles[message.mood]} ${styles.collapsedMessage}`;
              }
            }}
          >
            <span>{message.content}</span>
            <span className={styles.moodLabel}>Mood: {message.mood}</span>
          </div>
        ))}
    </div>
  );
};

export default ConversationMessages;
