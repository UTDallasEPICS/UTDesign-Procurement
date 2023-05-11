/**
 * This is the Request Form page
 */

import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
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
  let vendors = await prisma.vendor.findMany({})
  return {
    props: {
      session: session,
      user: user,
      vendors: vendors,
    },
  }
}

interface StudentRequestProps {
  session: Session | null
  user: User
  vendors: Vendor[]
}

const StudentRequest = ({ session, user, vendors }: StudentRequestProps) => {
  // State and handlers
  const [date, setDate] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [remainingBudget, setRemainingBudget] = useState<Prisma.Decimal>(
    new Prisma.Decimal(1000)
  )
  const [startingBudget, setStartingBudget] = useState<Prisma.Decimal>(
    new Prisma.Decimal(1000)
  )
  const [totalExpenses, setTotalExpenses] = useState<Prisma.Decimal>(
    new Prisma.Decimal(0)
  )
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

  /**
   * This function handles updating the tooltips whenever the input fields are changed
   * THIS SHOULD BE IMPROVE SINCE IT IS USING VANILLA JS AND THE DOM, NOT REACT
   * @param index
   * @param inputId
   * @param tooltipId
   * @returns
   */
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
      const proj: Project[] = await res.data.projects
      setProjects(proj)
      setSelectedProject(proj[0].projectNum)
      findBudget(proj[0].projectNum, proj)
      setTotalExpenses(proj[0].totalExpenses)
      setRemainingBudget(
        Prisma.Decimal.sub(
          Prisma.Decimal.sub(startingBudget, totalExpenses),
          calculateTotalCost()
        )
      )
    } catch (error) {
      console.log(error)
    }
  }

  // get projects
  useEffect(() => {
    getProjects()
  }, [])

  // Initialize the first RequestItem
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
    setRemainingBudget(
      Prisma.Decimal.sub(
        Prisma.Decimal.sub(startingBudget, totalExpenses),
        calculateTotalCost()
      )
    )
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

  /**
   * Updates the state of the items array to add a new item
   */
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

  /**
   * This function is what handles submitting the form and calls our API to update the database
   * @param e
   * @returns
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check if the remaining budget is negative
    if (remainingBudget < new Prisma.Decimal(0)) {
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
      items: items,
      selectedFiles,
      selectedProject: selectedProject,
      user: user.email,
      totalExpenses: Prisma.Decimal.sub(startingBudget, remainingBudget),
    })

    // Call the API
    try {
      // const newRequest = await axios.post('/api/request-form', {
      //   dateNeeded: date,
      //   projectNum: selectedProject,
      //   studentEmail: user.email,
      //   items: itemsToSend,
      //   additionalInfo: additionalInfo,
      //   totalExpenses: Prisma.Decimal.sub(startingBudget, remainingBudget),
      // })
      // if (newRequest.status === 200) {
      //   // Redirects to the orders page (which will redirect to the student view)
      //   alert('Request Successfully Submitted')
      //   router.push('/orders')
      // }
    } catch (error) {
      console.log(error)
    }
  }

  //start of autocopmlete search functions
  // const handleOnSearch = (string, results) => {
  //   console.log(string, results)
  // }

  // const handleOnHover = (result) => {
  //   console.log(result)
  // }

  // const handleOnSelect = (item) => {
  //   console.log(item)
  // }

  // const handleOnFocus = () => {
  //   console.log('Focused')
  // }

  // const handleOnClear = () => {
  //   console.log('Cleared')
  // }

  //end of autocopmlete funcitons

  function findBudget(projectNum: number, proj: Project[]) {
    let budget: Prisma.Decimal = new Prisma.Decimal(0)
    proj.forEach((project) => {
      if (project.projectNum === projectNum) {
        budget = project.startingBudget
      }
    })
    setStartingBudget(budget)
    return budget
  }

  return (
    <Container className={styles.container}>
      <div className={styles.titleContainer}>
        <h1 className={styles.requestForm}>Request Form</h1>
      </div>
      <Row className={'text-center mb-4'}>
        <Col>
          <p>
            <strong>Budget: </strong>
          </p>
          <p>
            <span>
              ${new Prisma.Decimal(startingBudget).toFixed(4).toString()}
            </span>
          </p>
        </Col>
        <Col>
          <p>
            <strong>Remaining: </strong>
          </p>
          <p>
            <span>${remainingBudget.toFixed(4).toString()}</span>
          </p>
        </Col>
      </Row>
      <Form onSubmit={handleSubmit} autoComplete='off'>
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
                  {/* <ReactSearchAutocomplete
                    items={vendors}
                    maxResults={15}
                    // onSearch={handleOnSearch}
                    // onHover={handleOnHover}
                    // onSelect={handleOnSelect}
                    // onFocus={handleOnFocus}
                    // onClear={handleOnClear}
                    fuseOptions={{ keys: ['name', 'description'] }} // Search in the description text as well
                    styling={{ zIndex: 3 }} // To display it on top of the search box below
                  /> */}
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

                  {/* <Form.Select
                    value={item.vendor}
                    onChange={(e) => handleItemChange(e, index, 'vendor')}
                  >
                    {vendors.map((vendor, vendorIndex) => {
                      return (
                        <option key={vendorIndex} value={vendor.vendorID}>
                          {vendor.vendorName}
                        </option>
                      )
                    })}
                  </Form.Select> */}
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
