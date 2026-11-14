import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Languages,
  Lightbulb,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { ProgressRing } from '../components/ProgressRing'
import { readingPassages } from '../data/reading'
import { useProgress } from '../store/progress'
import { useToast } from '../components/Toast'

export function ReadingPage() {
  const { passageId } = useParams()
  const passage = readingPassages.find((item) => item.id === passageId)
  const { progress, recordReading } = useProgress()
  const { showToast } = useToast()
  const [showKana, setShowKana] = useState(true)
  const [showZh, setShowZh] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const recorded = useRef(false)

  useEffect(() => {
    setAnswers({})
    setSubmitted(false)
    setShowKana(true)
    setShowZh(false)
    recorded.current = false
  }, [passageId])

  if (!passage) {
    return (
      <div className="empty-state">
        <span className="empty-glyph">読</span>
        <h1>没有找到这篇阅读</h1>
        <Link to="/practice?tab=reading" className="button button-primary">回到阅读列表</Link>
      </div>
    )
  }

  const score = useMemo(
    () => passage.questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0),
    [answers, passage.questions],
  )
  const answeredCount = Object.keys(answers).length
  const nextPassage = readingPassages[readingPassages.findIndex((item) => item.id === passage.id) + 1]
  const done = progress.readPassages.includes(passage.id)

  const submit = () => {
    if (answeredCount < passage.questions.length) return
    setSubmitted(true)
    if (!recorded.current) {
      recorded.current = true
      recordReading(passage.id, score, passage.questions.length)
      showToast(`阅读完成，答对 ${score} / ${passage.questions.length} 题`)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="reading-page page-enter">
      <div className="lesson-breadcrumb">
        <Link to="/practice?tab=reading"><ArrowLeft size={15} /> 阅读训练</Link>
        <ChevronRight size={14} />
        <span>{passage.genre}</span>
        <ChevronRight size={14} />
        <strong>{passage.title}</strong>
      </div>

      <header className="reading-hero">
        <div>
          <div className="lesson-badges">
            <span className={`level-pill strong level-${passage.level.toLowerCase()}`}>{passage.level}</span>
            <span className="unit-pill">{passage.genre}</span>
            {done && <span className="complete-pill"><CheckCircle2 size={13} /> 已读</span>}
          </div>
          <p className="eyebrow">READING · {passage.questions.length} QUESTIONS</p>
          <h1>{passage.title}</h1>
          <p className="reading-hero-jp">{passage.jpTitle}</p>
          <p className="reading-hero-intro">{passage.intro}</p>
          <div className="lesson-meta-row">
            <span><Clock3 size={15} /> {passage.minutes} 分钟</span>
            <span><BookOpen size={15} /> {passage.paragraphs.length} 段</span>
            <span><Sparkles size={15} /> +20 XP</span>
          </div>
        </div>
        <div className="reading-hero-seal">
          <span>読</span>
          <small>READ<br />CAREFULLY</small>
        </div>
      </header>

      <div className="reading-layout">
        <main className="reading-main">
          <div className="reading-toolbar">
            <div>
              <button type="button" className={`tool-toggle ${showKana ? 'active' : ''}`} onClick={() => setShowKana((value) => !value)}>
                {showKana ? <EyeOff size={15} /> : <Eye size={15} />} {showKana ? '隐藏假名' : '显示假名'}
              </button>
              <button type="button" className={`tool-toggle ${showZh ? 'active' : ''}`} onClick={() => setShowZh((value) => !value)}>
                <Languages size={15} /> {showZh ? '隐藏翻译' : '显示翻译'}
              </button>
            </div>
            <AudioButton text={passage.paragraphs.map((paragraph) => paragraph.jp).join('。')} label="通读全文" />
          </div>

          <article className="reading-article">
            <div className="reading-article-head">
              <span className="reading-vertical-title">{passage.jpTitle}</span>
              <div>
                <p className="eyebrow">本文</p>
                <h2>{passage.title}</h2>
              </div>
            </div>
            {passage.paragraphs.map((paragraph, index) => (
              <div className="passage-paragraph" key={index}>
                <span className="paragraph-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="passage-jp">{paragraph.jp}</p>
                  {showKana && <p className="passage-kana">{paragraph.kana}</p>}
                  {showZh && <p className="passage-zh">{paragraph.zh}</p>}
                </div>
                <AudioButton text={paragraph.jp} compact />
              </div>
            ))}
          </article>

          <section className="reading-questions">
            <div className="reading-questions-head">
              <div>
                <p className="eyebrow">QUESTIONS · 理解检查</p>
                <h2>读完了，试试看</h2>
              </div>
              <span className="answered-pill">{answeredCount} / {passage.questions.length} 已答</span>
            </div>
            {passage.questions.map((question, questionIndex) => {
              const selected = answers[questionIndex]
              const isAnswered = selected !== undefined
              return (
                <div className="reading-question" key={questionIndex}>
                  <div className="reading-question-head">
                    <span>Q{questionIndex + 1}</span>
                    <h3>{question.question}</h3>
                  </div>
                  <div className="reading-options">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selected === optionIndex
                      const isCorrect = question.answer === optionIndex
                      let state = ''
                      if (submitted && isCorrect) state = 'correct'
                      else if (isAnswered && isSelected && !isCorrect) state = 'wrong'
                      else if (isAnswered && isSelected) state = 'selected'
                      return (
                        <button
                          type="button"
                          key={option}
                          className={`reading-option ${state}`}
                          disabled={isAnswered}
                          onClick={() => setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))}
                        >
                          <span>{String.fromCharCode(65 + optionIndex)}</span>
                          {option}
                          {submitted && isCorrect && <Check size={15} />}
                          {submitted && isSelected && !isCorrect && <X size={15} />}
                        </button>
                      )
                    })}
                  </div>
                  {submitted && (
                    <p className={`reading-explanation ${selected === question.answer ? 'good' : 'bad'}`}>
                      {selected === question.answer ? '答对了。' : '再看一下原文对应句。'} {question.explanation}
                    </p>
                  )}
                </div>
              )
            })}

            {!submitted ? (
              <div className="reading-submit">
                <span>{answeredCount === passage.questions.length ? '所有题目已作答，可以提交了。' : `还有 ${passage.questions.length - answeredCount} 题未作答。`}</span>
                <button type="button" className="button button-primary" disabled={answeredCount < passage.questions.length} onClick={submit}>
                  提交答案 <CheckCircle2 size={16} />
                </button>
              </div>
            ) : (
              <div className="reading-result">
                <ProgressRing value={score} max={passage.questions.length} size={104} stroke={7} tone={score === passage.questions.length ? 'green' : 'red'} label={`${score}/${passage.questions.length}`} sublabel="正确" />
                <div>
                  <p className="eyebrow">READING COMPLETE</p>
                  <h2>{score === passage.questions.length ? '完全读懂，漂亮。' : score >= passage.questions.length - 1 ? '只差一点，回原文定位。' : '先把每段的主题句画出来。'}</h2>
                  <p>每道错题都回到原文找依据。N4 阅读考的不是翻译速度，而是定位和逻辑。</p>
                  <div className="reading-result-actions">
                    <button type="button" className="button button-ghost" onClick={() => { setSubmitted(false); setAnswers({}); recorded.current = false }}>
                      <RotateCcw size={15} /> 再做一次
                    </button>
                    {nextPassage && <Link to={`/reading/${nextPassage.id}`} className="button button-primary">下一篇：{nextPassage.title} <ArrowRight size={15} /></Link>}
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>

        <aside className="reading-aside">
          <article className="panel">
            <div className="panel-head compact">
              <div><p className="eyebrow">KEY WORDS</p><h2>本篇生词</h2></div>
              <BookOpen size={18} className="panel-icon" />
            </div>
            <div className="passage-vocab">
              {passage.vocab.map((word) => (
                <div className="passage-vocab-row" key={word.word}>
                  <div><strong>{word.word}</strong><span>{word.kana}</span></div>
                  <p>{word.meaning}</p>
                  <AudioButton text={word.word} compact />
                </div>
              ))}
            </div>
          </article>
          <div className="reading-tip">
            <Lightbulb size={17} />
            <div><strong>阅读策略</strong><p>先读题干，圈出“谁、何时、为什么”。遇到生词不要停，靠前后句猜大意。</p></div>
          </div>
          <Link to="/practice?tab=reading" className="reading-back-link">← 回到阅读列表</Link>
        </aside>
      </div>
    </div>
  )
}
