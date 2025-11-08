import { createBrowserRouter } from 'react-router-dom';
import FormationPlanner from './pages/FormationPlanner';
import FormationsList from './pages/FormationsList';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <FormationPlanner />,
  },
  {
    path: '/formations',
    element: <FormationsList />,
  },
  {
    path: '/planner',
    element: <FormationPlanner />,
  },
]);

