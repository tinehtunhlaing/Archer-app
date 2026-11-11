import en from "@/i18n/en.json"
import my from "@/i18n/my.json"

export type Role = "CLIENT" | "FREELANCER" | "ADMIN"
export type Currency = "USD" | "MMK"

export type User = {
  id: string
  email: string
  role: Role
  profile?: Profile | null
  createdAt?: string
}
export type Profile = {
  id?: string
  userId?: string
  displayName: string
  headline: string | null
  bio: string | null
  location: string | null
  skills: string[]
  role?: Role
  memberSince?: string
}

export type Job = {
  id: string
  clientId: string
  title: string
  description: string
  budgetType: "FIXED" | "HOURLY"
  budgetMin: string | null
  budgetMax: string | null
  currency: Currency
  status: "OPEN" | "CLOSED"
  createdAt: string
  updatedAt: string
  client?: { id: string; profile: { displayName: string } | null }
  _count?: { proposals: number }
}

export type Proposal = {
  id: string
  jobId: string
  freelancerId: string
  coverLetter: string
  bidAmount: string | null
  currency: Currency | null
  status: "PENDING" | "REJECTED" | "WITHDRAWN"
  createdAt: string
  job?: Pick<Job, "id" | "title" | "currency" | "status">
  freelancer?: { id: string; profile: Profile | null }
  conversation?: { id: string } | null
}

export type Conversation = {
  id: string
  jobId: string
  clientId: string
  freelancerId: string
  createdAt: string
  job: Pick<Job, "id" | "title" | "status">
  client: { id: string; profile: { displayName: string } | null }
  freelancer: { id: string; profile: { displayName: string } | null }
  messages: Message[]
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
  sender?: { id: string; profile: { displayName: string } | null }
}

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "")

let accessToken: string | null = sessionStorage.getItem("archer.accessToken")
export function getAccessToken() { return accessToken }
export function setAccessToken(token: string | null) {
  accessToken = token
  if (token) sessionStorage.setItem("archer.accessToken", token)
  else sessionStorage.removeItem("archer.accessToken")
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

async function apiResponse<T>(path: string, init: RequestInit = {}): Promise<{ data: T; nextCursor?: string | null }> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`)
  const selectedLocale = typeof localStorage !== "undefined" && localStorage.getItem("archer.language") === "my"
    ? "my"
    : typeof document !== "undefined" && document.documentElement.lang.startsWith("my") ? "my" : "en"
  headers.set("Accept-Language", selectedLocale)
  const localize = (message: string, values: Record<string, string | number> = {}) => {
    const translation = selectedLocale === "my" ? my[message as keyof typeof my] ?? message : en[message as keyof typeof en] ?? message
    return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)), translation)
  }
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(localize("Could not reach Archer API. Check that the API server is running."), 0, "NETWORK_ERROR")
  }

  const payload = await response.json().catch(() => null) as
    | { data?: T; error?: { message?: string; code?: string }; nextCursor?: string | null }
    | null
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || localize("Request failed ({{status}})", { status: response.status }),
      response.status,
      payload?.error?.code,
    )
  }
  if (!payload || !("data" in payload)) throw new ApiError(localize("The API returned an unexpected response."), response.status)
  return { data: payload.data as T, ...(payload.nextCursor !== undefined ? { nextCursor: payload.nextCursor } : {}) }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return (await apiResponse<T>(path, init)).data
}

export async function apiRequestPage<T>(path: string): Promise<{ data: T; nextCursor?: string | null }> {
  return apiResponse<T>(path)
}

export function formatMoney(min: string | null, max: string | null, currency: Currency, type: Job["budgetType"], locale: "en" | "my" = "en") {
  if (!min || !max) return locale === "my" ? (type === "HOURLY" ? `နာရီအလိုက် · ${currency}` : `ဘတ်ဂျက်ညှိနှိုင်းရန် · ${currency}`) : type === "HOURLY" ? `Hourly · ${currency}` : `Budget open · ${currency}`
  const left = formatAmount(min, currency, locale)
  const right = formatAmount(max, currency, locale)
  return `${left} – ${right}${type === "HOURLY" ? (locale === "my" ? " / နာရီ" : " / hr") : ""}`
}

export function formatAmount(value: string, currency: Currency, locale: "en" | "my" = "en") {
  const [whole = "0", rawFraction = ""] = value.split(".")
  const fraction = currency === "USD"
    ? rawFraction.padEnd(2, "0").slice(0, Math.max(2, rawFraction.length))
    : rawFraction.replace(/0+$/, "")
  try {
    return new Intl.NumberFormat(locale === "my" ? "my-MM" : "en-US", {
      style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(BigInt(whole)) + (fraction ? `.${fraction}` : currency === "USD" ? ".00" : "")
  } catch {
    return `${value} ${currency}`
  }
}

export function timeAgo(isoDate: string, locale: "en" | "my" = "en") {
  const days = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000))
  if (locale === "my") {
    if (days === 0) return "ယနေ့"
    if (days === 1) return "မနေ့က"
    if (days < 30) return `${new Intl.NumberFormat("my-MM").format(days)} ရက်ခန့်က`
    if (days < 365) return `${new Intl.NumberFormat("my-MM").format(Math.floor(days / 30))} လခန့်က`
    return `${new Intl.NumberFormat("my-MM").format(Math.floor(days / 365))} နှစ်ခန့်က`
  }
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}
