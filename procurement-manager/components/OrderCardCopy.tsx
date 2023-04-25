import React from 'react';
import { Card } from 'react-bootstrap';
//import './OrderCard.css';

type OrderCard = {
    orderNumber: number;
    dateOrdered: string;
    orderSubtotal: number;
    shippingCost: number;
    orderTotal: number;
    orderStatus: string;
    key: number;
  }

const OrderCard: React.FC<OrderCard> = ({
  orderNumber,
  dateOrdered,
  orderTotal,
  orderStatus,
  shippingCost,
  orderSubtotal,
  key,
}) => {
  return (
    <Card className='order-card' key={key}>
      <Card.Body>
        <Card.Title>Order {orderNumber}</Card.Title>
        <Card.Subtitle>{dateOrdered}</Card.Subtitle>
        <Card.Text>
          <div className='order-details'>
            <div className='order-detail'>
              <span>Order Total:</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
            <div className='order-detail'>
              <span>Status:</span>
              <span>{orderStatus}</span>
            </div>
            <div className='order-detail'>
              <span>Shipping Cost:</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className='order-detail'>
              <span>Order Subtotal:</span>
              <span>${orderSubtotal.toFixed(2)}</span>
            </div>
          </div>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default OrderCard;

