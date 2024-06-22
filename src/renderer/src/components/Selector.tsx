import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'

interface ISelectorProps {
  label?: string;
  items: string[]
  selectedParam: string
  selectParam(e: SelectChangeEvent<string>): void
}

export default function Selector({ label, items, selectedParam, selectParam }: ISelectorProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">{label || 'Parameter'}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedParam}
          label="Parameter"
          onChange={selectParam}
        >
          {items.map((item) => (
            <MenuItem sx={{ display: 'flex', justifyContent: 'center' }} key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
