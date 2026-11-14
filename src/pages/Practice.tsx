import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Headphones,
  ListChecks,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Volume2,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import type { QuizQuestion } from '../data/types'
import { buildQuiz, quizModes, type QuizMode } from '../data/quiz'
import { listeningItems } from '../data/listening'
import { readingPassages } from '../data/reading'
import { useProgress } from '../store/progress'
import { useToast } from '../components/Toast'

type PracticeTab = 'quiz' | 'reading' | 'listening'

const typeLabels: Record<QuizQuestion['type'], string> = {
  grammar: '语法',
  vocab: '词汇',
  kanji: '汉字',
  kana: '假名',
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

const resultCopy = (rate: number) => {
  if (rate >= 90) return { title: '非常稳，N4 在你射程内。', note: '保持节奏，把错题对应的语法点再看一遍，就可以往下推进。' }
  if (rate >= 75) return { title: '基础已经成形。', note: '错的题多半是细节。回到语法库看「接续」和「语感」，再做一轮。' }
  if (rate >= 60) return { title: '方向对了，细节还要再磨。', note: '不要只对答案。把每个错误选项为什么错，用中文写一句。' }
  return { title: '这一步有点难，正常。', note: '先回到对应课节，把讲解和例句过一遍，再来一次。' }
}

function QuizRunner({ mode, onExit }: { mode: QuizMode; onExit: () => void }) {
  const config = quizModes.find((item) => item.id === mode) ?? quizModes[0]
  const { recordQuiz } = useProgress()
  const { showToast } = useToast()
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuiz(mode))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<{ question: QuizQuestion; selected: number }[]>([])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startTime = useRef(Date.now())
  const recorded = useRef(false)

  useEffect(() => {
    startTime.current = Date.now()
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const question = questions[index]

  const choose = (optionIndex: number) => {
    if (selected !== null) return
    setSelected(optionIndex)
    if (optionIndex === question.answer) setScore((value) => value + 1)
    setAnswers((prev) => [...prev, { question, selected: optionIndex }])
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true)
      if (!recorded.current) {
        recorded.current = true
        recordQuiz({
          mode,
          score,
          total: questions.length,
          duration: Math.round((Date.now() - startTime.current) / 1000),
        })
      }
      showToast('测验完成，记录已保存')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setIndex((value) => value + 1)
    setSelected(null)
  }

  const restart = () => {
    setQuestions(buildQuiz(mode))
    setIndex(0)
    setSelected(null)
    setAnswers([])
    setScore(0)
    setFinished(false)
    setElapsed(0)
    startTime.current = Date.now()
    recorded.current = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (finished) {
    const rate = Math.round((score / questions.length) * 100)
    const copy = resultCopy(rate)
    const wrong = answers.filter((answer) => answer.selected !== answer.question.answer)
    return (
      <div className="quiz-result">
        <div className="quiz-result-hero">
          <ProgressRing value={score} max={questions.length} size={152} stroke={10} tone={rate >= 75 ? 'green' : 'red'} label={`${rate}%`} sublabel={`${score} / ${questions.length}`} />
          <div className="quiz-result-copy">
            <p className="eyebrow">RESULT · {config.title}</p>
            <h2>{copy.title}</h2>
            <p>{copy.note}</p>
            <div className="quiz-result-meta">
              <span><Clock3 size={15} /> 用时 {formatClock(elapsed)}</span>
              <span><Trophy size={15} /> 正确 {score} 题</span>
              <span><X size={15} /> 错误 {questions.length - score} 题</span>
              <span><Sparkles size={15} /> +{Math.max(5, score * 3)} XP</span>
            </div>
            <div className="quiz-result-actions">
              <button type="button" className="button button-primary" onClick={restart}><RotateCcw size={16} /> 再做一轮</button>
              <button type="button" className="button button-ghost" onClick={onExit}>返回测验中心</button>
              {wrong.length > 0 && <button type="button" className="text-button" onClick={() => document.getElementById('wrong-review')?.scrollIntoView({ behavior: 'smooth' })}>查看错题 ↓</button>}
            </div>
          </div>
        </div>

        {wrong.length > 0 ? (
          <div className="wrong-review" id="wrong-review">
            <div className="panel-head">
              <div><p className="eyebrow">REVIEW THE GAPS</p><h2>错题复盘 · {wrong.length} 题</h2></div>
              <Link to="/grammar" className="text-link">打开语法库 <ArrowRight size={14} /></Link>
            </div>
            {wrong.map((answer, index) => (
              <div className="wrong-card" key={`${answer.question.id}-${index}`}>
                <span className="wrong-number">Q{index + 1}</span>
                <div className="wrong-copy">
                  <p className="wrong-prompt">{answer.question.prompt}</p>
                  <div className="wrong-answer-row">
                    <span className="wrong-answer"><X size={13} /> 你的选择：{answer.question.options[answer.selected]}</span>
                    <span className="correct-answer"><Check size={13} /> 正确答案：{answer.question.options[answer.question.answer]}</span>
                  </div>
                  <p className="wrong-explanation">{answer.question.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="perfect-result">
            <CheckCircle2 size={22} />
            <div><strong>全对。这一组没有漏洞。</strong><p>把时间留给更难的阅读和听力，或者挑战下一组模拟。</p></div>
          </div>
        )}
      </div>
    )
  }

  if (!question) return null

  const optionState = (optionIndex: number) => {
    if (selected === null) return ''
    if (optionIndex === question.answer) return 'correct'
    if (optionIndex === selected) return 'wrong'
    return 'muted'
  }

  return (
    <div className="quiz-runner">
      <div className="quiz-runner-head">
        <button type="button" className="text-button" onClick={onExit}><ArrowLeft size={15} /> 退出测验</button>
        <div className="quiz-runner-title">
          <span>{config.title}</span>
          <small>{typeLabels[question.type]}</small>
        </div>
        <span className="quiz-timer"><Timer size={15} /> {formatClock(elapsed)}</span>
      </div>
      <div className="quiz-progress-row">
        <div className="quiz-progress"><span style={{ width: `${(index / questions.length) * 100}%` }} /></div>
        <span>{index + 1} / {questions.length}</span>
      </div>

      <div className="quiz-question-card">
        <div className="quiz-question-meta">
          <span className="quiz-type-pill">{typeLabels[question.type]}</span>
          {question.hint && <span className="quiz-hint">{question.hint}</span>}
          {question.audioText && <AudioButton text={question.audioText} compact />}
        </div>
        <h2>{question.prompt}</h2>
        <p className="quiz-instruction">选择最合适的一项</p>
        <div className="quiz-options">
          {question.options.map((option, optionIndex) => (
            <button
              type="button"
              key={`${option}-${optionIndex}`}
              className={`quiz-option ${optionState(optionIndex)}`}
              disabled={selected !== null}
              onClick={() => choose(optionIndex)}
            >
              <span className="quiz-option-letter">{String.fromCharCode(65 + optionIndex)}</span>
              <span className="quiz-option-text">{option}</span>
              {selected !== null && optionIndex === question.answer && <CheckCircle2 size={18} />}
              {selected !== null && optionIndex === selected && optionIndex !== question.answer && <X size={18} />}
            </button>
          ))}
        </div>
        {selected !== null && (
          <div className={`quiz-feedback ${selected === question.answer ? 'good' : 'bad'}`}>
            <div className="quiz-feedback-head">
              <span>{selected === question.answer ? <><Check size={16} /> 答对了</> : <><X size={16} /> 差一点</>}</span>
              <button type="button" className="button button-primary button-small" onClick={next}>
                {index + 1 >= questions.length ? '查看结果' : '下一题'} <ArrowRight size={15} />
              </button>
            </div>
            <p>{question.explanation}</p>
          </div>
        )}
      </div>
      <p className="quiz-keyboard-note">先判断考点，再排除干扰项。不要在一道题上停留超过一分钟。</p>
    </div>
  )
}

export function Practice() {
  const { progress, recordQuiz } = useProgress()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as PracticeTab) || 'quiz'
  const initialMode = searchParams.get('mode') as QuizMode | null
  const [mode, setMode] = useState<QuizMode | null>(
    initialMode && quizModes.some((item) => item.id === initialMode) ? initialMode : null,
  )

  useEffect(() => {
    const requested = searchParams.get('mode') as QuizMode | null
    setMode(requested && quizModes.some((item) => item.id === requested) ? requested : null)
  }, [searchParams])

  const switchTab = (nextTab: PracticeTab) => {
    setMode(null)
    setSearchParams({ tab: nextTab })
  }

  const startQuiz = (nextMode: QuizMode) => {
    setMode(nextMode)
    setSearchParams({ tab: 'quiz', mode: nextMode })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const exitQuiz = () => {
    setMode(null)
    setSearchParams({ tab: 'quiz' })
  }

  const quizHistory = progress.quizHistory
  const quizAverage = quizHistory.length
    ? Math.round(quizHistory.reduce((sum, item) => sum + (item.score / item.total) * 100, 0) / quizHistory.length)
    : 0
  const readCount = progress.readPassages.length
  const listenCount = progress.completedListening.length

  return (
    <div className="practice-page page-enter">
      <PageHeader
        eyebrow="PRACTICE DOJO · 练习场"
        title="练习场"
        jp="練習場"
        description="把“看懂了”变成“选得对、听得清、读得快”。所有结果都会进入学习报告。"
        actions={
          mode ? (
            <button type="button" className="button button-ghost" onClick={exitQuiz}>
              <ArrowLeft size={16} /> 退出测验
            </button>
          ) : tab === 'quiz' ? (
            <button type="button" className="button button-primary" onClick={() => startQuiz('daily')}>
              <Sparkles size={16} /> 每日小测
            </button>
          ) : (
            <Link to={tab === 'reading' ? '/reading/r01' : '/listening/li01'} className="button button-primary">
              <Play size={16} /> 从第一篇开始
            </Link>
          )
        }
      />

      <div className="practice-stats">
        <div className="practice-stat">
          <span className="practice-stat-icon red"><ListChecks size={18} /></span>
          <div><strong>{quizHistory.length}</strong><span>已完成测验</span></div>
        </div>
        <div className="practice-stat">
          <span className="practice-stat-icon green"><Trophy size={18} /></span>
          <div><strong>{quizAverage}<small>%</small></strong><span>平均正确率</span></div>
        </div>
        <div className="practice-stat">
          <span className="practice-stat-icon gold"><BookOpen size={18} /></span>
          <div><strong>{readCount}<small> / {readingPassages.length}</small></strong><span>阅读篇目</span></div>
        </div>
        <div className="practice-stat">
          <span className="practice-stat-icon blue"><Headphones size={18} /></span>
          <div><strong>{listenCount}<small> / {listeningItems.length}</small></strong><span>听力场景</span></div>
        </div>
      </div>

      <div className="practice-tabs">
        <button type="button" className={tab === 'quiz' ? 'active' : ''} onClick={() => switchTab('quiz')}>
          <ListChecks size={17} /> 测验
        </button>
        <button type="button" className={tab === 'reading' ? 'active' : ''} onClick={() => switchTab('reading')}>
          <BookOpen size={17} /> 阅读 <span>{readingPassages.length}</span>
        </button>
        <button type="button" className={tab === 'listening' ? 'active' : ''} onClick={() => switchTab('listening')}>
          <Headphones size={17} /> 听力 <span>{listeningItems.length}</span>
        </button>
      </div>

      {tab === 'quiz' && mode && <QuizRunner mode={mode} onExit={exitQuiz} />}

      {tab === 'quiz' && !mode && (
        <div className="quiz-center">
          <div className="quiz-center-head">
            <div>
              <p className="eyebrow">CHOOSE A MODE</p>
              <h2>今天想练哪一块？</h2>
            </div>
            <p className="quiz-center-note"><Timer size={15} /> 建议先做每日小测，控制在 8 分钟内。</p>
          </div>
          <div className="quiz-mode-grid">
            {quizModes.map((item) => (
              <article className={`quiz-mode-card tone-${item.tone}`} key={item.id}>
                <div className="quiz-mode-top">
                  <span className="quiz-mode-jp">{item.jp}</span>
                  <span className="quiz-mode-time"><Clock3 size={13} /> {item.minutes} 分</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="quiz-mode-meta">
                  <span>{item.count} 题</span>
                  <span>{item.id === 'mock' ? '综合挑战' : '即时解析'}</span>
                </div>
                <button type="button" className="quiz-mode-start" onClick={() => startQuiz(item.id)}>
                  <Play size={15} /> 开始
                </button>
              </article>
            ))}
          </div>

          {quizHistory.length > 0 && (
            <div className="quiz-history-panel">
              <div className="panel-head compact">
                <div><p className="eyebrow">RECENT RESULTS</p><h2>最近记录</h2></div>
                <BarChart3 size={18} className="panel-icon" />
              </div>
              <div className="quiz-history-list">
                {quizHistory.slice(0, 5).map((record) => {
                  const config = quizModes.find((item) => item.id === record.mode)
                  const rate = Math.round((record.score / record.total) * 100)
                  return (
                    <div className="quiz-history-row" key={record.id}>
                      <div><strong>{config?.title ?? record.mode}</strong><span>{new Date(record.date).toLocaleDateString('zh-CN')}</span></div>
                      <div className="history-score-bar"><span style={{ width: `${rate}%` }} /></div>
                      <strong className={rate >= 75 ? 'good' : ''}>{record.score}/{record.total}</strong>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'reading' && (
        <div className="reading-list">
          <div className="content-tab-head">
            <div><p className="eyebrow">READING · 5 PASSAGES</p><h2>短篇阅读</h2><p>先看题目，再带着问题读。每篇 4–5 分钟。</p></div>
            <div className="content-tab-stat"><span>已完成</span><strong>{readCount} / {readingPassages.length}</strong></div>
          </div>
          <div className="reading-grid">
            {readingPassages.map((passage, index) => {
              const done = progress.readPassages.includes(passage.id)
              return (
                <Link to={`/reading/${passage.id}`} className={`reading-card ${done ? 'done' : ''}`} key={passage.id}>
                  <div className="reading-card-top">
                    <span className="reading-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="reading-genre">{passage.genre}</span>
                    <span className={`level-pill ${passage.level === 'N5' ? 'level-n5' : 'level-n4'}`}>{passage.level}</span>
                    {done && <CheckCircle2 size={16} className="done-mark" />}
                  </div>
                  <h3>{passage.title}</h3>
                  <span className="reading-jp-title">{passage.jpTitle}</span>
                  <p>{passage.intro}</p>
                  <div className="reading-card-foot">
                    <span><Clock3 size={14} /> {passage.minutes} 分钟 · {passage.questions.length} 题</span>
                    <span>{done ? '已读' : '开始阅读'} <ChevronRight size={14} /></span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'listening' && (
        <div className="listening-list">
          <div className="content-tab-head">
            <div><p className="eyebrow">LISTENING · 6 SCENES</p><h2>场景听力</h2><p>先听，再答题，最后看原文。每段都标了抓点提示。</p></div>
            <div className="content-tab-stat"><span>已完成</span><strong>{listenCount} / {listeningItems.length}</strong></div>
          </div>
          <div className="listening-grid">
            {listeningItems.map((item, index) => {
              const done = progress.completedListening.includes(item.id)
              return (
                <Link to={`/listening/${item.id}`} className={`listening-card ${done ? 'done' : ''}`} key={item.id}>
                  <div className="listening-card-icon"><Headphones size={22} /></div>
                  <div className="listening-card-body">
                    <div className="listening-card-meta">
                      <span>{String(index + 1).padStart(2, '0')} · {item.scene}</span>
                      <span className={`level-pill ${item.level === 'N5' ? 'level-n5' : 'level-n4'}`}>{item.level}</span>
                      {done && <CheckCircle2 size={15} className="done-mark" />}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.tip}</p>
                    <div className="listening-card-foot">
                      <span><Clock3 size={14} /> {item.minutes} 分钟 · {item.questions.length} 题</span>
                      <span>{done ? '再听一次' : '去听'} <ChevronRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
