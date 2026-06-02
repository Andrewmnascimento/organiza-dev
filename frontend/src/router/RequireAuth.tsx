import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../lib/authStore";

export const RequireAuth = ({ children }) => {
  const status = useAuthStore(state => state.status);
  const location = useLocation();

  if (status === 'loading') {
     return (
       <div className="min-h-screen grid place-items-center bg-zinc-50 text-zinc-600">
         Loading…
       </div>
     );
   }
 
   if (status === 'unauthenticated') {
     return <Navigate to="/login" replace state={{ from: location.pathname }} />;
   }
 
   return children;
}