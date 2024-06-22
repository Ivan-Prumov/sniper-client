import * as React from 'react'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

interface IFileUploadProps {
  onChange: (file: File) => void;
}

export default function FileUploadButton({ onChange }: IFileUploadProps) {

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    onChange(e.target.files[0]);
  }

  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      sx={{ width: '100%', textAlign: 'center' }}
      startIcon={<CloudUploadIcon />}
    >
      Upload Base Config File
      <VisuallyHiddenInput
        type="file"
        onChange={handleFileUpload}
        sx={{ backgroundColor: 'white' }}
      />
    </Button>
  )
}
