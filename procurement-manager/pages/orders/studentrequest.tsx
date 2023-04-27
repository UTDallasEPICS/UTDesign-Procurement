import React, { useState, ChangeEvent, FormEvent } from 'react'
import styles from '@/styles/request.module.css'

const initialItem = {
  vendor: '',
  itemDescription: '',
  itemLink: '',
  partNumber: '',
  quantity: '',
  unitCost: '',
  totalCost: '',
}

const StudentRequest = () => {
  const [date, setDate] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [items, setItems] = useState([{ ...initialItem }])

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value } = e.target
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    )
    setItems(updatedItems)
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleAdditionalInfoChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInfo(e.target.value)
  }

  const handleAddItem = () => {
    setItems([...items, { ...initialItem }])
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form submitted!')
  }

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

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
            <label className={styles.date} htmlFor='date'>
              Date Needed
            </label>
            <input
              className={styles.dateField}
              type='date'
              id='date'
              value={date}
              onChange={handleDateChange}
              required
            />
          </div>
          <div className={styles.textareaWrapper}>
            <label className={styles.additionalInfo} htmlFor='additionalInfo'>
              Additional Information
            </label>
            <textarea
              className={styles.additionalinfoField}
              id='additionalInfo'
              value={additionalInfo}
              onChange={handleAdditionalInfoChange}
              required
            />
          </div>
        </div>
        {items.map((item, index) => (
          <div key={index} className={styles.itemSection}>
            <div className={styles.row}>
              <div className={styles.textareaWrapper}>
                <label className={styles.vendor} htmlFor={`vendor${index}`}>
                  Vendor
                </label>
                <textarea
                  className={styles.vendorField}
                  id={`vendor${index}`}
                  name='vendor'
                  value={item.vendor}
                  onChange={(e) => handleInputChange(e, index)}
                  required
                />
              </div>
              <div className={styles.textareaWrapper}>
                <label
                  className={styles.itemDescription}
                  htmlFor={`itemDescription${index}`}
                >
                  Item Description
                </label>
                <textarea
                  className={styles.itemdescriptionField}
                  id={`itemDescription${index}`}
                  name='itemDescription'
                  value={item.itemDescription}
                  onChange={(e) => handleInputChange(e, index)}
                  required
                />
              </div>
              <div className={styles.textareaWrapper}>
                <label className={styles.itemLink} htmlFor={`itemLink${index}`}>
                  Item Link
                </label>
                <textarea
                  className={styles.itemlinkField}
                  id={`itemLink${index}`}
                  name='itemLink'
                  value={item.itemLink}
                  onChange={(e) => handleInputChange(e, index)}
                  required
                />
              </div>
              <div className={styles.textareaWrapper}>
                <label
                  className={styles.partNum}
                  htmlFor={`partNumber${index}`}
                >
                  Part Number
                </label>
                <textarea
                  className={styles.partnumField}
                  id={`partNumber${index}`}
                  name='partNumber'
                  value={item.partNumber}
                  onChange={(e) => handleInputChange(e, index)}
                  required
                />
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.quantity} htmlFor={`quantity${index}`}>
                  Quantity
                </label>
                <input
                  className={styles.quantityField}
                  type='number'
                  id={`quantity${index}`}
                  name='quantity'
                  value={item.quantity}
                  onChange={(e) => handleInputChange(e, index)}
                  required
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label className={styles.unitCost} htmlFor={`unitCost${index}`}>
                  Unit Cost
                </label>
                <input
                  className={styles.unitcostField}
                  type='number'
                  step='0.01'
                  id={`unitCost${index}`}
                  name='unitCost'
                  value={item.unitCost}
                  onChange={(e) => handleInputChange(e, index)}
                  required
                />
              </div>
              <div>
                <label
                  className={styles.totalCost}
                  htmlFor={`totalCost${index}`}
                >
                  Total Cost
                </label>
                <input
                  className={styles.totalcostField}
                  type='number'
                  step='0.01'
                  id={`totalCost${index}`}
                  name='totalCost'
                  value={item.totalCost}
                  onChange={(e) => handleInputChange(e, index)}
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <button
          className={styles.addItemButton}
          type='button'
          onClick={handleAddItem}
        >
          Add Item
        </button>

        <div className={styles.supportingDocs}>
          <label
            className={styles.supportingDocsLabel}
            htmlFor='supportingDocsInput'
          >
            Supporting Documents
          </label>
          <input
            className={styles.supportingDocsInput}
            type='file'
            id='supportingDocsInput'
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
          />
          {selectedFiles && (
            <ul className={styles.selectedFilesList}>
              {Array.from(selectedFiles).map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
        <button className={styles.submitButton} type='submit'>
          Submit
        </button>
      </form>
    </div>
  )
}

export default StudentRequest
