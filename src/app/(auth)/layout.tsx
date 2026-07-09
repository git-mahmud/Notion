export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-2xl">📝</span>
          <span>Notion Clone</span>
        </div>
        <div>
          <blockquote className="space-y-2">
            <p className="text-lg">
              &quot;Organize your thoughts, manage your projects, and collaborate with your team —
              all in one place.&quot;
            </p>
          </blockquote>
        </div>
        <p className="text-sm text-zinc-400">
          A private, production-ready workspace — no AI, no tracking.
        </p>
      </div>

      {/* Right side - auth form */}
      <div className="flex w-full items-center justify-center bg-background lg:w-1/2">
        <div className="w-full max-w-[400px] px-8">{children}</div>
      </div>
    </div>
  );
}
