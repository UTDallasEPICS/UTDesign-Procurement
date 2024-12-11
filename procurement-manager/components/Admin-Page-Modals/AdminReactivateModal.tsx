import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface AdminReactivateModalProps {
  show: boolean;
  onHide: () => void;
  type: string;
}

export default function AdminReactivateModal({ show, onHide, type }: AdminReactivateModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleReactivate = async (itemsToReactivate: any[]) => {
    try {
      for (const item of itemsToReactivate) {
        const endpoint = type === 'user' ? '/api/admin-APIs/reactivate-user' : '/api/admin-APIs/reactivate-project';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: type,
            id: type === 'user' ? item.userID : item.projectID
          }),
        });
        
        if (!response.ok) throw new Error(`Failed to reactivate ${type}`);
      }
      onHide();
      window.location.reload();
    } catch (error) {
      console.error(`Error reactivating ${type}:`, error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch('/api/admin-APIs/admin-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type,
          searchTerm: searchTerm
        }),
      });
      
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Reactivate {type === 'user' ? 'Users' : 'Projects'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>
            {type === 'user' 
              ? 'Search by Name or NetID'
              : 'Search by Project Number'}
          </Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={type === 'user' 
                ? "Enter name or NetID..."
                : "Enter project number..."}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </Form.Group>

        {searchResults.length > 0 && (
          <>
            <h6>Search Results:</h6>
            <ul>
              {searchResults.map((item: any) => (
                <li key={type === 'user' ? item.userID : item.projectID}>
                  {type === 'user' 
                    ? `${item.firstName} ${item.lastName} (${item.netID})`
                    : `${item.projectTitle} (${item.projectNum})`}
                </li>
              ))}
            </ul>
            <Button 
              variant="success"
              style={{ backgroundColor: '#98FB98', borderColor: '#98FB98', color: 'black' }}
              onClick={() => handleReactivate(searchResults)}
            >
              Reactivate Found Items
            </Button>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 