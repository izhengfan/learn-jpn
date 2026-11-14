import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Headphones,
  Languages,
  Lightbulb,
  ListChecks,
  Lock,
  MessageSquare,
  Sparkles,
  Table2,
  Target,
  Volume2,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { ProgressRing } from '../components/ProgressRing'
import { grammarById } from '../data/grammar'
import { lessons, lessonsById, units } from '../data/lessons'
import type { LessonStep } from '../data/types'
import { wordsById } from '../data/vocabulary'
import { useProgress } from '../store/progress'
import { useToast } from '../components/Toast'

const stepMeta: Record<LessonStep['type'], { label: string; icon: typeof BookOpen }> = {
  teach: { label: '讲解', icon: BookOpen },
  table: { label: '规则表', icon: Table2 },
  dialogue: { label: '情景对话', icon: MessageSquare },
  tip: { label: '记忆锦囊', icon: Lightbulb },
  check: { label: '即时检查', icon: CircleHelp },
}

function StepTitle({ step }: { step: LessonStep }) {
  const Icon = stepMeta[step.type].icon
  return (
    <div className="step-heading">
      <span className="step-type"><Icon size={14} /> {stepMeta[step.type].label}</span>
      <h2>{step.title ?? '即时检查'}</h2>
      {'kicker' in step && step.kicker && <p className="step-kicker">{step.kicker}</p>}
    </div>
  )
}

