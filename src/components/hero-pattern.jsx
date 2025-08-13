
export function HeroPattern() {
  return (
    <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-secondary/30 shadow-inner">
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r="50%" fill="url(#grad)" />
        </svg>
      </div>
      <div className="absolute inset-0 z-10" style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, hsl(var(--accent)/0.1) 1px, transparent 1px),
          radial-gradient(circle at 90% 80%, hsl(var(--accent)/0.1) 1px, transparent 1px),
          radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.05) 1px, transparent 1px)
        `,
        backgroundSize: '3rem 3rem',
      }}></div>
    </div>
  );
}
