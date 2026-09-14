import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { SiteLayout } from './layouts/SiteLayout.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { TechStackPage } from './pages/TechStackPage.tsx'
import { CvPage } from './pages/CvPage.tsx'
import { ProjectsPage } from './pages/ProjectsPage.tsx'
import { BlogIndexPage } from './pages/BlogIndexPage.tsx'
import { BlogPostPage } from './pages/BlogPostPage.tsx'
import { AdminPage } from './admin/AdminPage.tsx'
import { HardwarePageFallback } from './components/hardware/HardwarePageFallback.tsx'
import { HardwarePageLazy } from './components/hardware/HardwarePageLazy.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stack" element={<TechStackPage />} />
          <Route path="/cv" element={<CvPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route
            path="/hardware"
            element={
              <Suspense fallback={<HardwarePageFallback />}>
                <HardwarePageLazy />
              </Suspense>
            }
          />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
