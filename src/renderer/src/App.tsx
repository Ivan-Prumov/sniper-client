import './assets/base.css'
import { Box } from '@mui/material'
import RunBenchmark from './components/RunBenchmark/RunBenchmark'
import { ErrorMessageContextProvider } from './ErrorMessageWrapper'
import CenteredTabsWrapper from './components/Wrappers/CenteredTabsWrapper'
import { GenerateConfig } from './components/GenerateConfig/GenerateConfig'

function App(): JSX.Element {
  return (
    <Box className={'body'}>
      <ErrorMessageContextProvider>
        <CenteredTabsWrapper>
          <GenerateConfig />
          <RunBenchmark />
        </CenteredTabsWrapper>
      </ErrorMessageContextProvider>
    </Box>
  )
}

export default App
