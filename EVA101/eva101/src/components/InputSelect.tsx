import React, { useRef } from "react";
import { Textarea, Button } from "@fluentui/react-components";

interface InputSectionProps {
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  handleButtonClick: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputValue,
  setInputValue,
  handleButtonClick,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
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
        Present Your Dissertation Below, if You Please...
      </label>
      <Textarea
        id="inputField"
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Kindly inscribe your esteemed query here..."
        aria-label="Input field for text"
        style={{ width: "100%", resize: "vertical", minHeight: "60px" }}
      />
      <Button
        onClick={handleButtonClick}
        aria-label="Print input to console"
        style={{ margin: "10px", fontSize: "2.2rem", padding: "10px" }}
        icon={<span aria-hidden="true">🧐</span>}
      >
        Dispatch Thy Query
      </Button>
    </>
  );
};

export default InputSection;
