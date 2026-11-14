import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Layers3,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { useToast } from '../components/Toast'
import type { Word } from '../data/types'
import { vocabCategories, words, wordsById } from '../data/vocabulary'
import { useProgress, type ReviewRating } from '../store/progress'

type Tab = 'library' | 'review'
type CardFilter = '全部' | '未学习' | '学习中' | '待复习'

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function wordStatus(wordId: string, cards: ReturnType<typeof useProgress>['progress']['cards']) {
  const card = cards[wordId]
  if (!card) return { label: '未学习', className: 'new' }
  if (card.due <= Date.now()) return { label: '待复习', className: 'due' }
  if (card.stage >= 3) return { label: '已掌握', className: 'mastered' }
  return { label: '学习中', className: 'learning' }
}

function WordDetail({
  word,
  onClose,
  onStartReview,
}: {
  word: Word | null
  onClose: () => void
  onStartReview: (wordId: string) => void
}) {
  const { progress, ensureCards, toggleWordBookmark } = useProgress()
  const { showToast } = useToast()
  if (!word) return null
  const card = progress.cards[word.id]
  const bookmarked = progress.bookmarkedWords.includes(word.id)
  return (
    <Modal open={Boolean(word)} onClose={onClose} width="md" className="word-detail-modal">
      <div className="word-detail">
        <div className="word-detail-top">
          <span className="word-category-tag">{word.category}</span>
          <span className="level-pill">{word.level}</span>
          <button
            type="button"
            className={`icon-button ${bookmarked ? 'active' : ''}`}
            onClick={() => {
              toggleWordBookmark(word.id)
              showToast(bookmarked ? '已取消收藏' : '已加入收藏', 'info')
            }}
            aria-label="收藏单词"
          >
            {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
        <div className="word-detail-main">
          <span className="word-detail-kana">{word.kana}</span>
          <h2>{word.word}</h2>
          <div className="word-detail-meaning"><span>{word.pos}</span>{word.meaning}</div>
          <AudioButton text={word.word} label="听发音" />
        </div>
        <div className="word-detail-example">
          <p className="eyebrow">例句 · EXAMPLE</p>
          <p className="jp-line">{word.example}</p>
          {word.exampleMeaning && <span>{word.exampleMeaning}</span>}
          <AudioButton text={word.example} compact />
        </div>
        {word.note && <div className="inline-note"><Sparkles size={15} /><span>{word.note}</span></div>}
        <div className="word-detail-status">
          <span>记忆状态</span>
          <strong>{card ? (card.due <= Date.now() ? '到期，适合现在复习' : `已复习 ${card.reps} 次，阶段 ${card.stage + 1}`) : '还没有加入卡组'}</strong>
        </div>
        <div className="word-detail-actions">
          <button
            type="button"
            className="button button-primary button-block"
            onClick={() => {
              ensureCards([word.id])
              showToast(card ? '开始复习这张卡' : '已加入复习卡组')
              onStartReview(word.id)
            }}
          >
            <Brain size={17} /> {card ? '复习这张卡' : '加入我的卡组'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function Vocabulary() {
  const {
    progress,
    dueCount,
    learnedWords,
    ensureCards,
    reviewWord,
    addStudyMinutes,
    toggleWordBookmark,
  } = useProgress()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get('tab') === 'review' ? 'review' : 'library'
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [cardFilter, setCardFilter] = useState<CardFilter>('全部')
  const [detailWord, setDetailWord] = useState<Word | null>(null)

  const [sessionQueue, setSessionQueue] = useState<string[]>([])
  const [sessionIndex, setSessionIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [sessionStats, setSessionStats] = useState<Record<ReviewRating, number>>({ again: 0, hard: 0, good: 0, easy: 0 })
  const [sessionActive, setSessionActive] = useState(false)
  const completeMarked = useRef(false)

  useEffect(() => {
    const wordId = searchParams.get('word')
    if (wordId && wordsById[wordId]) {
      setDetailWord(wordsById[wordId])
    }
  }, [searchParams])

  const newWords = useMemo(() => words.filter((word) => !progress.cards[word.id]), [progress.cards])
  const dueWords = useMemo(
    () => Object.values(progress.cards).filter((card) => card.due <= Date.now()).map((card) => wordsById[card.wordId]).filter(Boolean),
    [progress.cards],
  )

  const filteredWords = useMemo(() => {
    const term = search.trim().toLowerCase()
    return words.filter((word) => {
      if (category !== '全部' && word.category !== category) return false
      const status = wordStatus(word.id, progress.cards)
      if (cardFilter === '未学习' && status.className !== 'new') return false
      if (cardFilter === '学习中' && !['learning', 'due'].includes(status.className)) return false
      if (cardFilter === '待复习' && status.className !== 'due') return false
      if (!term) return true
      return (
        word.word.toLowerCase().includes(term) ||
        word.kana.toLowerCase().includes(term) ||
        word.meaning.toLowerCase().includes(term) ||
        word.category.includes(term)
      )
    })
  }, [search, category, cardFilter, progress.cards])

  const currentWord = sessionQueue[sessionIndex] ? wordsById[sessionQueue[sessionIndex]] : null
  const sessionDone = sessionActive && !currentWord
  const sessionTotal = sessionQueue.length
  const reviewedCount = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy

  const openTab = (nextTab: Tab) => {
    const params: Record<string, string> = { tab: nextTab }
    setSearchParams(params)
  }

  const startSession = (source: 'due' | 'new' | 'all' = 'all', focusWordId?: string) => {
    const dueIds = dueWords.map((word) => word.id)
    const newIds = newWords.map((word) => word.id)
    let ids: string[] = []
    if (focusWordId) ids = [focusWordId]
    else if (source === 'due') ids = dueIds.slice(0, 12)
    else if (source === 'new') ids = newIds.slice(0, 10)
    else {
      ids = [...dueIds.slice(0, 10), ...newIds.slice(0, Math.max(0, 10 - Math.min(10, dueIds.length)))]
    }
    if (ids.length === 0) {
      showToast('今天没有到期卡片，去学新课或做一组测验吧', 'info')
      return
    }
    ensureCards(ids)
    setSessionQueue(ids)
    setSessionIndex(0)
    setRevealed(false)
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 })
    setSessionActive(true)
    completeMarked.current = false
    openTab('review')
  }

  const handleRating = (rating: ReviewRating) => {
    if (!currentWord) return
    reviewWord(currentWord.id, rating)
    addStudyMinutes(0.5)
    setSessionStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }))
    setRevealed(false)
    if (sessionIndex + 1 >= sessionQueue.length) {
      setSessionIndex((index) => index + 1)
      if (!completeMarked.current) {
        completeMarked.current = true
        window.setTimeout(() => showToast('本轮复习完成，记忆已更新'), 250)
      }
    } else {
      setSessionIndex((index) => index + 1)
    }
  }

  useEffect(() => {
    if (!sessionActive || !currentWord) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault()
        setRevealed(true)
      }
      if (revealed && ['1', '2', '3', '4'].includes(event.key)) {
        const ratings: ReviewRating[] = ['again', 'hard', 'good', 'easy']
        handleRating(ratings[Number(event.key) - 1])
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  return (
    <div className="vocabulary-page page-enter">
      <PageHeader
        eyebrow="VOCABULARY · 180 CORE WORDS"
        title="单词卡"
        jp="単語帳"
        description="不是按字母表背单词，而是在记忆曲线的正确时刻遇见它。"
        actions={
          <button type="button" className="button button-primary" onClick={() => startSession('all')}>
            <Brain size={17} /> 开始复习 {dueCount > 0 ? `· ${dueCount}` : ''}
          </button>
        }
      />

      <div className="vocab-stats">
        <div className="vocab-stat-main">
          <ProgressRing value={learnedWords} max={words.length} size={90} stroke={7} label={`${learnedWords}`} sublabel={`/ ${words.length} 词`} />
          <div>
            <p className="eyebrow">YOUR DECK</p>
            <h2>卡组进度</h2>
            <p>课节自动收词，复习让记忆变牢。</p>
          </div>
        </div>
        <div className="vocab-stat-cell">
          <span className="vocab-stat-icon red"><Clock3 size={18} /></span>
          <div><strong>{dueCount}</strong><span>今日到期</span></div>
        </div>
        <div className="vocab-stat-cell">
          <span className="vocab-stat-icon green"><Check size={18} /></span>
          <div><strong>{Object.values(progress.cards).filter((card) => card.stage >= 3).length}</strong><span>已进入长期记忆</span></div>
        </div>
        <div className="vocab-stat-cell">
          <span className="vocab-stat-icon gold"><Bookmark size={18} /></span>
          <div><strong>{progress.bookmarkedWords.length}</strong><span>收藏单词</span></div>
        </div>
      </div>

      <div className="vocab-tabs">
        <button type="button" className={tab === 'library' ? 'active' : ''} onClick={() => openTab('library')}>
          <Layers3 size={17} /> 词库浏览
        </button>
        <button type="button" className={tab === 'review' ? 'active' : ''} onClick={() => openTab('review')}>
          <Brain size={17} /> 记忆卡 {dueCount > 0 && <span className="tab-count">{dueCount}</span>}
        </button>
        <div className="vocab-tabs-note">
          {tab === 'library' ? '点击任意词卡查看例句和记忆状态' : '空格翻面，数字键 1–4 评分'}
        </div>
      </div>

      {tab === 'library' ? (
        <>
          <div className="library-toolbar">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜日语、假名或中文意思…"
              />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="清空搜索"><X size={15} /></button>}
            </div>
            <div className="library-filter">
              <select value={cardFilter} onChange={(event) => setCardFilter(event.target.value as CardFilter)} aria-label="按学习状态筛选">
                {(['全部', '未学习', '学习中', '待复习'] as CardFilter[]).map((item) => <option key={item}>{item}</option>)}
              </select>
              <span className="result-count">{filteredWords.length} 个词</span>
            </div>
          </div>

          <div className="category-rail">
            <button type="button" className={category === '全部' ? 'active' : ''} onClick={() => setCategory('全部')}>
              全部 <small>{words.length}</small>
            </button>
            {vocabCategories.map((item) => (
              <button type="button" key={item.name} className={category === item.name ? 'active' : ''} onClick={() => setCategory(item.name)}>
                {item.name} <small>{words.filter((word) => word.category === item.name).length}</small>
              </button>
            ))}
          </div>

          {filteredWords.length === 0 ? (
            <div className="empty-state compact">
              <span className="empty-glyph">探</span>
              <h2>没有找到这个词</h2>
              <p>试试换一个关键词或清空筛选。</p>
              <button type="button" className="button button-ghost" onClick={() => { setSearch(''); setCategory('全部'); setCardFilter('全部') }}>
                重置筛选
              </button>
            </div>
          ) : (
            <div className="word-grid">
              {filteredWords.map((word) => {
                const status = wordStatus(word.id, progress.cards)
                const bookmarked = progress.bookmarkedWords.includes(word.id)
                return (
                  <article className="word-card" key={word.id} onClick={() => setDetailWord(word)}>
                    <div className="word-card-top">
                      <span className={`word-status ${status.className}`}>{status.label}</span>
                      <button
                        type="button"
                        className={`icon-button small ${bookmarked ? 'active' : ''}`}
                        aria-label="收藏"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleWordBookmark(word.id)
                        }}
                      >
                        {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                    <div className="word-card-main">
                      <span className="word-card-kana">{word.kana}</span>
                      <h3>{word.word}</h3>
                      <p>{word.meaning}</p>
                    </div>
                    <div className="word-card-example">
                      <p>{word.example}</p>
                      <span>{word.exampleMeaning}</span>
                    </div>
                    <div className="word-card-foot">
                      <span>{word.pos}</span>
                      <span className="word-level">{word.level}</span>
                      <AudioButton text={word.word} compact />
                      <span className="word-open">打开 <ChevronRight size={13} /></span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <div className="review-area">
          {!sessionActive ? (
            <div className="review-start">
              <div className="review-start-copy">
                <p className="eyebrow">SPACED REPETITION</p>
                <h2>今天该复习的，<br /><em>一张也不会漏。</em></h2>
                <p>
                  我们把记忆分成「新词 → 1 天 → 3 天 → 7 天 → 14 天」几个节点。答得越稳，间隔越长；忘记也没关系，它会在 10 分钟后再出现。
                </p>
                <div className="review-start-stats">
                  <div><strong>{dueWords.length}</strong><span>到期卡片</span></div>
                  <div><strong>{newWords.length}</strong><span>未学新词</span></div>
                  <div><strong>{learnedWords}</strong><span>卡组总数</span></div>
                </div>
                <div className="review-start-actions">
                  <button type="button" className="button button-primary button-large" onClick={() => startSession('all')}>
                    开始今日复习 <ArrowRight size={17} />
                  </button>
                  <button type="button" className="button button-ghost" onClick={() => startSession('new')} disabled={newWords.length === 0}>
                    只学 10 个新词
                  </button>
                </div>
              </div>
              <div className="review-card-preview" aria-hidden="true">
                <div className="preview-card back" />
                <div className="preview-card middle" />
                <div className="preview-card front">
                  <span>覚</span>
                  <p>おぼえる</p>
                  <small>记住</small>
                </div>
              </div>
            </div>
          ) : sessionDone ? (
            <div className="review-summary">
              <div className="completion-seal small">済</div>
              <p className="eyebrow">SESSION COMPLETE</p>
              <h2>这一轮，记住了 {sessionStats.good + sessionStats.easy} 张。</h2>
              <p>记忆不是一次完成，而是每次都比上次更熟一点。</p>
              <div className="review-summary-stats">
                <div><strong>{sessionStats.again}</strong><span>需要重来</span></div>
                <div><strong>{sessionStats.hard}</strong><span>有点难</span></div>
                <div><strong>{sessionStats.good}</strong><span>记住了</span></div>
                <div><strong>{sessionStats.easy}</strong><span>很熟练</span></div>
              </div>
              <div className="review-summary-actions">
                <button type="button" className="button button-primary" onClick={() => { setSessionActive(false); startSession('all') }}>
                  <RotateCcw size={16} /> 再来一轮
                </button>
                <button type="button" className="button button-ghost" onClick={() => { setSessionActive(false); openTab('library') }}>
                  回到词库
                </button>
              </div>
            </div>
          ) : currentWord ? (
            <div className="flashcard-session">
              <div className="session-head">
                <button type="button" className="text-button" onClick={() => setSessionActive(false)}>
                  <ChevronLeft size={15} /> 退出本轮
                </button>
                <div className="session-progress">
                  <span>{Math.min(sessionIndex + 1, sessionTotal)} / {sessionTotal}</span>
                  <div className="mini-progress"><span style={{ width: `${((sessionIndex) / sessionTotal) * 100}%` }} /></div>
                </div>
                <span className="session-reviewed">已复习 {reviewedCount}</span>
              </div>

              <div className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(true)}>
                <div className="flashcard-meta">
                  <span>{currentWord.category}</span>
                  <span>{currentWord.level} · {currentWord.pos}</span>
                </div>
                <div className="flashcard-front">
                  <span className="flashcard-kana">{currentWord.kana}</span>
                  <h2>{currentWord.word}</h2>
                  {!revealed && <p className="flashcard-hint">点击卡片，查看意思</p>}
                </div>
                {revealed && (
                  <div className="flashcard-back">
                    <div className="flashcard-meaning">{currentWord.meaning}</div>
                    <div className="flashcard-example">
                      <p>{currentWord.example}</p>
                      <span>{currentWord.exampleMeaning}</span>
                    </div>
                    <AudioButton text={currentWord.example} label="听例句" />
                  </div>
                )}
                <div className="flashcard-actions">
                  <AudioButton text={currentWord.word} compact />
                  {!revealed ? (
                    <button type="button" className="button button-primary" onClick={(event) => { event.stopPropagation(); setRevealed(true) }}>
                      显示答案
                    </button>
                  ) : (
                    <span className="keyboard-hint">按 1–4 评分</span>
                  )}
                </div>
              </div>

              {revealed ? (
                <div className="rating-buttons">
                  <button type="button" className="rating again" onClick={() => handleRating('again')}>
                    <span>忘记了</span><small>10 分钟后再来</small><em>1</em>
                  </button>
                  <button type="button" className="rating hard" onClick={() => handleRating('hard')}>
                    <span>有点难</span><small>明天再见</small><em>2</em>
                  </button>
                  <button type="button" className="rating good" onClick={() => handleRating('good')}>
                    <span>记住了</span><small>3 天后复习</small><em>3</em>
                  </button>
                  <button type="button" className="rating easy" onClick={() => handleRating('easy')}>
                    <span>很熟练</span><small>7 天后复习</small><em>4</em>
                  </button>
                </div>
              ) : (
                <div className="flashcard-before">
                  <CircleHelp size={16} /> 先在心里回忆意思，再看答案。回忆本身就是在加固记忆。
                </div>
              )}
              <button type="button" className="text-button flashcard-quit" onClick={() => setSessionActive(false)}>暂停本轮</button>
            </div>
          ) : null}
        </div>
      )}

      <WordDetail
        word={detailWord}
        onClose={() => {
          setDetailWord(null)
          const next = new URLSearchParams(searchParams)
          next.delete('word')
          setSearchParams(next)
        }}
        onStartReview={(wordId) => {
          setDetailWord(null)
          startSession('all', wordId)
        }}
      />
    </div>
  )
}
