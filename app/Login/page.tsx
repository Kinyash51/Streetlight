"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the login link.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Login to Streetlight</h1>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={signIn} className="btn-primary">
          Send Login Link
        </button>
      </div>
    </main>
  );
}