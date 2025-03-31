import React from "react";
import Button from "../common/Button";

type ReadyButtonProps = {
  isReady: boolean;
  onToggleReady: () => void;
};

const ReadyButton: React.FC<ReadyButtonProps> = ({
  isReady,
  onToggleReady,
}) => {
  return (
    <Button
      variant={isReady ? "success" : "primary"}
      fullWidth
      onClick={onToggleReady}
    >
      {isReady ? "Prêt ✓" : "Je suis prêt"}
    </Button>
  );
};

export default ReadyButton;
