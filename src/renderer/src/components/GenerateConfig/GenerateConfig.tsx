import { TabPanel } from '@mui/lab'
import { Box, SelectChangeEvent, Typography } from '@mui/material'
import { useErrorMessageContext } from '@renderer/ErrorMessageWrapper'
import { Button } from '@renderer/components/Button'
import FileUploadButton from '@renderer/components/FileUploadButton'
import LoadingOverlay from '@renderer/components/LoadingOverlay'
import { ModifiedParamCard } from '@renderer/components/ModifiedParamCard'
import { ParameterSelector } from '@renderer/components/ParameterSelector/ParameterSelector'
import { TABS } from '@renderer/components/Wrappers/CenteredTabsWrapper'
import { CenteredViewWrapper } from '@renderer/components/Wrappers/CenteredViewWrapper'
import { useEffect, useState } from 'react'

const { fs, fsExists, path, __dirname } = window.api as any

const EXTRACT_SECTION_REGEX = /^\s*\[([^\]]+)\]\s*$/gm
const EXTRACT_PARAM_REGEX = /^\s*([^=\s]+)\s*=\s*([^\s]+)/gm

type TSectionMap = Map<string, string[]>

interface IParamValue {
  min: number
  max: number
  step: number
}

export interface IParameter {
  name: string
  value: IParamValue
}

type TParameterInstance = Pick<IParameter, 'name'> & { value: number }

