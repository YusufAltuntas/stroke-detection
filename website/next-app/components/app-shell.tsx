"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Beaker, Moon, Sun, ShieldAlert, BookOpen } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const NAV = [
  { href: "/", label: "Inference", code: "01", icon: Activity },
  { href: "/results", label: "Deneyler & Sonuclar", code: "02", icon: Beaker },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-svh flex-col">
      <BackgroundDecor />
      <TopNav />
      <PrototypeNotice />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function BackgroundDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-mesh opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-[0.35] dark:opacity-[0.25]"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-noise opacity-[0.35] mix-blend-overlay dark:opacity-[0.18]"
      />
    </>
  )
}

function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-6">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="CerebrAI"
        >
          <Logo className="h-9" />
          <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
            v0.1 · research
          </Badge>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="font-mono-tnum text-[10px] text-muted-foreground/80">
                  {item.code}
                </span>
                <span>{item.label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-md bg-muted"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/results"
            className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            aria-label="Tez ozeti"
          >
            <BookOpen className="size-3.5" />
            <span>Tez ozeti</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* mobile nav strip */}
      <div className="border-t border-border/60 px-6 py-1.5 md:hidden">
        <div className="flex gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-center text-xs font-medium",
                  active ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}

function Logo({ className }: { className?: string }) {
  // Transparan PNG; dark mode'da koyu lacivert -> beyaz olsun diye 'dark:invert'.
  return (
    <Image
      src="/cerebrai-logo.png"
      alt="CerebrAI"
      width={2000}
      height={442}
      priority
      sizes="200px"
      className={cn(
        "w-auto select-none object-contain dark:invert",
        className
      )}
    />
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Tema degistir"
      className="size-9 shadow-none"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            <Moon className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            <Sun className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}

function PrototypeNotice() {
  return (
    <div className="border-b border-border/60 bg-card/50">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-6 py-2 text-[12px]">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-warning/15 text-warning-foreground">
          <ShieldAlert className="size-3.5" />
        </span>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Arastirma prototipi.</span>{" "}
          Bu arayuz tibbi tani amaci tasimaz. Tum sonuclar model ciktilari ve guven
          skorlari olarak yorumlanmalidir.
        </p>
        <Badge variant="muted" className="ml-auto hidden font-mono-tnum text-[10px] normal-case sm:inline-flex">
          for research use only
        </Badge>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-6" />
          <span>· Iki asamali inme tespit boru hatti</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-mono-tnum">EfficientNet-B3 · DenseNet-121</span>
          <span>·</span>
          <span>2026 · Tez calismasi</span>
        </div>
      </div>
    </footer>
  )
}
