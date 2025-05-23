/**
 * This is the Reimbursement Form page
 */

import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Button, InputGroup, FormControl } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import 'bootstrap/dist/css/bootstrap.min.css'
import styles from '@/styles/reimbursement.module.css'
import { Prisma, Project, User, Vendor } from '@prisma/client'
import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { useRouter } from 'next/router'
import { prisma } from '@/db'
import { dollarsAsString, NumberFormControl } from '@/components/NumberFormControl'

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions)
  const user = session?.user as User
  let projects = null
  let listOfProjects = null
  try {
    projects = await prisma.project.findMany({
      where: {
        WorksOn: {
          some: {
            userID: user.userID,
          },
        },
      },
      select: {
        projectNum: true,
        projectTitle: true,
        startingBudget: true,
        totalExpenses: true,
      },
    })
    listOfProjects = projects.map((project) => {
      return {
        projectNum: project.projectNum,
        projectTitle: project.projectTitle,
        startingBudget: project.startingBudget,
        totalExpenses: project.totalExpenses
      }
    })
  } catch (error) {
    console.log('project error: ', error)
  }
  let vendors = await prisma.vendor.findMany({})
  return {
    props: {
      session: session,
      user: user,
      listOfProjects: listOfProjects,
      vendors: vendors,
    },
  }
}

interface StudentRequestProps {
  session: Session | null
  user: User
  listOfProjects: Project[]
  vendors: Vendor[]
}

