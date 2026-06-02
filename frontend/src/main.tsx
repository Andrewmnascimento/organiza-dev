import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import './index.css';
import App from './App.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Login } from './pages/Login.tsx';
import { Signup } from './pages/Signup.tsx';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/login', element: <Login />},
  { path: '/signup', element: <Signup />},
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
