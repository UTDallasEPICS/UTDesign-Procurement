import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface AdminSortByProjectModalProps {
  show: boolean;
  onHide: () => void;
}

export default function AdminSortByProjectModal({ show, onHide }: AdminSortByProjectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setSearchAttempted(true)
      setError('')
      console.log('Making API request to search for project:', searchTerm)

      if (!searchTerm) {
        setError('Please enter a project number')
        return
      }

      const projectNum = parseInt(searchTerm)
      if (isNaN(projectNum)) {
        setError('Please enter a valid project number')
        return
      }

      setSearchResults([])

      const response = await fetch('/api/admin-api/admin-sort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: projectNum,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (data && Array.isArray(data.users)) {
        setSearchResults(data.users)
      } else {
        setError('Invalid response format')
      }
    } catch (error) {
      console.error('Search error:', error)
      if (error instanceof Error) {
        setError(`Error searching for users: ${error.message}`)
      } else {
        setError('Error searching for users')
      }
    }
  }

  return (
    <Modal show={show} onHide={onHide} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>Sort Users by Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSearch}>
          <Form.Group className='mb-3'>
            <Form.Label>Search by Project Number</Form.Label>
            <div className='d-flex gap-2'>
              <Form.Control
                type='number'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Enter project number...'
              />
              <Button type='submit'>Search</Button>
            </div>
          </Form.Group>
        </form>

        {error && <Alert variant='danger'>{error}</Alert>}

        {searchAttempted && !error && (
          <>
            <h6>Users in Project {searchTerm}:</h6>
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((user: any) => (
                  <li key={user.userID}>
                    {user.firstName} {user.lastName} (
                    {user.netID ?? '---------'})
                  </li>
                ))}
              </ul>
            ) : (
              <Alert variant='info'>
                No users found for this project number.
              </Alert>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
