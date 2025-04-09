import { RequestDetails } from '@/lib/types'
import axios from 'axios'
import { User } from 'next-auth'
import React, { useEffect, useState } from 'react'
import {
  Card,
  Button,
  Col,
  Row,
  Collapse,
  Form,
  InputGroup,
  Table,
} from 'react-bootstrap'
import styles from '@/styles/RequestCard.module.scss'
import { Status } from '@prisma/client'

interface RequestCardProps {
  details: RequestDetails
  collapsed: boolean
}

const StudentRequestCard: React.FC<RequestCardProps> = ({ details, collapsed }) => {
  const [studentThatRequested, setStudentThatRequested] = useState<User | null>(null)
  const [mentorThatApproved, setMentorThatApproved] = useState<User | null>(null)
  const [collapse, setCollapse] = useState<boolean>(collapsed)
  const [editable, setEditable] = useState<boolean>(false)
  const [resubmit, setResubmit] = useState<boolean>(false)
  const [vendorNames, setVendorNames] = useState<{ [key: string]: string }>({})
  const [inputValues, setInputValues] = useState(details.RequestItem.map(item => ({ ...item })))

  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  useEffect(() => {
    getStudentThatRequested()
    getMentorThatApproved()
    fetchVendorNames()
  }, [])

  async function getStudentThatRequested() {
    try {
      const user = await axios.get(`/api/user/${details.studentID}`)
      if (user.status === 200) setStudentThatRequested(user.data)
    } catch (error) {
      console.error('Error fetching student:', error)
    }
  }

  async function getMentorThatApproved() {
    try {
      if (!details.process.mentorID) return
      const user = await axios.get(`/api/user/${details.process.mentorID}`)
      if (user.status === 200) setMentorThatApproved(user.data)
    } catch (error) {
      console.error('Error fetching mentor:', error)
    }
  }

  async function fetchVendorNames() {
    try {
      const vendorIds = [...new Set(details.RequestItem.map(item => item.vendorID))]
      const vendorData = await axios.get(`/api/vendor/get`)
      console.log(vendorData, "wertyujhtgfb")
      const vendorMap = Object.fromEntries(vendorData.data.map(v => [v.vendorID, v.vendorName]))
      setVendorNames(vendorMap)
    } catch (error) {
      console.error('Error fetching vendor names:', error)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const { name, value } = e.target
    setInputValues(prev => prev.map((item, i) => (i !== index ? item : { ...item, [name]: value })))
  }

  function handleSave() {
    setEditable(false)
  }

  function handleResubmit(e: React.FormEvent) {
    e.preventDefault()
    setResubmit(false)
  }

  return (
    <Card className='request-card mb-3' style={{ backgroundColor: 'rgb(240, 240, 240)' }}>
      <Card.Body>
        <Row className='smaller-row'>
          <Col xs={12} lg={3}>
            <Card.Title>
              <h4 className={styles.headingLabel}>Request #{details.requestID}</h4>
            </Card.Title>
          </Col>
          <Col xs={6} lg={2}>
            <h6 className={styles.headingLabel}>Date Requested</h6>
            <p>{new Date(details.dateSubmitted).toLocaleDateString()}</p>
          </Col>
          <Col xs={6} lg={2}>
            <h6 className={styles.headingLabel}>Date Needed</h6>
            <p>{new Date(details.dateNeeded).toLocaleDateString()}</p>
          </Col>
          <Col xs={6} lg={2}>
            <h6 className={styles.headingLabel}>Order Subtotal</h6>
            <p>${details.RequestItem.reduce((total, item) => total + item.quantity * Number(item.unitPrice), 0).toFixed(2)}</p>
          </Col>
          <Col xs={6} lg={3}>
            <h6 className={styles.headingLabel}>Status</h6>
            <p>{details.process.status}</p>
          </Col>
        </Row>
        <Collapse in={collapse}>
          <div>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Vendor</th>
                  <th>URL</th>
                  <th>Part #</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {inputValues.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Control name='description' value={item.description} onChange={e => handleInputChange(e, index)} />
                    </td>
                    <td>{vendorNames[item.vendorID] || 'Loading...'}</td>
                    <td>
                      <Form.Control name='url' value={item.url} onChange={e => handleInputChange(e, index)} />
                    </td>
                    <td>
                      <Form.Control name='partNumber' value={item.partNumber} onChange={e => handleInputChange(e, index)} />
                    </td>
                    <td>
                      <Form.Control name='quantity' value={item.quantity} onChange={e => handleInputChange(e, index)} />
                    </td>
                    <td>
                      <Form.Control name='unitPrice' value={item.unitPrice.toString()} onChange={e => handleInputChange(e, index)} />
                    </td>
                    <td>
                      ${(item.quantity * Number(item.unitPrice)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  )
}

export default StudentRequestCard
