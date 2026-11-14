import { useEffect, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  Braces,
  ChevronRight,
  Flame,
  Home,
  Languages,
  Layers3,
  Menu,
  PencilLine,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useProgress } from '../store/progress'
import { Modal } from './Modal'
import { useToast } from './Toast'

const navItems = [
  { to: '/', label: '学习首页', jp: 'ホーム', icon: Home, end: true },
  { to: '/courses', label: '学习路径', jp: 'コース', icon: BookOpen },
  { to: '/vocabulary', label: '单词卡', jp: '単語', icon: Layers3 },
  { to: '/grammar', label: '语法库', jp: '文法', icon: Braces },
  { to: '/kana', label: '文字训练', jp: 'かな・漢字', icon: Languages },
  { to: '/practice', label: '练习场', jp: '練習', icon: PencilLine },
  { to: '/progress', label: '学习报告', jp: '記録', icon: BarChart3 },
]

const mobileNav = [
  { to: '/', label: '首页', icon: Home, end: true },
  { to: '/courses', label: '课程', icon: BookOpen },
  { to: '/vocabulary', label: '单词', icon: Layers3 },
  { to: '/practice', label: '练习', icon: PencilLine },
  { to: '/progress', label: '我的', icon: BarChart3 },
]

const routeTitles: Record<string, string> = {
  '/': '学习首页',
  '/courses': '学习路径',
  '/vocabulary': '单词卡',
  '/grammar': '语法库',
  '/kana': '文字训练',
  '/kanji': '汉字图鉴',
  '/practice': '练习场',
  '/progress': '学习报告',
}

function getRouteTitle(pathname: string) {
  if (pathname.startsWith('/lesson/')) return '课节学习'
  if (pathname.startsWith('/reading/')) return '阅读训练'
  if (pathname.startsWith('/listening/')) return '听力训练'
  return routeTitles[pathname] ?? '道场 N4'
}

function weekNumber(startedAt: number | null) {
  if (!startedAt) return 1
  const days = Math.max(0, Math.floor((Date.now() - startedAt) / 86400000))
  return Math.min(12, Math.floor(days / 7) + 1)
}

function isNavActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  if (to === '/courses') return pathname.startsWith('/courses') || pathname.startsWith('/lesson/')
  if (to === '/practice') return pathname.startsWith('/practice') || pathname.startsWith('/reading/') || pathname.startsWith('/listening/')
  if (to === '/kana') return pathname.startsWith('/kana') || pathname.startsWith('/kanji')
  return pathname.startsWith(to)
}

