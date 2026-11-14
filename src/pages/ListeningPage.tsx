import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Headphones,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { ProgressRing } from '../components/ProgressRing'
import { listeningItems } from '../data/listening'
import { useJapaneseSpeech } from '../hooks/useJapaneseSpeech'
import { useProgress } from '../store/progress'
import { useToast } from '../components/Toast'

export function ListeningPage() {
  const { itemId } = useParams()
  const item = listeningItems.find((entry) => entry.id === itemId)
  const { progress, recordListening } = useProgress()
  const { showToast } = useToast()
  const { speak, stop, speaking } = useJapaneseSpeech()
  const [slow, setSlow] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const recorded = useRef(false)

  useEffect(() => {
    setAnswers({})
    setSubmitted(false)
    setShowTranscript(false)
    setSlow(false)
    recorded.current = false
    stop()
  }, [itemId, stop])

  if (!item) {
    return (
      <div className="empty-state">
        <span className="empty-glyph">聴</span>
        <h1>没有找到这组听力</h1>
        <Link to="/practice?tab=listening" className="button button-primary">回到听力列表</Link>
      </div>
    )
  }

  const combined = item.lines.map((line) => line.jp).join('。')
  const answeredCount = Object.keys(answers).length
  const score = item.questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0)
  const done = progress.completedListening.includes(item.id)
  const nextItem = listeningItems[listeningItems.findIndex((entry) => entry.id === item.id) + 1]

  const playAll = () => {
    if (speaking) stop()
    else speak(combined, slow ? 0.62 : 0.82)
  }

  const submit = () => {
    if (answeredCount < item.questions.length) return
    setSubmitted(true)
    if (!recorded.current) {
      recorded.current = true
      recordListening(item.id, score, item.questions.length)
      showToast(`听力完成，答对 ${score} / ${item.questions.length} 题`)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="listening-page page-enter">
      <div className="lesson-breadcrumb">
        <Link to="/practice?tab=listening"><ArrowLeft size={15} /> 听力训练</Link>
        <ChevronRight size={14} />
        <span>{item.scene}</span>
        <ChevronRight size={14} />
        <strong>{item.title}</strong>
      </div>

      <header className="listening-hero">
        <div className="listening-hero-wave" aria-hidden="true">
          {Array.from({ length: 42 }).map((_, index) => (
            <i key={index} style={{ height: `${18 + ((index * 17) % 58)}%` }} />
          ))}
        </div>
        <div className="listening-hero-copy">
          <div className="lesson-badges">
            <span className={`level-pill strong level-${item.level.toLowerCase()}`}>{item.level}</span>
            <span className="unit-pill dark-pill">{item.scene}</span>
            {done && <span className="complete-pill light-pill"><CheckCircle2 size={13} /> 已完成</span>}
          </div>
          <p className="eyebrow light">LISTENING · {item.questions.length} QUESTIONS</p>
          <h1>{item.title}</h1>
          <p>{item.tip}</p>
          <div className="lesson-meta-row light-meta">
            <span><Clock3 size={15} /> {item.minutes} 分钟</span>
            <span><Headphones size={15} /> {item.lines.length} 句对话</span>
            <span><Sparkles size={15} /> +20 XP</span>
          </div>
        </div>
        <div className="listening-hero-mark">
          <Headphones size={46} strokeWidth={1.2} />
          <span>聴</span>
        </div>
      </header>

      <div className="listening-layout">
        <main className="listening-main">
          <section className="audio-stage">
            <div className="audio-stage-top">
              <div>
                <p className="eyebrow">LISTEN FIRST</p>
                <h2>先听，不要看原文。</h2>
                <p>第一遍抓场景和数字，第二遍再确认细节。</p>
              </div>
              <div className="audio-controls">
                <button type="button" className={`slow-toggle ${slow ? 'active' : ''}`} onClick={() => setSlow((value) => !value)}>
                  {slow ? '0.7× 慢速' : '1× 常速'}
                </button>
                <button type="button" className="play-all-button" onClick={playAll}>
                  {speaking ? <Pause size={20} /> : <Play size={20} />}
                  <span>{speaking ? '停止播放' : '播放全文'}</span>
                </button>
              </div>
            </div>
            <div className="audio-wave">
              {Array.from({ length: 64 }).map((_, index) => (
                <i
                  key={index}
                  className={speaking ? 'playing' : ''}
                  style={{ height: `${12 + ((index * 13) % 60)}%`, animationDelay: `${index * 35}ms` }}
                />
              ))}
            </div>
            <div className="audio-stage-foot">
              <span><Volume2 size={14} /> 设备需要安装日语语音包；若无声音，请阅读原文。</span>
              <button type="button" className="tool-toggle" onClick={() => setShowTranscript((value) => !value)}>
                {showTranscript ? <EyeOff size={15} /> : <Eye size={15} />}
                {showTranscript ? '隐藏原文' : '显示原文'}
              </button>
            </div>
          </section>

          <section className="transcript-panel">
            <div className="panel-head compact">
              <div><p className="eyebrow">AUDIO SCRIPT</p><h2>逐句精听</h2></div>
              <span className="answered-pill">{item.lines.length} 句</span>
            </div>
            <div className="transcript-lines">
              {item.lines.map((line, index) => (
                <div className={`transcript-line ${showTranscript ? 'open' : ''}`} key={index}>
                  <span className="transcript-speaker">{line.speaker}</span>
                  <div className="transcript-copy">
                    {showTranscript ? (
                      <>
                        <p>{line.jp}</p>
                        <small>{line.kana}</small>
                        <span>{line.zh}</span>
                      </>
                    ) : (
                      <p className="transcript-hidden">点击右侧播放键听这一句 <span>••••••••</span></p>
                    )}
                  </div>
                  <AudioButton text={line.jp} compact />
                  <span className="transcript-index">{String(index + 1).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="reading-questions listening-questions">
            <div className="reading-questions-head">
              <div><p className="eyebrow">QUESTIONS · 听力检查</p><h2>听到了什么？</h2></div>
              <span className="answered-pill">{answeredCount} / {item.questions.length} 已答</span>
            </div>
            {item.questions.map((question, questionIndex) => {
              const selected = answers[questionIndex]
              const isAnswered = selected !== undefined
              return (
                <div className="reading-question" key={questionIndex}>
                  <div className="reading-question-head"><span>Q{questionIndex + 1}</span><h3>{question.question}</h3></div>
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
                      {selected === question.answer ? '答对了。' : '再听一遍对应句。'} {question.explanation}
                    </p>
                  )}
                </div>
              )
            })}

            {!submitted ? (
              <div className="reading-submit">
                <span>{answeredCount === item.questions.length ? '所有题目已作答，可以提交了。' : `还有 ${item.questions.length - answeredCount} 题未作答。`}</span>
                <button type="button" className="button button-primary" disabled={answeredCount < item.questions.length} onClick={submit}>
                  提交答案 <CheckCircle2 size={16} />
                </button>
              </div>
            ) : (
              <div className="reading-result">
                <ProgressRing value={score} max={item.questions.length} size={104} stroke={7} tone={score === item.questions.length ? 'green' : 'red'} label={`${score}/${item.questions.length}`} sublabel="正确" />
                <div>
                  <p className="eyebrow">LISTENING COMPLETE</p>
                  <h2>{score === item.questions.length ? '耳朵已经跟上了。' : '再听一遍，重点抓刚才漏掉的词。'}</h2>
                  <p>听力不是听清每个字，而是抓住场景、数字、方向和转折。把原文朗读一遍，效果会更好。</p>
                  <div className="reading-result-actions">
                    <button type="button" className="button button-ghost" onClick={() => { setSubmitted(false); setAnswers({}); recorded.current = false }}>
                      <RotateCcw size={15} /> 再听一次
                    </button>
                    {nextItem && <Link to={`/listening/${nextItem.id}`} className="button button-primary">下一组：{nextItem.title} <ArrowRight size={15} /></Link>}
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>

        <aside className="listening-aside">
          <article className="listening-tip-card">
            <span className="tip-icon"><Lightbulb size={19} /></span>
            <p className="eyebrow light">LISTENING HACK</p>
            <h2>别翻译，先抓骨架。</h2>
            <p>{item.tip}</p>
            <div className="listening-keywords">
              <span>场景</span>
              <strong>{item.scene}</strong>
            </div>
          </article>
          <article className="panel">
            <p className="eyebrow">听到这些词，先记下来</p>
            <div className="listen-keyword-list">
              {['時間', '数字', '場所', '方向', '依頼'].map((word) => <span key={word}>{word}</span>)}
            </div>
            <div className="aside-divider" />
            <p className="listening-small-note">如果没有日语音色，先在设备设置里安装日语语音包；也可以跟读原文来练节奏。</p>
          </article>
          <Link to="/practice?tab=listening" className="reading-back-link">← 回到听力列表</Link>
        </aside>
      </div>
    </div>
  )
}
