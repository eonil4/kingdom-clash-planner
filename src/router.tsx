import { createBrowserRouter } from 'react-router-dom';
import FormationPlanner from './pages/FormationPlanner';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <FormationPlanner />,
  },
]);

