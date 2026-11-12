import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Briefcase, Check, LockKey, Sparkle, User } from "@phosphor-icons/react"
import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api"
import { LanguageSwitcher, useI18n } from "@/i18n"

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register"
  const { t } = useI18n()
  const { signIn, register, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState<"CLIENT" | "FREELANCER">(searchParams.get("role") === "CLIENT" ? "CLIENT" : "FREELANCER")
  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      if (isRegister) {
        await register({
          email: String(form.get("email")),
          password: String(form.get("password")),
          displayName: String(form.get("displayName")),
          role,
        })
      } else {
        await signIn(String(form.get("email")), String(form.get("password")))
      }
    },
    onSuccess: () => navigate("/"),
  })

  useEffect(() => { if (user) navigate("/", { replace: true }) }, [user, navigate])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    mutation.mutate(new FormData(event.currentTarget))
  }

  return <main className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
    <section className="flex flex-col px-5 py-6 sm:px-10 lg:px-14">
      <Link to="/jobs" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft size={17} /> {t("Back to jobs")}
      </Link>
      <div className="mt-4 flex items-center gap-2"><LanguageSwitcher /><ThemeToggle /></div>
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-14">
        <Link to="/" className="mb-10 flex w-fit items-center gap-2.5 text-xl font-semibold tracking-[-0.06em] text-foreground">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkle weight="fill" size={19} /></span>
          archer<span className="-ml-2 text-primary">.</span>
        </Link>
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{t(isRegister ? "Start your next chapter" : "Welcome back")}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">{t(isRegister ? "Make good work happen." : "Good to see you again.")}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {t(isRegister ? "Create your Archer account and find your place in a better way to work." : "Sign in to pick up where you left off.")}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          {isRegister && <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="displayName">{t("Your name")}</label>
            <input id="displayName" name="displayName" required minLength={1} maxLength={80} autoComplete="name" placeholder={t("How should we call you?")} className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" />
          </div>}
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="email">{t("Email address")}</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">{t("Password")}</label>
              {!isRegister && <span className="text-xs text-muted-foreground">{t("At least 10 characters")}</span>}
            </div>
            <div className="relative">
              <LockKey size={17} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
              <input id="password" name="password" type="password" required minLength={isRegister ? 10 : 1} maxLength={128} autoComplete={isRegister ? "new-password" : "current-password"} placeholder="••••••••••" className="h-11 w-full rounded-xl border border-input bg-background pr-3.5 pl-10 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" />
            </div>
          </div>
          {isRegister && <fieldset>
            <legend className="mb-2 text-sm font-medium">{t("I’m here as a")}</legend>
            <div className="grid grid-cols-2 gap-3">
              <RoleChoice active={role === "FREELANCER"} icon={<User size={18} />} title={t("Freelancer")} description={t("Find your next project")} onClick={() => setRole("FREELANCER")} />
              <RoleChoice active={role === "CLIENT"} icon={<Briefcase size={18} />} title={t("Client")} description={t("Find great talent")} onClick={() => setRole("CLIENT")} />
            </div>
          </fieldset>}
          {mutation.error && <div role="alert" className="rounded-xl border border-destructive/15 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
            {mutation.error instanceof ApiError ? mutation.error.message : t("Something went wrong. Please try again.")}
          </div>}
          <Button type="submit" disabled={mutation.isPending} className="h-11 w-full rounded-xl text-sm">
            {mutation.isPending ? t("Please wait…") : t(isRegister ? "Create your account" : "Log in to Archer")}
          </Button>
          <p className="text-center text-xs leading-5 text-muted-foreground">{t("By continuing, you agree to use Archer with respect for the people you work with.")}</p>
        </form>
        <p className="mt-7 text-center text-sm text-muted-foreground">
          {t(isRegister ? "Already have an account? " : "New to Archer? ")}
          <Link className="font-semibold text-primary hover:underline" to={isRegister ? "/login" : "/register"}>{t(isRegister ? "Log in" : "Create an account")}</Link>
        </p>
      </div>
    </section>
    <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,.25),transparent_28%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,.16),transparent_34%)]" />
      <div className="relative flex justify-end"><span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs tracking-wide text-white/85">{t("Work, with a little more heart.")}</span></div>
      <div className="relative max-w-lg">
        <div className="mb-8 flex gap-2">
          <span className="grid size-12 place-items-center rounded-2xl border border-white/20 bg-white/10"><Briefcase size={22} /></span>
          <span className="grid size-12 place-items-center rounded-2xl border border-white/20 bg-white/10"><User size={22} /></span>
          <span className="grid size-12 place-items-center rounded-2xl border border-white/20 bg-white/10"><Sparkle size={22} weight="fill" /></span>
        </div>
        <h2 className="text-5xl leading-[1.08] font-semibold tracking-[-0.06em]">{t("Good people.")}<br />{t("Good projects.")}<br /><span className="text-white/65">{t("Better work.")}</span></h2>
        <p className="mt-6 max-w-md text-base leading-7 text-white/75">{t("A thoughtful place for independent talent and the teams who need them. Find work that feels like a fit.")}</p>
      </div>
      <div className="relative flex items-center gap-2 text-xs text-white/65"><Check size={15} weight="bold" /> {t("Open opportunities in USD and MMK")}</div>
    </aside>
  </main>
}

function RoleChoice({ active, icon, title, description, onClick }: {
  active: boolean; icon: React.ReactNode; title: string; description: string; onClick: () => void
}) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`flex flex-col rounded-xl border p-3.5 text-left transition-all ${active ? "border-primary/50 bg-primary/5 ring-2 ring-primary/10" : "border-border bg-background hover:border-primary/20 hover:bg-muted/40"}`}>
    <span className={`mb-2 grid size-8 place-items-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{icon}</span>
    <span className="text-sm font-semibold">{title}</span>
    <span className="mt-0.5 text-[11px] text-muted-foreground">{description}</span>
  </button>
}
