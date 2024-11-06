import {
  Button,
  Input,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { useState } from "react";

const useStyles = makeStyles({
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
    padding: "20px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  overlayContainer: {
    position: "absolute",
    top: "60px",
    left: "0px",
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

const UIOverlay = () => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");

  const handleButtonClick = () => {
    console.log("Button clicked with input:", inputValue);
  };

  return (
    //<div className={styles.overlay}>
    //<div className={styles.container}>
    <div className={styles.overlayContainer}>
      <Input
        className={styles.input}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter text"
      />
      <Button onClick={handleButtonClick}>Print to Console</Button>
    </div>
    //</div>
    //</div>
  );
};

export default UIOverlay;
