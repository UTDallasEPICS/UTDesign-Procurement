import { type ComponentProps, useCallback, useState } from "react"
import { Form } from "react-bootstrap"

type NumberFormControlProps = Omit<
  ComponentProps<typeof Form.Control>,
  'value' | 'onChange' | 'type' | 'onBlur'> & 
  {
    defaultValue: number, 
    onValueChange?: (value: number | null) => void
    renderNumber?: (value: number) => string
  }


export function NumberFormControl(props: NumberFormControlProps) {
    const { defaultValue, onValueChange, renderNumber = (value) => value.toString(), ...rest } = props
    const [stringValue, setStringValue] = useState(renderNumber(defaultValue))
  
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setStringValue(e.target.value)
    }, [])
  
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (!onValueChange) {
        return
      }
      const trimmed = e.target.value.trim()
      if (trimmed.length === 0) {
        onValueChange(null)
      } else {
        const parsed = Number.parseFloat(trimmed)
        if (!Number.isNaN(parsed)) {
          setStringValue(renderNumber(parsed))
          onValueChange(parsed)
        }
      }
    }, [onValueChange, renderNumber])
  
  
    return (
      <Form.Control
        type='number'
        value={stringValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...rest}
      />
    )
  }
  
/**
* Converts a decimal number representing dollars to a string with a dollar sign.
* @param value - The number to convert
* @param includeCurrencySign - Whether to include the dollar sign
* 
* @example
* dollarsAsString(100) // "$100.00"
* dollarsAsString(100, false) // "100.00"
* dollarsAsString(84.2, true) // "$84.20"
* 
*/
export function dollarsAsString(value: number | undefined, includeCurrencySign = true) {
    if (value === undefined) {
        return ''
    }
    const formattedValue = value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        useGrouping: false,
    });
    return includeCurrencySign ? formattedValue : formattedValue.slice(1);
}