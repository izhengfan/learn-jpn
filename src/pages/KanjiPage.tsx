import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Languages,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { kanjiList } from '../data/kanji'
import type { Kanji } from '../data/types'
import { useProgress } from '../store/progress'

function KanjiDetail({ kanji, onClose }: { kanji: Kanji | null; onClose: () => void }) {
  const { progress, toggleKanjiMastered } = useProgress()
  if (!kanji) return null
  const mastered = progress.kanjiMastered.includes(kanji.char)
  return (
    <Modal open={Boolean(kanji)} onClose={onClose} width="md" className="kanji-detail-modal">
      <div className="kanji-detail">
        <div className="kanji-detail-hero">
          <div className="kanji-detail-char">{kanji.char}</div>
          <div className="kanji-detail-head">
            <div className="kanji-detail-tags">
              <span className={`level-pill strong level-${kanji.level.toLowerCase()}`}>{kanji.level}</span>
              <span className="kanji-radical">部首 · {kanji.radical}</span>
              <span className="kanji-strokes">{kanji.strokes} 画</span>
            </div>
            <h2>{kanji.meaning}</h2>
            <button
              type="button"
              className={`button button-small ${mastered ? 'button-success' : 'button-ghost'}`}
              onClick={() => toggleKanjiMastered(kanji.char)}
            >
              <CheckCircle2 size={15} /> {mastered ? '已掌握' : '标记掌握'}
            </button>
          </div>
        </div>

        <div className="kanji-readings">
          <div>
            <p className="eyebrow">音读 · ON</p>
            <div className="reading-chips">
              {kanji.on.length ? kanji.on.map((reading) => <span key={reading}>{reading}</span>) : <em>常用音读暂无</em>}
            </div>
          </div>
          <div>
            <p className="eyebrow">训读 · KUN</p>
            <div className="reading-chips kun">
              {kanji.kun.length ? kanji.kun.map((reading) => <span key={reading}>{reading}</span>) : <em>常用训读暂无</em>}
            </div>
          </div>
        </div>

        <div className="kanji-words">
          <p className="eyebrow">放进词里记 · WORDS</p>
          {kanji.words.map((word) => (
            <div className="kanji-word-row" key={word.word}>
              <div>
                <strong>{word.word}</strong>
                <span>{word.kana}</span>
              </div>
              <p>{word.meaning}</p>
              <AudioButton text={word.word} compact />
            </div>
          ))}
        </div>
        <div className="inline-note">
          <CircleHelp size={15} />
          <span>汉字不要孤立背。先记住一个词，再从词里抽出读音，效率会高很多。</span>
        </div>
      </div>
    </Modal>
  )
}

export function KanjiPage() {
  const { progress } = useProgress()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('全部')
  const [masteredOnly, setMasteredOnly] = useState(false)
  const [selected, setSelected] = useState<Kanji | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return kanjiList.filter((kanji) => {
      if (level !== '全部' && kanji.level !== level) return false
      if (masteredOnly && !progress.kanjiMastered.includes(kanji.char)) return false
      if (!term) return true
      return (
        kanji.char.includes(term) ||
        kanji.meaning.toLowerCase().includes(term) ||
        kanji.on.some((reading) => reading.toLowerCase().includes(term)) ||
        kanji.kun.some((reading) => reading.toLowerCase().includes(term)) ||
        kanji.words.some((word) => word.word.includes(term) || word.kana.includes(term) || word.meaning.includes(term))
      )
    })
  }, [search, level, masteredOnly, progress.kanjiMastered])

  const masteredCount = progress.kanjiMastered.length
  const n5Count = kanjiList.filter((kanji) => kanji.level === 'N5').length

  return (
    <div className="kanji-page page-enter">
      <PageHeader
        eyebrow={`KANJI · ${kanjiList.length} ESSENTIALS`}
        title="汉字图鉴"
        jp="漢字図鑑"
        description="中国人学日语的红利在这里，陷阱也在这里。按词记音，比按字背音更可靠。"
        actions={
          <Link to="/practice?tab=quiz&mode=kanji" className="button button-primary">
            <Sparkles size={16} /> 汉字专项测验
          </Link>
        }
      />

      <section className="kanji-banner">
        <div className="kanji-banner-char">漢</div>
        <div className="kanji-banner-copy">
          <p className="eyebrow light">FROM SHAPE TO SOUND</p>
          <h2>看得懂字形，<br />不代表读得出声音。</h2>
          <p>N4 阶段最重要的不是写对所有笔画，而是看到常用词能反应出读音。{kanjiList.length} 个核心字，每个都带例词和音频。</p>
          <div className="kanji-banner-points">
            <span><Check size={14} /> 音读 / 训读分开记</span>
            <span><Check size={14} /> 每个字至少一个常用词</span>
            <span><Check size={14} /> 点击即听</span>
          </div>
        </div>
        <div className="kanji-banner-stats">
          <ProgressRing value={masteredCount} max={kanjiList.length} size={116} stroke={8} tone="gold" label={`${masteredCount}`} sublabel="已掌握" />
          <div className="kanji-banner-counts">
            <span>N5 <strong>{n5Count}</strong></span>
            <span>N4 <strong>{kanjiList.length - n5Count}</strong></span>
            <span>总计 <strong>{kanjiList.length}</strong></span>
          </div>
        </div>
      </section>

      <div className="kanji-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜汉字、读音、意思或例词…" />
          {search && <button type="button" onClick={() => setSearch('')} aria-label="清空搜索"><X size={15} /></button>}
        </div>
        <div className="kanji-filters">
          <div className="segmented">
            {['全部', 'N5', 'N4'].map((item) => (
              <button type="button" key={item} className={level === item ? 'selected' : ''} onClick={() => setLevel(item)}>{item}</button>
            ))}
          </div>
          <button type="button" className={`filter-toggle ${masteredOnly ? 'active' : ''}`} onClick={() => setMasteredOnly((value) => !value)}>
            <CheckCircle2 size={15} /> 只看已掌握
          </button>
          <span className="result-count">{filtered.length} 个汉字</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state compact">
          <span className="empty-glyph">字</span>
          <h2>没有找到这个字</h2>
          <p>试试换一个关键词。</p>
          <button type="button" className="button button-ghost" onClick={() => { setSearch(''); setLevel('全部'); setMasteredOnly(false) }}>重置筛选</button>
        </div>
      ) : (
        <div className="kanji-grid">
          {filtered.map((kanji) => {
            const mastered = progress.kanjiMastered.includes(kanji.char)
            return (
              <button type="button" className={`kanji-tile ${mastered ? 'mastered' : ''}`} key={kanji.char} onClick={() => setSelected(kanji)}>
                <span className="kanji-tile-char">{kanji.char}</span>
                <span className="kanji-tile-meaning">{kanji.meaning}</span>
                <span className="kanji-tile-reading">{kanji.on[0] || kanji.kun[0] || '—'}</span>
                <span className="kanji-tile-level">{kanji.level}</span>
                {mastered && <CheckCircle2 size={15} className="kanji-tile-check" />}
              </button>
            )
          })}
        </div>
      )}

      <div className="kanji-footer-note">
        <Languages size={18} />
        <div>
          <strong>下一步：从“认识字”到“读得快”</strong>
          <p>去练习场做汉字专项，限时 6 分钟。速度比一次全对更重要。</p>
        </div>
        <Link to="/practice?tab=quiz&mode=kanji" className="button button-ghost button-small">去练习 <ChevronRight size={14} /></Link>
      </div>

      <KanjiDetail kanji={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
