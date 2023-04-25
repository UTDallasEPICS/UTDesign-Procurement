
import React, { useState } from 'react';
import styles from '../../styles/request.module.css'

interface Props {
  onSubmit: (formData: any) => void;
  budget?: number;
  remaining?: number;
}

const RequestForm: React.FC<Props> = ({ onSubmit, budget = 0, remaining = 0 }) => {
  const [items, setItems] = useState([{ id: 1 }]);

  const handleAddItem = () => {
    const newId = items[items.length - 1].id + 1;
    setItems([...items, { id: newId }]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <div>
      <div className={styles.budget}>
        <label htmlFor="budget">Budget:</label> ${budget.toFixed(2)}<br />
        <label htmlFor="remaining">Remaining:</label> ${remaining.toFixed(2)}
      </div>
      <h2>Request Form</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="vendor-name">Vendor Name</label>
        <input type="text" id="vendor-name" name="vendor-name" required />

        <label htmlFor="date-needed">Date Needed</label>
        <input type="date" id="date-needed" name="date-needed" required />

        <label htmlFor="expense-justification">Expense Justification</label>
        <textarea id="expense-justification" name="expense-justification" required />

        <label htmlFor="additional-information">Additional Information</label>
        <textarea id="additional-information" name="additional-information" />

        {items.map((item) => (
          <div key={item.id}>
            <label htmlFor={`item-${item.id}-description`}>Item Description</label>
            <input type="text" id={`item-${item.id}-description`} name={`item-${item.id}-description`} required />

            <label htmlFor={`item-${item.id}-link`}>Item Link</label>
            <input type="url" id={`item-${item.id}-link`} name={`item-${item.id}-link`} required />

            <label htmlFor={`item-${item.id}-part-number`}>Part Number</label>
            <input type="text" id={`item-${item.id}-part-number`} name={`item-${item.id}-part-number`} required />

            <label htmlFor={`item-${item.id}-quantity`}>Quantity</label>
            <input type="number" id={`item-${item.id}-quantity`} name={`item-${item.id}-quantity`} required />

            <label htmlFor={`item-${item.id}-unit-cost`}>Unit Cost</label>
            <input type="number" id={`item-${item.id}-unit-cost`} name={`item-${item.id}-unit-cost`} required />

            <label htmlFor={`item-${item.id}-total-cost`}>Total Cost</label>
            <input type="number" id={`item-${item.id}-total-cost`} name={`item-${item.id}-total-cost`} required />

            <label htmlFor={`item-${item.id}-supporting-documents`}>Supporting Documents</label> 
            <input type="file" id={`item-${item.id}-supporting-documents`} name={`item-${item.id}-supporting-documents`} multiple />
            {item.id === items.length && (
              <button type="button" onClick={handleAddItem}>
                Add Item
              </button>

        )}
      </div>
    ))}

    <button type="submit">Submit</button>
  </form>
</div>
  )
    }

    export default RequestForm;

  