export const GenerateConfig = () => {
  const { setErrorMsg } = useErrorMessageContext()
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [params, setParams] = useState<TSectionMap>(new Map())
  const [selectedParam, setSelectedParam] = useState<string>('')
  const [modifiedParams, setModifiedParams] = useState<IParameter[]>([])
  const [isModifyMenuOpen, setIsModifyMenuOpen] = useState<boolean>(false)

  useEffect(() => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setFileContent(text)
        setParams(extractParameters(text))
      }
      reader.readAsText(file)
    }
  }, [file])

  const onChange = (file: File) => {
    setFile(file)
  }

  const selectParam = (e: SelectChangeEvent<string>) => {
    setSelectedParam(e.target.value)
  }

  const toggleIsModifyMenuOpen = () => {
    setIsModifyMenuOpen((prev) => !prev)
  }

  const addModifiedParam = (newParam: IParameter) => {
    if (!newParam.name) {
      setErrorMsg('Parameter name required!')
      return
    }
    setModifiedParams((prev) => [...prev, newParam])
    setIsModifyMenuOpen(false)
  }

  const removeModifiedParam = (modifiedParam: string) => {
    setModifiedParams((prev) => prev.filter((param) => param.name !== modifiedParam))
  }

  const extractParameters = (text: string): TSectionMap => {
    const params = new Map<string, string[]>()
    let section: string | null = null

    const lines = text.split(/\r?\n/)
    for (const line of lines) {
      let match: RegExpExecArray | null

      if ((match = EXTRACT_SECTION_REGEX.exec(line)) !== null) {
        section = match[1].trim()
        if (!params.has(section)) {
          params.set(section, [])
        }
      } else if (section && (match = EXTRACT_PARAM_REGEX.exec(line)) !== null) {
        const paramName = match[1].trim()
        const paramValue = match[2].trim()
        if (isNaN(Number(paramValue))) continue
        const sectionParams = params.get(section)
        if (!sectionParams?.includes(paramName)) {
          sectionParams?.push(paramName)
        }
      }

      EXTRACT_SECTION_REGEX.lastIndex = 0
      EXTRACT_PARAM_REGEX.lastIndex = 0
    }

    return params
  }

  const getAllUniqueAtomicParameters = (): string[] => {
    const atomicParams: string[] = []
    for (const [section, parameters] of params.entries()) {
      for (const param of parameters) {
        const atomicParam = `[${section}]/${param}`
        if (!modifiedParams.some((modifiedParam) => modifiedParam.name === atomicParam)) {
          atomicParams.push(atomicParam)
        }
      }
    }
    return atomicParams
  }

  const generateConfigFiles = async () => {
    if (!file) {
      setErrorMsg('No file loaded.')
      return
    }

    if (modifiedParams.length === 0) {
      setErrorMsg('No modified parameters.')
      return
    }

    setIsLoading(true)

    const groupedParams = modifiedParams.reduce((acc, param) => {
      const lastSlashIndex = param.name.lastIndexOf('/')
      if (lastSlashIndex !== -1) {
        const section = param.name.substring(0, lastSlashIndex)
        const paramName = param.name.substring(lastSlashIndex + 1)
        if (!acc[section]) {
          acc[section] = []
        }
        acc[section].push({ name: paramName, value: param.value })
      }
      return acc
    }, {})

    const isLinuxClient = process.platform === 'linux'

    const configFilesDir = isLinuxClient
      ? '/home/ivan/sniperSim/sniper-7.4/config'
      : path.join(__dirname, 'custom-config-files')

    try {
      const fileExists = await fsExists(configFilesDir)

      if (!fileExists) {
        await fs.promises.mkdir(configFilesDir)
      }

      const allParams: IParameter[] = Object.values(groupedParams).flat() as IParameter[]
      allParams.sort((a, b) => getIterations(a.value) - getIterations(b.value))

      const combinations = generateCombinations(allParams)
      await generateFoldersAndCfg(combinations, configFilesDir, groupedParams)
    } catch (err: any) {
    } finally {
      setIsLoading(false)
    }
  }

  const getIterations = (value: IParamValue) => {
    return Math.ceil((value.max - value.min) / value.step) + 1
  }

  const generateCombinations = (params) => {
    if (params.length === 0) return [[]]
    const [first, ...rest] = params
    const restCombinations = generateCombinations(rest)
    const combinations: TParameterInstance[][] = []

    for (let i = first.value.min; i <= first.value.max; i += first.value.step) {
      for (const combo of restCombinations) {
        combinations.push([{ name: first.name, value: roundToTwoDecimals(i) }, ...combo])
      }
    }

    return combinations
  }

  const generateFoldersAndCfg = async (combinations, basePath, groupedParams) => {
    for (const combination of combinations) {
      const folderPath = combination.reduce((acc, { name, value }) => {
        return path.join(acc, `${name}_${value}`)
      }, basePath)

      const fileExists = await fsExists(folderPath)
      if (!fileExists) {
        await fs.promises.mkdir(folderPath, { recursive: true })
      }

      const cfgFilePath = path.join(folderPath, 'config.cfg')
      const newContent = `${fileContent}\n${generateConfigContent(combination, groupedParams)}`
      await fs.promises.writeFile(cfgFilePath, newContent)
    }
  }

  const generateConfigContent = (combination, groupedParams) => {
    let content = ''
    const sections = Object.keys(groupedParams)

    sections.forEach((section) => {
      const params = groupedParams[section]
      let sectionContent = ''

      params.forEach((param) => {
        const comboParam = combination.find((p) => p.name === param.name)
        if (comboParam) {
          sectionContent += `${param.name} = ${comboParam.value}\n`
        }
      })

      if (sectionContent) {
        content += `\n${section}\n${sectionContent}`
      }
    })

    return content
  }

  const roundToTwoDecimals = (num: number) => {
    return Math.round(num * 100) / 100
  }

  return (
    <TabPanel
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
      value={TABS.GENERATE_CONFIG}
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
          {file ? `Currently loaded config file: ${file.name}` : 'Please upload a config file.'}
        </Typography>
        <FileUploadButton onChange={onChange} />
        <Box
          sx={{
            gap: '16px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column'
          }}
        >
          {modifiedParams.map((param) => (
            <ModifiedParamCard
              param={param}
              key={param.name}
              onRemove={() => removeModifiedParam(param.name)}
            />
          ))}
        </Box>
        {file &&
          (isModifyMenuOpen ? (
            <ParameterSelector
              selectParam={selectParam}
              onSubmit={addModifiedParam}
              selectedParam={selectedParam}
              items={getAllUniqueAtomicParameters()}
            />
          ) : (
            <Button onClick={toggleIsModifyMenuOpen}>Modify parameter</Button>
          ))}
        {modifiedParams.length > 0 && (
          <Button onClick={generateConfigFiles}>Generate Config Files</Button>
        )}
      </CenteredViewWrapper>
    </TabPanel>
  )
}
