import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AuthProvider } from "@/lib/auth-context"
import { AppLayout } from "@/components/app-layout"
import { AuthPage } from "@/pages/auth-page"
import { LandingPage } from "@/pages/landing-page"
import { JobDetailPage } from "@/pages/job-detail-page"
import { JobsPage } from "@/pages/jobs-page"
import { MessagesPage } from "@/pages/messages-page"
import { NewJobPage } from "@/pages/new-job-page"
import { ProfilePage } from "@/pages/profile-page"
import { ProposalsPage } from "@/pages/proposals-page"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<LandingPage />} />
            <Route element={<AppLayout />}>
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/:jobId" element={<JobDetailPage />} />
              <Route path="jobs/new" element={<NewJobPage />} />
              <Route path="proposals" element={<ProposalsPage />} />
              <Route path="messages/:conversationId?" element={<MessagesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="login" element={<AuthPage mode="login" />} />
            <Route path="register" element={<AuthPage mode="register" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
