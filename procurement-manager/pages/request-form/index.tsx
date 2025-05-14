/**
 * This is the Request Form page
 */

import React, { useState, useEffect, useRef, ComponentProps, useMemo, useCallback } from 'react'
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
        totalExpenses: project.totalExpenses,
      }
    })
  } catch (error) {
    console.log('project error: ', error)
  }

  let vendors = await prisma.vendor.findMany()
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

const StudentRequest = ({
  session,
  user,
  listOfProjects,
  vendors,
}: StudentRequestProps) => {
  // State and handlers
  const [date, setDate] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  // remaining budget before adding any items
  const [remainingBeforeItem, setRemainingBeforeItem] =
    useState(
      (
        (listOfProjects[0].startingBudget)-
        (listOfProjects[0].totalExpenses)
      ),
    )
  // remaining budget that updates every time item is added/deleted
  const [remainingAfterItem, setRemainingAfterItem] = useState(
      (listOfProjects[0].startingBudget)-
      (listOfProjects[0].totalExpenses),
    
  )

  const [items, setItems] = useState([
    {
      sequence: 1,
      vendor: '',
      description: '',
      url: '',
      partNumber: '',
      quantity: 0,
      unitCost: 0,
      totalCost: 0,
      isDropdownOpen: false,
      isNewVendor: false,
      searchTerm: '',
      newVendorName: '',
      newVendorEmail: '',
      newVendorURL: '',
    },
  ])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [selectedProject, setSelectedProject] = useState(
    listOfProjects[0].projectNum,
  )

  const router = useRouter()

  const handleVendorChange = (
    e: React.ChangeEvent<any> | { target: { value: any } },
    index: number
  ) => {
    const value = e.target.value;

    const newItems = [...items];
    newItems[index].vendor = value;
    newItems[index].isNewVendor = value === 'other';

    // Reset new vendor details if selecting a predefined vendor
    if (value !== 'other') {
      newItems[index].newVendorName = '';
      newItems[index].newVendorURL = '';
      newItems[index].newVendorEmail = '';
    }

    setItems(newItems);
  };


  const handleDropdownToggle = (
    index: number,
    isOpen: boolean
  ) => {
    const newItems = [...items];
    newItems[index].isDropdownOpen = isOpen;
    setItems(newItems);
  };

  const handleSearchTermChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].searchTerm = value;
    setItems(newItems);
  };

  //------------

  // TODO:: update tooltip whenever item is added or deleted

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

  // Initialize the first RequestItem
  useEffect(() => {
    items.forEach((_, index) => {
      handleTooltip(index, `item${index}Vendor`, `vendorTooltip${index}`)
      handleTooltip(
        index,
        `item${index}Description`,
        `descriptionTooltip${index}`,
      )
      handleTooltip(index, `item${index}URL`, `urlTooltip${index}`)
      handleTooltip(
        index,
        `item${index}PartNumber`,
        `partNumberTooltip${index}`,
      )
    })
  }, [items])

  
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
    let proj = listOfProjects.filter(
      (project) => project.projectNum === selectedProject,
    )
    setRemainingAfterItem(
          (proj[0].startingBudget)-
          (proj[0].totalExpenses)
     - calculateTotalCost()
    
    )
  }, [items])

  useEffect(() => {
    findBudget(selectedProject, listOfProjects)
  }, [selectedProject])

  // Input handling
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }
  const handleAdditionalInfoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setAdditionalInfo(e.target.value)
  }

  const calculateTotalCost = (): number => {
    let totalCost = 0
    items.forEach((item) => {
      console.log('[calculateTotalCost] item', item)
      totalCost +=
        (item.unitCost || 0) * (item.quantity || 0)
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
        url: '',
        partNumber: '',
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        isDropdownOpen: false,
        isNewVendor: false,
        searchTerm: '',
        newVendorName: '',
        newVendorEmail: '',
        newVendorURL: '',
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
      | 'url'
      | 'partNumber'
  ) => {
    const newItems = [...items]
    newItems[index][field] = e.target.value
    
    setItems(newItems)
  }
  
  const handleNumericValueChangeOnItem = (value: number | null, index: number, field: 'unitCost' | 'quantity') => {
    console.log('[Parent] handleNumericValueChangeOnItem called with', { value, index, field });
    const newItems = [...items]
    newItems[index][field] = value ?? 0

    if (field === 'quantity' || field === 'unitCost') {
      const quantity = newItems[index].quantity
      const unitCost = newItems[index].unitCost
      console.log('[Parent] Calculating totalCost with', { quantity, unitCost });
      if (!Number.isNaN(quantity) && !Number.isNaN(unitCost)) {
        newItems[index].totalCost = (quantity * unitCost)
      } else {
        newItems[index].totalCost = 0
      }
    }
    setItems(newItems)
    console.log('[Parent] setItems called with', newItems);
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
        'Your remaining budget cannot be negative. Please review your items.',
      )
      return
    }

    // clean out the items to send to API
    const itemsToSend = items.map((item) => {
      return {
        ...item,
        quantity: (item.quantity),
        unitPrice: (item.unitCost),
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
    let budget = 0
    proj.forEach((project) => {
      if (project.projectNum === projectNum) {
        budget = project.startingBudget - project.totalExpenses
      }
    })
    setRemainingBeforeItem(budget)
    setRemainingAfterItem(budget)
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
                  findBudget(selectedProject, listOfProjects)
                  console.log('selectedProject = ', selectedProject)
                }}
              >
                {listOfProjects.map((project, projIndex) => {
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
                <Form.Group controlId={`item${index}URL`}>
                  <Form.Label>
                    <strong>Item URL</strong>
                  </Form.Label>
                  <div className={styles.tooltip}>
                    <Form.Control
                      type='url'
                      value={item.url}
                      onChange={(e) => handleItemChange(e, index, 'url')}
                      required
                    />
                    <span
                      className={styles.tooltiptext}
                      id={`urlTooltip${index}`}
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
                  <NumberFormControl
                    min='0'
                    defaultValue={item.quantity}
                    onValueChange={(e) => handleNumericValueChangeOnItem(e, index, 'quantity')}
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
                    <NumberFormControl
                      step='0.0001'
                      min='0'
                      defaultValue={item.unitCost/100}
                      onValueChange={(e) => {
                        console.log('[NumberFormControl] onValueChange: e', e)  
                        if (e === null) {
                          handleNumericValueChangeOnItem(null, index, 'unitCost')
                        } else {
                          handleNumericValueChangeOnItem(e * 100, index, 'unitCost')
                        }
                      }}
                      className={`${styles.costInputField} ${styles.unitCostInput} ${styles.hideArrows}`}
                      renderNumber={(value) => dollarsAsString(value, false)}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* TOTAL COST */}
              <Col md={2}>
                <p>
                  <strong>Total</strong>
                </p>
                <p>
                  {dollarsAsString(item.totalCost/100)}
                </p>
              </Col>
              <Col className='justify-content-end w-100'>
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
            <Row className="my-4">
              <Col md={4}>
                <Form.Group controlId={`vendorSelect-${index}`}>
                  <Form.Label>
                    <strong>Vendor</strong>
                  </Form.Label>
                  {/* Searchable dropdown */}
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type="text"
                      placeholder="Search or select a vendor..."
                      value={item.searchTerm} // Use the item's specific search term
                      onChange={(e) => handleSearchTermChange(index, e.target.value)}
                      onFocus={() => handleDropdownToggle(index, true)}
                      onBlur={() =>
                        setTimeout(() => handleDropdownToggle(index, false), 200)
                      }
                    />
                    {item.isDropdownOpen && (
                      <ul
                        style={{
                          position: 'absolute',
                          width: '100%',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          zIndex: 1000,
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {vendors
                          .filter(
                            (vendor: any) =>
                              vendor.vendorStatus === 'APPROVED' &&
                              vendor.vendorName
                                .toLowerCase()
                                .includes(item.searchTerm.toLowerCase())
                          )
                          .map((vendor: any) => (
                            <li
                              key={vendor.vendorID}
                              style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #ddd',
                              }}
                              onClick={() => {
                                handleVendorChange(
                                  { target: { value: vendor.vendorID } },
                                  index
                                );
                                handleSearchTermChange(index, vendor.vendorName);
                                handleDropdownToggle(index, false);
                              }}
                            >
                              {vendor.vendorName}
                            </li>
                          ))}
                        <li
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            backgroundColor: '#f9f9f9',
                          }}
                          onClick={() => {
                            handleVendorChange({ target: { value: 'other' } }, index);
                            handleSearchTermChange(index, 'Other');
                            handleDropdownToggle(index, false);
                          }}
                        >
                          Other
                        </li>
                      </ul>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            {item.isNewVendor && (
              <Row className="my-4">
                <Col md={4}>
                  <Form.Group controlId={`newVendorName-${index}`}>
                    <Form.Label>
                      <strong>New Vendor Name</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={item.newVendorName || ''}
                      onChange={(e) =>
                        setItems((prev) => {
                          const newItems = [...prev];
                          newItems[index].newVendorName = e.target.value;
                          return newItems;
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId={`newVendorURL-${index}`}>
                    <Form.Label>
                      <strong>New Vendor URL</strong>
                    </Form.Label>
                    <Form.Control
                      type="url"
                      value={item.newVendorURL || ''}
                      onChange={(e) =>
                        setItems((prev) => {
                          const newItems = [...prev];
                          newItems[index].newVendorURL = e.target.value;
                          return newItems;
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId={`newVendorEmail-${index}`}>
                    <Form.Label>
                      <strong>New Vendor Email (Optional)</strong>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={item.newVendorEmail || ''}
                      onChange={(e) =>
                        setItems((prev) => {
                          const newItems = [...prev];
                          newItems[index].newVendorEmail = e.target.value;
                          return newItems;
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </div>
        ))}
        <Row className='my-4'>
          <Col xs={12} md={4}>
            <Button variant='primary' type='button' onClick={handleAddItem}>
              Add another item
            </Button>
          </Col>
        </Row>
        {/* TODO:: store uploaded files in the cloud and update DB */}
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


type NumberFormControlProps = Omit<
  ComponentProps<typeof Form.Control>,
  'value' | 'onChange' | 'type' | 'onBlur'> & 
  {
    defaultValue: number, 
    onValueChange?: (value: number | null) => void
    renderNumber?: (value: number) => string
  }

function NumberFormControl(props: NumberFormControlProps) {
  const { defaultValue, onValueChange, renderNumber = (value) => value.toString(), ...rest } = props
  const [stringValue, setStringValue] = useState(renderNumber(defaultValue))

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStringValue(e.target.value)
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!onValueChange) {
      return
    }
    const trimmed = e.target.value.trim()
    if (trimmed.length === 0) {
      onValueChange(null)
    } else {
      const parsed = Number.parseFloat(trimmed)
      if (!Number.isNaN(parsed)) {
        setStringValue(renderNumber(parsed))
        onValueChange(parsed)
      }
    }
  }, [onValueChange, renderNumber])


  return (
    <Form.Control
      type='number'
      value={stringValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...rest}
    />
  )
}

const dollarsAsString = (value: number | undefined, includeCurrencySign = true) => {
  if (value === undefined) {
    return ''
  }
  const formattedValue = value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    useGrouping: false,
  });
  return includeCurrencySign ? formattedValue : formattedValue.slice(1);
}