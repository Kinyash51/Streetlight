"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

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
        toast.error(`Login failed: ${error.message}`);
        return;
      }
      
      toast.success(
        "Check your email. Your Streetlight login link is on the way."
      );
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  
    if (error) {
      toast.error("Google sign in failed. Please try again.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Login to Streetlight</h1>

        <button onClick={signInWithGoogle} className="btn-ghost">
  Continue with Google
</button>

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