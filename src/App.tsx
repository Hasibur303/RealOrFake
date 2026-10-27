import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CheckPage } from './pages/CheckPage'
import { CompanyPage } from './pages/CompanyPage'
import { DemoPage } from './pages/DemoPage'
import { HomePage } from './pages/HomePage'
import { ResearchPage } from './pages/ResearchPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="check" element={<CheckPage />} />
        <Route path="company" element={<CompanyPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="demo" element={<DemoPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}
