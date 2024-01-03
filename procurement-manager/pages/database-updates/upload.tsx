import DragAndDrop from '@/components/DragAndDrop'
import { FileWithValid, ValidFile, InvalidReason } from '@/lib/types'
import Head from 'next/head'
import { title } from 'process'
import { useState } from 'react'
import {
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  Button,
  Modal,
  Spinner,
} from 'react-bootstrap'
import styles from '@/styles/DatabaseUpdate.module.scss'

export async function getServerSideProps() {
  return {
    props: {
      title: 'Upload Files - Procurement Manager',
      description: 'University of Texas at Dallas',
    },
  }
}

async function handleSubmit(files: FileWithValid[]) {
  try {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    const res = await fetch('/api/db-upload', {
      method: 'POST',
      body: formData,
    })

    if (res.status === 200) {
      alert('Upload successful!')
    } else {
      alert('Upload failed. Please try again.')
    }
  } catch (error) {
    console.error(error)
  }
}

async function handleUpload(
  files: FileWithValid[],
  setShowLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setShowLoading(true)
  await handleSubmit(files)
  setShowLoading(false)
  setShowModal(false)
}

export default function Upload({ title }: { title: string }) {
  const [files, setFiles] = useState<FileWithValid[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showLoading, setShowLoading] = useState<boolean>(false)

  function handleModalClose() {
    setShowModal(false)
  }

  function handleModalShow() {
    setShowModal(true)
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <DragAndDrop files={files} setFiles={setFiles} />

      <Row className='my-4'>
        <Col>
          {files.length > 0 ? (
            <>
              <h2>Files to be uploaded:</h2>
              <ListGroup className='mb-4'>
                {/* Makes a list of the files selected by the user */}
                {files.map((file: FileWithValid) => (
                  <ListGroupItem
                    key={file.name}
                    className={
                      file.validity.valid
                        ? 'list-group-item-success'
                        : 'list-group-item-danger'
                    }
                  >
                    <div className='d-flex justify-content-between align-items-center'>
                      <span>{file.name}</span>
                      <div className='d-flex align-items-center'>
                        {/* <Button variant='warning' className='mx-2'>
                        </Button> */}
                        <label
                          className='btn btn-warning mx-2'
                          htmlFor='changeFile'
                        >
                          Change
                        </label>
                        <input
                          type='file'
                          name='changeFile'
                          id='changeFile'
                          className={styles['change-file-input']}
                          onChange={(e) => {
                            // This function updates the file list when the user changes a file
                            const newFiles = files.map((f) => {
                              if (f.name === file.name) {
                                if (e.target.files === null) return f
                                const newFile = e.target
                                  .files[0] as FileWithValid
                                let v: ValidFile = { valid: true, reason: '' }

                                // Check for file type
                                if (
                                  !newFile.name.toLowerCase().endsWith('.xlsx')
                                ) {
                                  v.valid = false
                                  v.reason = InvalidReason.FILE_TYPE
                                }

                                // Check if other files have the same name
                                if (
                                  files.some(
                                    (file) => file.name === newFile.name,
                                  )
                                ) {
                                  v.valid = false
                                  v.reason = InvalidReason.DUPLICATE_NAME
                                }
                                newFile.validity = v
                                return newFile
                              } else return f
                            })
                            setFiles(newFiles)
                          }}
                        />
                        <Button
                          variant='danger'
                          onClick={() => {
                            // This function removes a file from the list
                            const newFiles = files.filter(
                              (f) => f.name !== file.name,
                            )
                            setFiles(newFiles)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
              <Button
                className='mb-4'
                disabled={files.some((file) => !file.validity.valid)}
                onClick={handleModalShow}
              >
                Upload
              </Button>
            </>
          ) : (
            <></>
          )}
        </Col>
      </Row>

      <Modal
        show={showModal}
        onHide={handleModalClose}
        backdrop='static'
        keyboard={false}
        size='lg'
        centered
      >
        <Modal.Header>
          <Modal.Title>Confirm Upload</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <>
            <Row className='mb-4'>
              <Col>
                <p>Are you sure you want to upload these files?</p>
              </Col>
            </Row>

            <Row className='my-4'>
              <Col>
                <ListGroup>
                  {files.map((file) => (
                    <ListGroupItem key={file.name}>{file.name}</ListGroupItem>
                  ))}
                </ListGroup>
              </Col>
            </Row>

            {showLoading && (
              <Row className='mt-4'>
                <Col className='d-flex flex-column justify-content-center align-items-center'>
                  <p>
                    Please don't refresh the page while database is being
                    updated
                  </p>
                  <Spinner animation='border' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                  </Spinner>
                </Col>
              </Row>
            )}
          </>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant='secondary'
            disabled={showLoading}
            onClick={handleModalClose}
          >
            Cancel
          </Button>
          <Button
            disabled={showLoading}
            variant='primary'
            onClick={() => {
              handleUpload(files, setShowLoading, setShowModal)
            }}
          >
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
