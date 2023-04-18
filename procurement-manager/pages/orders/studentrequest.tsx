import React from 'react';

export default function StudentRequest() {
  return (
    <>
      <form>
        <div className="rectangle-1"></div>
        <div className="request-form">Request Form</div>
        <div className="budget">Budget:</div>
        <div className="remaining">Remaining:</div>
        <div className="vendor">Vendor</div>
        <input type="text" className="vendor-field" id="vendor-field" name="vendor-field" />
        <div className="date">Date</div>
        <input type="text" className="date-field" id="date-field" name="date-field"  />
        <div className="expense-justification">Expense Justification</div>
        <input type="text" className="expense-field" id="expense-field" name="expense-field" />
        <div className="additional-info">Additional Information</div>
        <input type="text" className="additionalinfo-field" id="additionalinfo-field" name="additionalinfo-field" />
        <div className="item-description">Item Description</div>
        <input type="text" className="itemdescription-field" id="itemdescription-field" name="itemdescription-field"/>
        <div className="item-link">Item Link</div>
        <input type="text" className="itemlink-field" id="itemlink-field" name="itemdescription-field" />
        <div className="part-num">Part Number</div>
        <input type="text" className="partnum-field" id="partnum-field" name="partnum-field" />
        <div className="quantity">Quantity</div>
        <input type="text" className="quantity-field" id="quantity-field" name="quantity-field" />
        <div className="unit-cost">Unit Cost</div>
        <input type="text" className="unitcost-field" id="unitcost-field" name="unitcost-field"  />
        <div className="total-cost">Total Cost</div>
        <input type="text" className="totalcost-field" id="totalcost-field" name="totalcost-field" />
        <div className="supporting-docs">Supporting Documents</div>
        <div className="submit-box">
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
      <div className="add-item">
        <button type="button" className="btn btn-success">Add Item</button>
      </div>
    </>
  );
}