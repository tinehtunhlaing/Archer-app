import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Briefcase, CurrencyDollar, Info } from "@phosphor-icons/react"
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { PageTitle, RequireRole } from "@/components/app-layout"
import { ApiError, apiRequest, type Currency, type Job } from "@/lib/api"
import { useI18n } from "@/i18n"

export function NewJobPage() {
  return <RequireRole roles={["CLIENT"]}><NewJobForm /></RequireRole>
}

function NewJobForm() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currency, setCurrency] = useState<Currency>("USD")
  const [budgetType, setBudgetType] = useState<"FIXED" | "HOURLY">("FIXED")
  const [budgetError, setBudgetError] = useState("")
  const mutation = useMutation({
    mutationFn: (input: Record<string, string>) => apiRequest<Job>("/jobs", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (job) => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] })
      navigate(`/jobs/${job.id}`)
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const budgetMin = String(data.get("budgetMin") || "").trim()
    const budgetMax = String(data.get("budgetMax") || "").trim()
    if (Boolean(budgetMin) !== Boolean(budgetMax)) {
      setBudgetError(t("Add both ends of your budget range, or leave both blank."))
      return
    }
    setBudgetError("")
    mutation.mutate({
      title: String(data.get("title")),
      description: String(data.get("description")),
      budgetType,
      currency,
      ...(budgetMin && budgetMax ? { budgetMin, budgetMax } : {}),
    })
  }

  return <div className="mx-auto max-w-3xl">
    <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft size={16} /> {t("Back to opportunities")}</Link>
    <div className="rounded-3xl border border-border/80 bg-background p-6 shadow-[0_12px_45px_-36px_rgba(20,35,66,.32)] sm:p-9">
      <PageTitle eyebrow={t("For clients")} title={t("Put good work out there.")} description={t("Share enough detail to help the right freelancer decide whether to apply.")} />
      <form onSubmit={submit} className="space-y-6">
        <div><label htmlFor="title" className="mb-2 block text-sm font-medium">{t("Project title")}</label><input id="title" name="title" required minLength={5} maxLength={120} placeholder={t("e.g. Brand identity for a neighborhood café")} className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" /><p className="mt-1.5 text-xs text-muted-foreground">{t("Be specific about the work you need done.")}</p></div>
        <div><label htmlFor="description" className="mb-2 block text-sm font-medium">{t("What do you need help with?")}</label><textarea id="description" name="description" required minLength={30} maxLength={10000} rows={8} placeholder={t("Describe the project, what success looks like, and anything a freelancer should know before reaching out…")} className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" /><p className="mt-1.5 text-xs text-muted-foreground">{t("At least 30 characters. Clear details lead to better proposals.")}</p></div>

        <fieldset><legend className="mb-2 text-sm font-medium">{t("How would you like to work?")}</legend><div className="grid gap-3 sm:grid-cols-2">
          <BudgetChoice active={budgetType === "FIXED"} title={t("Fixed project")} description={t("One amount for the full project")} onClick={() => setBudgetType("FIXED")} />
          <BudgetChoice active={budgetType === "HOURLY"} title={t("Hourly")} description={t("Pay based on time worked")} onClick={() => setBudgetType("HOURLY")} />
        </div></fieldset>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_160px]">
          <div><label htmlFor="budgetMin" className="mb-2 block text-sm font-medium">{t("Budget from")} <span className="font-normal text-muted-foreground">({t("optional")})</span></label><input id="budgetMin" name="budgetMin" inputMode="decimal" pattern="[0-9]{1,12}([.][0-9]{1,4})?" placeholder="e.g. 500" className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" /></div>
          <div><label htmlFor="budgetMax" className="mb-2 block text-sm font-medium">{t("Budget to")} <span className="font-normal text-muted-foreground">({t("optional")})</span></label><input id="budgetMax" name="budgetMax" inputMode="decimal" pattern="[0-9]{1,12}([.][0-9]{1,4})?" placeholder="e.g. 1,000" className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" /></div>
          <div><label htmlFor="currency" className="mb-2 block text-sm font-medium">{t("Currency")}</label><select id="currency" value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/25"><option value="USD">USD</option><option value="MMK">MMK</option></select></div>
        </div>
        {budgetError && <p role="alert" className="-mt-4 text-sm text-destructive">{budgetError}</p>}

        <div className="flex gap-3 rounded-xl bg-muted/60 p-4 text-xs leading-5 text-muted-foreground"><Info size={17} className="mt-0.5 shrink-0 text-primary" /><p>{t("Archer displays the amount and currency you choose. The platform does not convert currencies or process payments.")}</p></div>
        {mutation.isError && <p role="alert" className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{mutation.error instanceof ApiError ? mutation.error.message : t("Could not create the project.")}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link to="/" className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium hover:bg-muted">{t("Cancel")}</Link><Button type="submit" disabled={mutation.isPending} className="h-11 gap-2 rounded-xl px-6"><Briefcase size={17} />{mutation.isPending ? t("Publishing…") : t("Publish project")}</Button></div>
      </form>
    </div>
  </div>
}

function BudgetChoice({ active, title, description, onClick }: { active: boolean; title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-xl border p-4 text-left transition-all ${active ? "border-primary/45 bg-primary/5 ring-2 ring-primary/10" : "border-border hover:border-primary/20 hover:bg-muted/30"}`}>
    <span className="mb-2 grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><CurrencyDollar size={17} /></span>
    <span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span>
  </button>
}
