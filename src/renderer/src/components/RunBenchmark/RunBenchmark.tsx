import { TabPanel } from '@mui/lab'
import { TABS } from '../Wrappers/CenteredTabsWrapper'
import { CenteredViewWrapper } from '../Wrappers/CenteredViewWrapper'
import { Button } from '../Button'
import Selector from '../Selector'
import { useState } from 'react'
import { SelectChangeEvent, Typography } from '@mui/material'
import FileUploadButton from '../FileUploadButton'
import LoadingOverlay from '../LoadingOverlay'
import { useErrorMessageContext } from '@renderer/ErrorMessageWrapper'
import { ExecException } from 'child_process'

const { fs, fsExists, path, exec, saveBenchmark } = window.api as any

async function parseSimOutFile(filename: string): Promise<string> {
  const fileData = await fs.promises.readFile(filename, { encoding: 'utf-8' })

  const lines = fileData.split('\n')
  const result: { [key: string]: { [core: string]: string | number } } = {}

  let currentCategory = ''
  let numCores = 0

  lines.forEach((line) => {
    line = line.trim()

    // Skip empty lines
    if (!line) return

    // Check for category headers
    if (!line.includes('|') && line.includes(' ')) {
      currentCategory = line.trim()
      return
    }

    // Parse lines with data
    if (line.includes('|')) {
      const parts = line.split('|').map((part) => part.trim())

      if (parts.length > 1) {
        const metricName = parts[0]
        const coreValues = parts.slice(1).map((value) => {
          if (value.includes('%')) {
            return value
          }
          const numberValue = parseFloat(value.replace(/,/g, ''))
          return isNaN(numberValue) ? value : numberValue
        })

        // Determine number of cores from the first data line
        if (numCores === 0) {
          numCores = coreValues.length
        }

        const metricKey = currentCategory ? `${currentCategory} - ${metricName}` : metricName

        if (metricKey && metricKey !== ':') {
          const coreValuesObject = coreValues.reduce(
            (acc, value, index) => {
              if (value !== '') {
                acc[`Core ${index}`] = value
              }
              return acc
            },
            {} as { [core: string]: string | number }
          )

          if (Object.keys(coreValuesObject).length > 0) {
            result[metricKey] = coreValuesObject
          }
        }
      }
    }
  })

  return JSON.stringify(result, null, 2)
}

const BENCHMARKS = [
  'splash2-cholesky',
  'splash2-fft',
  'splash2-lu',
  'splash2-radix',
  'splash2-barnes',
  'splash2-fmm',
  'splash2-ocean',
  'splash2-radiosity',
  'splash2-volrend',
  'splash2-water-nsquared',
  'splash2-water-spatial',
  'splash2-raytrace'
]

const RunBenchmark = () => {
  const { setErrorMsg } = useErrorMessageContext()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('')
  const [selectedConfig, setSelectedConfig] = useState<File | null>(null)

  const onChange = (file: File) => {
    setSelectedConfig(file)
  }

  const selectBenchmark = (e: SelectChangeEvent<string>) => {
    setSelectedBenchmark(e.target.value)
  }

  const runBenchmark = async () => {
    if (!selectedBenchmark) {
      setErrorMsg('Benchmark is required!')
      return
    }
    if (!selectedConfig) {
      setErrorMsg('Config is required!')
      return
    }

    setIsLoading(true)

    // Get the directory path
    const benchmarkDirectory = path.join(process.env.HOME, 'sniperSim', 'sniper-7.4', 'benchmarks')

    // Check if sim.out file exists, if yes, delete it
    const simOutPath = path.join(benchmarkDirectory, 'sim.out')

    const fileExists = await fsExists(simOutPath)

    if (fileExists) {
      await fs.promises.unlink(simOutPath)
    }

    // Run the benchmark command
    const command = `
      cd ${benchmarkDirectory} &&
      ./run-sniper -p ${selectedBenchmark} -c ${selectedConfig.path}
    `

    exec(command, async (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        setErrorMsg(`Error executing command: ${error.message}`)
        console.log(error.message);
        return
      }

      const fileExists = await fsExists(simOutPath)
      // Check if sim.out file exists again
      if (!fileExists) {
        // Read and print the system.log file
        const systemLogPath = path.join(benchmarkDirectory, 'system.log')

        const systemLogContent = await fs.promises.readFile(systemLogPath, 'utf-8')
        console.log(`System log content: ${systemLogContent}`)
        setIsLoading(false)
        return
      }

      console.log(`Command output: ${stdout}`)
      console.error(`Command error: ${stderr}`)

      // Usage example
      try {
        const jsonString = await parseSimOutFile(simOutPath)

        const jsonData = JSON.parse(jsonString)
        const message = await (saveBenchmark as (json: JSON) => Promise<void>)(jsonData)
        console.log(message)
      } catch (err: any) {
        setErrorMsg(`Error parsing file: ${err.message}`)
        console.log(err.message);
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <TabPanel
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
      value={TABS.RUN_BENCHMARK}
    >
      <LoadingOverlay isLoading={isLoading} />
      <CenteredViewWrapper gap={'32px'} width={'50%'} maxWidth={'760px'}>
        <Typography
          sx={{
            width: '100%',
            fontSize: 18,
            overflow: 'hidden',
            textAlign: 'center',
            textOverflow: 'ellipsis'
          }}
        >
          Choose Benchmark
        </Typography>
        <Selector
          items={BENCHMARKS}
          label="Benchmark"
          selectParam={selectBenchmark}
          selectedParam={selectedBenchmark}
        />
        <FileUploadButton onChange={onChange} />
        <Button onClick={runBenchmark}>Run Benchmark</Button>
      </CenteredViewWrapper>
    </TabPanel>
  )
}

export default RunBenchmark