export function LessonPage() {
  const { lessonId } = useParams()
  const lesson = lessonId ? lessonsById[lessonId] : undefined
  const { progress, completeLesson } = useProgress()
  const { showToast } = useToast()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [freshCompletion, setFreshCompletion] = useState(false)

  useEffect(() => {
    setStepIndex(0)
    setAnswers({})
    setFreshCompletion(false)
  }, [lessonId])

  if (!lesson) {
    return (
      <div className="empty-state">
        <span className="empty-glyph">無</span>
        <h1>没有找到这一课</h1>
        <p>它可能已经被移动了。</p>
        <Link to="/courses" className="button button-primary">回到学习路径</Link>
      </div>
    )
  }

  const unit = units.find((item) => item.id === lesson.unitId)
  const vocab = lesson.vocabIds.map((id) => wordsById[id]).filter(Boolean)
  const grammar = lesson.grammarIds.map((id) => grammarById[id]).filter(Boolean)
  const nextLesson = lessons.find((item) => item.number === lesson.number + 1)
  const completed = progress.completedLessons.includes(lesson.id)
  const currentStep = lesson.steps[stepIndex] ?? lesson.steps[lesson.steps.length - 1]
  const finished = stepIndex >= lesson.steps.length
  const progressPercent = finished ? 100 : Math.round((stepIndex / lesson.steps.length) * 100)

  const checkAnswers = useMemo(() => {
    if (!currentStep || currentStep.type !== 'check') return { total: 0, answered: 0 }
    const total = currentStep.questions.length
    const answered = currentStep.questions.filter((_, index) => answers[`${stepIndex}-${index}`] !== undefined).length
    return { total, answered }
  }, [answers, currentStep, stepIndex])

  const nextDisabled = currentStep?.type === 'check' && checkAnswers.answered < checkAnswers.total

  const goNext = () => {
    if (nextDisabled) return
    setStepIndex((index) => Math.min(lesson.steps.length, index + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goPrev = () => {
    setStepIndex((index) => Math.max(0, index - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finishLesson = () => {
    const newlyCompleted = completeLesson(lesson.id, lesson.vocabIds, lesson.xp, lesson.duration)
    setFreshCompletion(newlyCompleted)
    setStepIndex(lesson.steps.length)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast(newlyCompleted ? `+${lesson.xp} XP，单词已加入卡组` : '复习完成，继续保持')
  }

  return (
    <div className="lesson-page page-enter">
      <div className="lesson-breadcrumb">
        <Link to="/courses"><ArrowLeft size={15} /> 学习路径</Link>
        <ChevronRight size={14} />
        <span>{unit?.title}</span>
        <ChevronRight size={14} />
        <strong>第 {String(lesson.number).padStart(2, '0')} 课</strong>
      </div>

      <header className="lesson-hero">
        <div className="lesson-hero-copy">
          <div className="lesson-badges">
            <span className={`level-pill strong level-${lesson.level.toLowerCase()}`}>{lesson.level}</span>
            <span className="unit-pill">UNIT {unit?.code} · {unit?.jpTitle}</span>
            {completed && <span className="complete-pill"><CheckCircle2 size={13} /> 已完成</span>}
          </div>
          <p className="lesson-number">LESSON {String(lesson.number).padStart(2, '0')} / {lessons.length}</p>
          <h1>{lesson.title}</h1>
          <p className="lesson-jp-title">{lesson.jpTitle}</p>
          <p className="lesson-subtitle">{lesson.subtitle}</p>
          <div className="lesson-meta-row">
            <span><Clock3 size={15} /> {lesson.duration} 分钟</span>
            <span><Sparkles size={15} /> +{lesson.xp} XP</span>
            <span><ListChecks size={15} /> {lesson.steps.length} 个学习步骤</span>
          </div>
        </div>
        <div className="lesson-hero-ring">
          <ProgressRing
            value={progressPercent}
            max={100}
            size={128}
            stroke={8}
            tone="red"
            label={`${progressPercent}%`}
            sublabel="本课进度"
          />
          <div className="lesson-objectives">
            <p className="eyebrow">学完你能</p>
            {lesson.objectives.slice(0, 3).map((objective) => (
              <span key={objective}><Check size={13} /> {objective}</span>
            ))}
          </div>
        </div>
      </header>

      {finished ? (
        <section className="lesson-complete">
          <div className="completion-confetti" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => <i key={index} style={{ '--i': index } as CSSProperties} />)}
          </div>
          <div className="completion-seal">済</div>
          <p className="eyebrow">LESSON COMPLETE</p>
          <h1>{freshCompletion ? `第 ${lesson.number} 课，完成。` : '这一课，又走了一遍。'}</h1>
          <p className="completion-lead">
            {freshCompletion
              ? `你已经拿下「${lesson.title}」的 ${lesson.objectives.length} 个目标。接下来用复习和练习把它固定住。`
              : '重复不是浪费，是把知识从“知道”变成“反应”。'}
          </p>
          <div className="completion-stats">
            <div><strong>+{lesson.xp}</strong><span>XP 经验值</span></div>
            <div><strong>{lesson.vocabIds.length}</strong><span>个新词入卡组</span></div>
            <div><strong>{lesson.duration}</strong><span>分钟学习</span></div>
            <div><strong>{lesson.steps.filter((step) => step.type === 'check').reduce((sum, step) => sum + (step.type === 'check' ? step.questions.length : 0), 0)}</strong><span>道即时检查</span></div>
          </div>
          <div className="completion-objectives">
            {lesson.objectives.map((objective) => <span key={objective}><CheckCircle2 size={15} /> {objective}</span>)}
          </div>
          <div className="completion-actions">
            {nextLesson ? (
              <Link to={`/lesson/${nextLesson.id}`} className="button button-primary button-large">
                下一课：{nextLesson.title} <ArrowRight size={17} />
              </Link>
            ) : (
              <Link to="/practice?tab=quiz" className="button button-primary button-large">
                去做 N4 综合模拟 <ArrowRight size={17} />
              </Link>
            )}
            <Link to="/vocabulary?tab=review" className="button button-ghost button-large">
              复习本课单词
            </Link>
            <Link to="/courses" className="text-link">回到学习路径</Link>
          </div>
          <div className="completion-next">
            <p className="eyebrow">带走这一句</p>
            <p className="completion-phrase">
              {grammar[0]?.examples[0]?.jp ?? vocab[0]?.example ?? '継続は力なり。'}
            </p>
            <span>{grammar[0]?.examples[0]?.zh ?? vocab[0]?.exampleMeaning ?? '坚持就是力量。'}</span>
          </div>
        </section>
      ) : (
        <div className="lesson-layout">
          <div className="lesson-main">
            <div className="lesson-progress-bar">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="lesson-step-tabs" aria-label="课节步骤">
              {lesson.steps.map((step, index) => {
                const Icon = stepMeta[step.type].icon
                return (
                  <button
                    type="button"
                    key={`${step.type}-${index}`}
                    className={`step-tab ${index === stepIndex ? 'active' : ''} ${index < stepIndex ? 'passed' : ''}`}
                    onClick={() => {
                      setStepIndex(index)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    title={step.title ?? stepMeta[step.type].label}
                  >
                    <Icon size={15} />
                    <span>{stepMeta[step.type].label}</span>
                  </button>
                )
              })}
            </div>

            <article className={`step-card step-${currentStep.type}`}>
              {currentStep.type === 'teach' && (
                <>
                  <StepTitle step={currentStep} />
                  <p className="teach-body">{currentStep.body}</p>
                  {currentStep.bullets && (
                    <ul className="lesson-bullets">
                      {currentStep.bullets.map((bullet) => <li key={bullet}><span>{bullet}</span></li>)}
                    </ul>
                  )}
                  {currentStep.examples && (
                    <div className="example-list">
                      {currentStep.examples.map((example, index) => (
                        <div className="example-row" key={`${example.jp}-${index}`}>
                          <span className="example-index">{String(index + 1).padStart(2, '0')}</span>
                          <div className="example-content">
                            <p className="example-jp">{example.jp}</p>
                            <p className="example-kana">{example.kana}</p>
                            <p className="example-zh">{example.zh}</p>
                          </div>
                          <AudioButton text={example.jp} compact />
                        </div>
                      ))}
                    </div>
                  )}
                  {currentStep.note && <div className="inline-note"><Lightbulb size={16} /><span>{currentStep.note}</span></div>}
                </>
              )}

              {currentStep.type === 'table' && (
                <>
                  <StepTitle step={currentStep} />
                  <div className="rule-table-wrap">
                    <table className="rule-table">
                      <thead>
                        <tr>{currentStep.headers.map((header) => <th key={header}>{header}</th>)}</tr>
                      </thead>
                      <tbody>
                        {currentStep.rows.map((row, index) => (
                          <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {currentStep.note && <div className="inline-note"><Lightbulb size={16} /><span>{currentStep.note}</span></div>}
                </>
              )}

              {currentStep.type === 'dialogue' && (
                <>
                  <StepTitle step={currentStep} />
                  <p className="dialogue-scene">{currentStep.scene}</p>
                  <div className="dialogue-list">
                    {currentStep.lines.map((line, index) => (
                      <div className="dialogue-line" key={index}>
                        <span className={`speaker speaker-${index % 2 === 0 ? 'a' : 'b'}`}>{line.speaker}</span>
                        <div className="dialogue-bubble">
                          <p>{line.jp}</p>
                          {line.kana && <small>{line.kana}</small>}
                          <span>{line.zh}</span>
                        </div>
                        <AudioButton text={line.jp} compact />
                      </div>
                    ))}
                  </div>
                  {currentStep.note && (
                    <div className="inline-note"><Lightbulb size={16} /><span>{currentStep.note}</span></div>
                  )}
                </>
              )}

              {currentStep.type === 'tip' && (
                <>
                  <StepTitle step={currentStep} />
                  <div className={`tip-block ${currentStep.tone ?? 'red'}`}>
                    <span className="tip-quote">「</span>
                    <p>{currentStep.body}</p>
                  </div>
                </>
              )}

              {currentStep.type === 'check' && (
                <>
                  <StepTitle step={currentStep} />
                  <p className="check-intro">别急着看答案。选完之后，再读一遍解释。</p>
                  <div className="check-list">
                    {currentStep.questions.map((question, questionIndex) => {
                      const key = `${stepIndex}-${questionIndex}`
                      const selected = answers[key]
                      const isAnswered = selected !== undefined
                      return (
                        <div className={`check-question ${isAnswered ? 'answered' : ''}`} key={key}>
                          <div className="check-question-head">
                            <span>Q{questionIndex + 1}</span>
                            <h3>{question.question}</h3>
                          </div>
                          <div className="check-options">
                            {question.options.map((option, optionIndex) => {
                              const isSelected = selected === optionIndex
                              const isCorrect = question.answer === optionIndex
                              let stateClass = ''
                              if (isAnswered && isCorrect) stateClass = 'correct'
                              if (isAnswered && isSelected && !isCorrect) stateClass = 'wrong'
                              return (
                                <button
                                  type="button"
                                  key={`${option}-${optionIndex}`}
                                  className={`check-option ${stateClass}`}
                                  disabled={isAnswered}
                                  onClick={() => setAnswers((prev) => ({ ...prev, [key]: optionIndex }))}
                                >
                                  <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                                  <span>{option}</span>
                                  {isAnswered && isCorrect && <Check size={16} />}
                                  {isAnswered && isSelected && !isCorrect && <X size={16} />}
                                </button>
                              )
                            })}
                          </div>
                          {isAnswered && (
                            <p className={`check-explanation ${selected === question.answer ? 'good' : 'bad'}`}>
                              {selected === question.answer ? '对了。' : '正确答案已标出。'} {question.explanation}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="check-summary">
                    <span>已答 {checkAnswers.answered} / {checkAnswers.total}</span>
                    <div className="mini-progress"><span style={{ width: `${(checkAnswers.answered / Math.max(1, checkAnswers.total)) * 100}%` }} /></div>
                  </div>
                </>
              )}
            </article>

            <div className="lesson-footer">
              <button type="button" className="button button-ghost" onClick={goPrev} disabled={stepIndex === 0}>
                <ArrowLeft size={16} /> 上一步
              </button>
              <span className="lesson-footer-hint">
                {currentStep.type === 'check' && nextDisabled
                  ? `还有 ${checkAnswers.total - checkAnswers.answered} 题未作答`
                  : `${stepIndex + 1} / ${lesson.steps.length}`}
              </span>
              {stepIndex === lesson.steps.length - 1 ? (
                <button type="button" className="button button-primary" onClick={finishLesson} disabled={nextDisabled}>
                  完成本课 <CheckCircle2 size={16} />
                </button>
              ) : (
                <button type="button" className="button button-primary" onClick={goNext} disabled={nextDisabled}>
                  下一步 <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          <aside className="lesson-aside">
            <article className="panel lesson-outline">
              <div className="panel-head compact">
                <div><p className="eyebrow">IN THIS LESSON</p><h2>本课路线</h2></div>
                <span className="outline-count">{stepIndex + 1}/{lesson.steps.length}</span>
              </div>
              <ol>
                {lesson.steps.map((step, index) => {
                  const Icon = stepMeta[step.type].icon
                  return (
                    <li key={`${step.type}-${index}`} className={`${index === stepIndex ? 'current' : ''} ${index < stepIndex ? 'done' : ''}`}>
                      <button type="button" onClick={() => setStepIndex(index)}>
                        <span className="outline-icon">{index < stepIndex ? <Check size={13} /> : <Icon size={14} />}</span>
                        <span>{step.title ?? stepMeta[step.type].label}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </article>

            {grammar.length > 0 && (
              <article className="panel lesson-side-panel">
                <p className="eyebrow">本课语法</p>
                <div className="side-grammar-list">
                  {grammar.map((point) => (
                    <Link to={`/grammar?point=${point.id}`} className="side-grammar-item" key={point.id}>
                      <span className="side-grammar-pattern">{point.pattern}</span>
                      <small>{point.meaning}</small>
                      <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>
              </article>
            )}

            <article className="panel lesson-side-panel">
              <p className="eyebrow">本课词汇 · 完成后自动入卡组</p>
              <div className="side-word-list">
                {vocab.map((word) => (
                  <div className="side-word" key={word.id}>
                    <div><strong>{word.word}</strong><span>{word.kana}</span></div>
                    <small>{word.meaning}</small>
                    <AudioButton text={word.word} compact />
                  </div>
                ))}
              </div>
            </article>

            <div className="lesson-side-tip">
              <Headphones size={17} />
              <p>每个例句都能点小喇叭听发音。先听一遍，再跟读一遍。</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
