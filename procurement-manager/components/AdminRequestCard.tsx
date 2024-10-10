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
import {
  Prisma,
  User,
  Project,
  Vendor,
  Order,
  RequestItem,
} from '@prisma/client'
import axios from 'axios'
import { json } from 'stream/consumers'
interface AdminRequestCardProps {
  user: User
  project: Project
  details: RequestDetails
  onReject: () => void
  onAccept: () => void
  onSave: () => void
  collapsed: boolean
}
const AdminRequestCard: React.FC<AdminRequestCardProps> = ({
  user,
  project,
  details,
  onReject,
  onAccept,
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

  // state for tracking the unique order #s for orders that have been deleted
  const [deletedOrderNumbers, setDeletedOrderNumbers] = useState<number[]>([])

  // state that contains the values of the fields for each order
  // TODO:: implement add/delete orders feature similar to add/delete items feature for request-form/index.ts
  const [orders, setOrders] = useState<
    {
      orderNumber: string
      trackingInfo: string
      orderDetails: string
      shippingCost: Prisma.Decimal
      dateOrdered: string
    }[]
  >([])
  // state to track the new orders for the add/delete button
  const [newOrders, setNewOrders] = useState<
    {
      orderNumber: string
      trackingInfo: string
      orderDetails: string
      shippingCost: Prisma.Decimal
      dateOrdered: string
    }[]
  >([])
  // state to track the new items for the add/delete button
  const [newItems, setNewItems] = useState<
    {
      itemID: number
      description: string
      vendorName: string
      url: string
      partNumber: string
      quantity: number
      unitPrice: Prisma.Decimal
    }[]
  >([])
  // state that contains the values of the input fields for request items in the request card
  // TODO:: implement add/delete items feature similar to add/delete items feature for request-form/index.ts
  const [items, setItems] = useState(
    // initialized by the details prop
    details.RequestItem.map((item, itemIndex) => {
      return {
        vendorName: '',
        ...item,
      }
    }),
  )
  // state for tracking the unique item IDs for items that were updated
  const [itemIDs, setItemIDs] = useState<number[]>([])
  /**
   * this function calculates the total cost for all items in a request
   * @returns Prisma Decimal value for total request expenses
   */
  const calculateTotalCost = (): Prisma.Decimal => {
    let totalCost = 0
    items.forEach((item) => {
      totalCost += Number(item.unitPrice) * item.quantity
    })
    orders.forEach((order) => {
      totalCost += Number(order.shippingCost) // added cost of orders as well
    })
    return new Prisma.Decimal(totalCost)
  }
  const [orderTotal, setOrderTotal] =
    useState<Prisma.Decimal>(calculateTotalCost())
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
          vendorName:
            vendors.length > itemIndex ? vendors[itemIndex].vendorName : '',
          ...item,
        }
      }),
    )
  }, [vendors])
  useEffect(() => {
    setOrders(
      reqOrders.length !== 0
        ? reqOrders.map((reqOrder, reqOrderIndex) => {
            return {
              orderNumber: reqOrder.orderNumber,
              trackingInfo: reqOrder.trackingInfo,
              orderDetails: reqOrder.orderDetails,
              shippingCost: reqOrder.shippingCost,
              dateOrdered:
                reqOrder.dateOrdered instanceof Date
                  ? reqOrder.dateOrdered.toISOString()
                  : reqOrder.dateOrdered,
            }
          })
        : [],
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
    try {
      const response = await axios.get('/api/vendor/get/requestVendors/', {
        params: {
          requestID: details.requestID,
        },
      })
      if (response.status === 200) {
        const vendorArr: Vendor[] = response.data.vendors
        setVendors(vendorArr)
      }
    } catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.log(error.message)
      else console.log(error)
    }
  }
  /**
   * this function is used to retrieve the orders associated with request
   */
  async function getOrders() {
    try {
      const response = await axios.get('/api/orders/get/requestOrders/', {
        params: { requestID: details.requestID },
      })
      if (response.status === 200) {
        console.log('Orders fetched:', response.data.orders)
        setReqOrders(response.data.orders) // Directly setting without adding to previous state
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }
  /**
   * This function handles changes to inputs whenever user is editing the input fields in the request card for request item
   * @param e - the onChange event passed by the input field
   * @param index - the index of the request item the input field is in within the request items array
   */
  function handleItemChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    const { name, value } = e.target
    if (index < items.length) {
      setItems((prev) => {
        return prev.map((item, i) => {
          if (i !== index) return item
          updateItemIDs(item.itemID)
          return {
            ...item,
            [name]: value,
          }
        })
      })
    } else {
      setNewItems((prev) => {
        return prev.map((item, i) => {
          if (i !== index - items.length) return item
          return {
            ...item,
            [name]: value,
          }
        })
      })
    }
  }
  //Handles adding new items to the newItems state
  const handleAddItem = () => {
    setNewItems([
      ...newItems,
      {
        itemID: -1,
        description: '',
        vendorName: '',
        url: '',
        partNumber: '',
        quantity: 0,
        unitPrice: new Prisma.Decimal(0),
      },
    ])
  }
  //Handles deleting items
  const handleDeleteItem = (index: number) => {
    if (index < items.length) {
      setItems((prevItems) => prevItems.filter((_, i) => i !== index))
    } else {
      setNewItems((prevNewItems) =>
        prevNewItems.filter((_, i) => i !== index - items.length),
      )
    }
  }
  /**
   * This function handles changes to inputs whenever user is editing the input fields in the request card for orders
   * @param e - the onChange event passed by the input field
   * @param index - the index of the request item the input field is in within the request items array
   */
  function handleOrderChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    const { name, value } = e.target
    const updatedValue =
      name === 'dateOrdered' ? new Date(value).toISOString() : value
    // Update the local state with the new order details
    setOrders((prevOrders) =>
      prevOrders.map((order, i) =>
        i === index ? { ...order, [name]: updatedValue } : order,
      ),
    )
  }
  //Handles deleting orders
  const handleDeleteOrder = async (index: number, deletedItem: number) => {
    if (index < orders.length) {
      setOrders((prevOrders) => prevOrders.filter((_, i) => i !== index))
    } else {
      setNewOrders((prevNewOrders) =>
        prevNewOrders.filter((_, i) => i !== index - orders.length),
      )
    }
    try {
      const response = await axios.delete(`/api/orders/delete`, {
        data: { orderNumber: deletedItem },
      })
      if (response.status === 200) {
        console.log('Order deleted:', response.data)
        // Update state or perform any necessary actions after successful deletion
      }
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
    setDeletedOrderNumbers((prevDeletedOrderNumbers) => [
      ...prevDeletedOrderNumbers,
      deletedItem,
    ])
  }
  //Handles adding new items to the newItems state
  const handleAddOrders = () => {
    setOrders([
      ...orders,
      {
        orderNumber: '',
        trackingInfo: '',
        orderDetails: '',
        shippingCost: new Prisma.Decimal(0),
        dateOrdered: '',
      },
    ])
  }
  /**
   * this function adds a item ID for any updated item data to the list of updated item IDs
   * @param value item ID for item data that admin edited
   */
  const updateItemIDs = (value: number) => {
    const storeItemIDs = [...itemIDs]
    storeItemIDs.push(value) // add new value to array
    setItemIDs(storeItemIDs) // Set the state with the updated array
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
        RequestItem: newItems, // replace the RequestItem array with the new inputs in each request item
      }
      const newOrders = orders
      const oldOrderDetails = await axios.get(
        '/api/orders/get/requestOrders/',
        {
          params: { requestID: details.requestID },
        },
      )
      if (oldOrderDetails.status === 200) {
        const oldOrders = oldOrderDetails.data.orders
        // Get the orderNumbers of old orders
        const oldOrderNumbers = new Set(
          oldOrders.map((order: any) => order.orderNumber),
        )
        //check the order is exist to update
        const orderChanged =
          oldOrders.length === newOrders.length &&
          JSON.stringify(newOrders) !== JSON.stringify(oldOrders)

        if (orderChanged) {
          for (let i = 0; i < newOrders.length; i++) {
            try {
              const response = await axios.put('/api/orders/update', {
                dateOrdered: new Date(newOrders[i].dateOrdered),
                orderNumber: newOrders[i].orderNumber,
                orderDetails: newOrders[i].orderDetails,
                trackingInfo: newOrders[i].trackingInfo,
                shippingCost: newOrders[i].shippingCost,
                requestID: details.requestID,
                netID: user.netID,
              })
              if (response.status === 201) {
                console.log('Order updated:', response.data)
              }
            } catch (error) {
              console.error('Failed to insert order:', error)
            }
          }
        }
        let newOrdersToInsert: any[] = []
        // Filter newOrders to get only the orders that are not present in oldOrders
        for (const order of newOrders) {
          // Check if the order number is not included in oldOrderNumbers
          if (!oldOrderNumbers.has(order.orderNumber)) {
            newOrdersToInsert.push(order)
          }
        }
        // Insert new orders to the API
        for (let i = 0; i < newOrdersToInsert.length; i++) {
          try {
            const response = await axios.post('/api/orders', {
              dateOrdered: new Date(newOrdersToInsert[i].dateOrdered),
              orderNumber: newOrdersToInsert[i].orderNumber,
              orderDetails: newOrdersToInsert[i].orderDetails,
              trackingInfo: newOrdersToInsert[i].trackingInfo,
              shippingCost: newOrdersToInsert[i].shippingCost,
              requestID: details.requestID,
              netID: user.netID,
            })
            if (response.status === 201) {
              console.log('New order inserted:', response.data)
            }
          } catch (error) {
            console.error('Failed to insert order:', error)
          }
        }
      }
      let updatedItemArr = []
      for (let i = 0; i < newDetails.RequestItem.length; i++) {
        // for (const id of itemIDs) {
        // if (newDetails.RequestItem[i].itemID === id) {
        updatedItemArr.push(newDetails.RequestItem[i])
        // }
        // }
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
          vendorName: item.vendorName,
        }
      })
      const response = await axios.post('/api/request-form/update', {
        projectID: project.projectID,
        requestID: details.requestID,
        items: itemsToSend,
        totalExpenses: calculateTotalCost(),
      })
      const response2 = await axios.get('/api/items')
      if (response2) {
        console.log('Hello Data', response2.data)
      }
      if (response.status === 200) {
        console.log('Hello Data', response.data)
      }
      setOrderTotal(calculateTotalCost())
      onSave() // used to update project data after edits
      setItemIDs([]) // reset list to none edited once done
    } catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.error('Hello', error.message)
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
                    },
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
                <p>${orderTotal.toFixed(4)}</p>
              </Col>
              {/* STATUS */}
              <Col xs={6} lg={3}>
                <h6 className={styles.headingLabel}>Status</h6>
                <p>{details.Process[0].status}</p>
              </Col>
            </Row>
            {/* COLLAPSED ROW */}
            <div>
              <Row className='my-4 smaller-row'>
                {/* JUSTIFICATION ADDITIONAL INFO */}
                <Col xs={12} lg={3}>
                  <h6 className={styles.headingLabel}>Additional info:</h6>
                  <p>
                    {!details.additionalInfo ? 'none' : details.additionalInfo}
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
                    variant='success'
                    style={{ minWidth: '150px', marginRight: '20px' }}
                    onClick={onAccept}
                  >
                    Accept
                  </Button>
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
                          <th> </th>
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
                                      itemIndex,
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
                                      itemIndex,
                                    )
                                  }
                                />
                              </td>
                              <td
                                style={{
                                  position: 'relative',
                                  paddingRight: '40px',
                                }}
                              >
                                {editable ? (
                                  <Form.Control
                                    name='url'
                                    value={item.url}
                                    onChange={(e) =>
                                      handleItemChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        itemIndex,
                                      )
                                    }
                                    style={{ paddingLeft: '20px' }}
                                  />
                                ) : (
                                  <a
                                    href={item.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    style={{
                                      position: 'absolute',
                                      top: '50%',
                                      right: '5px',
                                      transform: 'translateY(-50%)',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    Open
                                  </a>
                                )}
                              </td>
                              <td>
                                <Form.Control
                                  name='partNumber'
                                  value={item.partNumber}
                                  onChange={(e) =>
                                    handleItemChange(
                                      e as React.ChangeEvent<HTMLInputElement>,
                                      itemIndex,
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
                                      itemIndex,
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
                                      itemIndex,
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
                                <Form.Control disabled />
                              </td>
                              <td>
                                <Button
                                  className={styles.cardBtn}
                                  variant='danger'
                                  onClick={() => handleDeleteItem(itemIndex)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                        {newItems.map((item, itemIndex) => {
                          return (
                            <tr key={itemIndex + items.length}>
                              <td width={20}>{itemIndex + items.length + 1}</td>
                              <td>
                                <Form.Control
                                  name='description'
                                  value={item.description}
                                  onChange={(e) =>
                                    handleItemChange(
                                      e as React.ChangeEvent<HTMLInputElement>,
                                      itemIndex + items.length,
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
                                      itemIndex + items.length,
                                    )
                                  }
                                />
                              </td>
                              <td
                                style={{
                                  position: 'relative',
                                  paddingRight: '40px',
                                }}
                              >
                                {editable ? (
                                  <Form.Control
                                    name='url'
                                    value={item.url}
                                    onChange={(e) =>
                                      handleItemChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        itemIndex + items.length,
                                      )
                                    }
                                    style={{ paddingLeft: '20px' }}
                                  />
                                ) : (
                                  <a
                                    href={item.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    style={{
                                      position: 'absolute',
                                      top: '50%',
                                      right: '5px',
                                      transform: 'translateY(-50%)',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    Open
                                  </a>
                                )}
                              </td>
                              <td>
                                <Form.Control
                                  name='partNumber'
                                  value={item.partNumber}
                                  onChange={(e) =>
                                    handleItemChange(
                                      e as React.ChangeEvent<HTMLInputElement>,
                                      itemIndex + items.length,
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
                                      itemIndex + items.length,
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
                                      itemIndex + items.length,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <InputGroup>
                                  <InputGroup.Text>$</InputGroup.Text>
                                  <Form.Control
                                    value={(
                                      item.quantity * Number(item.unitPrice)
                                    ).toFixed(4)}
                                    disabled
                                  />
                                </InputGroup>
                              </td>
                              <td>
                                <Form.Control disabled />
                              </td>
                              <td>
                                <Button
                                  className={styles.cardBtn}
                                  variant='danger'
                                  onClick={() =>
                                    handleDeleteItem(itemIndex + items.length)
                                  }
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                    <Row>
                      <Col xs={12} className='d-flex justify-content-end'>
                        {editable && (
                          <Button
                            className={styles.cardBtn}
                            variant='success'
                            onClick={handleAddItem}
                          >
                            Add Item
                          </Button>
                        )}
                      </Col>
                    </Row>
                    {/* ORDERS (based on number of vendors) */}
                    {Boolean(orders.length > 0) && (
                      <Table responsive striped>
                        <thead>
                          <tr>
                            <th>Order #</th>
                            <th>Tracking Info</th>
                            <th>Order Details</th>
                            <th>Shipping Cost</th>
                            <th>Date Ordered</th>
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
                                    onChange={(e) =>
                                      handleOrderChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        orderIndex,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    name='trackingInfo'
                                    value={order.trackingInfo}
                                    onChange={(e) =>
                                      handleOrderChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        orderIndex,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    name='orderDetails'
                                    value={order.orderDetails}
                                    onChange={(e) =>
                                      handleOrderChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        orderIndex,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    name='shippingCost'
                                    value={Number(order.shippingCost)}
                                    onChange={(e) =>
                                      handleOrderChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        orderIndex,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    name='dateOrdered'
                                    type='date'
                                    value={
                                      order.dateOrdered
                                        ? new Date(order.dateOrdered)
                                            .toISOString()
                                            .split('T')[0]
                                        : ''
                                    }
                                    onChange={(e) =>
                                      handleOrderChange(
                                        e as React.ChangeEvent<HTMLInputElement>,
                                        orderIndex,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Button
                                    className={styles.cardBtn}
                                    variant='danger'
                                    onClick={() =>
                                      handleDeleteOrder(
                                        orderIndex,
                                        parseInt(order.orderNumber),
                                      )
                                    }
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </Table>
                    )}
                  </fieldset>
                  <Row>
                    <Col xs={12} className='d-flex justify-content-end'>
                      {editable && (
                        <Row>
                          <Col>
                            <Button
                              className={styles.cardBtn}
                              variant='success'
                              onClick={handleAddOrders}
                            >
                              Add Order
                            </Button>
                            &nbsp;
                            <Button
                              className={styles.cardBtn}
                              variant='success'
                              onClick={(e) => handleSave()}
                            >
                              Save
                            </Button>
                          </Col>
                        </Row>
                      )}
                    </Col>
                  </Row>
                </Form>
              </Row>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default AdminRequestCard
function newDetails(arg0: string, newDetails: any) {
  throw new Error('Function not implemented.')
}
