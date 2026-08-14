import { createBrowserRouter, RouterProvider } from 'react-router';
import { HomePage } from '../pages/HomePage';
import { Dashboard } from '../pages/Dashboard.tsx';
import { RequireAuth } from './RequireAuth.tsx';
import { Login } from '../pages/Login.tsx';
import { Signup } from '../pages/Signup.tsx';
import { CheckEmail } from '../pages/CheckEmail.tsx';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {
    path: '/dashboard', element: 
      <RequireAuth> 
        <Dashboard />
      </RequireAuth>
  },
  { path: '/login', element: <Login />},
  { path: '/signup', element: <Signup /> },
  { path: '/check-email', element: <CheckEmail />}
]);

export const AppRouter = () => {
  return (
    <RouterProvider router={router} />
  )
}