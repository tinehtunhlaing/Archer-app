import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChatCircleDots, ListBullets, X } from "@phosphor-icons/react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { EmptyState, ErrorState, LoadingState, PageTitle, RequireRole } from "@/components/app-layout"
import { apiRequest, formatAmount, timeAgo, type Proposal } from "@/lib/api"
import { useI18n } from "@/i18n"

export function ProposalsPage() {
  return <RequireRole roles={["FREELANCER"]}><MyProposals /></RequireRole>
}

function MyProposals() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const proposalsQuery = useQuery({ queryKey: ["proposals", "me"], queryFn: () => apiRequest<Proposal[]>("/proposals/me") })
  const withdrawMutation = useMutation({
    mutationFn: (proposalId: string) => apiRequest<Proposal>(`/proposals/${proposalId}/withdraw`, { method: "PATCH" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["proposals", "me"] }),
  })

  return <>
    <PageTitle eyebrow={t("Your work journey")} title={t("My proposals")} description={t("Keep track of the projects you’ve raised your hand for.")} />
    {proposalsQuery.isPending ? <LoadingState label="Loading your proposals" /> : proposalsQuery.isError ? <ErrorState message={proposalsQuery.error.message} retry={() => void proposalsQuery.refetch()} /> : proposalsQuery.data.length === 0 ? <EmptyState icon={<ListBullets size={22} />} title={t("Your next introduction starts with a proposal")} description={t("When a project catches your eye, send a note to the client and tell them why you’re a great fit.")} action={<Link to="/" className="text-sm font-semibold text-primary hover:underline">{t("Browse open projects")}</Link>} /> :
      <div className="grid gap-3">{proposalsQuery.data.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} onWithdraw={() => withdrawMutation.mutate(proposal.id)} withdrawing={withdrawMutation.isPending && withdrawMutation.variables === proposal.id} />)}</div>}
  </>
}

function ProposalCard({ proposal, onWithdraw, withdrawing }: { proposal: Proposal; onWithdraw: () => void; withdrawing: boolean }) {
  const { t, locale } = useI18n()
  const statusStyle = {
    PENDING: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    REJECTED: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
    WITHDRAWN: "bg-muted text-muted-foreground",
  }[proposal.status]
  return <article className="rounded-2xl border border-border/80 bg-background p-5 sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${statusStyle}`}>{t(proposal.status.toLowerCase())}</span><span className="text-xs text-muted-foreground">{t("Sent {{time}}", { time: timeAgo(proposal.createdAt, locale) })}</span></div>
        <Link to={`/jobs/${proposal.job?.id || proposal.jobId}`} className="text-lg font-semibold tracking-tight transition-colors hover:text-primary">{proposal.job?.title || t("Archer project")}</Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{proposal.coverLetter}</p>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
        <span className="text-sm font-semibold">{proposal.bidAmount && proposal.currency ? formatAmount(proposal.bidAmount, proposal.currency, locale) : t("No bid included")}</span>
        <div className="flex items-center gap-2">
          {proposal.status === "PENDING" && <Button variant="outline" size="sm" onClick={onWithdraw} disabled={withdrawing} className="gap-1.5"><X size={14} />{withdrawing ? t("Withdrawing…") : t("Withdraw")}</Button>}
          <Link to={proposal.conversation?.id ? `/messages/${proposal.conversation.id}` : "/messages"} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary/8 px-3 text-xs font-semibold text-primary hover:bg-primary/12"><ChatCircleDots size={14} /> {t("Message")}</Link>
        </div>
      </div>
    </div>
  </article>
}
