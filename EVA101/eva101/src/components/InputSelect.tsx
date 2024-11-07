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
        style={{ color: "white", marginRight: "10px" }}
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
        style={{ margin: "10px" }}
      >
        Dispatch Thy Query
      </Button>
    </>
  );
};

export default InputSection;