function SidebarContent({ onNavigate, onSettings }: { onNavigate?: () => void; onSettings: () => void }) {
  const { progress, todayMinutes } = useProgress()
  const location = useLocation()
  const percent = Math.min(100, Math.round((todayMinutes / Math.max(1, progress.dailyGoal)) * 100))

  return (
    <div className="sidebar-inner">
      <Link to="/" className="brand" onClick={onNavigate}>
        <span className="brand-seal" aria-hidden="true">道</span>
        <span className="brand-copy">
          <strong>道场 N4</strong>
          <small>NIHONGO DOJO</small>
        </span>
      </Link>

      <div className="sidebar-route-chip">
        <Sparkles size={14} />
        <span>从五十音到 N4</span>
        <em>12 周</em>
      </div>

      <nav className="sidebar-nav" aria-label="主导航">
        <p className="nav-label">我的学习</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `nav-item ${isActive || isNavActive(location.pathname, item.to) ? 'active' : ''}`}
          >
            <item.icon size={19} strokeWidth={1.8} />
            <span className="nav-item-copy">
              <strong>{item.label}</strong>
              <small>{item.jp}</small>
            </span>
            <ChevronRight size={14} className="nav-chevron" />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button type="button" className="daily-goal-card" onClick={onSettings}>
          <div className="daily-goal-top">
            <span className="goal-fire"><Flame size={16} /> {progress.streak} 天</span>
            <span>{todayMinutes}/{progress.dailyGoal} 分</span>
          </div>
          <div className="mini-progress">
            <span style={{ width: `${percent}%` }} />
          </div>
          <p><Target size={13} /> {percent >= 100 ? '今日目标已达成，漂亮。' : '保持节奏，今天再学一点。'}</p>
        </button>

        <button type="button" className="sidebar-settings" onClick={onSettings}>
          <span className="avatar">{progress.name.slice(0, 1)}</span>
          <span className="sidebar-user">
            <strong>{progress.name}</strong>
            <small>第 {weekNumber(progress.startedAt)} 周 · 本地存档</small>
          </span>
          <Settings size={17} />
        </button>
      </div>
    </div>
  )
}

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { progress, updateSettings, resetProgress } = useProgress()
  const { showToast } = useToast()
  const [name, setName] = useState(progress.name)
  const [dailyGoal, setDailyGoal] = useState(progress.dailyGoal)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (open) {
      setName(progress.name)
      setDailyGoal(progress.dailyGoal)
      setConfirmReset(false)
    }
  }, [open, progress.name, progress.dailyGoal])

  return (
    <Modal open={open} onClose={onClose} title="学习设置" subtitle="所有进度保存在此浏览器，不需要注册。" width="sm">
      <div className="settings-form">
        <label className="field-label">
          怎么称呼你
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={12} placeholder="同学" />
        </label>
        <div className="field-label">
          每日学习目标
          <div className="segmented">
            {[15, 25, 40].map((minute) => (
              <button
                type="button"
                key={minute}
                className={dailyGoal === minute ? 'selected' : ''}
                onClick={() => setDailyGoal(minute)}
              >
                {minute} 分钟
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="button button-primary button-block"
          onClick={() => {
            updateSettings({ name, dailyGoal })
            showToast('设置已保存')
            onClose()
          }}
        >
          保存设置
        </button>
        <div className="settings-danger">
          <p><strong>重新开始</strong><span>清空课节、单词卡、测验记录与所有统计数据。</span></p>
          <button
            type="button"
            className={`button button-small ${confirmReset ? 'button-danger' : 'button-ghost'}`}
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true)
                return
              }
              resetProgress()
              onClose()
              showToast('进度已清空，重新出发', 'info')
            }}
          >
            {confirmReset ? '确认清空？' : '清空进度'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function Layout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { progress, todayMinutes } = useProgress()
  const location = useLocation()

  useEffect(() => {
    setDrawerOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const today = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <SidebarContent onSettings={() => setSettingsOpen(true)} />
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button type="button" className="mobile-menu" onClick={() => setDrawerOpen(true)} aria-label="打开菜单">
              <Menu size={21} />
            </button>
            <div className="mobile-brand">
              <span className="brand-seal small">道</span>
              <strong>道场 N4</strong>
            </div>
            <div className="breadcrumbs">
              <span>道场 N4</span>
              <i>/</i>
              <strong>{getRouteTitle(location.pathname)}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">{today}</span>
            <span className="topbar-streak"><Flame size={15} /> {progress.streak} 天连续</span>
            <button type="button" className="topbar-avatar" onClick={() => setSettingsOpen(true)} aria-label="打开设置">
              {progress.name.slice(0, 1)}
            </button>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="移动端导航">
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive || isNavActive(location.pathname, item.to) ? 'active' : '')}
          >
            <item.icon size={20} strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {drawerOpen && (
        <div className="mobile-drawer-backdrop" role="presentation" onMouseDown={() => setDrawerOpen(false)}>
          <aside className="mobile-drawer" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="关闭菜单">
              <X size={20} />
            </button>
            <SidebarContent
              onNavigate={() => setDrawerOpen(false)}
              onSettings={() => {
                setDrawerOpen(false)
                setSettingsOpen(true)
              }}
            />
          </aside>
        </div>
      )}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <div className={`mobile-goal-pill ${todayMinutes >= progress.dailyGoal ? 'done' : ''}`}>
        <Flame size={14} /> {todayMinutes}/{progress.dailyGoal} 分
      </div>
    </div>
  )
}
