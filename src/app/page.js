"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabaseClient"

export default function Home() {

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/bookmarks")
      }
    }
    checkUser()
  }, [router])

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/bookmarks'
      }
    })
  }

  return (
    <div style={{ padding: "50px" }}>
      <h1>Google Login Demo</h1>
      <button onClick={loginWithGoogle}>
        Login with Google
      </button>
    </div>
  )
}
