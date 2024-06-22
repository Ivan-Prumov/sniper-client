import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Typography } from "@mui/material"
import { IParameter } from './GenerateConfig/GenerateConfig';

interface IModifiedParamCardProps {
    param: IParameter;
    onRemove(): void;
}

export const ModifiedParamCard = ({ param, onRemove }: IModifiedParamCardProps) => {
    return (
        <Box sx={{
            gap: '16px',
            width: '100%',
            display: 'flex',
            borderRadius: 2,
            overflow: 'hidden',
            padding: '4px 8px',
            alignItems: 'center',
            backgroundColor: 'white',
            boxShadow: '0px 0px 2px grey',
            justifyContent: 'space-between',
        }}>
            <Box sx={{ flex: 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography whiteSpace={'nowrap'}>{param.name}</Typography>
            </Box>
            <Typography flex={1}>{param.value.min}</Typography>
            <Typography flex={1}>{param.value.max}</Typography>
            <Typography flex={1}>{param.value.step}</Typography>
            <IconButton
                sx={{
                    height: '100%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onClick={onRemove}
            >
                <CloseIcon />
            </IconButton>
        </Box>
    )
}
