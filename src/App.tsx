import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ErrorBoundary } from './components/organisms';
import { store } from './store';
import { router } from './router';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#111827',
      paper: '#1f2937',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
});

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
