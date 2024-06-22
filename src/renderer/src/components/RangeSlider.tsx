import * as React from 'react';
import Box from '@mui/material/Box';
import Slider, { SliderProps } from '@mui/material/Slider';

type RangeSliderProps = SliderProps;

const RangeSlider: React.FC<RangeSliderProps> = (props) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Slider
        {...props}
        valueLabelDisplay="auto"
      />
    </Box>
  );
};

export default RangeSlider;
