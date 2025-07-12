import React, { useState, useEffect, useRef } from 'react'
import { Form, Row, Col } from 'react-bootstrap'

interface Vendor {
  vendorID: number
  vendorName: string
  vendorStatus: string
  vendorEmail: string | null
  vendorURL: string
}

interface NewVendorData {
  name: string
  email: string
  url: string
}

interface VendorSelectionProps {
  vendors: Vendor[]
  selectedVendorId?: number | string
  newVendorData?: NewVendorData
  onVendorChange: (
    vendorId: number | string,
    newVendorData?: NewVendorData,
  ) => void
  required?: boolean
  className?: string
}

const VendorSelection: React.FC<VendorSelectionProps> = ({
  vendors,
  selectedVendorId,
  newVendorData,
  onVendorChange,
  required = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNewVendor, setIsNewVendor] = useState(false)
  const [newVendorInfo, setNewVendorInfo] = useState<NewVendorData>({
    name: '',
    email: '',
    url: '',
  })

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize component state based on props
  useEffect(() => {
    if (selectedVendorId === 'other') {
      setIsNewVendor(true)
      setSearchTerm('Other')
      if (newVendorData) {
        setNewVendorInfo(newVendorData)
      }
    } else if (selectedVendorId && selectedVendorId !== 'other') {
      const selectedVendor = vendors.find(
        (v) => v.vendorID === selectedVendorId,
      )
      if (selectedVendor) {
        setSearchTerm(selectedVendor.vendorName)
        setIsNewVendor(false)
      }
    } else {
      setSearchTerm('')
      setIsNewVendor(false)
    }
  }, [selectedVendorId, vendors, newVendorData])

  // Filter approved vendors based on search term
  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.vendorStatus === 'APPROVED' &&
      vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle vendor selection from dropdown
  const handleVendorSelect = (
    vendorId: number | string,
    vendorName: string,
  ) => {
    if (vendorId === 'other') {
      setIsNewVendor(true)
      setSearchTerm('Other')
      onVendorChange('other', newVendorInfo)
    } else {
      setIsNewVendor(false)
      setSearchTerm(vendorName)
      onVendorChange(vendorId)
    }
    setIsDropdownOpen(false)
  }

  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle new vendor form changes
  const handleNewVendorChange = (field: keyof NewVendorData, value: string) => {
    const updatedInfo = { ...newVendorInfo, [field]: value }
    setNewVendorInfo(updatedInfo)
    onVendorChange('other', updatedInfo)
  }

  // Handle dropdown focus
  const handleFocus = () => {
    setIsDropdownOpen(true)
  }

  // Handle dropdown blur with delay to allow for click events
  const handleBlur = () => {
    setTimeout(() => setIsDropdownOpen(false), 200)
  }

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className={className}>
      <Row className='my-4'>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              <strong>Vendor</strong>
            </Form.Label>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <Form.Control
                type='text'
                placeholder='Search or select a vendor...'
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required={required}
              />
              {isDropdownOpen && (
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {filteredVendors.map((vendor) => (
                    <li
                      key={vendor.vendorID}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #ddd',
                      }}
                      onClick={() =>
                        handleVendorSelect(vendor.vendorID, vendor.vendorName)
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white'
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
                      fontWeight: 'bold',
                    }}
                    onClick={() => handleVendorSelect('other', 'Other')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9e9e9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9f9f9'
                    }}
                  >
                    Other (Add New Vendor)
                  </li>
                </ul>
              )}
            </div>
          </Form.Group>
        </Col>
      </Row>

      {isNewVendor && (
        <Row className='my-4'>
          <Col md={4}>
            <Form.Group>
              <Form.Label>
                <strong>New Vendor Name</strong>
              </Form.Label>
              <Form.Control
                type='text'
                value={newVendorInfo.name}
                onChange={(e) => handleNewVendorChange('name', e.target.value)}
                required={required}
                placeholder='Enter vendor name'
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>
                <strong>New Vendor URL</strong>
              </Form.Label>
              <Form.Control
                type='url'
                value={newVendorInfo.url}
                onChange={(e) => handleNewVendorChange('url', e.target.value)}
                required={required}
                placeholder='https://example.com'
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>
                <strong>New Vendor Email (Optional)</strong>
              </Form.Label>
              <Form.Control
                type='email'
                value={newVendorInfo.email}
                onChange={(e) => handleNewVendorChange('email', e.target.value)}
                placeholder='vendor@example.com'
              />
            </Form.Group>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default VendorSelection
