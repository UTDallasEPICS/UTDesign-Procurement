/**
 * This component is the card that the Admin will see in the Orders Page
 */
import React, { useEffect, useState } from 'react'
import { prisma } from '@/db'
import { RequestDetails } from '@/lib/types'
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  InputGroup,
  Collapse,
} from 'react-bootstrap'
import styles from '@/styles/RequestCard.module.scss'
import { Prisma, User, Project, Vendor, Order, RequestItem } from '@prisma/client'
import axios from 'axios'

interface AdminRequestCardProps {
  user: User
  project: Project
  details: RequestDetails
  onReject: () => void
  onSave: () => void
  collapsed: boolean
}

const AdminRequestCard: React.FC<AdminRequestCardProps> = ({
  user,
  project,
  details,
  onReject,
  onSave,
  collapsed,
}) => {
  // state for the student that requested the order
  const [studentThatRequested, setStudentThatRequested] = useState<User>()
  // state for the mentor that approved the order
  const [mentorThatApproved, setMentorThatApproved] = useState<User>()
  // state for the collapse for request details
  const [collapse, setCollapse] = useState<boolean | undefined>(false)
  // state for editing the request details
  const [editable, setEditable] = useState<boolean>(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  // using for now since haven't removed processed (ordered) requests from orders page yet so once fixed no need to use orders in a request
  const [reqOrders, setReqOrders] = useState<Order[]>([]) 
 
  // state that contains the values of the fields for each order
  // TODO:: implement add/delete orders feature similar to add/delete items feature for request-form/index.ts
  const [orders, setOrders] = useState([
    {
      orderNumber: '',
      trackingInfo: '',
      orderDetails: '',
      shippingCost: new Prisma.Decimal(0),
    }
  ])
  
  // state that contains the values of the input fields for request items in the request card
  // TODO:: implement add/delete items feature similar to add/delete items feature for request-form/index.ts
  const [items, setItems] = useState(
    // initialized by the details prop
    details.RequestItem.map((item, itemIndex) => {
      return { 
        vendorName: "", 
        ...item, 
      }
    })
  )
  const [itemIDs, setItemIDs] = useState<number[]>([]) // track which of the items were updated

  /**
   * this function calculates the total cost for all items in a request
   * @returns Prisma Decimal value for total request expenses
   */
  const calculateTotalCost = (): Prisma.Decimal => {
    let totalCost = 0
    items.forEach((item) => {
      totalCost += (Number(item.unitPrice) * item.quantity)
    })
    orders.forEach((order) => {
      totalCost += Number(order.shippingCost)
    })
    return new Prisma.Decimal(totalCost);
  }
  const [orderTotal, setOrderTotal] = useState<Prisma.Decimal>(calculateTotalCost())

  // Show cards by default and rerenders everytime collapsed changes
  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  // Get the student and mentor that requested and approved the order - only runs once
  useEffect(() => {
    getStudentThatRequested()
    getMentorThatApproved()
    getVendors()
    getOrders()
  }, [])

  // set request item and order arrays to data retrieved from request
  useEffect(() => {
    setItems(
      details.RequestItem.map((item, itemIndex) => {
        return { 
          vendorName: (vendors.length > itemIndex ? vendors[itemIndex].vendorName : ""), 
          ...item, 
        }
      })
    )
  }, [vendors])

  useEffect(() => {
    setOrders(reqOrders.length !== 0 ? (
        reqOrders.map((reqOrder, reqOrderIndex) => {
          return {
            orderNumber: reqOrder.orderNumber,
            trackingInfo: reqOrder.trackingInfo,
            orderDetails: reqOrder.orderDetails,
            shippingCost: reqOrder.shippingCost,
          }
        })
      ) : (
        [
          {
            orderNumber: '',
            trackingInfo: '',
            orderDetails: '',
            shippingCost: new Prisma.Decimal(0),
          }
        ]
      )
    )
    setOrderTotal(calculateTotalCost())
  }, [reqOrders])

  /**
   * This function provides the data received from our API of the student that requested the order
   * @returns User object of the student that requested the order
   */
  async function getStudentThatRequested() {
    try {
      if (!details.Process[0].mentorID) return null
      const user = await axios.get(`/api/user/${details.studentID}`)
      if (user.status === 200) setStudentThatRequested(user.data)
      return user
    } catch (error) {
      if (axios.isAxiosError(error)) console.log(error.status, error.message)
      else if (error instanceof Error) console.log(error.message)
      else console.log(error)
    }
  }

  /**
   * This function provides the data received from our API of the mentor that approved the order
   * @returns User object of the mentor that approved the order
   */
  async function getMentorThatApproved() {
    try {
      if (!details.Process[0].mentorID) return null
      const user = await axios.get(`/api/user/${details.Process[0].mentorID}`)
      if (user.status === 200) setMentorThatApproved(user.data)
      return user
    } catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.log(error.message)
      else console.log(error)
    }
  }

  /**
   * this function is used to retrieve the vendors needed for request 
   */
  async function getVendors() {
    try 
    {
      const response = await axios.get('/api/vendor/get/requestVendors/', {
        params: {
          requestID: details.requestID
        }
      })
      if (response.status === 200)
      {
        const vendorArr: Vendor[] = response.data.vendors
        setVendors(vendorArr)
      }
    } 
    catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.log(error.message)
      else console.log(error)
    } 
  }

  /**
   * this function is used to retrieve the orders associated with request
   */
  async function getOrders() {
    try 
    {
      const response = await axios.get('/api/orders/get/requestOrders/', {
        params: {
          requestID: details.requestID
        }
      })
      if (response.status === 200)
      {
        const orderArr: Order[] = response.data.orders
        
        if (orderArr.length !== 0) {
          setReqOrders(orderArr)
        }
      }
    } 
    catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.log(error.message)
      else console.log(error)
    } 
  }

  /**
   * This function handles changes to inputs whenever user is editing the input fields in the request card for request item
   * @param e - the onChange event passed by the input field
   * @param index - the index of the request item the input field is in within the request items array
   */
  function handleItemChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const { name, value } = e.target

    setItems((prev) => {
      return prev.map((item, i) => {
        if (i !== index) return item
        updateItemIDs(item.itemID) // update if item is at updated index
        return {
          ...item,
          [name]: value,
        }
      })
    })
  }

   /**
   * this function adds a item ID for any updated item data to the list of updated item IDs
   * @param value item ID for item data that admin edited
   */
   const updateItemIDs = (value: number) => {
    const storeItemIDs = [...itemIDs]
    storeItemIDs.push(value) // add new value to array
    setItemIDs(storeItemIDs) // Set the state with the updated array
  };

  /**
   * This function handles changes to inputs whenever user is editing the input fields in the request card for orders
   * @param e - the onChange event passed by the input field
   * @param index - the index of the request item the input field is in within the request items array
   */
  function handleOrderChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const { name, value } = e.target

    setOrders((prev) => {
      return prev.map((order, i) => {
        if (i !== index) return order
        return {
          ...order,
          [name]: value,
        }
      })
    })
  }

  // TODO:: add form validation to make sure input values follow requirements (no characters for numeric values, etc.)
  // use this as reference: https://react-bootstrap.netlify.app/docs/forms/validation/
  // TODO:: add editable field for otherExpenses for a request

  /**
   * This function handles saving the changes made to the request card
   */
  async function handleSave() {
    setEditable(false)
    try {
      const newDetails = {
        ...details, // copy the details object
        RequestItem: items, // replace the RequestItem array with the new inputs in each request item
      }
      const newOrders = orders

      for (let i = 0; i < newOrders.length; i++) 
      {
        const response = await axios.post('/api/orders', {
          // for now, using as if admin updates info on the website after ordering that day
          // TODO:: allow admin to set date ordered similar to request-form/index
          dateOrdered: new Date(), 
          orderNumber: newOrders[i].orderNumber,
          orderDetails: newOrders[i].orderDetails,
          trackingInfo: newOrders[i].trackingInfo,
          shippingCost: newOrders[i].shippingCost,
          requestID: details.requestID,
          netID: user.netID,
        })
        if (response.status === 201) {
          console.log(response.data) 
        }
      }
      let updatedItemArr = []

      for (let i = 0; i < newDetails.RequestItem.length; i++) {
        for (const id of itemIDs) {
          if (newDetails.RequestItem[i].itemID === id) {
            updatedItemArr.push(newDetails.RequestItem[i])
            console.log("updated item id: ", newDetails.RequestItem[i].itemID)
          }
        }
      }

      // only sending updated items and the edited data types to API
      const itemsToSend = updatedItemArr.map((item) => {
        return {
          itemID: item.itemID,
          description: item.description,
          url: item.url,
          partNumber: item.partNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vendorName: item.vendorName
        }
      })
      const response = await axios.post('/api/request-form/update', {
        projectID: project.projectID,
        requestID: details.requestID,
        items: itemsToSend,
        totalExpenses: calculateTotalCost(),
      })
      if (response.status === 200) {
        console.log(response.data)
      }
      setOrderTotal(calculateTotalCost())
      onSave() // used to update project data after edits
      setItemIDs([]) // reset list to none edited once done
    } catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.error(error.message)
      else console.log(error)
    }
  }

  return (
    <Row className='mb-4'>
      <Col>
        <Card style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body>
            {/* UNCOLLAPSED ROW */}
            <Row className='smaller-row'>
              {/* REQUEST NUMBER */}
              <Col xs={12} lg={3}>
                <Card.Title>
                  <h4 className={styles.headingLabel}>
                    Request #{details.requestID}
                  </h4>
                </Card.Title>
              </Col>

              {/* DATE REQUESTED */}
              <Col xs={6} lg={2}>
                <h6 className={styles.headingLabel}>Date Requested</h6>
                <p>
                  {new Date(details.dateSubmitted).toLocaleDateString(
                    undefined,
                    {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </p>
              </Col>

              {/* DATE NEEDED */}
              <Col xs={6} lg={2}>
                <h6 className={styles.headingLabel}>Date Needed</h6>
                <p>
                  {new Date(details.dateNeeded).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </Col>

              {/* ORDER SUBTOTAL */}
              <Col xs={6} lg={2}>
                <h6 className={styles.headingLabel}>Order Subtotal</h6>
                <p>
                  $
                  {orderTotal.toFixed(4)}
                </p>
              </Col>

              {/* STATUS */}
              <Col xs={6} lg={3}>
                <h6 className={styles.headingLabel}>Status</h6>
                <p>{details.Process[0].status}</p>
              </Col>
            </Row>

            {/* COLLAPSED ROW */}
            <Collapse in={collapse}>
              <div>
                <Row className='my-4 smaller-row'>
                  {/* JUSTIFICATION ADDITIONAL INFO */}
                  <Col xs={12} lg={3}>
                    <h6 className={styles.headingLabel}>Additional info:</h6>
                    <p>
                      {!details.additionalInfo
                        ? 'none'
                        : details.additionalInfo}
                    </p>
                    <h6 className={styles.headingLabel}>Sponsor:</h6>
                    <p>{details.project.sponsorCompany}</p>
                  </Col>

                  {/* REQUESTED BY/APPROVED BY */}
                  <Col xs={12} lg={4}>
                    <h6 className={styles.headingLabel}>Requested by:</h6>
                    <p>{studentThatRequested?.email}</p>

                    <h6 className={styles.headingLabel}>Approved by:</h6>
                    <p>{mentorThatApproved?.email}</p>
                  </Col>

                  {/* REJECT/EDIT BUTTONS */}
                  <Col xs={12} lg={5}>
                    <Button
                      className={`${styles.cardBtn} ${styles.rejectBtn}`}
                      variant='danger'
                      style={{ minWidth: '150px', marginRight: '20px' }}
                      onClick={onReject}
                    >
                      Reject
                    </Button>{' '}
                    {!editable && (
                      <Button
                        className={`${styles.editBtn} ${styles.cardBtn}`}
                        variant='warning'
                        onClick={(e) => setEditable(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </Col>
                </Row>

                {/* REQUEST ITEMS */}
                <Row className='my-2'>
                  <Form className={styles.requestDetails}>
                    <fieldset disabled={!editable}>
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
                            <th>Order #</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, itemIndex) => {
                            return (
                              <tr key={itemIndex}>
                                <td width={20}>{itemIndex + 1}</td>
                                <td>
                                  <Form.Control
                                    name='description'
                                    value={item.description}
                                    onChange={(e) =>
                                      handleItemChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        itemIndex
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    name='vendorName'
                                    value={item.vendorName}
                                    onChange={(e) =>
                                      handleItemChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        itemIndex
                                      )
                                    }
                                  />
                                </td>
                                <td style={{ position: 'relative', paddingRight: '40px' }}>
                                  {editable ? (
                                    <Form.Control
                                      name='itemURL'
                                      value={item.url}
                                      onChange={(e) =>
                                        handleItemChange(
                                          e as React.ChangeEvent<HTMLInputElement>,
                                          itemIndex
                                        )
                                      }
                                      style={{ paddingLeft: '20px' }}
                                    />
                                  ) : (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)', textDecoration: 'none' }}>Open</a>
                                  )}
                                </td>
                                <td>
                                  <Form.Control
                                    name='partNumber'
                                    value={item.partNumber}
                                    onChange={(e) =>
                                      handleItemChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        itemIndex
                                      )
                                    }
                                  />
                                </td>
                                <td width={70}>
                                  <Form.Control
                                    name='quantity'
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleItemChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        itemIndex
                                      )
                                    }
                                  />
                                </td>
                                <td width={90}>
                                  <Form.Control
                                    name='unitPrice'
                                    value={item.unitPrice.toString()}
                                    onChange={(e) =>
                                      handleItemChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        itemIndex
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <InputGroup>
                                    <InputGroup.Text>$</InputGroup.Text>
                                    <Form.Control
                                      value={(
                                        item.quantity * (item.unitPrice as any)
                                      ).toFixed(4)}
                                      disabled
                                    />
                                  </InputGroup>
                                </td>
                                <td>
                                  <Form.Control />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </Table>
                      
                      {/* ORDERS (based on number of vendors) */}
                      <Table responsive striped>
                        <thead>
                          <tr>
                            <th>Order #</th>
                            <th>Tracking Info</th>
                            <th>Order Details</th>
                            <th>Shipping Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, orderIndex) => {
                            return (
                              <tr key={orderIndex}>
                              <td>
                                <Form.Control
                                  name='orderNumber'
                                  value={order.orderNumber}
                                  onChange={(e) => handleOrderChange(
                                    e as React.ChangeEvent<HTMLInputElement>,
                                    orderIndex
                                  )}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  name='trackingInfo'
                                  value={order.trackingInfo}
                                  onChange={(e) => handleOrderChange(
                                    e as React.ChangeEvent<HTMLInputElement>,
                                    orderIndex
                                  )}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  name='orderDetails'
                                  value={order.orderDetails}
                                  onChange={(e) => handleOrderChange(
                                    e as React.ChangeEvent<HTMLInputElement>,
                                    orderIndex
                                  )}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  name='shippingCost'
                                  value={Number(order.shippingCost)}
                                  onChange={(e) => handleOrderChange(
                                    e as React.ChangeEvent<HTMLInputElement>,
                                    orderIndex
                                  )}
                                />
                              </td>
                            </tr>
                            )
                          })}
                        </tbody>
                      </Table>
                    </fieldset>
                    <Row>
                      <Col xs={12} className='d-flex justify-content-end'>
                        {editable && (
                          <Button
                            className={styles.cardBtn}
                            variant='success'
                            onClick={(e) => handleSave()}
                          >
                            Save
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Form>
                </Row>
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default AdminRequestCard
