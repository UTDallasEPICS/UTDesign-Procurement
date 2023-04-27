import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, InputGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import 'bootstrap/dist/css/bootstrap.min.css';


import styles from "../../styles/request.module.css";

const StudentRequest = () => {
  // State and handlers
  const [date, setDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(5000);
  const [items, setItems] = useState([
    {
      sequence: 1,
      vendor: "",
      description: "",
      link: "",
      partNumber: "",
      quantity: "",
      unitCost: "",
      totalCost: "",
    },
  ]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
  setRemainingBudget(5000 - calculateTotalCost());
}, [items]);


  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleAdditionalInfoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setAdditionalInfo(e.target.value);
  };

  const calculateTotalCost = () => {
  let totalCost = 0;
  items.forEach(item => {
    totalCost += (parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 0);
  });
  return totalCost;
};


  const handleAddItem = () => {
    setItems([
      ...items,
      {
        sequence: items.length + 1,
        vendor: "",
        description: "",
        link: "",
        partNumber: "",
        quantity: "",
        unitCost: "",
        totalCost: "",
      },
    ]);
  };

  const handleItemChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  index: number,
  field:
    | "vendor"
    | "description"
    | "link"
    | "partNumber"
    | "quantity"
    | "unitCost"
) => {
  const newItems = [...items];
  newItems[index][field] = e.target.value;

  if (field === "quantity" || field === "unitCost") {
    const quantity = parseFloat(newItems[index].quantity);
    const unitCost = parseFloat(newItems[index].unitCost);

    if (!isNaN(quantity) && !isNaN(unitCost)) {
      newItems[index].totalCost = (quantity * unitCost).toFixed(2);
    } else {
      newItems[index].totalCost = "";
    }
  }

  setItems(newItems);
};





  const calculateTotalCosts = () => {
    const newItems = items.map((item) => ({
      ...item,
      totalCost: item.quantity && item.unitCost
        ? (Number(item.quantity) * Number(item.unitCost)).toFixed(2)
        : "",
    }));
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Process form data and submit
    console.log("Submit:", { date, additionalInfo, items, selectedFiles });
  };

  return (
    <Container className={styles.container}>
      <div className={styles.titleContainer}>
        <h1 className={styles.requestForm}>Request Form</h1>
      </div>
      <div className={styles.greenBar}></div>
      <Row className={"text-center mb-4"}>
        <Col>
          <p>
            <strong>Budget:</strong> <span>$10,000</span>
          </p>
        </Col>
        <Col>
  <p>
    <strong>Remaining:</strong> <span>${remainingBudget}</span>
  </p>
</Col>

      </Row>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={4}>
            <Form.Group controlId="date">
              <Form.Label>
                <strong>Date Needed</strong>
              </Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={handleDateChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group controlId="additionalInfo">
              <Form.Label>
                <strong>Additional Information</strong>
              </Form.Label>
              <Form.Control                as="textarea"
                rows={3}
                value={additionalInfo}
                onChange={handleAdditionalInfoChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {items.map((item, index) => (
          <div key={index} className={styles.itemSection}>
            <Row>
              <Col md={1}>
                <Form.Group controlId={`item${index}Sequence`}>
                  <Form.Label>
                    <strong>Seq. #</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.sequence}
                    readOnly
                    className={styles.sequenceNumberInput}
                  />
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group controlId={`item${index}Vendor`}>
                  <Form.Label>
                    <strong>Vendor</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.vendor}
                    onChange={(e) =>
                      handleItemChange(e, index, "vendor")
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId={`item${index}Description`}>
                  <Form.Label>
                    <strong>Description</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(e, index, "description")
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`item${index}Link`}>
                  <Form.Label>
                    <strong>Item Link</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.link}
                    onChange={(e) =>
                      handleItemChange(e, index, "link")
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId={`item${index}PartNumber`}>
                  <Form.Label>
                    <strong>Part Number</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.partNumber}
                    onChange={(e) =>
                      handleItemChange(e, index, "partNumber")
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group controlId={`item${index}Quantity`}>
                  <Form.Label>
                    <strong>Qty.</strong>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(e, index, "quantity")
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group controlId={`item${index}UnitCost`}>
                  <Form.Label>
                    <strong>Unit Cost</strong>
                  </Form.Label>
                  <InputGroup className={`${styles.unitcostField} ${styles.customInputGroup}`}>
  <InputGroup.Text className={styles.inputGroupText}>$</InputGroup.Text>
  <Form.Control
    type="number"
    step="0.01"
    value={item.unitCost}
    onChange={(e) => handleItemChange(e, index, "unitCost")}
    className={`${styles.costInputField}`}
    required
  />
</InputGroup>

                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group controlId={`item${index}TotalCost`}>
                  <Form.Label>
                    <strong>Total</strong>
                  </Form.Label>
                  <InputGroup className={`${styles.unitcostField} ${styles.customInputGroup}`}>
  <InputGroup.Text className={styles.inputGroupText}>$</InputGroup.Text>
  <Form.Control
    type="text"
    value={item.totalCost === "" ? "" : parseFloat(item.totalCost).toFixed(2)}
    readOnly
    className={`${styles.costInputField}`}
  />
</InputGroup>

                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}

        <Button variant="primary" type="button" onClick={handleAddItem}>
          Add another item
        </Button>
        <Form.Group controlId="fileUpload">
          <Form.Label>
            <strong>Supporting Documents</strong>
          </Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={(e) => setSelectedFiles((e.target as HTMLInputElement).files)}
          />
        </Form.Group>
        <Button variant="success" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default StudentRequest;    


