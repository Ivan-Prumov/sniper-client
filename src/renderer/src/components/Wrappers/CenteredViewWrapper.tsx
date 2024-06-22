import React from "react"
import { Box, BoxProps } from "@mui/material"


interface BoxOptions {

}

export const CenteredViewWrapper = <C extends React.ElementType>(
    props: BoxProps<C, { component?: C }> & BoxOptions
) => {
    const { sx, ...otherProps } = props;

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            ...sx
        }} {...otherProps}>
            {props.children}
        </Box>
    )
}