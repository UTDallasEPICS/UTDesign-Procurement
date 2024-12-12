import React, { useState } from 'react';
import { Modal, Form, Nav, Button } from 'react-bootstrap';

interface AddOptionModalProps {
  show: boolean;
  onHide: () => void;
}

const AddOptionModal: React.FC<AddOptionModalProps> = ({ show, onHide }) => {
  const [activeTab, setActiveTab] = useState('user');
  
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roleID: 3,  // Default to student (3)
    projectNum: ''  // Add this field
  });

  const [projectForm, setProjectForm] = useState({
    projectTitle: '',
    projectNum: '',
    startingBudget: '',
    projectType: '',
    sponsorCompany: '',
    additionalInfo: '',
    costCenter: '',
    initialExpenses: '0'
  });

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin-api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          data: {
            ...userForm,
            projectNum: userForm.projectNum ? parseInt(userForm.projectNum) : undefined
          }
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add user');
      onHide();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin-api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'project',
          data: projectForm
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add project');
      onHide();
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link onClick={() => setActiveTab('user')}>Add User</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link onClick={() => setActiveTab('project')}>Add Project</Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === 'user' ? (
          <Form onSubmit={handleUserSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control 
                type="text" 
                value={userForm.firstName}
                onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control 
                type="text" 
                value={userForm.lastName}
                onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="Student"
                  name="role"
                  checked={userForm.roleID === 3}
                  onChange={() => setUserForm({...userForm, roleID: 3})}
                />
                <Form.Check
                  type="radio"
                  label="Mentor"
                  name="role"
                  checked={userForm.roleID === 2}
                  onChange={() => setUserForm({...userForm, roleID: 2})}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Project Number Assigned to User (Optional)</Form.Label>
              <Form.Control 
                type="number" 
                value={userForm.projectNum}
                onChange={(e) => setUserForm({...userForm, projectNum: e.target.value})}
                placeholder="Enter project number if applicable"
              />
            </Form.Group>
            <Button type="submit">Submit</Button>
          </Form>
        ) : (
          
          <Form onSubmit={handleProjectSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Project Title</Form.Label>
              <Form.Control 
                type="text" 
                value={projectForm.projectTitle}
                onChange={(e) => setProjectForm({...projectForm, projectTitle: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Project Number</Form.Label>
              <Form.Control 
                type="number" 
                value={projectForm.projectNum}
                onChange={(e) => setProjectForm({...projectForm, projectNum: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Starting Budget</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01"
                value={projectForm.startingBudget}
                onChange={(e) => setProjectForm({...projectForm, startingBudget: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expenses</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01"
                value={projectForm.initialExpenses}
                onChange={(e) => setProjectForm({...projectForm, initialExpenses: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Project Type</Form.Label>
              <Form.Control 
                type="text" 
                value={projectForm.projectType}
                onChange={(e) => setProjectForm({...projectForm, projectType: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sponsor Company</Form.Label>
              <Form.Control 
                type="text" 
                value={projectForm.sponsorCompany}
                onChange={(e) => setProjectForm({...projectForm, sponsorCompany: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Additional Information</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                value={projectForm.additionalInfo}
                onChange={(e) => setProjectForm({...projectForm, additionalInfo: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cost Center</Form.Label>
              <Form.Control 
                type="text" 
                value={projectForm.costCenter}
                onChange={(e) => setProjectForm({...projectForm, costCenter: e.target.value})}
              />
            </Form.Group>
            <Button type="submit">Submit</Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddOptionModal;
