import { useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Languages,
  Layers3,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { buildKanaQuestions } from '../data/quiz'
import { dakutenKana, handakutenKana, kanaNotes, kanaRows, yoonKana } from '../data/kana'
import { kanjiList } from '../data/kanji'
import type { QuizQuestion } from '../data/types'
import { useProgress } from '../store/progress'
import { useToast } from '../components/Toast'

type Script = 'hira' | 'kata'
type Group = 'basic' | 'dakuten' | 'yoon'

function KanaQuiz() {
  const { recordKanaAnswer, addStudyMinutes } = useProgress()
  const { showToast } = useToast()
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildKanaQuestions(10))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [finished, setFinished] = useState(false)
  const completionRecorded = useRef(false)

  const question = questions[index]

  const choose = (option: number) => {
    if (selected !== null) return
    setSelected(option)
    setAnswered((value) => value + 1)
    if (option === question.answer) setScore((value) => value + 1)
    recordKanaAnswer(option === question.answer)
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true)
      if (!completionRecorded.current) {
        completionRecorded.current = true
        addStudyMinutes(2)
      }
      showToast('假名反应训练完成')
      return
    }
    setIndex((value) => value + 1)
    setSelected(null)
  }

  const restart = () => {
    setQuestions(buildKanaQuestions(10))
    setIndex(0)
    setSelected(null)
    setScore(0)
    setAnswered(0)
    setFinished(false)
    completionRecorded.current = false
  }

  if (finished) {
    const rate = Math.round((score / questions.length) * 100)
    return (
      <div className="kana-quiz-result">
        <ProgressRing value={score} max={questions.length} size={130} stroke={9} label={`${rate}%`} sublabel={`${score}/${questions.length}`} />
        <div>
          <p className="eyebrow">KANA CHECK COMPLETE</p>
          <h2>{rate >= 90 ? '已经接近条件反射了。' : rate >= 70 ? '基础不错，再刷一轮更稳。' : '别急，慢一点反而更快。'}</h2>
          <p>{rate >= 90 ? '下一步把速度用在单词和短句上。' : '把出错的假名单独朗读三遍，再做一次。'}</p>
          <div className="kana-quiz-actions">
            <button type="button" className="button button-primary" onClick={restart}><RotateCcw size={16} /> 再测一轮</button>
            <Link to="/vocabulary" className="button button-ghost">去单词卡 <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kana-quiz">
      <div className="kana-quiz-head">
        <div><span className="eyebrow">KANA REACTION</span><h2>假名反应训练</h2></div>
        <span className="quiz-counter">{index + 1} / {questions.length}</span>
      </div>
      <div className="kana-quiz-progress"><span style={{ width: `${(answered / questions.length) * 100}%` }} /></div>
      <div className="kana-quiz-prompt">
        <span className="kana-quiz-row">{question.hint}</span>
        <h3>{question.prompt}</h3>
        <span className="kana-quiz-hint">选一个正确答案</span>
      </div>
      <div className="kana-quiz-options">
        {question.options.map((option, optionIndex) => {
          let state = ''
          if (selected !== null) {
            if (optionIndex === question.answer) state = 'correct'
            else if (optionIndex === selected) state = 'wrong'
          }
          return (
            <button
              type="button"
              key={option}
              className={`kana-quiz-option ${state}`}
              disabled={selected !== null}
              onClick={() => choose(optionIndex)}
            >
              <span>{String.fromCharCode(65 + optionIndex)}</span>
              <strong>{option}</strong>
              {selected !== null && optionIndex === question.answer && <Check size={16} />}
              {selected !== null && optionIndex === selected && optionIndex !== question.answer && <X size={16} />}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <div className={`kana-quiz-explanation ${selected === question.answer ? 'good' : 'bad'}`}>
          <span>{selected === question.answer ? '正解' : '再看一眼'}</span>
          <p>{question.explanation}</p>
          <button type="button" className="button button-primary button-small" onClick={next}>
            {index + 1 >= questions.length ? '查看结果' : '下一题'} <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

export function KanaPage() {
  const { progress } = useProgress()
  const [script, setScript] = useState<Script>('hira')
  const [group, setGroup] = useState<Group>('basic')

  const rows = useMemo(() => {
    if (group === 'basic') return kanaRows
    if (group === 'dakuten') {
      const labels = Array.from(new Set([...dakutenKana, ...handakutenKana].map((kana) => kana.row)))
      return labels.map((row) => ({
        row,
        cells: [...dakutenKana, ...handakutenKana].filter((kana) => kana.row === row),
      }))
    }
    const labels = Array.from(new Set(yoonKana.map((kana) => kana.row)))
    return labels.map((row) => ({ row, cells: yoonKana.filter((kana) => kana.row === row) }))
  }, [group])

  const kanaAnswerCount = Object.values(progress.kanaStats).reduce((sum, item) => sum + item.total, 0)
  const kanaCorrect = Object.values(progress.kanaStats).reduce((sum, item) => sum + item.correct, 0)
  const accuracy = kanaAnswerCount ? Math.round((kanaCorrect / kanaAnswerCount) * 100) : 0

  return (
    <div className="kana-page page-enter">
      <PageHeader
        eyebrow="CHARACTERS · KANA & KANJI"
        title="文字训练"
        jp="かなと漢字"
        description="把假名从“背过”练成“看见就反应”，再逐步接手 N4 核心汉字。"
        actions={
          <Link to="/kanji" className="button button-primary">
            <Languages size={16} /> 打开汉字图鉴
          </Link>
        }
      />

      <div className="kana-stats">
        <div className="kana-stat">
          <span className="kana-stat-glyph">あ</span>
          <div><strong>46</strong><span>基础假名</span></div>
        </div>
        <div className="kana-stat">
          <span className="kana-stat-glyph">が</span>
          <div><strong>25</strong><span>浊音 · 半浊音</span></div>
        </div>
        <div className="kana-stat">
          <span className="kana-stat-glyph">ゃ</span>
          <div><strong>33</strong><span>拗音</span></div>
        </div>
        <div className="kana-stat accuracy-stat">
          <div>
            <strong>{accuracy}<small>%</small></strong>
            <span>训练正确率 · {kanaAnswerCount} 题</span>
          </div>
          <Sparkles size={19} />
        </div>
      </div>

      <div className="kana-layout">
        <section className="panel kana-chart-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">THE SOUND MAP</p>
              <h2>五十音图</h2>
            </div>
            <div className="script-toggle">
              <button type="button" className={script === 'hira' ? 'active' : ''} onClick={() => setScript('hira')}>平假名</button>
              <button type="button" className={script === 'kata' ? 'active' : ''} onClick={() => setScript('kata')}>片假名</button>
            </div>
          </div>
          <div className="group-toggle">
            <button type="button" className={group === 'basic' ? 'active' : ''} onClick={() => setGroup('basic')}>基本 46</button>
            <button type="button" className={group === 'dakuten' ? 'active' : ''} onClick={() => setGroup('dakuten')}>浊音 · 半浊音</button>
            <button type="button" className={group === 'yoon' ? 'active' : ''} onClick={() => setGroup('yoon')}>拗音</button>
          </div>
          <div className={`kana-grid ${group === 'yoon' ? 'yoon' : ''}`}>
            {rows.map((row) => (
              <div className="kana-row" key={row.row}>
                <span className="kana-row-label">{row.row}</span>
                <div className="kana-row-cells">
                  {row.cells.map((cell) => (
                    <button
                      type="button"
                      className="kana-cell"
                      key={cell.hira}
                      onClick={() => {
                        if (!('speechSynthesis' in window)) return
                        const utterance = new SpeechSynthesisUtterance(cell.hira)
                        utterance.lang = 'ja-JP'
                        utterance.rate = 0.72
                        window.speechSynthesis.cancel()
                        window.speechSynthesis.speak(utterance)
                      }}
                      title={`${cell.hira} / ${cell.kata} · ${cell.romaji}`}
                    >
                      <span className="kana-cell-main">{script === 'hira' ? cell.hira : cell.kata}</span>
                      <span className="kana-cell-sub">{script === 'hira' ? cell.kata : cell.hira}</span>
                      <small>{cell.romaji}</small>
                      <Volume2 size={11} className="kana-audio-mark" />
                    </button>
                  ))}
                  {group === 'basic' && row.cells.length < 5 && Array.from({ length: 5 - row.cells.length }).map((_, index) => (
                    <span className="kana-cell ghost" key={`ghost-${index}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="kana-chart-foot">
            <span><Volume2 size={14} /> 点击任意假名听发音</span>
            <span>长音 · 促音 · 拗音，都是拍子的变化</span>
          </div>
        </section>

        <aside className="kana-side">
          <article className="panel kana-notes-panel">
            <div className="panel-head compact">
              <div><p className="eyebrow">PRONUNCIATION NOTES</p><h2>发音小抄</h2></div>
              <BookOpen size={18} className="panel-icon" />
            </div>
            <div className="kana-notes">
              {kanaNotes.map((note, index) => (
                <div className="kana-note" key={note.title}>
                  <span className="note-number">{String(index + 1).padStart(2, '0')}</span>
                  <div><strong>{note.title}</strong><p>{note.body}</p></div>
                </div>
              ))}
            </div>
          </article>

          <article className="kana-kanji-banner">
            <span className="kana-kanji-mark">漢</span>
            <div>
              <p className="eyebrow light">NEXT STEP</p>
              <h3>{kanjiList.length} 个 N4 核心汉字</h3>
              <p>按音读、训读、例词整理，点开就能听。</p>
              <Link to="/kanji" className="text-link light">进入汉字图鉴 <ArrowRight size={14} /></Link>
            </div>
          </article>
        </aside>
      </div>

      <section className="kana-quiz-panel">
        <div className="kana-quiz-intro">
          <p className="eyebrow">10-SECOND WARMUP</p>
          <h2>看见，就能读出来吗？</h2>
          <p>10 道随机题，平假名、片假名、罗马字三种方向混合。全对不代表结束，速度才是目标。</p>
          <div className="kana-quiz-meta">
            <span><Layers3 size={15} /> 10 题随机</span>
            <span><Sparkles size={15} /> 即时反馈</span>
          </div>
        </div>
        <KanaQuiz />
      </section>
    </div>
  )
}
