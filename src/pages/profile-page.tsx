import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check, FloppyDisk } from "@phosphor-icons/react"
import { useState, type FormEvent, type ReactNode } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ErrorState, LoadingState, PageTitle, RequireRole } from "@/components/app-layout"
import { ApiError, apiRequest, type Profile } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/i18n"

export function ProfilePage() {
  return <RequireRole roles={["CLIENT", "FREELANCER"]}><ProfileForm /></RequireRole>
}

function ProfileForm() {
  const { t } = useI18n()
  const { user, refreshUser } = useAuth()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const profileQuery = useQuery({ queryKey: ["profile", "me"], queryFn: () => apiRequest<Profile>("/profiles/me") })
  const mutation = useMutation({
    mutationFn: (profile: Omit<Profile, "id" | "userId" | "role" | "memberSince">) => apiRequest<Profile>("/profiles/me", { method: "PUT", body: JSON.stringify(profile) }),
    onSuccess: (profile) => {
      queryClient.setQueryData(["profile", "me"], profile)
      void refreshUser()
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    },
  })

  if (profileQuery.isPending) return <LoadingState label="Loading your profile" />
  if (profileQuery.isError && profileQuery.error instanceof ApiError && profileQuery.error.status !== 404) return <ErrorState message={profileQuery.error.message} retry={() => void profileQuery.refetch()} />
  const profile = profileQuery.data
  const completionFields = [profile?.displayName, profile?.headline, profile?.bio, profile?.location, profile?.skills?.length ? "skills" : ""]
  const completion = Math.round(completionFields.filter(Boolean).length / completionFields.length * 100)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const skills = String(form.get("skills"))
      .split(/[\n,]/)
      .map((skill) => skill.trim())
      .filter(Boolean)
      .slice(0, 30)
    mutation.mutate({
      displayName: String(form.get("displayName")).trim(),
      headline: String(form.get("headline")).trim() || null,
      bio: String(form.get("bio")).trim() || null,
      location: String(form.get("location")).trim() || null,
      skills,
    })
  }

  return <div className="mx-auto max-w-4xl">
    <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft size={16} /> {t("Back to work")}</Link>
    <div className="grid gap-6 md:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-border/80 bg-background p-6">
        <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">{(profile?.displayName || user?.email || "A").slice(0, 1).toUpperCase()}</div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight">{profile?.displayName || t("Your name")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t(user?.role === "CLIENT" ? "Client" : "Freelancer")} {t("account")}</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{profile?.headline || t("Add a short headline that tells people what you do.")}</p>
        <div className="my-5 border-t border-border/70" />
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{t("Profile completeness")}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${completion}%` }} /></div>
        <p className="mt-2 text-xs text-muted-foreground">{t("Complete the details so the right projects can find you.")}</p>
      </aside>
      <section className="rounded-3xl border border-border/80 bg-background p-6 sm:p-8">
        <PageTitle eyebrow={t("Your profile")} title={t("A little about you.")} description={t("Show people the person behind the work. Keep it real, keep it yours.")} />
        <form onSubmit={submit} className="space-y-5">
          <Field label={t("Display name")} htmlFor="displayName"><input id="displayName" name="displayName" required maxLength={80} defaultValue={profile?.displayName || user?.profile?.displayName || ""} placeholder={t("Your name")} className={inputClass} /></Field>
          <Field label={t("Headline")} htmlFor="headline" hint={t("A short description of what you do.")}><input id="headline" name="headline" maxLength={120} defaultValue={profile?.headline || ""} placeholder={t("e.g. Brand designer for early-stage teams")} className={inputClass} /></Field>
          <Field label={t("About you")} htmlFor="bio" hint={t("Your experience, approach, and what kind of work you enjoy.")}><textarea id="bio" name="bio" rows={5} maxLength={2000} defaultValue={profile?.bio || ""} placeholder={t("Tell people what you bring to a project…")} className={`${inputClass} h-auto resize-y py-3 leading-6`} /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("Location")} htmlFor="location"><input id="location" name="location" maxLength={120} defaultValue={profile?.location || ""} placeholder={t("City, country")} className={inputClass} /></Field>
            <Field label={t("Skills")} htmlFor="skills" hint={t("Separate skills with commas.")}><input id="skills" name="skills" defaultValue={profile?.skills?.join(", ") || ""} placeholder="Figma, research, writing…" className={inputClass} /></Field>
          </div>
          {mutation.isError && <p role="alert" className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{mutation.error instanceof ApiError ? mutation.error.message : t("Could not save your profile.")}</p>}
          <div className="flex items-center justify-between border-t border-border/70 pt-5">
            <span className="text-xs text-muted-foreground">{t("Your profile can be viewed by other Archer members.")}</span>
            <Button type="submit" disabled={mutation.isPending} className="gap-2 rounded-xl px-5">{saved ? <Check size={16} /> : <FloppyDisk size={16} />}{saved ? t("Saved") : mutation.isPending ? t("Saving…") : t("Save profile")}</Button>
          </div>
        </form>
      </section>
    </div>
  </div>
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return <div><label htmlFor={htmlFor} className="mb-2 block text-sm font-medium">{label}</label>{children}{hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}</div>
}

const inputClass = "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/25"
