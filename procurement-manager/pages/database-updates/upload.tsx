import DragAndDrop from '@/components/DragAndDrop'
import { FileWithValid, ValidFile, InvalidReason } from '@/lib/types'
import Head from 'next/head'
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

/**
 * This function handles the upload of the files to the server when the Upload button is clicked
 * @param files
 * @param setErrorFileURL
 * @param setStatus
 */
async function handleSubmit(
  files: FileWithValid[],
  setErrorFileURL: React.Dispatch<React.SetStateAction<string>>,
  setStatus: React.Dispatch<React.SetStateAction<string>>,
) {
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
      /**
       * The API returns the file or a JSON object but only one way to parse the response (either res.blob() or res.json())
       * but to get the error file, we need to parse the response as a blob and to get the status of the upload, we need to parse the response as a JSON object
       * The solution is to parse the response as a blob and then check the type of the blob to see if it is a JSON object or not
       */
      const resData = await res.blob()
      if (resData.type.includes('application/json')) {
        // This will just give the user insight whether the upload was successful without any errors
        const text = await new Response(resData).text()
        const jsonResults = JSON.parse(text)
        if (jsonResults.status && jsonResults.status === 'ok')
          setStatus('Upload successful. No errors found in the uploaded files')
      } else {
        // This will give the user the error file to download
        const errorFile = new Blob([resData])
        const errorFileURL = URL.createObjectURL(errorFile)
        setErrorFileURL(errorFileURL)
        setStatus(
          'Upload successful, but there were errors found in the uploaded files. Here is a file containing all the errors.',
        )
      }
    } else {
      setStatus('Upload failed. Please try again.')
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * This is just a wrapper function to handle the loading animation
 * @param files
 * @param setShowLoading
 * @param setErrorFileURL
 * @param setStatus
 */
async function handleUpload(
  files: FileWithValid[],
  setShowLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setErrorFileURL: React.Dispatch<React.SetStateAction<string>>,
  setStatus: React.Dispatch<React.SetStateAction<string>>,
) {
  setShowLoading(true)
  await handleSubmit(files, setErrorFileURL, setStatus)
  setShowLoading(false)
}

export default function Upload({ title }: { title: string }) {
  const [files, setFiles] = useState<FileWithValid[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showLoading, setShowLoading] = useState<boolean>(false)
  const [errorFileURL, setErrorFileURL] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  function handleModalClose() {
    setShowModal(false)
    setStatus('')
    setErrorFileURL('')
    URL.revokeObjectURL(errorFileURL)
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
          <Modal.Title>
            {status === '' ? 'Confirm Upload' : 'Upload Status'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <>
            {status === '' && (
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
                        <ListGroupItem key={file.name}>
                          {file.name}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </Col>
                </Row>
              </>
            )}

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

            {
              // Show status of upload
              status !== '' && (
                <Row className='mt-4'>
                  <Col className='d-flex flex-column justify-content-center align-items-center'>
                    <p>{status}</p>
                  </Col>
                </Row>
              )
            }

            {/* Show download link to error file */}
            {errorFileURL !== '' && (
              <Row className='mt-4'>
                <Col className='d-flex flex-column justify-content-center align-items-center'>
                  <p>
                    <a href={errorFileURL} download='report.xlsx'>
                      Download Error File
                    </a>
                  </p>
                </Col>
              </Row>
            )}
          </>
        </Modal.Body>

        <Modal.Footer>
          {/* A button that shows Cancel before uploading and Close after uploading */}
          <Button
            variant='secondary'
            disabled={showLoading}
            onClick={handleModalClose}
          >
            {status === '' ? 'Cancel' : 'Close'}
          </Button>

          {/* An upload button that shows before uploading and disappears after uploading to prevent reuploads */}
          {status === '' && (
            <Button
              disabled={showLoading}
              variant='primary'
              onClick={() => {
                handleUpload(files, setShowLoading, setErrorFileURL, setStatus)
              }}
            >
              Upload
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}
