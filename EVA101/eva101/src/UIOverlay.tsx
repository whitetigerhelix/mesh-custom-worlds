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
    left: 0,
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
});

const UIOverlay = () => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");

  const handleButtonClick = () => {
    console.log(inputValue);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter text"
        />
        <Button onClick={handleButtonClick}>Print to Console</Button>
      </div>
    </div>
  );
};

export default UIOverlay;
