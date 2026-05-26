import { useState } from "react";
export const Login = ({ page }) => {
  // mode refers to the page is login or signup
  const [mode, setMode] = useState(page);
  if (mode === "login") {
    return (
    <div>
      
    </div>
    )
  }
  else {
    return (
      <div>
        
      </div>
    )
  }
  
}