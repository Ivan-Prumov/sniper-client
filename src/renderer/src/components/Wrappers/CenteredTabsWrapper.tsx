import * as React from 'react';
import { TabList } from '@mui/lab';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext'


export enum TABS {
    RUN_BENCHMARK = 'run_benchmark',
    GENERATE_CONFIG = 'generate_config'
}

interface ICenteredTabsWrapper {
    children: React.ReactNode;
}

export default function CenteredTabsWrapper({ children }: ICenteredTabsWrapper) {
    const [value, setValue] = React.useState<TABS>(TABS.GENERATE_CONFIG);

    const handleChange = (_: React.SyntheticEvent, newValue: TABS) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <TabContext value={value}>
           
                    <TabList onChange={handleChange} aria-label="tab-list">
                        <Tab sx={{ maxWidth: 'unset', flex: 1 }} label="Generate Config" value={TABS.GENERATE_CONFIG} />
                        <Tab sx={{ maxWidth: 'unset', flex: 1 }} label="Run Benchmark" value={TABS.RUN_BENCHMARK} />
                    </TabList>
             
                {children}
            </TabContext>
        </Box>
    );
}