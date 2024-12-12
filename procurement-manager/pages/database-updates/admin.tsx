/**
 * This is the Admin View for the Database Updates Page
 */


import React, { useEffect, useState } from 'react'
import { Col, Nav, Row, Dropdown, DropdownButton } from 'react-bootstrap'
import { prisma } from '@/db'
import { Project, User } from '@prisma/client'
import Link from 'next/link'
import Head from 'next/head'
import styles from '@/styles/DatabaseUpdate.module.scss'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { CellValueChangedEvent } from 'ag-grid-community'
import AdminAddButtonModal from '@/components/admin-modals/AdminAddButtonModal'
import AdminDeleteModal from '@/components/admin-modals/AdminDeleteModal'
import AdminDeactivateModal from '@/components/admin-modals/AdminDeactivateModal'
import AdminReactivateModal from '@/components/admin-modals/AdminReactivateModal'
import AdminSortByProjectModal from '@/components/admin-modals/AdminSortByProjectModal'
import AdminAssignProjectModal from '@/components/admin-modals/AdminAssignProjectModal'

export async function getServerSideProps() {
  const users = await prisma.user.findMany()
  const projects = await prisma.project.findMany()

  return {
    props: {
      title: 'Database Updates - Procurement Manager',
      description: 'University of Texas at Dallas',
      users: JSON.parse(JSON.stringify(users)),
      projects: JSON.parse(JSON.stringify(projects)),
    },
  }
}

interface AdminProps {
  title: String
  description: String
  users: User[]
  projects: Project[]
}

interface DatePickerParams {//type issue resolved calender into string
  value?: string | Date;
}

