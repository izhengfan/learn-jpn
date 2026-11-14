import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Play,
  Route,
  Sparkles,
  Target,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { lessons, lessonsByUnit, units } from '../data/lessons'
import { useProgress } from '../store/progress'

type Filter = 'all' | 'todo' | 'done'

export function Courses() {
  const { progress, completedLessonCount } = useProgress()
  const [filter, setFilter] = useState<Filter>('all')
  const overall = Math.round((completedLessonCount / lessons.length) * 100)

  return (
    <div className="page-enter courses-page">
      <PageHeader
        eyebrow="CURRICULUM · 全 18 课"
        title="学习路径"
        jp="学習コース"
        description="六个阶段，把「看得懂」变成「说得出」。每课 10–18 分钟，按顺序学最稳。"
        actions={
          <Link to={`/lesson/${lessons.find((lesson) => !progress.completedLessons.includes(lesson.id))?.id ?? lessons[0].id}`} className="button button-primary">
            <Play size={16} /> 继续学习
          </Link>
        }
      />

      <section className="course-overview">
        <div className="course-overview-art">
          <span className="overview-kanji">道</span>
          <div>
            <p className="eyebrow light">THE 12-WEEK ROUTE</p>
            <h2>从五十音到 N4，<br />不是一条直线，<br /><em>而是一层层搭起来的。</em></h2>
            <p>每节课只引入少量新知识，用例句、对话和即时检查把它固定下来。</p>
            <div className="overview-meta">
              <span><Clock3 size={14} /> 约 4 小时核心课</span>
              <span><Target size={14} /> 12 周节奏</span>
              <span><Sparkles size={14} /> 18 次即时检查</span>
            </div>
          </div>
        </div>
        <div className="course-overview-progress">
          <ProgressRing
            value={completedLessonCount}
            max={lessons.length}
            size={142}
            stroke={9}
            tone="gold"
            label={`${overall}%`}
            sublabel="总进度"
          />
          <div className="overview-progress-copy">
            <strong>{completedLessonCount} / {lessons.length} 课</strong>
            <span>已完成</span>
            <div className="overview-progress-bar"><span style={{ width: `${overall}%` }} /></div>
            <small>建议每周完成 1–2 个单元</small>
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <div className="segmented filter-tabs">
          {([
            ['all', '全部课节'],
            ['todo', '还没学'],
            ['done', '已完成'],
          ] as [Filter, string][]).map(([value, label]) => (
            <button type="button" key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="filter-summary">
          <span className="legend-item"><i className="legend-dot red" /> 建议从当前单元继续</span>
          <span>{completedLessonCount} 已完成 · {lessons.length - completedLessonCount} 待学习</span>
        </div>
      </div>

      <div className="course-layout">
        <div className="unit-list">
          {units.map((unit) => {
            const unitLessons = lessonsByUnit(unit.id)
            const done = unitLessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
            const visibleLessons = unitLessons.filter((lesson) => {
              if (filter === 'done') return progress.completedLessons.includes(lesson.id)
              if (filter === 'todo') return !progress.completedLessons.includes(lesson.id)
              return true
            })
            if (visibleLessons.length === 0) return null
            const isCurrent = unitLessons.some((lesson) => !progress.completedLessons.includes(lesson.id)) &&
              units.findIndex((item) => item.id === unit.id) ===
                units.findIndex((item) => lessonsByUnit(item.id).some((lesson) => !progress.completedLessons.includes(lesson.id)))

            return (
              <section className={`unit-card accent-${unit.color} ${isCurrent ? 'is-current' : ''}`} key={unit.id}>
                <div className="unit-head">
                  <div className="unit-number">
                    <span>{unit.code}</span>
                    <strong>{unit.number}</strong>
                  </div>
                  <div className="unit-title">
                    <div className="unit-kicker">
                      <span>{unit.jpTitle}</span>
                      <em>{unit.weeks}</em>
                      {isCurrent && <b>当前阶段</b>}
                    </div>
                    <h2>{unit.title}</h2>
                    <p>{unit.description}</p>
                  </div>
                  <div className="unit-meta">
                    <strong>{done}<span> / {unitLessons.length}</span></strong>
                    <small>课节完成</small>
                    <div className="unit-progress"><span style={{ width: `${(done / unitLessons.length) * 100}%` }} /></div>
                  </div>
                </div>

                <div className="unit-outcome">
                  <Target size={15} />
                  <span>学完能做到：{unit.outcome}</span>
                </div>

                <div className="lesson-list">
                  {visibleLessons.map((lesson) => {
                    const isDone = progress.completedLessons.includes(lesson.id)
                    return (
                      <Link to={`/lesson/${lesson.id}`} className={`lesson-row ${isDone ? 'done' : ''}`} key={lesson.id}>
                        <span className="lesson-status">
                          {isDone ? <CheckCircle2 size={22} /> : <span>{String(lesson.number).padStart(2, '0')}</span>}
                        </span>
                        <span className="lesson-row-title">
                          <strong>{lesson.title}</strong>
                          <small>{lesson.jpTitle}</small>
                        </span>
                        <span className="lesson-row-sub">{lesson.subtitle}</span>
                        <span className="lesson-row-meta">
                          <span>{lesson.level}</span>
                          <span><Clock3 size={13} /> {lesson.duration} 分钟</span>
                        </span>
                        <span className="lesson-row-cta">
                          {isDone ? <><Check size={15} /> 已掌握</> : <><Play size={14} /> 开始</>}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <aside className="course-aside">
          <article className="panel aside-sticky">
            <div className="panel-head compact">
              <div>
                <p className="eyebrow">HOW TO USE</p>
                <h2>这样学，最省力</h2>
              </div>
              <Route size={18} className="panel-icon" />
            </div>
            <ol className="course-tips">
              <li><span>01</span><div><strong>先完成课节，再背单词</strong><p>词在句子里才有生命。课节会自动把新词加入卡组。</p></div></li>
              <li><span>02</span><div><strong>每天先清到期复习</strong><p>记忆曲线不等人，先复习旧词只需 3–5 分钟。</p></div></li>
              <li><span>03</span><div><strong>每 3 课做一次混合测验</strong><p>用题目暴露“以为会了”的漏洞，再回到语法库。</p></div></li>
            </ol>
            <div className="aside-divider" />
            <p className="eyebrow">N4 能力构成</p>
            <div className="ability-chips">
              <span>约 1500 词</span>
              <span>约 170 汉字</span>
              <span>基础敬语</span>
              <span>短文阅读</span>
              <span>日常听力</span>
            </div>
            <Link to="/progress" className="button button-ghost button-block">查看我的学习报告 <ArrowRight size={15} /></Link>
          </article>
          <article className="aside-quote">
            <span className="quote-mark">「</span>
            <p>人間は、自分が思っている以上に、<br />少しずつしか変わらない。<br />だから、少しずつでいい。</p>
            <small>人改变得比自己想象中慢，所以一点点就好。</small>
          </article>
        </aside>
      </div>
    </div>
  )
}
