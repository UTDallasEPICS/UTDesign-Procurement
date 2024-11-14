
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface AddOptionModalProps {
  show: boolean;
  onHide: () => void;
}

const AddOptionModal: React.FC<AddOptionModalProps> = ({ show, onHide }) => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const handleAddUserClick = () => {
    setShowUserForm(true);
    setShowProjectForm(false);
  };

  const handleAddProjectClick = () => {
    setShowProjectForm(true);
    setShowUserForm(false);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select Add Option</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>What would you like to add?</p>
        <Button variant="secondary" className="mx-2" onClick={handleAddUserClick}>
          Add User
        </Button>
        {showUserForm && (
          <Form>
          <Form.Group controlId="addUser">
            <Form.Label>Email:</Form.Label>
            <Form.Control as="textarea" rows={1} />
            <Form.Label>First Name:</Form.Label>
            <Form.Control as="textarea" rows={1} />
            <Form.Label>Last Name:</Form.Label>
            <Form.Control as="textarea" rows={1} />
          </Form.Group>
        </Form>
        )}

        <Button variant="primary" className="mx-2" onClick={handleAddProjectClick}>
          Add Project
        </Button>
        {showProjectForm && (
          <Form>
          <Form.Group controlId="addUser">
            <Form.Label>Project Number:</Form.Label>
            <Form.Control as="textarea" rows={1} />
            <Form.Label>Starting Budget:</Form.Label>
            <Form.Control as="textarea" rows={1} />
            <Form.Label>Expenses:</Form.Label>
            <Form.Control as="textarea" rows={1} />
            <Form.Label>Project Type:</Form.Label>
            <Form.Control as="textarea" rows={1} />
            <Form.Label>Sponsor Company:</Form.Label>
            <Form.Control as="textarea" rows={1} />
            <Form.Label>Cost Center:</Form.Label>
            <Form.Control as="textarea" rows={1} />
            <Form.Label>Addidtional Information:</Form.Label>
            <Form.Control as="textarea" rows={1} />
          </Form.Group>
        </Form>
      
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddOptionModal;
