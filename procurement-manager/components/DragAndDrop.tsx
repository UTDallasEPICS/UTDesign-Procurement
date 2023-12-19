import { ValidFile, FileWithValid, InvalidReason } from '@/lib/types'
import {
  Dispatch,
  SetStateAction,
  DragEvent,
  useEffect,
  useRef,
  useState,
  ChangeEvent,
} from 'react'
import { Row, Col } from 'react-bootstrap'
import styles from '../styles/DatabaseUpdate.module.scss'

interface Props {
  files: FileWithValid[]
  setFiles: Dispatch<SetStateAction<FileWithValid[]>>
}

/**
 * Called when user selects files by clicking and validates files
 * @param e
 * @param files
 * @param setFiles
 * @returns
 */
function handleChange(
  e: ChangeEvent<HTMLInputElement>,
  files: FileWithValid[],
  setFiles: Dispatch<SetStateAction<FileWithValid[]>>
) {
  if (e.target == undefined) return
  if (e.target.files == undefined) return

  const filesArray = Array.from(e.target.files)

  enum InvalidReason {
    FILE_TYPE = 'Invalid file type. Please upload .xlsx files only.',
    DUPLICATE_NAME = 'There are duplicate file names. Please rename the files and try again.',
  }

  let newFiles: FileWithValid[] = filesArray.map((f: File) => {
    let v: ValidFile = { valid: true, reason: '' }

    // Check for file type
    if (!f.name.toLowerCase().endsWith('.xlsx')) {
      v.valid = false
      v.reason = InvalidReason.FILE_TYPE
    }

    // Check if other files have the same name
    if (files.some((file) => file.name === f.name)) {
      v.valid = false
      v.reason = InvalidReason.DUPLICATE_NAME
    }

    let newFile = f as FileWithValid
    newFile.validity = v

    return newFile
  })

  setFiles(files.concat(newFiles))
}

/**
 * Called when user drops files into dropArea and validates files
 * @param e
 * @param files
 * @param setFiles
 * @param setInDropZone
 * @returns
 */
function handleDrop(
  e: DragEvent<HTMLLabelElement>,
  files: FileWithValid[],
  setFiles: Dispatch<SetStateAction<FileWithValid[]>>,
  setInDropZone: Dispatch<SetStateAction<boolean>>
): void {
  e.preventDefault()
  e.stopPropagation()

  setInDropZone(false)

  if (e.dataTransfer == undefined) return

  const filesArray = Array.from(e.dataTransfer.files)

  let newFiles: FileWithValid[] = filesArray.map((f: File) => {
    let v: ValidFile = { valid: true, reason: '' }

    // Check for file type
    if (!f.name.toLowerCase().endsWith('.xlsx')) {
      v.valid = false
      v.reason = InvalidReason.FILE_TYPE
    }

    // Check if other files have the same name
    if (files.some((file) => file.name === f.name)) {
      v.valid = false
      v.reason = InvalidReason.DUPLICATE_NAME
    }

    let newFile = f as FileWithValid
    newFile.validity = v

    return newFile
  })

  setFiles(files.concat(newFiles))
}

export default function DragAndDrop({ files, setFiles }: Props) {
  const [inDropZone, setInDropZone] = useState(false) // used to change style of drop zone

  // Stop browser from opening the file when dropped
  useEffect(() => {
    const dropzoneId = 'dragDrop'
    window.addEventListener(
      'dragenter',
      (e) => {
        if (!e || !e.target || !e.dataTransfer) return
        if ((e.target as HTMLElement).id != dropzoneId) {
          e.preventDefault()
          e.dataTransfer.effectAllowed = 'none'
          e.dataTransfer.dropEffect = 'none'
        }
      },
      false
    )

    window.addEventListener('dragover', (e) => {
      if (!e || !e.target || !e.dataTransfer) return
      if ((e.target as HTMLElement).id != dropzoneId) {
        e.preventDefault()
        e.dataTransfer.effectAllowed = 'none'
        e.dataTransfer.dropEffect = 'none'
      }
    })

    window.addEventListener('drop', (e) => {
      if (!e || !e.target || !e.dataTransfer) return
      if ((e.target as HTMLElement).id != dropzoneId) {
        e.preventDefault()
        e.dataTransfer.effectAllowed = 'none'
        e.dataTransfer.dropEffect = 'none'
      }
    })
  }, [])

  return (
    <>
      <Row>
        <Col>
          <label
            htmlFor='filesInput'
            id='dragDrop'
            className={`${
              inDropZone ? styles['in-zone'] : styles['out-zone']
            } ${styles['drag-drop']} text-center my-4`}
            onDragOver={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setInDropZone(true)
            }}
            onDrop={(e) => handleDrop(e, files, setFiles, setInDropZone)}
          >
            Drag or click .xlsx files here
          </label>
          <input
            type='file'
            name='filesInput'
            id='filesInput'
            className={styles['file-input']}
            multiple
            onChange={(e) => {
              handleChange(e, files, setFiles)
            }}
          />
        </Col>
      </Row>
    </>
  )
}
