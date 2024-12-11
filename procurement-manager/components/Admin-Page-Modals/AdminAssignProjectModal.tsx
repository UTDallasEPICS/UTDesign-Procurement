import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface AssignProjectModalProps {
  show: boolean;
  onHide: () => void;
}

const AdminAssignProjectModal: React.FC<AssignProjectModalProps> = ({ show, onHide }) => {
  const [searchUserTerm, setSearchUserTerm] = useState('');
  const [searchProjectTerm, setSearchProjectTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [projectResults, setProjectResults] = useState<any[]>([]);

  const handleUserSearch = async () => {
    try {
      const response = await fetch('/api/admin-APIs/admin-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          searchTerm: searchUserTerm
        }),
      });
      
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();
      setUserResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleProjectSearch = async () => {
    try {
      const response = await fetch('/api/admin-APIs/admin-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'project',
          searchTerm: searchProjectTerm
        }),
      });
      
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();
      setProjectResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedProject) return;

    try {
      const response = await fetch('/api/admin-APIs/assignProj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: selectedUser.userID,
          projectID: selectedProject.projectID,
          startDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to assign project');
      onHide();
      // Clear selections
      setSelectedUser(null);
      setSelectedProject(null);
      setUserResults([]);
      setProjectResults([]);
    } catch (error) {
      console.error('Error assigning project:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Assign Project to User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* User Search Section */}
        <Form.Group className="mb-4">
          <Form.Label>Search User</Form.Label>
          <div className="d-flex gap-2 mb-2">
            <Form.Control
              type="text"
              value={searchUserTerm}
              onChange={(e) => setSearchUserTerm(e.target.value)}
              placeholder="Enter name or NetID..."
            />
            <Button onClick={handleUserSearch}>Search</Button>
          </div>
          {userResults.length > 0 && (
            <div className="mb-3">
              <h6>Select User:</h6>
              {userResults.map((user) => (
                <div
                  key={user.userID}
                  className={`p-2 border rounded mb-1 cursor-pointer ${
                    selectedUser?.userID === user.userID ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                  style={{ cursor: 'pointer' }}
                >
                  {user.firstName} {user.lastName} ({user.netID})
                </div>
              ))}
            </div>
          )}
        </Form.Group>

        {/* Project Search Section */}
        <Form.Group className="mb-4">
          <Form.Label>Search Project</Form.Label>
          <div className="d-flex gap-2 mb-2">
            <Form.Control
              type="text"
              value={searchProjectTerm}
              onChange={(e) => setSearchProjectTerm(e.target.value)}
              placeholder="Enter project number or title..."
            />
            <Button onClick={handleProjectSearch}>Search</Button>
          </div>
          {projectResults.length > 0 && (
            <div>
              <h6>Select Project:</h6>
              {projectResults.map((project) => (
                <div
                  key={project.projectID}
                  className={`p-2 border rounded mb-1 cursor-pointer ${
                    selectedProject?.projectID === project.projectID ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                  style={{ cursor: 'pointer' }}
                >
                  {project.projectTitle} (#{project.projectNum})
                </div>
              ))}
            </div>
          )}
        </Form.Group>

        {selectedUser && selectedProject && (
          <Button 
            variant="success" 
            onClick={handleAssign}
            className="w-100"
          >
            Assign {selectedUser.firstName} {selectedUser.lastName} to {selectedProject.projectTitle}
          </Button>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminAssignProjectModal;
