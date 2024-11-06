import {
  Button,
  Input,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { useState } from "react";

const useStyles = makeStyles({
  // overlay->container
  overlay: {
    position: "fixed",
    top: "60px",
    left: "0px",
    width: "auto",
    height: "auto",
    display: "flex",
    justifyContent: "left",
    alignItems: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    ...shorthands.padding("20px"),
  },
  container: {
    backgroundColor: "gray",
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  // All-in-one
  overlayContainer: {
    position: "absolute",
    top: "10px",
    left: "10px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    ...shorthands.padding("10px"),
    backgroundColor: "rgba(92, 92, 92, 0.8)",
    ...shorthands.borderRadius("4px"),
  },
  input: {
    marginRight: "10px",
  },
});

const UIOverlay: React.FC = () => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");

  const handleButtonClick = () => {
    console.log("Button clicked with input:", inputValue);
  };

  return (
    <div className={styles.overlayContainer}>
      <label
        htmlFor="inputField"
        style={{ color: "white", marginRight: "10px" }}
      >
        Magic incantation:
      </label>
      <Input
        id="inputField"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter text"
        aria-label="Input field for text"
      />
      <Button onClick={handleButtonClick} aria-label="Print input to console">
        Print to Console
      </Button>
    </div>
  );
};

export default UIOverlay;