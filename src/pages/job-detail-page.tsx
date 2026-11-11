import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowUpRight, Briefcase, Check, Clock, CurrencyDollar, PaperPlaneRight, UsersThree } from "@phosphor-icons/react"
import { useState, type ReactNode, type FormEvent } from "react"
import { Link, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { EmptyState, ErrorState, LoadingState } from "@/components/app-layout"
import { ApiError, apiRequest, formatMoney, timeAgo, type Job, type Proposal } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/i18n"

export function JobDetailPage() {
  const { jobId = "" } = useParams()
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const queryClient = useQueryClient()
  const [coverLetter, setCoverLetter] = useState("")
  const [bidAmount, setBidAmount] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const jobQuery = useQuery({ queryKey: ["job", jobId], queryFn: () => apiRequest<Job>(`/jobs/${jobId}`), enabled: Boolean(jobId) })
  const job = jobQuery.data
  const ownsJob = Boolean(job && user?.role === "CLIENT" && user.id === job.clientId)
  const proposalsQuery = useQuery({
    queryKey: ["proposals", "job", jobId],
    queryFn: () => apiRequest<Proposal[]>(`/proposals/jobs/${jobId}`),
    enabled: ownsJob,
  })
  const proposalMutation = useMutation({
    mutationFn: () => apiRequest<{ proposal: Proposal; conversation: { id: string } }>(`/proposals/jobs/${jobId}`, {
      method: "POST",
      body: JSON.stringify({ coverLetter: coverLetter.trim(), ...(bidAmount ? { bidAmount } : {}) }),
    }),
    onSuccess: (result) => {
      setSubmitted(true)
      setConversationId(result.conversation.id)
      void queryClient.invalidateQueries({ queryKey: ["proposals", "me"] })
      void queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })
  const rejectMutation = useMutation({
    mutationFn: (proposalId: string) => apiRequest<Proposal>(`/proposals/${proposalId}/reject`, { method: "PATCH" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["proposals", "job", jobId] }),
  })

  if (jobQuery.isPending) return <LoadingState label="Opening this project" />
  if (jobQuery.isError) return <ErrorState message={jobQuery.error.message} retry={() => void jobQuery.refetch()} />
  if (!job) return <EmptyState title={t("Project not found")} description={t("This opportunity may have closed or the link may be out of date.")} action={<Link to="/" className="text-sm font-semibold text-primary">{t("Browse open projects")}</Link>} />

  return <div className="mx-auto max-w-[1100px]">
    <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft size={16} /> {t("All opportunities")}</Link>
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="space-y-5">
        <section className="rounded-3xl border border-border/80 bg-background p-6 shadow-[0_12px_45px_-36px_rgba(20,35,66,.32)] sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-primary/8 px-3 py-1.5 font-semibold text-primary">{t(job.status === "OPEN" ? "Open opportunity" : "Closed")}</span>
            <span>{timeAgo(job.createdAt, locale)}</span><span>·</span><span>{t("{{count}} proposals", { count: job._count?.proposals ?? 0 })}</span>
          </div>
          <h1 className="mt-5 text-3xl leading-tight font-semibold tracking-[-0.05em] sm:text-[42px]">{job.title}</h1>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <InfoPill icon={<CurrencyDollar size={16} />} title={t("Budget")} value={formatMoney(job.budgetMin, job.budgetMax, job.currency, job.budgetType, locale)} />
            <InfoPill icon={<Clock size={16} />} title={t("Engagement")} value={t(job.budgetType === "HOURLY" ? "Hourly" : "Fixed project")} />
          </div>
          <div className="my-7 border-t border-border/70" />
          <h2 className="text-lg font-semibold tracking-tight">{t("About the project")}</h2>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{job.description}</div>
        </section>

        {ownsJob && <section className="rounded-3xl border border-border/80 bg-background p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-xl font-semibold tracking-tight">{t("Proposals")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("People who are interested in this project.")}</p></div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{proposalsQuery.data?.length ?? job._count?.proposals ?? 0}</span>
          </div>
          {proposalsQuery.isPending ? <LoadingState label="Loading proposals" /> : proposalsQuery.isError ? <ErrorState message={proposalsQuery.error.message} retry={() => void proposalsQuery.refetch()} /> : proposalsQuery.data.length === 0 ? <div className="mt-5 rounded-2xl bg-muted/50 px-5 py-6 text-center text-sm text-muted-foreground">{t("No proposals yet. We’ll let you know when someone reaches out.")}</div> :
            <div className="mt-5 space-y-3">{proposalsQuery.data.map((proposal) => <article key={proposal.id} className="rounded-2xl border border-border/70 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="font-semibold">{proposal.freelancer?.profile?.displayName || t("Freelancer")}</p><p className="mt-1 text-xs text-muted-foreground">{t("Sent {{time}}", { time: timeAgo(proposal.createdAt, locale) })}{proposal.bidAmount ? ` · ${proposal.bidAmount} ${proposal.currency}` : ""}</p></div>
                {proposal.status === "PENDING" ? <Button variant="outline" size="sm" onClick={() => rejectMutation.mutate(proposal.id)} disabled={rejectMutation.isPending}>{t("Decline")}</Button> : <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">{t(proposal.status.toLowerCase())}</span>}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{proposal.coverLetter}</p>
              {proposal.status === "PENDING" && <Link to="/messages" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">{t("Open conversation")} <ArrowUpRight size={14} /></Link>}
            </article>)}</div>}
        </section>}

        {!ownsJob && <section className="rounded-3xl border border-border/80 bg-background p-6 sm:p-8">
          {submitted ? <div className="py-3 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Check size={22} weight="bold" /></span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">{t("Your proposal is on its way")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("The client can now review your proposal and message you about the project.")}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-5"><Link to="/proposals" className="text-sm font-semibold text-primary hover:underline">{t("See your proposals")}</Link>{conversationId && <Link to={`/messages/${conversationId}`} className="text-sm font-semibold text-primary hover:underline">{t("Open conversation")}</Link>}</div>
          </div> : user?.role === "FREELANCER" ? <>
            <div className="mb-6"><p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">{t("Make your introduction")}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{t("Send a proposal")}</h2><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t("Tell the client what you’d bring to this project. You can start a conversation after you apply.")}</p></div>
            <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); proposalMutation.mutate() }} className="space-y-4">
              <div><label htmlFor="coverLetter" className="mb-2 block text-sm font-medium">{t("Your message")}</label><textarea id="coverLetter" value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} required minLength={20} maxLength={5000} rows={6} placeholder={t("Introduce yourself and share how you’d approach the work…")} className="w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" /><p className="mt-1 text-right text-[11px] text-muted-foreground">{coverLetter.length}/5000</p></div>
              <div className="max-w-xs"><label htmlFor="bidAmount" className="mb-2 block text-sm font-medium">{t("Your bid")} <span className="font-normal text-muted-foreground">({t("optional")} · {job.currency})</span></label><input id="bidAmount" inputMode="decimal" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} pattern="[0-9]{1,12}([.][0-9]{1,4})?" placeholder="e.g. 850" className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25" /></div>
              {proposalMutation.isError && <p role="alert" className="text-sm text-destructive">{proposalMutation.error instanceof ApiError ? proposalMutation.error.message : t("Could not send your proposal.")}</p>}
              <Button type="submit" disabled={proposalMutation.isPending || job.status !== "OPEN"} className="h-11 gap-2 rounded-xl px-5"><PaperPlaneRight size={17} />{proposalMutation.isPending ? t("Sending…") : t("Send proposal")}</Button>
            </form>
          </> : <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div><h2 className="text-xl font-semibold tracking-tight">{t("Interested in this project?")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("Create a freelancer account to introduce yourself.")}</p></div>
            <Link to="/register" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{t("Join as a freelancer")} <ArrowUpRight size={15} /></Link>
          </div>}
        </section>}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <section className="rounded-3xl border border-border/80 bg-background p-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{t("Posted by")}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf0ff] text-lg font-semibold text-primary">{job.client?.profile?.displayName?.slice(0, 1).toUpperCase() || "A"}</span>
            <div><p className="font-semibold">{job.client?.profile?.displayName || t("Archer client")}</p><p className="mt-0.5 text-xs text-muted-foreground">{t("Client on Archer")}</p></div>
          </div>
          <div className="my-5 border-t border-border/70" />
          <div className="space-y-3 text-sm">
            <Fact icon={<UsersThree size={16} />} label={t("Proposals")} value={t("{{count}} submitted", { count: job._count?.proposals ?? 0 })} />
            <Fact icon={<Clock size={16} />} label={t("Posted")} value={timeAgo(job.createdAt, locale)} />
            <Fact icon={<Briefcase size={16} />} label={t("Type")} value={t(job.budgetType === "HOURLY" ? "Hourly work" : "Fixed project")} />
          </div>
          {ownsJob && <Link to={`/jobs/${job.id}`} className="mt-5 flex h-10 items-center justify-center rounded-xl border border-border text-sm font-medium transition-colors hover:bg-muted">{t("Manage project")}</Link>}
        </section>
        <div className="rounded-2xl bg-[#e9efff] p-5">
          <p className="text-sm font-semibold text-[#1d3a79]">{t("Keep it clear, keep it kind.")}</p>
          <p className="mt-1.5 text-xs leading-5 text-[#52658f]">{t("Talk through scope and expectations before you get started. Archer does not process payments yet.")}</p>
        </div>
      </aside>
    </div>
  </div>
}

function InfoPill({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return <div className="flex items-center gap-2.5 rounded-xl bg-muted/65 px-3.5 py-2.5">
    <span className="text-primary">{icon}</span><span><span className="block text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{title}</span><span className="mt-0.5 block text-xs font-semibold">{value}</span></span>
  </div>
}
function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground">{icon}{label}</span><span className="font-medium">{value}</span></div>
}
