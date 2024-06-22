import { Box, SelectChangeEvent, TextField } from '@mui/material'
import Selector from '../Selector'
import RangeSlider from '../RangeSlider'
import { Button } from '../Button'
import { useState } from 'react'
import { IParameter } from '../GenerateConfig/GenerateConfig'

interface IInputValues {
  min: number
  max: number
  step: number
}

interface IParameterSelectorProps {
  items: string[]
  selectedParam: string
  onSubmit(newParam: IParameter): void
  selectParam(e: SelectChangeEvent<string>): void
}

export const ParameterSelector = ({
  items,
  onSubmit,
  selectParam,
  selectedParam
}: IParameterSelectorProps) => {
  const [inputValues, setInputValues] = useState<IInputValues>({
    step: 0.01,
    min: 3000,
    max: 7000
  })

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setInputValues((prev) => ({
        ...prev,
        min: Math.max(0.01, Math.min(newValue[0], 9999.99)),
        max: Math.max(0.01, Math.min(newValue[1], 9999.99))
      }))
    }
  }

  const inputFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newValue = parseFloat(value)

    if (!isNaN(newValue)) {
      setInputValues((prev) => {
        let min = name === 'min' ? newValue : prev.min
        let max = name === 'max' ? newValue : prev.max
        let step = name === 'step' ? Math.max(0.01, newValue) : prev.step // Ensure step is not negative

        // Ensure values are within 0.01 and 9999.99
        min = Math.max(0.01, Math.min(min, 9999.99))
        max = Math.max(0.01, Math.min(max, 9999.99))

        // Swap values if min is greater than max
        if (min > max) {
          ;[min, max] = [max, min]
        }

        return {
          ...prev,
          [name]: newValue,
          min,
          max,
          step
        }
      })
    }
  }

  return (
    <Box
      sx={{
        gap: '16px',
        width: '100%',
        borderRadius: 2,
        padding: '18px',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: 'white',
        boxShadow: '0px 0px 3px grey'
      }}
    >
      <Selector items={items} selectParam={selectParam} selectedParam={selectedParam} />
      <RangeSlider
        min={0.01}
        max={9999.99}
        onChange={handleSliderChange}
        getAriaLabel={() => 'min-max-param-val'}
        value={[inputValues.min, inputValues.max]}
        step={inputValues.step} // Ensure the slider uses the step value
      />
      <Box
        sx={{
          gap: '16px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <TextField
          name="min"
          label="Min"
          sx={{ flex: 1 }}
          variant="outlined"
          id="outlined-basic"
          value={inputValues.min}
          onChange={inputFieldChange}
          inputProps={{ step: 'any', type: 'number', min: 0.01, max: 9999.99 }} // Allow fractional input and enforce limits
        />
        <TextField
          name="max"
          label="Max"
          sx={{ flex: 1 }}
          variant="outlined"
          id="outlined-basic"
          value={inputValues.max}
          onChange={inputFieldChange}
          inputProps={{ step: 'any', type: 'number', min: 0.01, max: 9999.99 }} // Allow fractional input and enforce limits
        />
        <TextField
          name="step"
          label="Step"
          sx={{ flex: 1 }}
          variant="outlined"
          id="outlined-basic"
          value={inputValues.step}
          onChange={inputFieldChange}
          inputProps={{ step: 'any', type: 'number', min: 0.01, max: 9999.99 }} // Allow fractional input and enforce limits
        />
      </Box>
      <Button onClick={() => onSubmit({ name: selectedParam, value: inputValues })}>Confirm</Button>
    </Box>
  )
}
