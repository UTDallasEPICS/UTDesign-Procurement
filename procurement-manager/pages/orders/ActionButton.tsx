// ActionButton.tsx
import React from 'react';
import { Button } from 'react-bootstrap';

type ActionButtonProps = {
  variant: string;
  text: string;
  onClick?: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({ variant, text, onClick }) => {
  return (
    <Button
      variant={variant}
      size="lg"
      onClick={onClick}
      style={{ minWidth: '300px', marginRight: '40px' }}
    >
      {text}
    </Button>
  );
};

export default ActionButton;
