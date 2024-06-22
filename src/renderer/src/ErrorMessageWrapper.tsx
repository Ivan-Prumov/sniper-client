import { Box, Typography } from '@mui/material'
import { createContext, useContext, useEffect, useState } from 'react'

interface IErrorMessageContext {
  setErrorMsg(msg: string): void
}

const ErrorMessageContext = createContext<IErrorMessageContext>({
  setErrorMsg: () => {}
})

export const useErrorMessageContext = () => useContext(ErrorMessageContext)

export const ErrorMessageContextProvider = ({ children }) => {
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (!message) return

    const timeout = setTimeout(() => {
      clearError()
    }, 2500)

    return () => clearTimeout(timeout)
  }, [message])

  const setErrorMsg = (msg: string) => {
    setMessage(msg)
  }

  const clearError = () => {
    setMessage('')
  }

  return (
    <ErrorMessageContext.Provider value={{ setErrorMsg }}>
      {children}
      {message && (
        <Box
          sx={{
            borderRadius: '9px',
            padding: '8px 16px',
            justifySelf: 'center',
            width: '40%',
            backgroundColor: '#FFCCCC',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography
            sx={{ color: 'red', width: '100%', fontSize: 16, fontWeight: 400, textAlign: 'center' }}
          >
            {message}
          </Typography>
        </Box>
      )}
    </ErrorMessageContext.Provider>
  )
}
