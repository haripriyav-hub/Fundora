import type { ReactNode } from 'react'
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/app/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { HomePage } from '@/pages/home/HomePage'
import { ApplicationsPage } from '@/pages/app/ApplicationsPage'
import { BrowsePage } from '@/pages/app/BrowsePage'
import { DashboardPage } from '@/pages/app/DashboardPage'
import { SchemeDetailPage } from '@/pages/app/SchemeDetailPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

// The single-file builds are opened straight from disk (file://), where URL paths
// don't map to routes, so they keep the route in memory. Each file names its
// starting route in <body data-route>.
function Router({ children }: { children: ReactNode }) {
  if (import.meta.env.MODE === 'single') {
    return (
      <MemoryRouter initialEntries={[document.body.dataset.route ?? '/']}>{children}</MemoryRouter>
    )
  }
  return <BrowserRouter>{children}</BrowserRouter>
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot" element={<PlaceholderPage titleKey="placeholder.forgot" />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/matches" element={<BrowsePage key="matches" mode="matches" />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/browse" element={<BrowsePage key="browse" />} />
          <Route path="/schemes/:schemeId" element={<SchemeDetailPage />} />
        </Route>
        <Route path="/schemes" element={<Navigate to="/browse" replace />} />
        <Route path="/guides" element={<PlaceholderPage titleKey="placeholder.guides" />} />
        <Route path="/privacy" element={<PlaceholderPage titleKey="placeholder.privacy" />} />
        <Route path="/terms" element={<PlaceholderPage titleKey="placeholder.terms" />} />
        <Route path="*" element={<PlaceholderPage titleKey="placeholder.notFound" />} />
      </Routes>
    </Router>
  )
}
