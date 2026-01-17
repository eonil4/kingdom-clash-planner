import { forwardRef } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotificationProps {
  open: boolean;
  message: string;
  severity?: ToastSeverity;
  autoHideDuration?: number;
  onClose: () => void;
}

const ToastNotification = forwardRef<HTMLDivElement, ToastNotificationProps>(
  ({ open, message, severity = 'info', autoHideDuration = 6000, onClose }, ref) => {
    return (
      <Snackbar
        ref={ref}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={onClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
          elevation={6}
        >
          {message}
        </Alert>
      </Snackbar>
    );
  }
);

ToastNotification.displayName = 'ToastNotification';

export default ToastNotification;
