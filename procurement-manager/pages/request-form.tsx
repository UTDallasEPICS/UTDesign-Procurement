import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import 'bootstrap/dist/css/bootstrap.min.css'

import styles from '@/styles/request.module.css'
import { useSession } from 'next-auth/react'
import { Prisma, Project, RequestItem, User } from '@prisma/client'
import axios from 'axios'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'
import { useRouter } from 'next/router'

export async function getServerSideProps(context: any) {
  return {
    props: {
      session: await getServerSession(context.req, context.res, authOptions),
    },
  }
}

const StudentRequest = () => {
  const { data: session } = useSession()
  const user = session?.user as User
  // State and handlers
  const [date, setDate] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [remainingBudget, setRemainingBudget] = useState(5000)
  const [items, setItems] = useState([
    {
      sequence: 1,
      vendor: '',
      description: '',
      link: '',
      partNumber: '',
      quantity: '',
      unitCost: '',
      totalCost: '',
    },
  ])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState(0)
  const router = useRouter()

  const handleTooltip = (index: number, inputId: string, tooltipId: string) => {
    const inputElement = document.getElementById(inputId) as HTMLInputElement
    const tooltipElement = document.getElementById(tooltipId) as HTMLElement

    if (inputElement && tooltipElement) {
      inputElement.addEventListener('input', () => {
        tooltipElement.textContent = inputElement.value
      })

      return () => {
        inputElement.removeEventListener('input', () => {
          tooltipElement.textContent = inputElement.value
        })
      }
    }
  }

  async function getProjects() {
    try {
      const res = await axios.post('/api/project/get', {
        netID: user.netID,
      })
      setProjects(res.data.projects)
      setSelectedProject(projects[0].projectNum)
    } catch (error) {
      console.log(error)
    }
  }

  // get projects
  useEffect(() => {
    getProjects()
  }, [])

  useEffect(() => {
    items.forEach((_, index) => {
      handleTooltip(index, `item${index}Vendor`, `vendorTooltip${index}`)
      handleTooltip(
        index,
        `item${index}Description`,
        `descriptionTooltip${index}`
      )
      handleTooltip(index, `item${index}Link`, `linkTooltip${index}`)
      handleTooltip(
        index,
        `item${index}PartNumber`,
        `partNumberTooltip${index}`
      )
    })
  }, [items])

  const handleUnitCostBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    index: number
  ) => {
    const newItems = [...items]
    newItems[index].unitCost = e.target.value
    setItems(newItems)
  }

  // This function is called when delete button for an item is clicked
  const handleDeleteItem = (index: number) => {
    // get the array without the item to be deleted
    const newItems = items.filter((_, i) => i !== index)
    // update the item sequence #s
    newItems.forEach((item, i) => {
      item.sequence = i + 1
    })
    setItems(newItems)
  }

  // Dynamically update the budget remaining
  useEffect(() => {
    setRemainingBudget(10000 - calculateTotalCost())
  }, [items])

  // Input handling
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }
  const handleAdditionalInfoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setAdditionalInfo(e.target.value)
  }

  const calculateTotalCost = () => {
    let totalCost = 0
    items.forEach((item) => {
      totalCost +=
        (parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 0)
    })
    return totalCost
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        sequence: items.length + 1,
        vendor: '',
        description: '',
        link: '',
        partNumber: '',
        quantity: '',
        unitCost: '',
        totalCost: '',
      },
    ])
  }

  const handleItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field:
      | 'vendor'
      | 'description'
      | 'link'
      | 'partNumber'
      | 'quantity'
      | 'unitCost'
  ) => {
    const newItems = [...items]
    newItems[index][field] = e.target.value

    if (field === 'quantity' || field === 'unitCost') {
      const quantity = parseFloat(newItems[index].quantity)
      const unitCost = parseFloat(newItems[index].unitCost)

      if (!isNaN(quantity) && !isNaN(unitCost)) {
        newItems[index].totalCost = (quantity * unitCost).toFixed(2)
      } else {
        newItems[index].totalCost = ''
      }
    }

    setItems(newItems)
  }

  const calculateTotalCosts = () => {
    const newItems = items.map((item) => ({
      ...item,
      totalCost:
        item.quantity && item.unitCost
          ? (Number(item.quantity) * Number(item.unitCost)).toFixed(2)
          : '',
    }))
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check if the remaining budget is negative
    if (remainingBudget < 0) {
      alert(
        'Your remaining budget cannot be negative. Please review your items.'
      )
      return
    }

    // clean out the items to send to API
    const itemsToSend = items.map((item) => {
      return {
        description: item.description,
        url: item.link,
        partNumber: item.partNumber,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitCost),
        vendorID: parseInt(item.vendor),
      }
    })

    // Process form data and submit
    console.info('Submitted Form ::', {
      date,
      additionalInfo,
      itemsToSend,
      selectedFiles,
      selectedProject: selectedProject,
      user: user.email,
    })

    try {
      const newRequest = await axios.post('/api/request-form', {
        dateNeeded: date,
        projectNum: selectedProject,
        studentEmail: user.email,
        items: itemsToSend,
        additionalInfo: additionalInfo,
      })
      if (newRequest.status === 200) {
        alert('Request Successfully Submitted')
        // router.push('/orders')
        console.log('results :: ', newRequest.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Container className={styles.container}>
      <div className={styles.titleContainer}>
        <h1 className={styles.requestForm}>Request Form</h1>
      </div>
      <Row className={'text-center mb-4'}>
        <Col>
          <p>
            <strong>Budget:</strong>
            <span>$10,000</span>
          </p>
        </Col>
        <Col>
          <p>
            <strong>Remaining:</strong>
            <span>${remainingBudget}</span>
          </p>
        </Col>
      </Row>
      <Form onSubmit={handleSubmit}>
        {/* DATE NEEDED */}
        <Row className='my-4'>
          <Col md={3}>
            <Form.Group controlId='date'>
              <Form.Label>
                <strong>Date Needed</strong>
              </Form.Label>
              <Form.Control
                type='date'
                value={date}
                onChange={handleDateChange}
                required
              />
            </Form.Group>
          </Col>

          {/* ADDITIONAL INFO */}
          <Col md={7}>
            <Form.Group controlId='additionalInfo'>
              <Form.Label>
                <strong>Additional Information</strong>
              </Form.Label>
              <Form.Control
                as='textarea'
                rows={1}
                value={additionalInfo}
                onChange={handleAdditionalInfoChange}
                required
              />
            </Form.Group>
          </Col>

          {/* SELECTION OF PROJECTS */}
          <Col md={2}>
            <Form.Group>
              <Form.Label>
                <strong>Project: </strong>
              </Form.Label>
              <Form.Select
                onChange={(e) => {
                  setSelectedProject(parseInt(e.target.value))
                  console.log('selectedProject = ', selectedProject)
                }}
              >
                {projects.map((project, projIndex) => {
                  return (
                    <option key={projIndex} value={project.projectNum}>
                      {project.projectTitle}
                    </option>
                  )
                })}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {items.map((item, index) => (
          <div key={index} className={`${styles.itemSection} my-2`}>
            <Row>
              {/* SEQUENCE NUMBER */}
              <Col md={1}>
                <Form.Group controlId={`item${index}Sequence`}>
                  <Form.Label>
                    <strong>Seq. #</strong>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    value={item.sequence}
                    readOnly
                    className={styles.sequenceNumberInput}
                    disabled
                  />
                </Form.Group>
              </Col>

              {/* VENDOR */}
              <Col md={1}>
                <Form.Group controlId={`item${index}Vendor`}>
                  <Form.Label>
                    <strong>Vendor</strong>
                  </Form.Label>
                  <div className={styles.tooltip}>
                    <Form.Control
                      type='text'
                      value={item.vendor}
                      onChange={(e) => handleItemChange(e, index, 'vendor')}
                      required
                    />
                    <span
                      className={styles.tooltiptext}
                      id={`vendorTooltip${index}`}
                    >
                      Tooltip text
                    </span>
                  </div>
                </Form.Group>
              </Col>

              {/* ITEM DESCRIPTION */}
              <Col md={2}>
                <Form.Group controlId={`item${index}Description`}>
                  <Form.Label>
                    <strong>Description</strong>
                  </Form.Label>
                  <div className={styles.tooltip}>
                    <Form.Control
                      type='text'
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(e, index, 'description')
                      }
                      required
                    />
                    <span
                      className={styles.tooltiptext}
                      id={`descriptionTooltip${index}`}
                    >
                      Tooltip text
                    </span>
                  </div>
                </Form.Group>
              </Col>

              {/* ITEM URL */}
              <Col md={2}>
                <Form.Group controlId={`item${index}Link`}>
                  <Form.Label>
                    <strong>Item Link</strong>
                  </Form.Label>
                  <div className={styles.tooltip}>
                    <Form.Control
                      type='text'
                      value={item.link}
                      onChange={(e) => handleItemChange(e, index, 'link')}
                      required
                    />
                    <span
                      className={styles.tooltiptext}
                      id={`linkTooltip${index}`}
                    >
                      Tooltip text
                    </span>
                  </div>
                </Form.Group>
              </Col>

              {/* PART NUMBER */}
              <Col md={1}>
                <Form.Group controlId={`item${index}PartNumber`}>
                  <Form.Label>
                    <strong>Part #</strong>
                  </Form.Label>
                  <div className={styles.tooltip}>
                    <Form.Control
                      type='text'
                      value={item.partNumber}
                      onChange={(e) => handleItemChange(e, index, 'partNumber')}
                      required
                    />
                    <span
                      className={styles.tooltiptext}
                      id={`partNumberTooltip${index}`}
                    >
                      Tooltip text
                    </span>
                  </div>
                </Form.Group>
              </Col>

              {/* QUANTITY */}
              <Col md={1}>
                <Form.Group controlId={`item${index}Quantity`}>
                  <Form.Label>
                    <strong>Qty.</strong>
                  </Form.Label>
                  <Form.Control
                    type='number'
                    min='0'
                    value={item.quantity}
                    onChange={(e) => handleItemChange(e, index, 'quantity')}
                    className={`${styles.quantityNumberInput} ${styles.hideArrows}`}
                    required
                  />
                </Form.Group>
              </Col>

              {/* UNIT COST */}
              <Col md={2}>
                <Form.Group controlId={`item${index}UnitCost`}>
                  <Form.Label>
                    <strong>Unit Cost</strong>
                  </Form.Label>
                  <InputGroup
                    className={`${styles.unitcostField} ${styles.customInputGroup}`}
                  >
                    <InputGroup.Text className={styles.inputGroupText}>
                      $
                    </InputGroup.Text>
                    <Form.Control
                      type='number'
                      step='0.0001'
                      min='0'
                      value={item.unitCost}
                      onChange={(e) => {
                        const unitCostValue = e.target.value
                        const regex = /^(?=.*[0-9])\d*(?:\.\d{0,4})?$/
                        if (regex.test(unitCostValue) || unitCostValue === '') {
                          handleItemChange(e, index, 'unitCost')
                        }
                      }}
                      onBlur={(e) =>
                        handleUnitCostBlur(
                          e as React.FocusEvent<HTMLInputElement>,
                          index
                        )
                      }
                      className={`${styles.costInputField} ${styles.unitCostInput} ${styles.hideArrows}`}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* TOTAL COST */}
              <Col md={2}>
                <Form.Group controlId={`item${index}TotalCost`}>
                  <Form.Label>
                    <strong>Total</strong>
                  </Form.Label>
                  <InputGroup
                    className={`${styles.unitcostField} ${styles.customInputGroup}`}
                  >
                    <InputGroup.Text className={styles.inputGroupText}>
                      $
                    </InputGroup.Text>
                    <Form.Control
                      type='text'
                      value={
                        item.totalCost === ''
                          ? ''
                          : parseFloat(item.totalCost).toFixed(2)
                      }
                      readOnly
                      className={`${styles.costInputField} ${styles.totalCostInput}`}
                      disabled
                    />
                  </InputGroup>
                </Form.Group>
                <Col md={1} className='d-flex align-items-end mt-2'>
                  {items.length > 1 && (
                    <Button
                      variant='danger'
                      size='sm'
                      type='button'
                      onClick={() => handleDeleteItem(index)}
                      className={styles.deleteButton}
                      disabled={items.length === 1}
                    >
                      Delete
                    </Button>
                  )}
                </Col>
              </Col>
            </Row>
          </div>
        ))}

        <Row className='my-4'>
          <Col xs={12} md={4}>
            <Button variant='primary' type='button' onClick={handleAddItem}>
              Add another item
            </Button>
          </Col>
        </Row>

        <Row className='my-4'>
          <Form.Group controlId='fileUpload'>
            <Form.Label>
              <strong>Supporting Documents</strong>
            </Form.Label>
            <Form.Control
              type='file'
              multiple
              onChange={(e) =>
                setSelectedFiles((e.target as HTMLInputElement).files)
              }
            />
          </Form.Group>
        </Row>

        <Row className='my-4'>
          <Button variant='success' type='submit'>
            Submit
          </Button>
        </Row>
      </Form>
    </Container>
  )
}

export default StudentRequest
