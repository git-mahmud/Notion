import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/documents");
  }

  // Landing page for unauthenticated users
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span className="text-lg font-bold">Notion Clone</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Write, plan, organize.
          <br />
          <span className="text-muted-foreground">All in one place.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          A private workspace for your notes, tasks, and projects. No AI, no tracking — just you and
          your ideas.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/sign-up"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get started free →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        Private. Secure. No telemetry.
      </footer>
    </div>
  );
}
