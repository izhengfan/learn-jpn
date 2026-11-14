import { useMemo } from 'react'
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Flame,
  Headphones,
  Layers3,
  PenLine,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { JapaneseScene } from '../components/JapaneseScene'
import { ProgressRing } from '../components/ProgressRing'
import { AudioButton } from '../components/AudioButton'
import { grammarPoints } from '../data/grammar'
import { lessons } from '../data/lessons'
import { listeningItems } from '../data/listening'
import { readingPassages } from '../data/reading'
import { units } from '../data/lessons'
import { words } from '../data/vocabulary'
import { todayKey, useProgress } from '../store/progress'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function formatShortDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function Dashboard() {
  const {
    progress,
    todayMinutes,
    dueCount,
    learnedWords,
    completedLessonCount,
  } = useProgress()

  const nextLesson = useMemo(
    () => lessons.find((lesson) => !progress.completedLessons.includes(lesson.id)) ?? lessons[lessons.length - 1],
    [progress.completedLessons],
  )
  const nextUnit = units.find((unit) => unit.id === nextLesson.unitId)

  const lessonDoneToday = progress.lessonCompletions[nextLesson.id] === todayKey()
  const quizDoneToday = progress.quizHistory.some((quiz) => new Date(quiz.date).toDateString() === new Date().toDateString())
  const reviewDone = dueCount === 0

  const weekly = useMemo(() => {
    const days: { label: string; minutes: number; date: string }[] = []
    for (let offset = -6; offset <= 0; offset += 1) {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const key = todayKey(date)
      days.push({
        label: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        minutes: Math.round(progress.activity[key] ?? 0),
        date: key,
      })
    }
    return days
  }, [progress.activity])

  const weekTotal = weekly.reduce((sum, day) => sum + day.minutes, 0)
  const weekMax = Math.max(progress.dailyGoal, ...weekly.map((day) => day.minutes), 10)

  const todayWord = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0)
    const day = Math.floor((Date.now() - start.getTime()) / 86400000)
    return words[day % words.length]
  }, [])

  const skillRows = [
    {
      label: '假名反应',
      value: Math.min(100, Math.round((Object.values(progress.kanaStats).reduce((sum, item) => sum + item.total, 0) / 30) * 100)),
      detail: '反应速度',
      color: 'red',
    },
    {
      label: '核心词汇',
      value: Math.min(100, Math.round((learnedWords / 180) * 100)),
      detail: `${learnedWords} / 180`,
      color: 'gold',
    },
    {
      label: '语法骨架',
      value: Math.min(100, Math.round((completedLessonCount / 18) * 100)),
      detail: `${completedLessonCount} / 18 课`,
      color: 'green',
    },
    {
      label: '阅读耐力',
      value: Math.min(100, Math.round((progress.readPassages.length / readingPassages.length) * 100)),
      detail: `${progress.readPassages.length} / ${readingPassages.length} 篇`,
      color: 'blue',
    },
    {
      label: '听力抓点',
      value: Math.min(100, Math.round((progress.completedListening.length / listeningItems.length) * 100)),
      detail: `${progress.completedListening.length} / ${listeningItems.length} 组`,
      color: 'plum',
    },
  ]

  const milestone = progress.completedLessons.length >= 13
    ? '进入 N4 冲刺'
    : progress.completedLessons.length >= 7
      ? '正在攻克表达'
      : progress.completedLessons.length >= 3
        ? '句子开始成形'
        : '打好发音与骨架'

  return (
    <div className="dashboard page-enter">
      <section className="hero-grid">
        <article className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">YOUR N4 ROUTE · 12 WEEKS</p>
            <h1>
              把日语，
              <br />
              <em>真正用起来。</em>
            </h1>
            <p className="hero-greeting">
              {greeting()}，{progress.name}。今天不用学很多，只要比昨天多会一句。
            </p>
            <div className="hero-actions">
              <Link to={`/lesson/${nextLesson.id}`} className="button button-primary button-large">
                继续学习 <ArrowRight size={17} />
              </Link>
              <Link to="/courses" className="button button-ghost button-large">
                查看 12 周路线
              </Link>
            </div>
            <div className="hero-progress">
              <div className="hero-progress-top">
                <span><BookOpen size={14} /> 课程进度 · {nextUnit?.title}</span>
                <strong>{completedLessonCount} / {lessons.length}</strong>
              </div>
              <div className="hero-progress-bar">
                <span style={{ width: `${(completedLessonCount / lessons.length) * 100}%` }} />
              </div>
              <div className="hero-progress-meta">
                <span>当前里程碑：{milestone}</span>
                <span>下一课 · {nextLesson.title}</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <JapaneseScene />
            <div className="hero-week-badge">
              <span>WEEK</span>
              <strong>{Math.min(12, Math.floor((completedLessonCount / 18) * 12) + 1)}</strong>
              <small>/ 12</small>
            </div>
            <div className="hero-floating-note">
              <span className="vert-jp">継続は力なり</span>
              <p>坚持就是力量</p>
            </div>
          </div>
        </article>

        <aside className="daily-card">
          <div className="daily-card-head">
            <div>
              <p className="eyebrow">TODAY'S PACE</p>
              <h2>今日学习</h2>
            </div>
            <ProgressRing
              value={todayMinutes}
              max={progress.dailyGoal}
              size={78}
              stroke={6}
              label={`${Math.min(100, Math.round((todayMinutes / progress.dailyGoal) * 100))}%`}
              sublabel="目标"
            />
          </div>
          <div className="daily-minutes">
            <strong>{todayMinutes}</strong>
            <span>/ {progress.dailyGoal} 分钟</span>
            {todayMinutes >= progress.dailyGoal && <em>已达成</em>}
          </div>
          <div className="daily-tasks">
            <Link to="/vocabulary?tab=review" className={`daily-task ${reviewDone ? 'done' : ''}`}>
              <span className="task-icon">{reviewDone ? <CheckCircle2 size={17} /> : <Layers3 size={17} />}</span>
              <span>
                <strong>复习单词</strong>
                <small>{dueCount > 0 ? `${dueCount} 张卡到期` : '今日已清空'}</small>
              </span>
              {reviewDone ? <CheckCircle2 size={16} className="task-check" /> : <ChevronRight size={16} />}
            </Link>
            <Link to={`/lesson/${nextLesson.id}`} className={`daily-task ${lessonDoneToday ? 'done' : ''}`}>
              <span className="task-icon">{lessonDoneToday ? <CheckCircle2 size={17} /> : <BookMarked size={17} />}</span>
              <span>
                <strong>{lessonDoneToday ? '课节已完成' : '完成下一课'}</strong>
                <small>{nextLesson.title} · {nextLesson.duration} 分钟</small>
              </span>
              {lessonDoneToday ? <CheckCircle2 size={16} className="task-check" /> : <ChevronRight size={16} />}
            </Link>
            <Link to="/practice?tab=quiz" className={`daily-task ${quizDoneToday ? 'done' : ''}`}>
              <span className="task-icon">{quizDoneToday ? <CheckCircle2 size={17} /> : <PenLine size={17} />}</span>
              <span>
                <strong>每日小测</strong>
                <small>10 题 · 约 5 分钟</small>
              </span>
              {quizDoneToday ? <CheckCircle2 size={16} className="task-check" /> : <ChevronRight size={16} />}
            </Link>
          </div>
          <div className="daily-footnote">
            <Sparkles size={14} />
            <span>今天还剩 {Math.max(0, progress.dailyGoal - todayMinutes)} 分钟，按自己的节奏来。</span>
          </div>
        </aside>
      </section>

      <section className="stat-strip" aria-label="学习统计">
        <div className="stat-cell">
          <span className="stat-icon flame"><Flame size={19} /></span>
          <div><strong>{progress.streak}<small> 天</small></strong><span>连续学习</span></div>
        </div>
        <div className="stat-cell">
          <span className="stat-icon green"><BookOpen size={19} /></span>
          <div><strong>{completedLessonCount}<small> / {lessons.length}</small></strong><span>已完成课节</span></div>
        </div>
        <div className="stat-cell">
          <span className="stat-icon gold"><Layers3 size={19} /></span>
          <div><strong>{learnedWords}<small> / {words.length}</small></strong><span>已收集单词</span></div>
        </div>
        <div className="stat-cell">
          <span className="stat-icon ink"><Trophy size={19} /></span>
          <div><strong>{progress.xp}<small> XP</small></strong><span>累计经验值</span></div>
        </div>
      </section>

      <section className="dashboard-columns">
        <div className="dashboard-left">
          <article className="panel next-lesson-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p>
                <h2>继续这一段</h2>
              </div>
              <Link to="/courses" className="text-link">全部课节 <ArrowRight size={14} /></Link>
            </div>
            <div className="next-lesson-card">
              <div className="next-lesson-number">
                <span>UNIT {nextUnit?.code}</span>
                <strong>{String(nextLesson.number).padStart(2, '0')}</strong>
              </div>
              <div className="next-lesson-copy">
                <span className="level-pill">{nextLesson.level} · {nextLesson.duration} 分钟</span>
                <h3>{nextLesson.title}</h3>
                <p className="jp-line">{nextLesson.jpTitle}</p>
                <p>{nextLesson.subtitle}</p>
                <div className="objective-chips">
                  {nextLesson.objectives.slice(0, 2).map((objective) => (
                    <span key={objective}>{objective}</span>
                  ))}
                </div>
              </div>
              <Link to={`/lesson/${nextLesson.id}`} className="circle-arrow" aria-label="开始下一课">
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="unit-rail">
              {units.map((unit) => {
                const unitLessons = lessons.filter((lesson) => lesson.unitId === unit.id)
                const done = unitLessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
                return (
                  <Link
                    to="/courses"
                    key={unit.id}
                    className={`unit-rail-item ${unit.id === nextUnit?.id ? 'current' : ''} ${done === unitLessons.length ? 'complete' : ''}`}
                    title={`${unit.title} · ${done}/${unitLessons.length}`}
                  >
                    <span>{unit.code}</span>
                    <i style={{ height: `${(done / unitLessons.length) * 100}%` }} />
                  </Link>
                )
              })}
            </div>
          </article>

          <article className="panel weekly-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">CONSISTENCY OVER INTENSITY</p>
                <h2>这七天的节奏</h2>
              </div>
              <div className="weekly-total"><strong>{weekTotal}</strong><span>分钟</span></div>
            </div>
            <div className="weekly-chart">
              {weekly.map((day) => (
                <div className="weekly-bar-col" key={day.date}>
                  <div className="weekly-bar-track">
                    <span
                      className={`weekly-bar ${day.date === todayKey() ? 'today' : ''}`}
                      style={{ height: `${Math.max(day.minutes > 0 ? 8 : 2, (day.minutes / weekMax) * 100)}%` }}
                      title={`${day.minutes} 分钟`}
                    />
                  </div>
                  <span className="weekly-bar-label">{day.label}</span>
                  <small>{day.minutes || '·'}</small>
                </div>
              ))}
            </div>
            <div className="weekly-legend">
              <span><i className="legend-dot red" /> 学习分钟</span>
              <span>目标 {progress.dailyGoal} 分钟 / 天</span>
            </div>
          </article>
        </div>

        <aside className="dashboard-right">
          <article className="panel skills-panel">
            <div className="panel-head compact">
              <div>
                <p className="eyebrow">YOUR BASELINE</p>
                <h2>能力底盘</h2>
              </div>
              <Target size={18} className="panel-icon" />
            </div>
            <div className="skill-list">
              {skillRows.map((skill) => (
                <div className="skill-row" key={skill.label}>
                  <div className="skill-row-top">
                    <span>{skill.label}</span>
                    <small>{skill.detail}</small>
                  </div>
                  <div className="skill-track">
                    <span className={`skill-fill ${skill.color}`} style={{ width: `${Math.max(skill.value, 2)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="panel-note">完成课节、测验和阅读后，这里会逐步长起来。</p>
          </article>

          <article className="today-word-card">
            <div className="today-word-head">
              <p className="eyebrow">WORD OF THE DAY</p>
              <AudioButton text={todayWord.word} compact />
            </div>
            <div className="today-word-main">
              <span className="today-word-kana">{todayWord.kana}</span>
              <h3>{todayWord.word}</h3>
              <p>{todayWord.meaning}</p>
            </div>
            <div className="today-word-example">
              <p>{todayWord.example}</p>
              <span>{todayWord.exampleMeaning}</span>
            </div>
            <Link to={`/vocabulary?word=${todayWord.id}`} className="text-link light">
              打开单词卡 <ArrowRight size={14} />
            </Link>
          </article>

          <article className="panel quick-links-panel">
            <Link to="/practice?tab=listening" className="quick-link">
              <span className="quick-icon"><Headphones size={18} /></span>
              <span><strong>5 分钟精听</strong><small>抓时间、数字、方向</small></span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/kana" className="quick-link">
              <span className="quick-icon"><Sparkles size={18} /></span>
              <span><strong>假名反应训练</strong><small>把读音练成条件反射</small></span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/grammar" className="quick-link">
              <span className="quick-icon"><Circle size={18} /></span>
              <span><strong>语法速查</strong><small>{grammarPoints.length} 个 N5–N4 句型</small></span>
              <ChevronRight size={16} />
            </Link>
          </article>
        </aside>
      </section>
    </div>
  )
}
