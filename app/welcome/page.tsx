"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login?next=/welcome");
        return;
      }

      setUser(session.user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  const name =
    user?.user_metadata?.name ??
    user?.user_metadata?.user_name ??
    user?.email?.split("@")[0] ??
    "Reader";

  if (loading) {
    return (
      <main className="welcome-page">
        <section className="welcome-shell">
          <p className="section-tag">Streetlight</p>
          <h1>Opening the door...</h1>
          <div className="dashboard-loading-line" aria-hidden="true" />
        </section>
      </main>
    );
  }

  return (
    <main className="welcome-page">
      <section className="welcome-shell">
        <div className="welcome-lamp" aria-hidden="true" />

        <p className="section-tag">Welcome to Streetlight</p>
        <h1>The rain remembers you, {name}.</h1>
        <p>
          Your reader home is ready. Chapter One is open, your access is saved,
          and the rest of the city waits under the amber light.
        </p>

        <div className="welcome-actions">
          <Link href="/dashboard" className="btn-primary">
            Enter Dashboard
          </Link>
          <Link href="/read/chapter-one" className="btn-ghost">
            Start Reading
          </Link>
        </div>
      </section>
    </main>
  );
}
