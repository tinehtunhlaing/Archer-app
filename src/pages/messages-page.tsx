import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowUp, ChatCircleDots, PaperPlaneRight, Sparkle } from "@phosphor-icons/react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { EmptyState, ErrorState, LoadingState, PageTitle, RequireRole } from "@/components/app-layout"
import { apiRequest, type Conversation, type Message } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/i18n"

export function MessagesPage() {
  return <RequireRole roles={["CLIENT", "FREELANCER"]}><Inbox /></RequireRole>
}

function Inbox() {
  const { t, locale } = useI18n()
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [body, setBody] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const conversationsQuery = useQuery({ queryKey: ["conversations"], queryFn: () => apiRequest<Conversation[]>("/conversations") })
  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => apiRequest<Message[]>(`/conversations/${conversationId}/messages?limit=100`),
    enabled: Boolean(conversationId),
  })
  const sendMutation = useMutation({
    mutationFn: () => apiRequest<Message>(`/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ body: body.trim() }) }),
    onSuccess: () => {
      setBody("")
      void queryClient.invalidateQueries({ queryKey: ["messages", conversationId] })
      void queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
  const activeConversation = conversationsQuery.data?.find((conversation) => conversation.id === conversationId)
  const otherPerson = activeConversation
    ? activeConversation.clientId === user?.id ? activeConversation.freelancer : activeConversation.client
    : null

  useEffect(() => {
    if (!conversationId && conversationsQuery.data?.length) {
      navigate(`/messages/${conversationsQuery.data[0]!.id}`, { replace: true })
    }
  }, [conversationId, conversationsQuery.data, navigate])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messagesQuery.data])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (body.trim()) sendMutation.mutate()
  }

  return <>
    <PageTitle eyebrow={t("Stay in the loop")} title={t("Messages")} description={t("Good work begins with a good conversation.")} />
    <div className="grid h-[min(690px,calc(100svh-260px))] min-h-[480px] overflow-hidden rounded-3xl border border-border/80 bg-background shadow-[0_12px_45px_-36px_rgba(20,35,66,.32)] md:grid-cols-[310px_minmax(0,1fr)]">
      <aside className={`${conversationId ? "hidden md:flex" : "flex"} flex-col border-r border-border/70`}>
        <div className="border-b border-border/70 px-5 py-4"><p className="text-sm font-semibold">{t("Your conversations")}</p><p className="mt-1 text-xs text-muted-foreground">{t("{{count}} active {{thread}}", { count: conversationsQuery.data?.length ?? 0, thread: t((conversationsQuery.data?.length ?? 0) === 1 ? "thread" : "threads") })}</p></div>
        {conversationsQuery.isPending ? <LoadingState label="Loading inbox" /> : conversationsQuery.isError ? <div className="p-4"><ErrorState message={conversationsQuery.error.message} retry={() => void conversationsQuery.refetch()} /></div> : conversationsQuery.data.length === 0 ? <div className="p-5"><EmptyState icon={<ChatCircleDots size={21} />} title={t("No conversations yet")} description={t("A conversation opens when a freelancer sends a proposal on your project.")} action={<Link to="/" className="text-sm font-semibold text-primary hover:underline">{t("Explore opportunities")}</Link>} /></div> :
          <div className="flex-1 overflow-y-auto p-2">{conversationsQuery.data.map((conversation) => {
            const person = conversation.clientId === user?.id ? conversation.freelancer : conversation.client
            const latest = conversation.messages[0]
            return <Link key={conversation.id} to={`/messages/${conversation.id}`} className={`mb-1 block rounded-2xl p-3.5 transition-colors ${conversationId === conversation.id ? "bg-primary/8" : "hover:bg-muted/70"}`}>
              <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf0ff] text-sm font-semibold text-primary">{person.profile?.displayName?.slice(0, 1).toUpperCase() || "A"}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{person.profile?.displayName || t("Archer member")}</span><span className="text-[10px] text-muted-foreground">{latest ? new Date(latest.createdAt).toLocaleDateString(locale === "my" ? "my-MM" : "en-US", { month: "short", day: "numeric" }) : t("New")}</span></span>
                  <span className="mt-0.5 block truncate text-xs text-primary/80">{conversation.job.title}</span>
                  <span className="mt-1.5 block truncate text-xs text-muted-foreground">{latest?.body || t("Start the conversation")}</span>
                </span>
              </div>
            </Link>
          })}</div>}
      </aside>

      <section className={`${conversationId ? "flex" : "hidden md:flex"} min-w-0 flex-col`}>
        {!conversationId || !activeConversation ? <div className="grid flex-1 place-items-center p-8 text-center">
          {conversationId && conversationsQuery.isPending ? <LoadingState label="Opening conversation" /> : conversationId && conversationsQuery.isError ? <ErrorState message={conversationsQuery.error.message} retry={() => void conversationsQuery.refetch()} /> : <div className="max-w-sm"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/8 text-primary"><Sparkle size={21} weight="fill" /></span><h2 className="mt-4 text-lg font-semibold tracking-tight">{t("A little clarity goes a long way.")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("Choose a conversation to talk through the work, timelines, and next steps.")}</p></div>}
        </div> : <>
          <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3.5 sm:px-6">
            <Link to="/messages" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted md:hidden" aria-label={t("Back to conversations")}><ArrowUp className="-rotate-90" size={17} /></Link>
            <span className="grid size-10 place-items-center rounded-xl bg-[#eaf0ff] text-sm font-semibold text-primary">{otherPerson?.profile?.displayName?.slice(0, 1).toUpperCase() || "A"}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{otherPerson?.profile?.displayName || t("Archer member")}</p><Link to={`/jobs/${activeConversation.jobId}`} className="mt-0.5 block truncate text-xs text-muted-foreground transition-colors hover:text-primary">{activeConversation.job.title}</Link></div>
            <span className="hidden rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">{t(activeConversation.job.status.toLowerCase())}</span>
          </div>
          <div className="flex-1 overflow-y-auto bg-[#fafbfc] px-4 py-5 sm:px-7">
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 text-center"><span className="rounded-full bg-white px-3 py-1.5 text-[10px] text-muted-foreground shadow-sm">{t("Conversation about")} <Link to={`/jobs/${activeConversation.jobId}`} className="font-semibold text-primary hover:underline">{activeConversation.job.title}</Link></span></div>
              {messagesQuery.isPending ? <LoadingState label="Loading messages" /> : messagesQuery.isError ? <ErrorState message={messagesQuery.error.message} retry={() => void messagesQuery.refetch()} /> : messagesQuery.data.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-white/70 p-7 text-center"><p className="text-sm font-semibold">{t("Say hello and get things moving.")}</p><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{t("Share a question, a little context, or a time to talk.")}</p></div> : <div className="space-y-4">{messagesQuery.data.map((message) => <MessageBubble key={message.id} message={message} mine={message.senderId === user?.id} locale={locale} />)}</div>}
              <div ref={bottomRef} />
            </div>
          </div>
          <form onSubmit={submit} className="border-t border-border/70 bg-background p-3 sm:p-4">
            <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-input bg-background p-2 focus-within:ring-3 focus-within:ring-ring/15">
              <textarea value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (body.trim()) sendMutation.mutate() } }} rows={1} maxLength={5000} placeholder={t("Write a message…")} aria-label={t("Message")} className="max-h-32 min-h-9 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-5 outline-none placeholder:text-muted-foreground/60" />
              <Button type="submit" size="icon" aria-label={t("Send message")} disabled={!body.trim() || sendMutation.isPending} className="mb-0.5 rounded-xl"><PaperPlaneRight size={17} /></Button>
            </div>
            {sendMutation.isError && <p role="alert" className="mx-auto mt-2 max-w-2xl text-xs text-destructive">{sendMutation.error.message}</p>}
            <p className="mx-auto mt-2 max-w-2xl text-[10px] text-muted-foreground">{t("Press Enter to send · Shift + Enter for a new line")}</p>
          </form>
        </>}
      </section>
    </div>
  </>
}

function MessageBubble({ message, mine, locale }: { message: Message; mine: boolean; locale: "en" | "my" }) {
  const { t } = useI18n()
  return <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border/70 bg-white"}`}>
      {!mine && <p className="mb-1 text-[10px] font-semibold text-primary">{message.sender?.profile?.displayName || t("Archer member")}</p>}
      <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
      <p className={`mt-1 text-right text-[9px] ${mine ? "text-white/60" : "text-muted-foreground"}`}>{new Date(message.createdAt).toLocaleTimeString(locale === "my" ? "my-MM" : "en-US", { hour: "numeric", minute: "2-digit" })}</p>
    </div>
  </div>
}
