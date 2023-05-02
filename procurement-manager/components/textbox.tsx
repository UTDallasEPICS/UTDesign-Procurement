import { useState } from "react";

function MyTextbox() {
  const [displayText, setDisplayText] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setDisplayText(event.currentTarget.value);
      event.currentTarget.value = "";
    }
  };

  return (
    <div>
      {displayText === "" ? (
        <input
          type="text"
          onKeyDown={handleKeyDown}
          style={{ width: "80px", fontSize: "14px" }}
        />
      ) : (
        <p>
          {" "}
          <span title={displayText}>{displayText.substring(0, 15)}</span>
        </p>
      )}
    </div>
  );
}

export default MyTextbox;

