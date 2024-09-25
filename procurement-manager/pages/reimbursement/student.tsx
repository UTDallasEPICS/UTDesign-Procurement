/**
 * This is the Request Form page
 */

import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import 'bootstrap/dist/css/bootstrap.min.css'
import styles from '@/styles/request.module.css'
import { Prisma, Project, User, Vendor } from '@prisma/client'
import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { useRouter } from 'next/router'
import { prisma } from '@/db'

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
        startingBudget: project.startingBudget.toNumber(),
        totalExpenses: project.totalExpenses.toNumber(),
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

const StudentRequest = ({ user, listOfProjects }: StudentRequestProps) => {
  // State and handlers
  const [date, setDate] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')

  // remaining budget before adding any items
  const [remainingBeforeItem, setRemainingBeforeItem] = useState<Prisma.Decimal>(Prisma.Decimal.sub(new Prisma.Decimal(listOfProjects[0].startingBudget), new Prisma.Decimal(listOfProjects[0].totalExpenses)))

  // remaining budget that updates every time item is added/deleted
  const [remainingAfterItem, setRemainingAfterItem] = useState<Prisma.Decimal>(Prisma.Decimal.sub(new Prisma.Decimal(listOfProjects[0].startingBudget), new Prisma.Decimal(listOfProjects[0].totalExpenses)))
  const [items, setItems] = useState([
    {
      sequence: 1,
      receiptDate: '',
      vendor: '',
      description: '',
      unitCost: ''
    },
  ])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [projects, setProjects] = useState<Project[]>(listOfProjects)
  const [selectedProject, setSelectedProject] = useState(listOfProjects[0].projectNum)
  const router = useRouter()
  
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
    let proj = projects.filter((project) => (project.projectNum === selectedProject))
    setRemainingAfterItem(
      Prisma.Decimal.sub(
        (Prisma.Decimal.sub(new Prisma.Decimal(proj[0].startingBudget), new Prisma.Decimal(proj[0].totalExpenses))),
        calculateTotalCost()
      )
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

  const calculateTotalCost = (): Prisma.Decimal => {
    let totalCost = 0
    items.forEach((item) => {
      totalCost +=
        (parseFloat(item.unitCost) || 0) * (1)
    })
    return new Prisma.Decimal(totalCost);
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
      | 'unitCost'
  ) => {
    const newItems = [...items]
    newItems[index][field] = e.target.value

    if (field === 'unitCost') {
      const unitCost = parseFloat(newItems[index].unitCost)
    }

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
    if (remainingAfterItem < new Prisma.Decimal(0)) {
      alert(
        'Your remaining budget cannot be negative. Please review your items.'
      )
      return
    }

    // clean out the items to send to API
    const itemsToSend = items.map((item) => {
      return {
        description: item.description,
        unitPrice: parseFloat(item.unitCost),
        vendorID: parseInt(item.vendor),
      }
    })

    // Process form data and submit
    console.info('Submitted Form ::', {
      date,
      additionalInfo,
      itemsToSend,
      items: items,
      selectedFiles,
      selectedProject: selectedProject,
      user: user.email,
      totalExpenses: calculateTotalCost(),
    })

    // Call the API
    try {
      const newRequest = await axios.post('/api/request-form', {
        dateNeeded: date,
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
    }
  }

  function findBudget(projectNum: number, proj: Project[]) {
    let budget: Prisma.Decimal = new Prisma.Decimal(0)
    proj.forEach((project) => {
      if (project.projectNum === projectNum) {
        budget = new Prisma.Decimal(Prisma.Decimal.sub(project.startingBudget, project.totalExpenses))
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
              ${new Prisma.Decimal(remainingBeforeItem).toFixed(4).toString()}
            </span>
          </p>
        </Col>
        <Col>
          <p>
            <strong>Remaining: </strong>
          </p>
          <p>
            <span>${remainingAfterItem.toFixed(4).toString()}</span>
          </p>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit} autoComplete='off'>

        <Row className='my-4'>

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
                    onChange={(e) => handleDateChange(e, index)}
                    required
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
                    <Form.Control
                      type='number'
                      step='0.01'
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
              
              {/* RECEIPT UPLOAD */}
              <Row className='my-4'>
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
              </Row>

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

export default StudentRequest
