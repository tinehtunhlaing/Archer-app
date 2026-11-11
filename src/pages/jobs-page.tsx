import { useInfiniteQuery } from "@tanstack/react-query"
import { ArrowUpRight, Briefcase, CaretDown, MagnifyingGlass, Sparkle, UsersThree } from "@phosphor-icons/react"
import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState, ErrorState, LoadingState, PageTitle } from "@/components/app-layout"
import { apiRequestPage, formatMoney, timeAgo, type Currency, type Job } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const quickSearches = ["Design", "Writing", "Development", "Marketing"]

export function JobsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [submittedSearch, setSubmittedSearch] = useState("")
  const [currency, setCurrency] = useState<"ALL" | Currency>("ALL")
  const jobsQuery = useInfiniteQuery({
    queryKey: ["jobs", submittedSearch, currency],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => apiRequestPage<Job[]>(`/jobs?limit=20${submittedSearch ? `&q=${encodeURIComponent(submittedSearch)}` : ""}${currency !== "ALL" ? `&currency=${currency}` : ""}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
  const jobs = jobsQuery.data?.pages.flatMap((page) => page.data) ?? []

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedSearch(search.trim())
  }

  return <>
    <section className="relative mb-9 overflow-hidden rounded-[30px] bg-[#12213f] px-6 py-8 text-white shadow-[0_20px_55px_-35px_rgba(20,35,66,.55)] sm:px-10 sm:py-10 lg:px-12">
      <div className="absolute -top-24 right-[8%] size-72 rounded-full bg-primary/30 blur-[90px]" />
      <div className="absolute -right-6 bottom-[-160px] size-80 rounded-full border border-white/10" />
      <div className="absolute right-[13%] bottom-[-95px] size-52 rounded-full border border-white/10" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_310px] lg:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/75">
            <Sparkle size={14} weight="fill" className="text-sky-300" /> INDEPENDENT WORK, WITH ROOM TO GROW
          </div>
          <h1 className="max-w-[740px] text-[38px] leading-[1.04] font-semibold tracking-[-0.06em] sm:text-5xl lg:text-[58px]">Find work that<br className="hidden sm:block" /> <span className="text-sky-300">fits your kind</span> of good.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">Discover thoughtful projects from people who value what you bring to the table.</p>
          <form onSubmit={submitSearch} className="mt-7 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <MagnifyingGlass size={20} className="shrink-0 text-primary" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Role, skill, or keyword" aria-label="Search jobs" className="h-11 w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            </label>
            <button type="submit" className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">Search work</button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
            <span className="mr-1">Try</span>
            {quickSearches.map((term) => <button key={term} onClick={() => { setSearch(term); setSubmittedSearch(term) }} className="rounded-full border border-white/15 px-2.5 py-1 transition-colors hover:border-white/35 hover:text-white">{term}</button>)}
          </div>
        </div>
        <div className="relative hidden min-h-48 flex-col justify-between rounded-2xl border border-white/15 bg-white/7 p-5 lg:flex">
          <span className="grid size-10 place-items-center rounded-xl bg-sky-300/15 text-sky-200"><Briefcase size={20} /></span>
          <div className="mt-6">
            <p className="text-2xl font-semibold tracking-tight">Your next chapter<br />starts somewhere.</p>
            <p className="mt-2 text-xs leading-5 text-white/55">A fresh project can change the shape of your week.</p>
          </div>
          <div className="absolute top-5 right-5 flex -space-x-2">
            <span className="grid size-8 place-items-center rounded-full border-2 border-[#1a2b4b] bg-amber-200 text-[10px] font-bold text-amber-900">A</span>
            <span className="grid size-8 place-items-center rounded-full border-2 border-[#1a2b4b] bg-sky-200 text-[10px] font-bold text-sky-900">M</span>
            <span className="grid size-8 place-items-center rounded-full border-2 border-[#1a2b4b] bg-rose-200 text-[10px] font-bold text-rose-900">T</span>
          </div>
        </div>
      </div>
    </section>

    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
      <section>
        <PageTitle
          eyebrow="The opportunity board"
          title={submittedSearch ? `Work for “${submittedSearch}”` : "Fresh opportunities"}
          description="Independent projects from clients looking for thoughtful, skilled people."
          action={<div className="relative flex items-center gap-2 self-start rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-muted-foreground sm:self-auto">
            <span className="text-foreground">Currency</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as "ALL" | Currency)} aria-label="Filter by currency" className="cursor-pointer appearance-none bg-transparent pr-4 outline-none">
              <option value="ALL">All currencies</option><option value="USD">USD</option><option value="MMK">MMK</option>
            </select><CaretDown size={13} className="pointer-events-none absolute right-3" />
          </div>}
        />
        <div className="space-y-3">
          {jobsQuery.isPending ? <LoadingState label="Finding open projects" /> : jobsQuery.isError ? <ErrorState message={jobsQuery.error.message} retry={() => void jobsQuery.refetch()} /> : jobs.length === 0 ? (
            <EmptyState icon={<MagnifyingGlass size={21} />} title="No matching projects yet" description="Try a broader search, or check back soon. The right project may be just around the corner." action={submittedSearch ? <button onClick={() => { setSearch(""); setSubmittedSearch("") }} className="text-sm font-semibold text-primary hover:underline">Clear your search</button> : undefined} />
          ) : jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
        {jobsQuery.hasNextPage && <button onClick={() => void jobsQuery.fetchNextPage()} disabled={jobsQuery.isFetchingNextPage} className="mt-5 flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-60">{jobsQuery.isFetchingNextPage ? "Loading more projects…" : "Show more opportunities"}</button>}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border/80 bg-background p-5 shadow-[0_8px_30px_-25px_rgba(20,35,66,.22)]">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Your Archer space</p>
          {user ? <>
            <p className="mt-4 text-lg font-semibold tracking-tight">Welcome, {user.profile?.displayName?.split(" ")[0] || "friend"}.</p>
            <p className="mt-1.5 text-sm leading-5 text-muted-foreground">A little polish can help the right people find you.</p>
            <Link to="/profile" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Complete your profile <ArrowUpRight size={15} /></Link>
          </> : <>
            <p className="mt-4 text-lg font-semibold tracking-tight">Good work starts here.</p>
            <p className="mt-1.5 text-sm leading-5 text-muted-foreground">Join a community of independent talent and teams that care about the details.</p>
            <Link to="/register" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Create your free account <ArrowUpRight size={15} /></Link>
          </>}
        </div>

        <div className="rounded-2xl border border-border/80 bg-background p-5">
          <div className="mb-4 flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700"><UsersThree size={18} /></span><p className="text-sm font-semibold">A good fit goes both ways</p></div>
          <p className="text-xs leading-5 text-muted-foreground">Share what you do, what you love, and how you work. Clear profiles help projects find the people who’ll care about them.</p>
          {user?.role === "CLIENT" && <Link to="/jobs/new" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full justify-center gap-2")}>Post a project <ArrowUpRight size={14} /></Link>}
        </div>

        <div className="rounded-2xl bg-primary/5 p-5">
          <p className="text-xs font-semibold text-primary">GOOD TO KNOW</p>
          <p className="mt-2 text-sm font-medium leading-5">Every project shows its currency up front.</p>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Archer supports USD and MMK. No surprise conversions, just clear expectations.</p>
        </div>
      </aside>
    </div>
  </>
}

function JobCard({ job }: { job: Job }) {
  return <Link to={`/jobs/${job.id}`} className="group block rounded-2xl border border-border/80 bg-background p-5 shadow-[0_8px_30px_-25px_rgba(20,35,66,.18)] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_16px_35px_-24px_rgba(35,65,120,.25)] sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf0ff] text-primary"><Briefcase size={21} weight="duotone" /></span>
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">{job.client?.profile?.displayName || "Archer client"}</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span className="text-[11px] text-muted-foreground">{timeAgo(job.createdAt)}</span>
          </div>
          <h2 className="text-[17px] leading-6 font-semibold tracking-[-0.025em] transition-colors group-hover:text-primary">{job.title}</h2>
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">{job.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground">{job.budgetType === "HOURLY" ? "Hourly" : "Fixed price"}</span>
            {job.currency === "MMK" && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-800">MMK project</span>}
            {job._count && <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><UsersThree size={14} /> {job._count.proposals} {job._count.proposals === 1 ? "proposal" : "proposals"}</span>}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-5 sm:flex-col sm:items-end sm:justify-start">
        <span className="text-sm font-semibold tracking-tight">{formatMoney(job.budgetMin, job.budgetMax, job.currency, job.budgetType)}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-75 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">View project <ArrowUpRight size={14} /></span>
      </div>
    </div>
  </Link>
}
