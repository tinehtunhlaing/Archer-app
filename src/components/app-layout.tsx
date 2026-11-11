import { Briefcase, ChatCircleDots, UserCircle, ListBullets, SignOut, Sparkle, User } from "@phosphor-icons/react"
import { Link, NavLink, Outlet, useNavigate } from "react-router"
import type { ReactNode } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { LanguageSwitcher, useI18n } from "@/i18n"

export function AppLayout() {
  const { user, ready, signOut } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const leave = () => {
    signOut()
    navigate("/")
  }

  return (
    <div className="min-h-svh bg-[#f7f8fa] text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-8">
          <Link to="/" className="group flex items-center gap-2.5" aria-label={t("Archer home")}>
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6">
              <Sparkle weight="fill" size={20} />
            </span>
            <span className="text-[19px] font-semibold tracking-[-0.06em]">archer<span className="text-primary">.</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label={t("Main navigation")}>
            <NavigationLink to="/" icon={<Briefcase size={17} />}>{t("Find work")}</NavigationLink>
            {user?.role === "FREELANCER" && <NavigationLink to="/proposals" icon={<ListBullets size={17} />}>{t("My proposals")}</NavigationLink>}
            {user?.role === "CLIENT" && <NavigationLink to="/jobs/new" icon={<Briefcase size={17} />}>{t("Post a job")}</NavigationLink>}
            {user && <NavigationLink to="/messages" icon={<ChatCircleDots size={17} />}>{t("Messages")}</NavigationLink>}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {!ready ? <div className="h-9 w-24 animate-pulse rounded-full bg-muted" /> : user ? (
              <>
                <Link to="/profile" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden gap-2 sm:inline-flex")}>
                  <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary"><UserCircle size={18} /></span>
                  <span className="max-w-32 truncate">{user.profile?.displayName || user.email}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={leave} className="gap-2">
                  <SignOut size={16} /><span className="hidden sm:inline">{t("Sign out")}</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>{t("Log in")}</Link>
                <Link to="/register" className={cn(buttonVariants({ size: "sm" }), "px-4")}>{t("Join Archer")}</Link>
              </>
            )}
          </div>
        </div>
        {user && <div className="border-t border-border/50 md:hidden">
          <nav className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-4 py-2.5 sm:px-8" aria-label={t("Mobile navigation")}>
            <MobileLink to="/" icon={<Briefcase size={15} />}>{t("Work")}</MobileLink>
            {user.role === "FREELANCER" && <MobileLink to="/proposals" icon={<ListBullets size={15} />}>{t("Proposals")}</MobileLink>}
            {user.role === "CLIENT" && <MobileLink to="/jobs/new" icon={<Briefcase size={15} />}>{t("Post")}</MobileLink>}
            <MobileLink to="/messages" icon={<ChatCircleDots size={15} />}>{t("Messages")}</MobileLink>
            <MobileLink to="/profile" icon={<User size={15} />}>{t("Profile")}</MobileLink>
          </nav>
        </div>}
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>
      <footer className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 pb-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© {new Date().getFullYear()} Archer · {t("Work, made more human.")}</span>
        <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" /> {t("Built for USD and MMK opportunities")}</span>
      </footer>
    </div>
  )
}

function NavigationLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return <NavLink to={to} end={to === "/"} className={({ isActive }) => cn(
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
    isActive ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
  )}>{icon}{children}</NavLink>
}

function MobileLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return <NavLink to={to} end={to === "/"} className={({ isActive }) => cn(
    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
    isActive ? "bg-primary/10 text-primary" : "bg-muted/70 text-muted-foreground",
  )}>{icon}{children}</NavLink>
}

export function PageTitle({ eyebrow, title, description, action }: {
  eyebrow?: string; title: string; description?: string; action?: ReactNode
}) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold tracking-[-0.055em] sm:text-[38px]">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  const { t } = useI18n()
  return <div className="grid min-h-48 place-items-center text-sm text-muted-foreground"><span className="flex items-center gap-3"><span className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />{t(label)}…</span></div>
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  const { t } = useI18n()
  return <div className="rounded-2xl border border-destructive/15 bg-destructive/5 px-5 py-4 text-sm text-destructive">
    <p>{message}</p>{retry && <button onClick={retry} className="mt-2 font-semibold underline underline-offset-4">{t("Try again")}</button>}
  </div>
}

export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description: string; action?: ReactNode
}) {
  return <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-border bg-background/70 p-8 text-center">
    <div className="max-w-sm">
      {icon && <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary/8 text-primary">{icon}</div>}
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  </div>
}

export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user, ready } = useAuth()
  const { t } = useI18n()
  if (!ready) return <LoadingState label="Checking your account" />
  if (!user) return <EmptyState icon={<UserCircle size={22} />} title={t("Sign in to continue")} description={t("Your Archer account keeps your work and conversations together.")} action={<Link to="/login" className={buttonVariants()}>{t("Log in")}</Link>} />
  if (!roles.includes(user.role)) return <EmptyState title={t("This page is for another role")} description={t("Your account does not have access to this workflow.")} action={<Link to="/" className={buttonVariants({ variant: "outline" })}>{t("Back to jobs")}</Link>} />
  return children
}
