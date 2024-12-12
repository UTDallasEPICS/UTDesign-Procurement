import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useRouter } from 'next/router';

interface AdminDeactivateModalProps {
  show: boolean;
  onHide: () => void;
  type: string;
}

export default function AdminDeactivateModal({
  show,
  onHide,
  type,
}: AdminDeactivateModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleSearch = async () => {
    try {
      const response = await fetch('/api/admin-api/admin-search', {
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

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      for (const item of searchResults) {
        const response = await fetch(`/api/admin-api/deactivate-${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: type === 'user' ? item.userID : item.projectID
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to deactivate');
        }
      }
      
      onHide();
      router.reload();
    } catch (error) {
      console.error('Error deactivating:', error);
    } finally {
      setIsDeactivating(false);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Deactivate {type === 'user' ? 'Users' : 'Projects'}</Modal.Title>
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
            <Button onSubmit={handleSearch}>Search</Button>
          </div>
        </Form.Group>

        {searchResults.length > 0 && (
          <>
            <h6>Search Results:</h6>
            <ul>
              {searchResults.map((item) => (
                <li key={type === 'user' ? item.userID : item.projectID}>
                  {type === 'user' 
                    ? `${item.firstName} ${item.lastName} (${item.netID})${
                        item.deactivationDate ? ` - Deactivated: ${formatDate(item.deactivationDate)}` : ''
                      }`
                    : `${item.projectTitle} (${item.projectNum})${
                        item.deactivationDate ? ` - Deactivated: ${formatDate(item.deactivationDate)}` : ''
                      }`
                  }
                </li>
              ))}
            </ul>
            <Button 
              variant="warning" 
              onClick={handleDeactivate}
              disabled={isDeactivating || searchResults.length === 0}
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate Found Items'}
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
