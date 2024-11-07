import React from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    backgroundColor: "gray",
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "column",
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
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "green",
  },
  highlightedMessage: {
    transform: "scale(1.05)",
    opacity: 1,
    ...shorthands.padding("15px"),
  },
  collapsedMessage: {
    maxHeight: "16px",
    overflow: "hidden",
    cursor: "pointer",
    fontSize: "0.6em",
    ...shorthands.padding("2px"),
  },
});

interface ConversationMessagesProps {
  conversation: { role: "user" | "assistant"; content: string }[];
}

const ConversationMessages: React.FC<ConversationMessagesProps> = ({
  conversation,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {conversation.map((message, index) => (
        <div
          key={index}
          className={`${styles.message} ${
            message.role === "user"
              ? styles.userMessage
              : styles.assistantMessage
          } ${
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
              } ${styles.highlightedMessage}`;
            }
          }}
          onMouseLeave={(e) => {
            if (index < conversation.length - 2) {
              const element = e.currentTarget;
              element.className = `${styles.message} ${
                message.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage
              } ${styles.collapsedMessage}`;
            }
          }}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
};

export default ConversationMessages;
