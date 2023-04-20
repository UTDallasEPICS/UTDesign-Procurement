import React, { useState, ChangeEvent, FormEvent } from "react";
import styles from "../../styles/request.module.css";

const StudentRequest = () => {
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [expenseJustification, setExpenseJustification] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemLink, setItemLink] = useState("");

  const handleVendorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVendor(e.target.value);
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handlePartNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPartNumber(e.target.value);
  };

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };

  const handleUnitCostChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUnitCost(e.target.value);
  };

  const handleTotalCostChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalCost(e.target.value);
  };

   const handleExpenseJustificationChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setExpenseJustification(e.target.value);
  };

  const handleAdditionalInfoChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInfo(e.target.value);
  };

  const handleItemDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItemDescription(e.target.value);
  };

  const handleItemLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItemLink(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted!");
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.requestForm}>Request Form</h1>
      </div>
      <div className={styles.budgetInfo}>
        <div className={styles.budget}>
          Budget: <span>$10,000</span>
        </div>
        <div className={styles.remaining}>
          Remaining: <span>$5,000</span>
        </div>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
  <div>
    <label className={styles.vendor} htmlFor="vendor">
      Vendor
    </label>
    <input
      className={styles.vendorField}
      type="text"
      id="vendor"
      value={vendor}
      onChange={handleVendorChange}
    />
  </div>

  <div>
    <label className={styles.date} htmlFor="date">
      Date Needed
    </label>
    <input
      className={styles.dateField}
      type="date"
      id="date"
      value={date}
      onChange={handleDateChange}
    />
  </div>
</div>


        <label className={styles.partNum} htmlFor="partNumber">
          Part Number
        </label>
        <input
          className={styles.partnumField}
          type="text"
          id="partNumber"
          value={partNumber}
          onChange={handlePartNumberChange}
        />

        <label className={styles.quantity} htmlFor="quantity">
          Quantity
        </label>
        <input
          className={styles.quantityField}
          type="number"
          id="quantity"
          value={quantity}
          onChange={handleQuantityChange}
        />

        <label className={styles.unitCost} htmlFor="unitCost">
          Unit Cost
        </label>
        <input
          className={styles.unitcostField}
          type="number"
          step="0.01"
          id="unitCost"
          value={unitCost}
          onChange={handleUnitCostChange}
        />

        <label className={styles.totalCost} htmlFor="totalCost">
          Total Cost
        </label>
        <input
          className={styles.totalcostField}
          type="number"
          step="0.01"
          id="totalCost"
          value={totalCost}
          onChange={handleTotalCostChange}
        />
         <label className={styles.expenseJustification} htmlFor="expenseJustification">
          Expense Justification
        </label>
        <textarea
          className={styles.expenseField}
          id="expenseJustification"
          value={expenseJustification}
          onChange={handleExpenseJustificationChange}
        ></textarea>

        <label className={styles.additionalInfo} htmlFor="additionalInfo">
          Additional Information
        </label>
        <textarea
          className={styles.additionalinfoField}
          id="additionalInfo"
          value={additionalInfo}
          onChange={handleAdditionalInfoChange}
        ></textarea>

        <label className={styles.itemDescription} htmlFor="itemDescription">
          Item Description
        </label>
        <input
          className={styles.itemdescriptionField}
          type="text"
          id="itemDescription"
          value={itemDescription}
          onChange={handleItemDescriptionChange}
        />

        <label className={styles.itemLink} htmlFor="itemLink">
          Item Link
        </label>
        <input
          className={styles.itemlinkField}
          type="text"
          id="itemLink"
          value={itemLink}
          onChange={handleItemLinkChange}
        />

        <label className={styles.supportingDocs} htmlFor="supportingDocs">
          Supporting Documents
        </label>
        <input
          className={styles.supportingdocsField}
          type="file"
          id="supportingDocs"
        />
                <button className={styles.submitButton} type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default StudentRequest;
