
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';


interface ILoadingOverlayProps {
    isLoading: boolean;

}

export default function LoadingOverlay({ isLoading }: ILoadingOverlayProps) {

    return (
        <div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
            >
                <CircularProgress color="inherit" size={'64px'}  />
            </Backdrop>
        </div>
    );
}