import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { GoogleButton } from "../components/ui/GoogleButton"
import { supabase } from "../lib/supabase"
import { useState } from "react"

export const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className=" flex flex-col gap-4 m-4 items-center justify-center min-h-screen">
      <h1 className="text-4xl font-medium">Organiza <br />Dev</h1>
      <Input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)}/>
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
      <Button className={' min-w-52'}>
        Signup
      </Button>

      <div className="flex items-center  my-2">
        <div className="flex-1 h-px bg-zinc-200"></div>
        <span className="px-3 text-xs text-zinc-400 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-zinc-200"></div>
      </div>
      <GoogleButton />
    </div>
  )
}