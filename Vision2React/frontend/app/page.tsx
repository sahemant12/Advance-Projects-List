import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Enhanced Background effects with flowing gradient */}
        <div className="absolute inset-0">
          {/* Animated gradient overlay - only at the top */}
          <div
            className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent animate-pulse"
            style={{ animationDuration: "8s" }}
          ></div>

          {/* Flowing vertical gradient - only upper portion */}
          <div
            className="absolute inset-x-0 top-0 h-[70%] opacity-30"
            style={{
              background:
                "linear-gradient(180deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 100%)",
              animation: "gradientFlow 10s ease-in-out infinite",
            }}
          ></div>

          {/* Animated orbs - only at the top */}
          <div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "6s" }}
          ></div>
          <div
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "8s", animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center space-y-12 md:space-y-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-md border border-primary/30 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 group">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent shadow-lg shadow-accent/50"></span>
              </span>
              <span className="text-sm md:text-base text-foreground font-semibold tracking-wide group-hover:text-primary transition-colors">
                AI-Powered Design to Code
              </span>
              <svg
                className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
                Transform <span className="gradient-text">Figma Designs</span>
                <br />
                into Production Code
              </h1>
            </div>

            {/* Subheadline */}
            <div className="space-y-6">
              <p className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Paste your Figma URL and watch AI convert it into clean,
                responsive React components. No more manual coding. No more
                pixel pushing.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
              <Link href="/setup-token">
                <Button
                  size="lg"
                  className="min-w-[220px] h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
                >
                  Get Started →
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[220px] h-14 text-lg font-semibold hover:bg-primary/5 transition-all"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-12 md:gap-16 pt-12 md:pt-16">
              <div className="text-center group cursor-default">
                <div className="text-4xl md:text-5xl font-bold text-accent group-hover:scale-110 transition-transform duration-300">
                  10x
                </div>
                <div className="text-sm md:text-base text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                  Faster Development
                </div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-4xl md:text-5xl font-bold text-accent group-hover:scale-110 transition-transform duration-300">
                  100%
                </div>
                <div className="text-sm md:text-base text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                  Responsive Code
                </div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-4xl md:text-5xl font-bold text-accent group-hover:scale-110 transition-transform duration-300">
                  AI
                </div>
                <div className="text-sm md:text-base text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                  Powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Complete Redesign */}
      <section className="max-w-[1400px] mx-auto px-6 py-32">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Why Vision2React?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The fastest way to ship pixel-perfect designs without writing a
            single line of code
          </p>
        </div>

        {/* Perfect Bento Grid - 4 columns, perfectly aligned */}
        <div className="grid grid-cols-4 grid-rows-3 gap-3 h-[800px]">
          {/* Row 1, Col 1-2: Smart Detection (Wide) */}
          <div className="col-span-2 row-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/70 border border-zinc-800 hover:border-primary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative h-full p-8 flex flex-col justify-center">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Smart Section Detection</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    AI automatically identifies logical components in your
                    design, breaking down complex layouts into reusable React
                    components. Save hours of manual work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Row 1, Col 3-4: Lightning Fast (Wide) */}
          <div className="col-span-2 row-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/70 border border-zinc-800 hover:border-secondary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl" />

            <div className="relative h-full p-8 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Lightning Fast</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Parallel processing for instant results. Convert entire
                    design systems in minutes, not hours. Watch your components
                    generate in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 flex-shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                <span className="text-xs font-semibold text-secondary">
                  Real-time
                </span>
              </div>
            </div>
          </div>

          {/* Row 2, Col 1: TypeScript (Small) */}
          <div className="col-span-1 row-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/70 border border-zinc-800 hover:border-accent/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

            <div className="relative h-full p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M0 12v12h24V0H0zm19.341-.956c.61.152 1.074.423 1.501.865.221.236.549.666.575.77.008.03-1.036.73-1.668 1.123-.023.015-.115-.084-.217-.236-.31-.45-.633-.644-1.128-.678-.728-.05-1.196.331-1.192.967a.88.88 0 00.102.45c.16.331.458.53 1.39.933 1.719.74 2.454 1.227 2.911 1.92.51.773.625 2.008.278 2.926-.38.998-1.325 1.676-2.655 1.9-.411.073-1.386.062-1.828-.018-.964-.172-1.878-.648-2.442-1.273-.221-.244-.651-.88-.625-.925.011-.016.11-.077.22-.141.108-.061.511-.294.892-.515l.69-.4.145.214c.202.308.643.731.91.872.766.404 1.817.347 2.335-.118a.883.883 0 00.313-.72c0-.278-.035-.4-.18-.61-.186-.266-.567-.49-1.649-.96-1.238-.533-1.771-.864-2.259-1.39a3.165 3.165 0 01-.659-1.2c-.091-.339-.114-1.189-.042-1.531.255-1.197 1.158-2.03 2.461-2.278.423-.08 1.406-.05 1.821.053zm-5.634 1.002l.008.983H10.59v8.876H8.38v-8.876H5.258v-.964c0-.534.011-.98.026-.99.012-.016 1.913-.024 4.217-.02l4.195.012z" />
                  </svg>
                </div>
                <div className="px-2 py-1 rounded-md bg-accent/10 text-accent text-[10px] font-bold">
                  TS
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">TypeScript</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Full type safety with IntelliSense support. Catch errors early
                  and ship with confidence.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2, Col 2-3: Hero Feature (Large Square) */}
          <div className="col-span-2 row-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/70 border border-zinc-800 hover:border-primary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-gradient-to-tl from-primary/20 to-secondary/20 rounded-full blur-3xl" />

            <div className="relative h-full p-10 flex flex-col">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>

                <h3 className="text-3xl font-bold mb-4">
                  Production Ready Code
                </h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  Get clean, maintainable React components with proper
                  structure, styling, and accessibility built-in.
                </p>
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-zinc-400">Component architecture</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-zinc-400">Accessibility standards</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-zinc-400">Optimized performance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2, Col 4: Responsive (Small) */}
          <div className="col-span-1 row-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/70 border border-zinc-800 hover:border-primary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative h-full p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex gap-1">
                  {[12, 16, 20, 24].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-primary/60 to-primary/20 group-hover:from-primary/80 group-hover:to-primary/40 transition-all"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">Responsive</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Mobile-first approach with adaptive breakpoints. Works
                  perfectly across all devices.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3, Col 1: Preview (Small) */}
          <div className="col-span-1 row-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/70 border border-zinc-800 hover:border-accent/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

            <div className="relative h-full p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-accent/30"
                    ></div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">Live Preview</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  See changes in real-time as you edit. Instant hot reload keeps
                  your development flow uninterrupted.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3, Col 4: Clean Code (Small) */}
          <div className="col-span-1 row-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/70 border border-zinc-800 hover:border-secondary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

            <div className="relative h-full p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-0.5 bg-secondary/30 rounded-full"
                    ></div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">Clean Code</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Readable, maintainable component structure. Follow best
                  practices with proper naming and organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-32 overflow-hidden">
        {/* Enhanced background decoration */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "1s" }}
          />
        </div>

        <div className="text-center space-y-6 mb-24">
          {/* Enhanced heading with gradient and animation */}
          <div className="inline-flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Simple Process
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">
              <span className="inline-block hover:scale-105 transition-transform duration-300">
                How
              </span>{" "}
              <span className="inline-block hover:scale-105 transition-transform duration-300">
                It
              </span>{" "}
              <span className="gradient-text inline-block hover:scale-110 transition-transform duration-300">
                Works
              </span>
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <span className="text-foreground font-semibold">
              Three simple steps
            </span>{" "}
            to transform your designs into{" "}
            <span className="text-accent">production-ready code</span>
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative">
            {/* Enhanced connection line - positioned at center of icons */}
            <div
              className="hidden md:block absolute top-[48px] h-[2px]"
              style={{
                left: "calc(16.66% + 48px)",
                right: "calc(16.66% + 48px)",
              }}
            >
              {/* Base gradient line */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
              {/* Animated overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse" />
            </div>

            {/* Step 1 */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center space-y-8">
                {/* Icon container with enhanced design */}
                <div className="relative z-10">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Icon box */}
                    <div className="relative w-24 h-24 rounded-[20px] gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:shadow-[0_20px_60px_-15px] group-hover:shadow-primary/50 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 border border-primary/20">
                      <svg
                        className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>

                    {/* Step number badge */}
                    <div className="absolute -top-3 -right-3 w-11 h-11 rounded-full bg-primary text-white text-base font-bold flex items-center justify-center border-4 border-background shadow-xl shadow-primary/50 group-hover:scale-110 transition-transform duration-300">
                      1
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold group-hover:gradient-text transition-all duration-300">
                    Paste Figma URL
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base max-w-xs mx-auto group-hover:text-foreground/80 transition-colors duration-300">
                    Simply paste your Figma design URL. We&apos;ll fetch and
                    analyze the entire design structure.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative z-10">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative w-24 h-24 rounded-[20px] gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:shadow-[0_20px_60px_-15px] group-hover:shadow-primary/50 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 border border-primary/20">
                      <svg
                        className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>

                    <div className="absolute -top-3 -right-3 w-11 h-11 rounded-full bg-primary text-white text-base font-bold flex items-center justify-center border-4 border-background shadow-xl shadow-primary/50 group-hover:scale-110 transition-transform duration-300">
                      2
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold group-hover:gradient-text transition-all duration-300">
                    AI Processes
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base max-w-xs mx-auto group-hover:text-foreground/80 transition-colors duration-300">
                    Watch as AI breaks down sections, extracts styles, and
                    generates React components in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative z-10">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative w-24 h-24 rounded-[20px] gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:shadow-[0_20px_60px_-15px] group-hover:shadow-primary/50 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 border border-primary/20">
                      <svg
                        className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>

                    <div className="absolute -top-3 -right-3 w-11 h-11 rounded-full bg-primary text-white text-base font-bold flex items-center justify-center border-4 border-background shadow-xl shadow-primary/50 group-hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold group-hover:gradient-text transition-all duration-300">
                    Get Production Code
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base max-w-xs mx-auto group-hover:text-foreground/80 transition-colors duration-300">
                    Preview your live site and download clean, production-ready
                    React code instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="relative group">
          {/* Enhanced glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

          <Card className="relative border border-primary/30 bg-gradient-to-br from-card/95 via-card/95 to-primary/5 backdrop-blur-sm overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                  backgroundSize: "4rem 4rem",
                }}
              />
            </div>

            <div className="relative text-center px-8 py-20 md:px-16 md:py-24">
              {/* Decorative corner elements */}
              <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-primary/20 rounded-tl-2xl" />
              <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-primary/20 rounded-br-2xl" />

              {/* Floating orbs */}
              <div className="absolute top-1/4 left-8 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-8 w-40 h-40 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl animate-pulse delay-700" />

              <div className="relative space-y-8">
                <div className="space-y-6">
                  <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                    Ready to Ship{" "}
                    <span className="gradient-text inline-block">Faster</span>?
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Join developers who are already building{" "}
                    <span className="text-accent font-semibold">
                      10x faster
                    </span>{" "}
                    with AI-powered design-to-code conversion.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                  <Link href="/setup-token">
                    <Button
                      size="lg"
                      className="min-w-[280px] text-lg h-14 font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                    >
                      Start Converting Now →
                    </Button>
                  </Link>
                </div>

                {/* Enhanced social proof badges */}
                <div className="flex flex-wrap justify-center gap-8 pt-10">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-accent"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-accent">
                      No credit card required
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-accent"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-accent">
                      Free to start
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-gradient-to-b from-background via-muted/10 to-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-5 space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold gradient-text">
                  Vision2React
                </h3>
                <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                  Transform Figma designs into production-ready React code with
                  the power of AI. Ship faster, build better.
                </p>
              </div>
            </div>

            {/* Links - Resources */}
            <div className="md:col-span-3 space-y-5">
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Documentation</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Tutorial</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    <span>Examples</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Links - Community */}
            <div className="md:col-span-4 space-y-5">
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                Community
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/kr1shna-exe/vision2react"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                    </svg>
                    <span>Discord</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/KrishXCodes"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    <span>X</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted-foreground">
              © 2024 Vision2React
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
