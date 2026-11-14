import { HashRouter, Route, Routes, Link } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Onboarding } from './components/Onboarding'
import { ToastProvider } from './components/Toast'
import { ProgressProvider } from './store/progress'
import { Dashboard } from './pages/Dashboard'
import { Courses } from './pages/Courses'
import { LessonPage } from './pages/LessonPage'
import { Vocabulary } from './pages/Vocabulary'
import { Grammar } from './pages/Grammar'
import { KanaPage } from './pages/KanaPage'
import { KanjiPage } from './pages/KanjiPage'
import { Practice } from './pages/Practice'
import { ReadingPage } from './pages/ReadingPage'
import { ListeningPage } from './pages/ListeningPage'
import { ProgressPage } from './pages/ProgressPage'

function NotFound() {
  return (
    <div className="empty-state full">
      <span className="empty-glyph">迷</span>
      <p className="eyebrow">404 · LOST IN KYOTO</p>
      <h1>这条路走不通。</h1>
      <p>页面不存在，但学习路线还在。</p>
      <Link to="/" className="button button-primary">回到学习首页</Link>
    </div>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <ToastProvider>
        <HashRouter>
          <Onboarding />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/grammar" element={<Grammar />} />
              <Route path="/kana" element={<KanaPage />} />
              <Route path="/kanji" element={<KanjiPage />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/reading/:passageId" element={<ReadingPage />} />
              <Route path="/listening/:itemId" element={<ListeningPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </ProgressProvider>
  )
}
