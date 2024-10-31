import React from 'react';
import { Modal, Button } from 'react-bootstrap';

// Define types for props
interface AddOptionModalProps {
  show: boolean;
  onHide: () => void;
  onAddProject: () => void;
  onAddUser: () => void;
}

const AddOptionModal: React.FC<AddOptionModalProps> = ({ show, onHide, onAddProject, onAddUser }) => {
  
    return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select Add Option</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>What would you like to add?</p>
        <Button variant="primary" onClick={onAddProject}>Add Project</Button>
        <Button variant="secondary" className="mx-2" onClick={onAddUser}>Add User</Button>
      </Modal.Body>
    </Modal>
  );
};

export default AddOptionModal;