export default function Admin({
  title,
  description,
  users,
  projects,
}: AdminProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showSortByProjectModal, setShowSortByProjectModal] = useState(false);
  const [showAssignProjectModal, setShowAssignProjectModal] = useState(false);
  const [tableType, setTableType] = useState<string>('user');
  const [colData, setColData] = useState<any>([])
  const [defaultColDef, setDefaultColDef] = useState<any>({
    editable: true,
    filter: true,
    cellStyle: { textAlign: 'left' },
    components: {
      datePicker: getDatePicker()
    }
  })
  const [userData, setUserData] = useState<User[]>(users);
  const [projectData, setProjectData] = useState<Project[]>(projects);

  const handleAddUserClick = () => {
    setShowModal(true)
  }

  const handleAddProjectClick = () => {
    setShowModal(true)
  }

  const onCellValueChanged = async (event: CellValueChangedEvent) => {
    if (event.rowIndex === null) return;

    try {
      let value = event.newValue;
      
      // Convert string date to DateTime for date fields
      if (event.colDef.field === 'deactivationDate' && value) {
        value = new Date(value).toISOString();
      }

      const response = await fetch('/api/admin-api/admin-edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: tableType,
          id: tableType === 'user' ? event.data.userID : event.data.projectID,
          field: event.colDef.field,
          value: value
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }
      
      // Update local state after successful API call
      if (tableType === 'user') {
        setUserData(prevData => 
          prevData.map(user => 
            user.userID === event.data.userID 
              ? { ...user, [event.colDef.field!]: value }
              : user
          )
        );
      } else {
        setProjectData(prevData => 
          prevData.map(project => 
            project.projectID === event.data.projectID 
              ? { ...project, [event.colDef.field!]: value }
              : project
          )
        );
      }
      
      event.node.setDataValue(event.colDef.field!, event.newValue);
    } catch (error) {
      console.error('Error updating:', error);
      event.node.setDataValue(event.colDef.field!, event.oldValue);
    }
  };

  useEffect(() => {
    if (tableType === 'user') {
      setColData([
        { field: 'userID' },
        { field: 'netID' },
        { field: 'firstName' },
        { field: 'lastName' },
        { field: 'email' },
        { 
          field: 'roleID',
          valueFormatter: (params: any) => {
            const roleMap: { [key: number]: string } = {
              1: 'Admin',
              2: 'Mentor',
              3: 'Student'
            };
            return roleMap[params.value] || params.value;
          }
        },
        { 
          field: 'active',
          valueFormatter: (params: any) => params.value ? 'Active' : 'Inactive',
          cellRenderer: (params: any) => params.value ? 'Active' : 'Inactive',
          editable: false,
          type: 'textColumn',
          cellStyle: { textAlign: 'left' }
        },
        { field: 'responsibilities' },
        { 
          field: 'deactivationDate',
          cellEditor: 'datePicker',
          cellEditorPopup: true,
          valueFormatter: (params: any) => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          valueParser: (params: any) => {
            return params.newValue;
          }
        },
      ])
    } else if (tableType === 'project') {
      setColData([
        { 
          field: 'projectID',
          editable: false
        },
        { field: 'projectTitle' },
        { field: 'projectNum' },
        { field: 'startingBudget' },
        { field: 'totalExpenses' },
        { field: 'projectType' },
        { field: 'sponsorCompany' },
        { 
          field: 'activationDate',
          valueFormatter: (params: any) => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
        },
        { 
          field: 'deactivationDate',
          cellEditor: 'datePicker',
          cellEditorPopup: true,
          valueFormatter: (params: any) => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          valueParser: (params: any) => {
            return params.newValue;
          }
        },
        { field: 'additionalInfo' },
        { field: 'costCenter' },
      ])
    }
  }, [tableType])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description.toString()} />
      </Head>
      <Row>
        <Col>
          <div className={styles['header-btns-container']}>
            <Nav
              variant='tabs'
              defaultActiveKey={'user'}
              className='flex-grow-1 me-4'
            >
              <Nav.Item>
                <Nav.Link
                  eventKey={'user'}
                  onClick={() => setTableType('user')}
                >
                  Users
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey={'project'}
                  onClick={() => setTableType('project')}
                >
                  Projects
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <div>
              <DropdownButton id='dropdown-admin-actions' title='Admin Actions'>
                <Dropdown.Item
                  onClick={() => setShowModal(true)}
                >
                  Add
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setShowReactivateModal(true)}
                >
                  Reactivate
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setShowDeactivateModal(true)}
                >
                  Deactivate
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setShowSortByProjectModal(true)}
                >
                  Search by Project
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setShowAssignProjectModal(true)}
                >
                  Assign Project
                </Dropdown.Item>
                <Dropdown.Item
                  as={Link}
                  href='/database-updates/upload'
                >
                  Upload Files
                </Dropdown.Item>
              </DropdownButton>

              <AdminAddButtonModal
                show={showModal}
                onHide={() => setShowModal(false)}
              />
              <AdminDeleteModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                type={tableType}
              />
              <AdminReactivateModal
                show={showReactivateModal}
                onHide={() => setShowReactivateModal(false)}
                type={tableType}
              />
              <AdminDeactivateModal
                show={showDeactivateModal}
                onHide={() => setShowDeactivateModal(false)}
                type={tableType}
              />
              <AdminSortByProjectModal
                show={showSortByProjectModal}
                onHide={() => setShowSortByProjectModal(false)}
              />
              <AdminAssignProjectModal
                show={showAssignProjectModal}
                onHide={() => setShowAssignProjectModal(false)}
              />
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <div
            className='ag-theme-quartz'
            style={{ width: '100%', height: '75vh' }}
          >
            <AgGridReact
              rowData={tableType === 'user' ? userData : projectData}
              columnDefs={colData}
              defaultColDef={defaultColDef}
              components={{ datePicker: getDatePicker() }}
              autoSizeStrategy={{ type: 'fitCellContents' }}
              pagination={true}
              onCellValueChanged={onCellValueChanged}
              stopEditingWhenCellsLoseFocus={true}
              suppressRowDeselection={true}
            />
          </div>
        </Col>
      </Row>
    </>
  )
}

function getDatePicker() {
  function DatePicker() {}
  DatePicker.prototype.init = function(params: DatePickerParams) {
    this.eInput = document.createElement('input');
    this.eInput.type = 'date';
    this.eInput.classList.add('ag-input');
    this.eInput.style.height = '100%';
    this.eInput.value = params.value ? new Date(params.value).toISOString().split('T')[0] : '';
  };
  DatePicker.prototype.getGui = function() {
    return this.eInput;
  };
  DatePicker.prototype.afterGuiAttached = function() {
    this.eInput.focus();
    this.eInput.select();
  };
  DatePicker.prototype.getValue = function() {
    return this.eInput.value;
  };
  DatePicker.prototype.destroy = function() {};
  DatePicker.prototype.isPopup = function() {
    return true;
  };

  return DatePicker;
}