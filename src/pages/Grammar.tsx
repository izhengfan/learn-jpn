import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Filter,
  Lightbulb,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { grammarById, grammarCategories, grammarPoints } from '../data/grammar'
import type { GrammarPoint } from '../data/types'
import { useProgress } from '../store/progress'

function GrammarDetail({
  point,
  onClose,
  onNavigatePoint,
}: {
  point: GrammarPoint | null
  onClose: () => void
  onNavigatePoint: (id: string) => void
}) {
  const { progress, toggleGrammarBookmark, toggleGrammarMastered } = useProgress()
  const { showToast } = useToast()
  if (!point) return null
  const bookmarked = progress.bookmarkedGrammar.includes(point.id)
  const mastered = progress.grammarMastered.includes(point.id)

  return (
    <Modal open={Boolean(point)} onClose={onClose} width="lg" className="grammar-detail-modal">
      <div className="grammar-detail">
        <div className="grammar-detail-head">
          <div className="grammar-detail-tags">
            <span className={`level-pill strong level-${point.level.toLowerCase()}`}>{point.level}</span>
            <span className="grammar-category">{point.category}</span>
            {mastered && <span className="complete-pill"><Check size={12} /> 已掌握</span>}
          </div>
          <div className="grammar-detail-title">
            <h2>{point.pattern}</h2>
            <p>{point.title}</p>
          </div>
          <p className="grammar-detail-meaning">{point.meaning}</p>
          <div className="grammar-detail-actions">
            <button
              type="button"
              className={`button button-small ${mastered ? 'button-success' : 'button-ghost'}`}
              onClick={() => {
                toggleGrammarMastered(point.id)
                showToast(mastered ? '已取消掌握标记' : '已标记为掌握', 'info')
              }}
            >
              <CheckCircle2 size={15} /> {mastered ? '已掌握' : '标记掌握'}
            </button>
            <button
              type="button"
              className={`button button-small button-ghost ${bookmarked ? 'is-bookmarked' : ''}`}
              onClick={() => toggleGrammarBookmark(point.id)}
            >
              {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />} {bookmarked ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>

        <div className="grammar-detail-body">
          <section>
            <p className="eyebrow">核心理解</p>
            <p className="grammar-summary">{point.summary}</p>
          </section>
          <section>
            <p className="eyebrow">接续方式</p>
            <div className="formation-list">
              {point.formation.map((item) => <span key={item}>{item}</span>)}
            </div>
          </section>
          <section>
            <p className="eyebrow">语感与用法</p>
            <p className="grammar-nuance">{point.nuance}</p>
          </section>
          <section>
            <p className="eyebrow">例句 · EXAMPLES</p>
            <div className="grammar-example-list">
              {point.examples.map((example, index) => (
                <div className="grammar-example" key={index}>
                  <div>
                    <p>{example.jp}</p>
                    <small>{example.kana}</small>
                    <span>{example.zh}</span>
                  </div>
                  <AudioButton text={example.jp} compact />
                </div>
              ))}
            </div>
          </section>
          {point.caution && (
            <section className="grammar-caution">
              <CircleAlert size={17} />
              <div><strong>容易踩的坑</strong><p>{point.caution}</p></div>
            </section>
          )}
          {point.related && point.related.length > 0 && (
            <section>
              <p className="eyebrow">相关语法</p>
              <div className="related-grammar">
                {point.related.map((id) => {
                  const related = grammarById[id]
                  if (!related) return null
                  return (
                    <button type="button" key={id} onClick={() => onNavigatePoint(id)}>
                      {related.pattern}
                      <span>{related.meaning}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}
          <div className="grammar-detail-footer">
            <span><Lightbulb size={15} /> 先理解语感，再去练习场用题目检验。</span>
            <Link to="/practice?tab=quiz" className="button button-primary button-small" onClick={onClose}>
              去语法专项练习 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function Grammar() {
  const { progress, toggleGrammarBookmark } = useProgress()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [level, setLevel] = useState('全部')
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)
  const [selected, setSelected] = useState<GrammarPoint | null>(null)

  useEffect(() => {
    const pointId = searchParams.get('point')
    if (pointId && grammarById[pointId]) setSelected(grammarById[pointId])
  }, [searchParams])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return grammarPoints.filter((point) => {
      if (category !== '全部' && point.category !== category) return false
      if (level !== '全部' && point.level !== level) return false
      if (bookmarkedOnly && !progress.bookmarkedGrammar.includes(point.id)) return false
      if (!term) return true
      return (
        point.pattern.toLowerCase().includes(term) ||
        point.title.includes(term) ||
        point.meaning.includes(term) ||
        point.summary.includes(term) ||
        point.examples.some((example) => example.jp.includes(term) || example.zh.includes(term))
      )
    })
  }, [search, category, level, bookmarkedOnly, progress.bookmarkedGrammar])

  const openPoint = (point: GrammarPoint) => {
    setSelected(point)
    setSearchParams({ point: point.id })
  }

  const closePoint = () => {
    setSelected(null)
    setSearchParams({})
  }

  const masteredCount = progress.grammarMastered.length

  return (
    <div className="grammar-page page-enter">
      <PageHeader
        eyebrow="GRAMMAR · 48 PATTERNS"
        title="语法库"
        jp="文法ノート"
        description="按功能查，不按字母查。每个句型都配了接续、语感、例句和最常踩的坑。"
        actions={
          <Link to="/practice?tab=quiz" className="button button-primary">
            <Sparkles size={16} /> 做语法专项
          </Link>
        }
      />

      <section className="grammar-banner">
        <div className="grammar-banner-mark"><Braces size={28} /></div>
        <div className="grammar-banner-copy">
          <p className="eyebrow light">A NOTEBOOK, NOT A DICTIONARY</p>
          <h2>语法不是公式，<br />是说话时的<span>视角</span>。</h2>
          <p>「は」和「が」不是主语和主题的考试标签，而是“我们聊什么”和“到底是谁”的区别。先理解视角，再记接续。</p>
        </div>
        <div className="grammar-banner-stats">
          <div><strong>{grammarPoints.length}</strong><span>核心句型</span></div>
          <div><strong>{masteredCount}</strong><span>已掌握</span></div>
          <div><strong>{progress.bookmarkedGrammar.length}</strong><span>已收藏</span></div>
        </div>
      </section>

      <div className="grammar-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜句型、中文意思或例句…" />
          {search && <button type="button" onClick={() => setSearch('')} aria-label="清空搜索"><X size={15} /></button>}
        </div>
        <div className="grammar-filters">
          <div className="segmented">
            {['全部', 'N5', 'N4'].map((item) => (
              <button type="button" key={item} className={level === item ? 'selected' : ''} onClick={() => setLevel(item)}>{item}</button>
            ))}
          </div>
          <button
            type="button"
            className={`filter-toggle ${bookmarkedOnly ? 'active' : ''}`}
            onClick={() => setBookmarkedOnly((value) => !value)}
          >
            <Bookmark size={15} /> 只看收藏
          </button>
          <span className="result-count">{filtered.length} 个句型</span>
        </div>
      </div>

      <div className="grammar-layout">
        <aside className="grammar-categories">
          <p className="eyebrow">按功能浏览</p>
          <div className="category-list">
            <button type="button" className={category === '全部' ? 'active' : ''} onClick={() => setCategory('全部')}>
              <span>全部语法</span><small>{grammarPoints.length}</small>
            </button>
            {grammarCategories.map((item) => {
              const count = grammarPoints.filter((point) => point.category === item).length
              return (
                <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>
                  <span>{item}</span><small>{count}</small>
                </button>
              )
            })}
          </div>
          <div className="grammar-side-note">
            <Lightbulb size={16} />
            <p>看不懂解释时，先点开例句听一遍。语感常常比术语先到。</p>
          </div>
        </aside>

        <div className="grammar-list">
          {filtered.length === 0 ? (
            <div className="empty-state compact">
              <span className="empty-glyph">文</span>
              <h2>没有匹配的语法</h2>
              <p>换个关键词，或者取消筛选。</p>
              <button type="button" className="button button-ghost" onClick={() => { setSearch(''); setCategory('全部'); setLevel('全部'); setBookmarkedOnly(false) }}>
                重置筛选
              </button>
            </div>
          ) : (
            filtered.map((point) => {
              const bookmarked = progress.bookmarkedGrammar.includes(point.id)
              const mastered = progress.grammarMastered.includes(point.id)
              return (
                <article className="grammar-card" key={point.id} onClick={() => openPoint(point)}>
                  <div className="grammar-card-top">
                    <span className={`level-dot level-${point.level.toLowerCase()}`}>{point.level}</span>
                    <span className="grammar-category">{point.category}</span>
                    {mastered && <span className="grammar-mastered"><Check size={12} /> 已掌握</span>}
                    <button
                      type="button"
                      className={`icon-button small ${bookmarked ? 'active' : ''}`}
                      onClick={(event) => { event.stopPropagation(); toggleGrammarBookmark(point.id) }}
                      aria-label="收藏语法"
                    >
                      {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                    </button>
                  </div>
                  <div className="grammar-card-main">
                    <div>
                      <h3>{point.pattern}</h3>
                      <span className="grammar-card-title">{point.title}</span>
                      <p className="grammar-card-meaning">{point.meaning}</p>
                    </div>
                    <ChevronRight size={19} className="grammar-card-arrow" />
                  </div>
                  <div className="grammar-card-example">
                    <p>{point.examples[0].jp}</p>
                    <span>{point.examples[0].zh}</span>
                  </div>
                  <div className="grammar-card-foot">
                    <span>{point.formation[0]}</span>
                    <span>点击查看完整笔记 <ArrowRight size={12} /></span>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>

      <GrammarDetail
        point={selected}
        onClose={closePoint}
        onNavigatePoint={(id) => {
          if (!grammarById[id]) return
          setSelected(grammarById[id])
          setSearchParams({ point: id })
        }}
      />
    </div>
  )
}
