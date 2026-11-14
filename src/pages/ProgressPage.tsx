import { useMemo } from 'react'
import {
  Award,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Headphones,
  Lock,
  Medal,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { lessons, units } from '../data/lessons'
import { listeningItems } from '../data/listening'
import { quizModes } from '../data/quiz'
import { readingPassages } from '../data/reading'
import { words } from '../data/vocabulary'
import { grammarPoints } from '../data/grammar'
import { todayKey, useProgress } from '../store/progress'

function weekNumber(startedAt: number | null) {
  if (!startedAt) return 1
  const days = Math.max(0, Math.floor((Date.now() - startedAt) / 86400000))
  return Math.min(12, Math.floor(days / 7) + 1)
}

export function ProgressPage() {
  const { progress, learnedWords, completedLessonCount, totalXP, todayMinutes } = useProgress()
  const currentWeek = weekNumber(progress.startedAt)
  const totalMinutes = Object.values(progress.activity).reduce((sum, value) => sum + value, 0)
  const quizAverage = progress.quizHistory.length
    ? Math.round(progress.quizHistory.reduce((sum, record) => sum + (record.score / record.total) * 100, 0) / progress.quizHistory.length)
    : 0

  const readiness = Math.min(
    100,
    Math.round(
      (completedLessonCount / lessons.length) * 35 +
      (learnedWords / words.length) * 20 +
      (progress.readPassages.length / readingPassages.length) * 15 +
      (progress.completedListening.length / listeningItems.length) * 15 +
      quizAverage * 0.15,
    ),
  )

  const heatmap = useMemo(() => {
    const days: { key: string; label: string; minutes: number; today: boolean }[] = []
    for (let offset = -27; offset <= 0; offset += 1) {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const key = todayKey(date)
      days.push({
        key,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        minutes: Math.round(progress.activity[key] ?? 0),
        today: offset === 0,
      })
    }
    return days
  }, [progress.activity])

  const thisWeekMinutes = useMemo(() => {
    let total = 0
    for (let offset = 0; offset > -7; offset -= 1) {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      total += progress.activity[todayKey(date)] ?? 0
    }
    return Math.round(total)
  }, [progress.activity])

  const achievements = [
    { id: 'first', label: '迈出第一步', detail: '完成第 1 节课', icon: Sparkles, earned: completedLessonCount >= 1 },
    { id: 'five', label: '句子成形', detail: '完成 5 节课', icon: BookOpen, earned: completedLessonCount >= 5 },
    { id: 'ten', label: '越过中点', detail: '完成 10 节课', icon: Target, earned: completedLessonCount >= 10 },
    { id: 'all', label: '十八课全通', detail: '完成全部课节', icon: Trophy, earned: completedLessonCount >= 18 },
    { id: 'words50', label: '五十词入袋', detail: '收集 50 个词', icon: Brain, earned: learnedWords >= 50 },
    { id: 'streak7', label: '一周不断', detail: '连续学习 7 天', icon: Flame, earned: progress.streak >= 7 },
    { id: 'reader', label: '读进去了', detail: '完成 3 篇阅读', icon: BookOpen, earned: progress.readPassages.length >= 3 },
    { id: 'listener', label: '耳朵打开', detail: '完成 3 组听力', icon: Headphones, earned: progress.completedListening.length >= 3 },
    { id: 'mock', label: '模考实战', detail: '完成 N4 综合模拟', icon: Medal, earned: progress.quizHistory.some((record) => record.mode === 'mock') },
  ]
  const earnedCount = achievements.filter((item) => item.earned).length

  const skills = [
    { label: '假名反应', value: Math.min(100, Math.round((Object.values(progress.kanaStats).reduce((sum, item) => sum + item.total, 0) / 30) * 100)), detail: '通过文字训练积累' },
    { label: '核心词汇', value: Math.round((learnedWords / words.length) * 100), detail: `${learnedWords} / ${words.length} 词` },
    { label: '语法骨架', value: Math.round((completedLessonCount / lessons.length) * 100), detail: `${completedLessonCount} / ${lessons.length} 课` },
    { label: '阅读耐力', value: Math.round((progress.readPassages.length / readingPassages.length) * 100), detail: `${progress.readPassages.length} / ${readingPassages.length} 篇` },
    { label: '听力抓点', value: Math.round((progress.completedListening.length / listeningItems.length) * 100), detail: `${progress.completedListening.length} / ${listeningItems.length} 组` },
  ]

  const targetDate = progress.startedAt ? new Date(progress.startedAt + 12 * 7 * 86400000) : null

  return (
    <div className="progress-page page-enter">
      <PageHeader
        eyebrow="YOUR RECORD · 学习报告"
        title="看见自己的变化"
        jp="成長の記録"
        description="这里不评价快慢，只记录你有没有在往前走。"
        actions={targetDate ? (
          <div className="target-date">
            <span>12 周路线目标日</span>
            <strong>{targetDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</strong>
          </div>
        ) : undefined}
      />

      <section className="report-hero">
        <div className="report-hero-main">
          <p className="eyebrow light">N4 READINESS</p>
          <h2>你的 N4 准备度</h2>
          <div className="readiness-row">
            <div className="readiness-number">{readiness}<span>%</span></div>
            <div className="readiness-copy">
              <div className="readiness-bar"><span style={{ width: `${readiness}%` }} /></div>
              <p>{readiness < 20 ? '刚刚起步。先把前 3 课学完，底盘就会稳很多。' : readiness < 50 ? '骨架正在成形。接下来重点补词汇和阅读。' : readiness < 75 ? '已经进入 N4 中段。保持每周两次测验。' : '准备度不错，接下来用模拟和错题做最后打磨。'}</p>
            </div>
          </div>
          <div className="report-hero-meta">
            <span><Flame size={15} /> 连续 {progress.streak} 天</span>
            <span><Clock3 size={15} /> 本周 {thisWeekMinutes} 分钟</span>
            <span><Award size={15} /> 第 {currentWeek} / 12 周</span>
          </div>
        </div>
        <div className="report-hero-ring">
          <ProgressRing value={readiness} max={100} size={170} stroke={11} tone="gold" label={`${readiness}%`} sublabel="准备度" />
          <p>不是考试分数，<br />而是当前能力覆盖度</p>
        </div>
      </section>

      <section className="report-stat-grid">
        <div className="report-stat"><span className="stat-icon flame"><Flame size={18} /></span><div><strong>{progress.streak}<small> 天</small></strong><span>连续学习</span></div></div>
        <div className="report-stat"><span className="stat-icon green"><Clock3 size={18} /></span><div><strong>{Math.round(totalMinutes)}<small> 分</small></strong><span>累计学习</span></div></div>
        <div className="report-stat"><span className="stat-icon ink"><Trophy size={18} /></span><div><strong>{totalXP}<small> XP</small></strong><span>累计经验</span></div></div>
        <div className="report-stat"><span className="stat-icon gold"><BookOpen size={18} /></span><div><strong>{completedLessonCount}<small> / 18</small></strong><span>完成课节</span></div></div>
      </section>

      <div className="report-grid">
        <div className="report-left">
          <article className="panel heatmap-panel">
            <div className="panel-head">
              <div><p className="eyebrow">THE LAST 28 DAYS</p><h2>学习节奏</h2></div>
              <span className="heatmap-summary">今天 {todayMinutes} 分钟</span>
            </div>
            <div className="heatmap-wrap">
              <div className="heatmap">
                {heatmap.map((day) => {
                  const intensity = day.minutes <= 0 ? 0 : Math.min(4, Math.ceil(day.minutes / Math.max(5, progress.dailyGoal / 2)))
                  return (
                    <span
                      key={day.key}
                      className={`heat-cell level-${intensity} ${day.today ? 'today' : ''}`}
                      title={`${day.label} · ${day.minutes} 分钟`}
                    >
                      <i />
                    </span>
                  )
                })}
              </div>
              <div className="heatmap-labels">
                <span>{heatmap[0]?.label}</span>
                <span>今天</span>
              </div>
            </div>
            <div className="heatmap-legend">
              <span>少</span>
              {[0, 1, 2, 3, 4].map((level) => <i key={level} className={`heat-dot level-${level}`} />)}
              <span>多</span>
              <em>· 每次学习都会留下痕迹</em>
            </div>
          </article>

          <article className="panel skill-report-panel">
            <div className="panel-head">
              <div><p className="eyebrow">SKILL BREAKDOWN</p><h2>五项能力</h2></div>
              <span className="heatmap-summary">共 {grammarPoints.length} 个语法点</span>
            </div>
            <div className="skill-report-list">
              {skills.map((skill, index) => (
                <div className="skill-report-row" key={skill.label}>
                  <span className="skill-rank">{String(index + 1).padStart(2, '0')}</span>
                  <div className="skill-report-copy">
                    <div><strong>{skill.label}</strong><small>{skill.detail}</small><span>{skill.value}%</span></div>
                    <div className="skill-track"><span className={`skill-fill ${['red', 'gold', 'green', 'blue', 'plum'][index]}`} style={{ width: `${Math.max(2, skill.value)}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel quiz-log-panel">
            <div className="panel-head">
              <div><p className="eyebrow">QUIZ LOG</p><h2>测验记录</h2></div>
              <Link to="/practice?tab=quiz" className="text-link">去练习 <Sparkles size={14} /></Link>
            </div>
            {progress.quizHistory.length === 0 ? (
              <div className="mini-empty">
                <span>まだ</span>
                <p>还没有测验记录。做一次每日小测，这里就会开始积累。</p>
                <Link to="/practice?tab=quiz" className="button button-ghost button-small">开始每日小测</Link>
              </div>
            ) : (
              <div className="quiz-log-list">
                {progress.quizHistory.slice(0, 8).map((record) => {
                  const config = quizModes.find((item) => item.id === record.mode)
                  const rate = Math.round((record.score / record.total) * 100)
                  return (
                    <div className="quiz-log-row" key={record.id}>
                      <span className={`quiz-log-dot ${rate >= 75 ? 'good' : ''}`} />
                      <div className="quiz-log-copy"><strong>{config?.title ?? record.mode}</strong><span>{new Date(record.date).toLocaleDateString('zh-CN')} · {Math.round(record.duration / 60)} 分钟</span></div>
                      <div className="quiz-log-bar"><span style={{ width: `${rate}%` }} /></div>
                      <strong className="quiz-log-score">{record.score}<span>/{record.total}</span></strong>
                      <span className="quiz-log-rate">{rate}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </article>
        </div>

        <aside className="report-right">
          <article className="report-route">
            <div className="panel-head compact">
              <div><p className="eyebrow">12-WEEK ROUTE</p><h2>路线进度</h2></div>
              <span className="week-pill">第 {currentWeek} 周</span>
            </div>
            <div className="unit-timeline">
              {units.map((unit) => {
                const unitLessons = lessons.filter((lesson) => lesson.unitId === unit.id)
                const done = unitLessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
                const weekStart = (unit.number - 1) * 2 + 1
                const weekEnd = weekStart + 1
                const active = currentWeek >= weekStart && currentWeek <= weekEnd
                return (
                  <div className={`timeline-unit ${active ? 'active' : ''} ${done === unitLessons.length ? 'complete' : ''}`} key={unit.id}>
                    <span className="timeline-dot">{done === unitLessons.length ? <Check size={12} /> : unit.code}</span>
                    <div>
                      <div className="timeline-title"><strong>{unit.title}</strong><small>第 {weekStart}–{weekEnd} 周</small></div>
                      <div className="timeline-bar"><span style={{ width: `${(done / unitLessons.length) * 100}%` }} /></div>
                      <span className="timeline-meta">{done}/{unitLessons.length} 课</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="panel achievements-panel">
            <div className="panel-head compact">
              <div><p className="eyebrow">MILESTONES</p><h2>成就徽章</h2></div>
              <span className="week-pill">{earnedCount} / {achievements.length}</span>
            </div>
            <div className="achievement-grid">
              {achievements.map((achievement) => (
                <div className={`achievement ${achievement.earned ? 'earned' : 'locked'}`} key={achievement.id} title={achievement.detail}>
                  <span className="achievement-icon">
                    {achievement.earned ? <achievement.icon size={19} /> : <Lock size={16} />}
                  </span>
                  <strong>{achievement.label}</strong>
                  <small>{achievement.detail}</small>
                </div>
              ))}
            </div>
          </article>

          <div className="report-note">
            <CheckCircle2 size={17} />
            <p>所有数据保存在当前浏览器。换设备或清理浏览器数据后不会同步，建议在设置中定期截图留存。</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