const StudentReimbursement = ({ user, listOfProjects }: StudentRequestProps) => {
  // State and handlers
  const [date, setDate] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')

  // remaining budget before adding any items
  const [remainingBeforeItem, setRemainingBeforeItem] = useState<number>(((listOfProjects[0].startingBudget)- (listOfProjects[0].totalExpenses)))

  // remaining budget that updates every time item is added/deleted
  const [remainingAfterItem, setRemainingAfterItem] = useState<number>(((listOfProjects[0].startingBudget) - (listOfProjects[0].totalExpenses)))
  const [items, setItems] = useState([
    {
      sequence: 1,
      receiptDate: '',
      vendor: '',
      description: '',
      unitCost: 0
    },
  ])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [projects, setProjects] = useState<Project[]>(listOfProjects)
  const [selectedProject, setSelectedProject] = useState(listOfProjects[0].projectNum)
  const router = useRouter()
  
  
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
    let proj = projects.filter((project) => (project.projectNum === selectedProject))
    setRemainingAfterItem(
        ((proj[0].startingBudget) - (proj[0].totalExpenses))-
        calculateTotalCost()
      
    )
  }, [items])

  useEffect(() => {
    findBudget(selectedProject, listOfProjects)
  }, [selectedProject])

  // Input handling
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newItems = [...items]
    newItems[index].receiptDate = e.target.value
    setItems(newItems)
  }
  
  const handleAdditionalInfoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setAdditionalInfo(e.target.value)
  }

  const calculateTotalCost = (): number => {
    let totalCost = 0
    items.forEach((item) => {
      totalCost +=
        (parseFloat(item.unitCost) || 0) * (1)
    })
    return (totalCost);
  }

  /**
   * Updates the state of the items array to add a new item
   */
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        sequence: items.length + 1,
        receiptDate: '',
        vendor: '',
        description: '',
        unitCost: ''
      },
    ])
  }

  /**
   * Whenever an input field is changed, this function updates the state of the items array
   * @param e
   * @param index
   * @param field
   */
  const handleItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field:
      | 'vendor'
      | 'description'
  ) => {
    const newItems = [...items]
    newItems[index][field] = e.target.value

    setItems(newItems)
  }

  const handleNumericValueChangeOnItem = (value: number | null, index: number, field: 'unitCost') => {
    console.log('[Parent] handleNumericValueChangeOnItem called with', { value, index, field });
    const newItems = [...items]
    newItems[index][field] = value ?? 0
    
    setItems(newItems)
  }

  // TODO:: change vendorID to vendorName similar to AdminRequestCard

  /**
   * This function is what handles submitting the form and calls our API to update the database
   * @param e
   * @returns
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check if the remaining budget is negative
    if (remainingAfterItem < 0) {
      alert(
        'Your remaining budget cannot be negative. Please review your items.'
      )
      return
    }

    // clean out the items to send to API
    const itemsToSend = items.map((item) => {
      return {
        receiptDate: item.receiptDate,
        description: item.description,
        receiptTotal: item.unitCost,
        vendorID: parseInt(item.vendor)
      }
    })

    console.log('STUDENT.TSX', itemsToSend)

    // Call the API
    try {
      const newRequest = await axios.post('/api/reimbursement-form', {
        projectNum: selectedProject,
        studentEmail: user.email,
        items: itemsToSend,
        additionalInfo: additionalInfo,
        totalExpenses: calculateTotalCost(),
      })
      if (newRequest.status === 200) {
        // Redirects to the orders page (which will redirect to the student view)
        alert('Request Successfully Submitted')
        router.push('/orders')
      }
    } catch (error) {
      console.log(error)
      alert('Something went wrong with reimbursement')
    }
  }

  function findBudget(projectNum: number, proj: Project[]) {
    let budget = 0
    proj.forEach((project) => {
      if (project.projectNum === projectNum) {
        budget = ((project.startingBudget - project.totalExpenses))
      }
    })
    setRemainingBeforeItem(budget)
    setRemainingAfterItem(budget)
    return budget
  }

  return (
    <Container className={styles.container}>

      <div className={styles.titleContainer}>
        <h1 className={styles.requestForm}>Reimbursement Form</h1>
      </div>

      <Row className={'text-center mb-4'}>
        <Col>
          <p>
            <strong>Budget: </strong>
          </p>
          <p>
            <span>
              {dollarsAsString(remainingBeforeItem/100)}
            </span>
          </p>
        </Col>
        <Col>
          <p>
            <strong>Remaining: </strong>
          </p>
          <p>
            <span>{dollarsAsString(remainingAfterItem/100)}</span>
          </p>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit} autoComplete='off'>

        <Row className='my-4'>

          {/* ADDITIONAL INFO */}
          <Col md={10}>
            <Form.Group controlId='additionalInfo'>
              <Form.Label>
                <strong>Additional Information</strong>
              </Form.Label>
              <Form.Control
                as='textarea'
                rows={1}
                value={additionalInfo}
                onChange={handleAdditionalInfoChange}
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
                  findBudget(selectedProject, listOfProjects)
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

        <h5>
          <strong>Items:</strong>
        </h5>

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

              {/* RECEIPT DATE */}
              <Col md={3}>
                <Form.Group controlId='date'>
                  <Form.Label>
                    <strong>Receipt Date</strong>
                  </Form.Label>
                  <Form.Control
                    type='date'
                    value={item.receiptDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e, index)}
                    required
                  />
                </Form.Group>
              </Col>

              {/* VENDOR */}
              <Col md={2}>
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
                  </div>
                </Form.Group>
              </Col>

              {/* ITEM DESCRIPTION */}
              <Col md={4}>
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
                  </div>
                </Form.Group>
              </Col>

              {/* RECEIPT TOTAL */}
              <Col md={2}>
                <Form.Group controlId={`item${index}UnitCost`}>
                  <Form.Label>
                    <strong>Receipt Total</strong>
                  </Form.Label>
                  <InputGroup
                    className={`${styles.unitcostField} ${styles.customInputGroup}`}
                  >
                    <InputGroup.Text className={styles.inputGroupText}>
                      $
                    </InputGroup.Text>
                    <NumberFormControl
                      step='0.01'
                      min='0'
                      defaultValue={item.unitCost/100}
                      onValueChange={(e) => {
                        if (e === null) {
                          handleNumericValueChangeOnItem(null, index, 'unitCost')
                        } else {
                          handleNumericValueChangeOnItem(e * 100, index, 'unitCost')
                        }
                      }}
                      renderNumber={(value) => dollarsAsString(value, false)}
                      className={`${styles.costInputField} ${styles.unitCostInput} ${styles.hideArrows}`}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>   
                    
              {/* RECEIPT UPLOAD */}
              <Col md={12}>
                <div className={styles.fileUpload}>
                  <Form.Group controlId='fileUpload'>
                    <Form.Label>
                      <strong>Receipt Upload</strong>
                    </Form.Label>
                    <Form.Control
                      type='file'
                      multiple
                      onChange={(e) =>
                        setSelectedFiles((e.target as HTMLInputElement).files)
                      }
                    />
                  </Form.Group>
                </div>
              </Col>

              {/* DELETE BUTTON */}
              <Col className='d-flex justify-content-end mt-2 w-100'>
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
          <Button variant='success' type='submit'>
            Submit
          </Button>
        </Row>

      </Form>
    </Container>
  )
}

export default StudentReimbursement
