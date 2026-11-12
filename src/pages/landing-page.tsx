import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Check,
  Compass,
  CursorClick,
  Heart,
  MagnifyingGlass,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react"
import { Link, Navigate } from "react-router"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { LanguageSwitcher, useI18n } from "@/i18n"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const categories = [
  { icon: <Sparkle size={18} />, title: "Design & creative", count: "01" },
  { icon: <CursorClick size={18} />, title: "Development", count: "02" },
  { icon: <Heart size={18} />, title: "Writing & content", count: "03" },
  { icon: <Compass size={18} />, title: "Marketing", count: "04" },
]

export function LandingPage() {
  const { t } = useI18n()
  const { user, ready } = useAuth()
  const primaryHref = user ? "/jobs" : "/register"

  if (user) return <Navigate to="/jobs" replace />

  return (
    <div className="min-h-svh overflow-hidden bg-[#f8f8f5] text-[#172232] dark:bg-background dark:text-foreground">
      <header className="relative z-10 mx-auto flex min-h-[76px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={t("Archer home")}>
          <span className="grid size-9 place-items-center rounded-xl bg-[#172232] text-white dark:bg-primary"><Sparkle size={19} weight="fill" /></span>
          <span className="text-[19px] font-semibold tracking-[-0.06em]">archer<span className="text-primary">.</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#68717d] lg:flex" aria-label={t("Main navigation")}>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">{t("How it works")}</a>
          <a href="#opportunities" className="transition-colors hover:text-foreground">{t("What you can do")}</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          {!ready ? <span className="hidden h-9 w-24 animate-pulse rounded-full bg-muted sm:block" /> : user ? (
            <Link to="/jobs" className={cn(buttonVariants({ size: "sm" }), "gap-2 rounded-full px-4")}>{t("Browse projects")}<ArrowUpRight size={15} /></Link>
          ) : <>
            <Link to="/login" className="hidden px-2 py-2 text-sm font-medium text-[#586270] transition-colors hover:text-foreground sm:inline-flex">{t("Log in")}</Link>
            <Link to="/register" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4 sm:px-5")}>{t("Get started")}<ArrowUpRight size={15} /></Link>
          </>}
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[625px] max-w-[1320px] items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-12 lg:pb-24 lg:pt-14">
          <div className="pointer-events-none absolute -top-28 right-[-90px] size-[430px] rounded-full bg-[#ffdf8d]/30 blur-[90px] dark:bg-primary/10" />
          <div className="relative z-[1] max-w-[650px]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dfe5dc] bg-white/70 px-3.5 py-2 text-[11px] font-semibold tracking-[0.11em] text-[#596557] uppercase dark:border-border dark:bg-card dark:text-muted-foreground">
              <span className="size-1.5 rounded-full bg-[#e4a750]" />{t("Independent work, made more human")}
            </div>
            <h1 className="max-w-[660px] text-[clamp(3.25rem,8vw,6.65rem)] leading-[0.94] font-semibold tracking-[-0.075em] text-[#172232] dark:text-foreground">
              {t("Good work,")}<br />{t("good people,")}<br /><span className="font-serif font-normal italic text-[#63745e] dark:text-primary">{t("better together.")}</span>
            </h1>
            <p className="mt-7 max-w-[470px] text-base leading-7 text-[#69727e] sm:text-lg sm:leading-8 dark:text-muted-foreground">{t("A thoughtful place for independent talent and the people with projects worth doing.")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryHref} className={cn(buttonVariants(), "h-12 gap-3 rounded-full bg-[#18283b] px-6 text-[14px] text-white shadow-[0_12px_24px_-14px_rgba(24,40,59,.7)] hover:bg-[#243b54] dark:bg-primary dark:text-primary-foreground")}>
                {t(user ? "Explore open projects" : "Find your next project")}<ArrowRight size={17} />
              </Link>
              {!user && <Link to="/register?role=CLIENT" className={cn(buttonVariants({ variant: "outline" }), "h-12 gap-2 rounded-full border-[#d9dfd8] bg-white/50 px-6 text-[14px] dark:bg-card")}>{t("Join as a client")}<ArrowUpRight size={15} /></Link>}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#69727e] dark:text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check size={15} weight="bold" className="text-[#667a61]" />{t("Clear project expectations")}</span>
              <span className="inline-flex items-center gap-1.5"><Check size={15} weight="bold" className="text-[#667a61]" />{t("USD and MMK shown clearly")}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[570px] lg:mr-0">
            <div className="absolute inset-7 rotate-[-5deg] rounded-[36px] bg-[#dce5d7] dark:bg-primary/10" />
            <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#efece2] p-4 shadow-[0_35px_80px_-45px_rgba(37,52,57,.38)] sm:p-6 dark:border-border dark:bg-card">
              <div className="relative min-h-[370px] overflow-hidden rounded-[23px] bg-[#d9e4dc] p-5 sm:min-h-[440px] sm:p-7 dark:bg-muted">
                <div className="absolute -top-20 right-[-35px] size-64 rounded-full bg-[#f3cb79]" />
                <div className="absolute top-[68px] right-[75px] size-32 rounded-full bg-[#f7e7b5] blur-[1px]" />
                <div className="absolute right-[-60px] bottom-[-125px] size-[330px] rounded-full border-[46px] border-[#7f9b87]/70" />
                <div className="absolute right-[-5px] bottom-[-92px] size-[235px] rounded-full border-[34px] border-[#536f60]/70" />
                <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-[#345344]/25 to-transparent" />
                <div className="relative z-[1] flex items-center justify-between text-[#345344]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1.5 text-[10px] font-semibold tracking-wide"><Sparkle size={13} weight="fill" />{t("A better way to work")}</span>
                  <span className="grid size-9 place-items-center rounded-full border border-white/60 bg-white/55"><ArrowDownRight size={17} /></span>
                </div>
                <div className="absolute right-5 bottom-5 left-5 z-[2] rounded-[18px] border border-white/70 bg-[#fffefa]/95 p-4 shadow-[0_16px_40px_-20px_rgba(20,42,36,.35)] sm:right-7 sm:bottom-7 sm:left-7 sm:p-5 dark:border-border dark:bg-background/95">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#818a7e] uppercase">{t("Made for meaningful work")}</p>
                      <h2 className="mt-2 text-xl leading-tight font-semibold tracking-[-0.045em] text-[#202c33] sm:text-2xl dark:text-foreground">{t("A place to do your best work.")}</h2>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e6eee4] text-[#4e6c55] dark:bg-primary/15 dark:text-primary"><Briefcase size={19} /></span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#e8e9e2] pt-4 text-xs dark:border-border">
                    <span className="flex items-center gap-2 text-[#727c75]"><UsersThree size={16} />{t("Independent talent, thoughtful teams")}</span>
                    <span className="font-semibold tracking-wide text-[#526b55]">USD · MMK</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 top-[22%] flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3.5 py-2.5 text-xs font-semibold text-[#35483c] shadow-lg sm:-right-5 dark:border-border dark:bg-card dark:text-foreground">
              <span className="grid size-7 place-items-center rounded-full bg-[#eef1df] text-[#637451]"><Heart size={15} weight="fill" /></span>{t("Made for good work")}
            </div>
          </div>
        </section>

        <section id="opportunities" className="border-y border-[#e8e9e2] bg-white/55 dark:border-border dark:bg-card/40">
          <div className="mx-auto grid max-w-[1320px] gap-9 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12 lg:py-[72px]">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.17em] text-[#75816f] uppercase">{t("A place for your kind of work")}</p>
              <h2 className="mt-3 max-w-md text-3xl leading-tight font-semibold tracking-[-0.06em] sm:text-[40px]">{t("Bring your skills. Find your people.")}</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">{t("Explore projects across creative, technical, and growing teams. Start with what you do best.")}</p>
              <Link to="/jobs" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">{t("Explore opportunities")}<ArrowRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {categories.map((category) => <Link key={category.title} to="/jobs" className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-[#e7e9e1] bg-white/75 px-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:px-5 dark:border-border dark:bg-card">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f1f3ea] text-[#63745e] transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-muted dark:text-primary">{category.icon}</span>
                <span className="min-w-0 flex-1 text-sm font-semibold tracking-[-0.02em]">{t(category.title)}</span>
                <span className="text-[10px] font-medium text-[#a1a69c]">{category.count}</span>
              </Link>)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[11px] font-semibold tracking-[0.17em] text-[#75816f] uppercase">{t("Simple by design")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] sm:text-[42px]">{t("The right work starts with a conversation.")}</h2>
          </div>
          <div className="mt-10 grid gap-3 md:grid-cols-3 lg:mt-14">
            <StepCard number="01" icon={<MagnifyingGlass size={19} />} title={t("Find a good fit")} body={t("Browse open projects and see the scope, engagement, and budget up front.")} />
            <StepCard number="02" icon={<UsersThree size={19} />} title={t("Meet the people") } body={t("Share a proposal or post a project, then get to know each other through conversation.")} />
            <StepCard number="03" icon={<Heart size={19} />} title={t("Make good work") } body={t("Align on the details together and focus on making something you’re proud of.")} />
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 pb-14 sm:px-8 lg:px-12 lg:pb-20">
          <div className="relative overflow-hidden rounded-[28px] bg-[#17283a] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute -top-36 right-[10%] size-72 rounded-full bg-[#b6c49f]/20 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#cfdbbd] uppercase">{t("Your next chapter starts here")}</p>
                <h2 className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.06em] sm:text-[42px]">{t("Let’s make good work happen.")}</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">{t("Create an account to discover projects, share your work, and connect with people who care about the details.")}</p>
              </div>
              <Link to={primaryHref} className={cn(buttonVariants(), "h-12 shrink-0 gap-2 rounded-full bg-[#dce7d1] px-6 text-[#203329] hover:bg-white")}>{t(user ? "Browse projects" : "Create your free account")}<ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 pb-7 text-xs text-[#7d857e] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span>© {new Date().getFullYear()} Archer · {t("Work, made more human.")}</span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-2"><span>{t("Independent work, with room to grow")}</span><span className="hidden size-1 rounded-full bg-[#b6bcb3] sm:block" /><Link to="/jobs" className="inline-flex items-center gap-1 font-medium hover:text-foreground">{t("Browse projects")}<ArrowUpRight size={12} /></Link></span>
      </footer>
    </div>
  )
}

function StepCard({ number, icon, title, body }: { number: string; icon: React.ReactNode; title: string; body: string }) {
  return <article className="rounded-2xl border border-border/70 bg-background/70 p-5 sm:p-6">
    <div className="flex items-center justify-between">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary">{icon}</span>
      <span className="text-xs font-medium tracking-[0.12em] text-muted-foreground/65">{number}</span>
    </div>
    <h3 className="mt-5 text-lg font-semibold tracking-[-0.035em]">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
  </article>
}
