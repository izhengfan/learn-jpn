import { useState } from 'react'
import { ArrowRight, Check, Clock3, Sparkles } from 'lucide-react'
import { useProgress } from '../store/progress'
import { kanjiList } from '../data/kanji'
import { JapaneseScene } from './JapaneseScene'

const kanaOptions = [
  { id: 'review', label: '刚学完，想再稳一点', note: '建议从第 1 课开始' },
  { id: 'basic', label: '基本能读，但反应慢', note: '可以边学边补假名' },
  { id: 'katakana', label: '片假名还不太熟', note: '加强外来语与片假名' },
]

export function Onboarding() {
  const { progress, completeOnboarding } = useProgress()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [dailyGoal, setDailyGoal] = useState(25)
  const [kanaLevel, setKanaLevel] = useState('review')

  if (progress.onboarded) return null

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label="开始设置学习路线">
      <div className="onboarding-card">
        <div className="onboarding-art">
          <div className="onboarding-art-top">
            <span className="brand-seal">道</span>
            <span>NIHONGO DOJO · N4</span>
          </div>
          <div className="onboarding-art-copy">
            <p className="eyebrow light">五十音之后，真正的起跑线</p>
            <h1>把“学过一点”<br />变成“真的会用”。</h1>
            <p>为中国学习者设计的 12 周日语路线。少一点语法术语，多一点能说出口的句子。</p>
          </div>
          <div className="onboarding-scene-wrap">
            <JapaneseScene />
          </div>
          <div className="onboarding-stats">
            <div><strong>18</strong><span>核心课节</span></div>
            <div><strong>180</strong><span>高频词</span></div>
            <div><strong>{kanjiList.length}</strong><span>N4 汉字</span></div>
            <div><strong>12</strong><span>周计划</span></div>
          </div>
        </div>

        <div className="onboarding-form-side">
          {step === 0 ? (
            <div className="onboarding-intro">
              <span className="step-kicker">WELCOME · はじめまして</span>
              <h2>从今天开始，<br />每天往前走一点。</h2>
              <p className="onboarding-lead">
                你不需要背完所有单词才开始。我们会根据你的节奏，把 N4 拆成每天 25 分钟能完成的小任务。
              </p>
              <ul className="onboarding-points">
                <li><span><Check size={15} /></span> 18 节互动课，从助词到敬语逐步搭骨架</li>
                <li><span><Check size={15} /></span> 单词卡按记忆曲线自动安排复习</li>
                <li><span><Check size={15} /></span> 阅读、听力、模拟测验形成完整闭环</li>
              </ul>
              <button type="button" className="button button-primary button-large button-block" onClick={() => setStep(1)}>
                定制我的路线 <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="text-button onboarding-skip"
                onClick={() => completeOnboarding({ name: '同学', dailyGoal: 25, kanaLevel: 'review' })}
              >
                先随便看看
              </button>
            </div>
          ) : (
            <div className="onboarding-setup">
              <button type="button" className="text-button back-link" onClick={() => setStep(0)}>
                ← 返回
              </button>
              <span className="step-kicker">SETUP · 三件小事</span>
              <h2>让路线认识你。</h2>
              <p className="onboarding-lead">之后可以在设置里随时修改。</p>

              <label className="field-label onboarding-field">
                怎么称呼你
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="例如：小林"
                  maxLength={12}
                  autoFocus
                />
              </label>

              <div className="onboarding-field">
                <span className="field-label-text">每天能投入多久？</span>
                <div className="goal-options">
                  {[15, 25, 40].map((minute) => (
                    <button
                      type="button"
                      key={minute}
                      className={`goal-option ${dailyGoal === minute ? 'selected' : ''}`}
                      onClick={() => setDailyGoal(minute)}
                    >
                      <Clock3 size={16} />
                      <strong>{minute}</strong>
                      <span>分钟 / 天</span>
                      {minute === 25 && <em>推荐</em>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="onboarding-field">
                <span className="field-label-text">你的五十音现在处于？</span>
                <div className="kana-options">
                  {kanaOptions.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      className={`kana-option ${kanaLevel === option.id ? 'selected' : ''}`}
                      onClick={() => setKanaLevel(option.id)}
                    >
                      <span className="radio-dot" />
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.note}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="button button-primary button-large button-block"
                onClick={() => completeOnboarding({ name, dailyGoal, kanaLevel })}
              >
                <Sparkles size={17} /> 出发，开始第 1 课
              </button>
              <p className="privacy-note">不需要邮箱。进度只保存在当前浏览器。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
