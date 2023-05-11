/**
 * This component is what shows when either the Mentor or Admin clicks on the Reject Button
 */

import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

interface RejectionModalProps {
  show: boolean
  onHide: () => void
  onSubmit: (reason: string) => void
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  show,
  onHide,
  onSubmit,
}) => {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    onSubmit(reason)
    setReason('')
    onHide()
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Reject Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId='rejectionReason'>
            <Form.Label>Reason for rejection:</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Close
        </Button>
        <Button variant='danger' onClick={handleSubmit}>
          Submit Rejection
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default RejectionModal
