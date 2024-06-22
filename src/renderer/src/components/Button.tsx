import React from 'react';
import { ButtonProps, Button as MuiButton } from '@mui/material';

interface ButtonOptions {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = <C extends React.ElementType>(
    props: ButtonProps<C, { component?: C }> & ButtonOptions
) => {
    return (
        <MuiButton onClick={props.onClick} {...props} sx={{ width: '100%' }} variant="contained">
            {props.children}
        </MuiButton>
    );
};
