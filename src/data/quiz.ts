import type { QuizQuestion } from './types'
import { words } from './vocabulary'
import { kanjiList } from './kanji'
import { allKana } from './kana'

export type QuizMode = 'daily' | 'grammar' | 'vocab' | 'kanji' | 'kana' | 'mock'

export const quizModes: {
  id: QuizMode
  title: string
  jp: string
  description: string
  count: number
  minutes: number
  tone: string
}[] = [
  { id: 'daily', title: '每日小测', jp: '毎日のチェック', description: '10 题混合热身，覆盖词汇、语法、汉字与假名。', count: 10, minutes: 5, tone: 'red' },
  { id: 'grammar', title: '语法专项', jp: '文法チェック', description: 'N4 核心句型填空，专治“看得懂但选不对”。', count: 12, minutes: 8, tone: 'green' },
  { id: 'vocab', title: '词汇专项', jp: '単語チェック', description: '高频词义与读音双练，选项来自同主题词。', count: 12, minutes: 6, tone: 'gold' },
  { id: 'kanji', title: '汉字专项', jp: '漢字チェック', description: '看词读音、看字选义，建立字形与词组的联系。', count: 12, minutes: 6, tone: 'blue' },
  { id: 'kana', title: '假名反应', jp: 'かなチェック', description: '平假名、片假名与罗马字快速切换。', count: 12, minutes: 4, tone: 'plum' },
  { id: 'mock', title: 'N4 综合模拟', jp: '模擬試験', description: '20 题限时挑战，检验当前 N4 准备度。', count: 20, minutes: 15, tone: 'ink' },
]

const grammarBank: QuizQuestion[] = [
  {
    id: 'qg001',
    type: 'grammar',
    prompt: '私＿学生です。',
    options: ['は', 'が', 'を', 'で'],
    answer: 0,
    explanation: '介绍自己时用「私は」提示话题。',
  },
  {
    id: 'qg002',
    type: 'grammar',
    prompt: '図書館＿勉強します。',
    options: ['に', 'で', 'を', 'へ'],
    answer: 1,
    explanation: '动作发生的场所用で。',
  },
  {
    id: 'qg003',
    type: 'grammar',
    prompt: '部屋＿猫がいます。',
    options: ['で', 'に', 'を', 'より'],
    answer: 1,
    explanation: '存在句的场所用に：部屋に猫がいます。',
  },
  {
    id: 'qg004',
    type: 'grammar',
    prompt: 'ご飯＿食べます。',
    options: ['を', 'に', 'が', 'で'],
    answer: 0,
    explanation: '食べる的对象用を。',
  },
  {
    id: 'qg005',
    type: 'grammar',
    prompt: 'この映画は面白＿です。',
    options: ['い', 'な', 'の', 'だ'],
    answer: 0,
    explanation: '面白い是い形容词，句末直接接です。',
  },
  {
    id: 'qg006',
    type: 'grammar',
    prompt: 'ここは静か＿公園です。',
    options: ['い', 'な', 'の', 'に'],
    answer: 1,
    explanation: '静か是な形容词，修饰名词加な。',
  },
  {
    id: 'qg007',
    type: 'grammar',
    prompt: '昨日は寒＿です。',
    options: ['い', 'かった', 'くない', 'な'],
    answer: 1,
    explanation: 'い形容词过去肯定去い加かった：寒かったです。',
  },
  {
    id: 'qg008',
    type: 'grammar',
    prompt: '日本語＿話せます。',
    options: ['を', 'が', 'に', 'で'],
    answer: 1,
    explanation: '可能形的对象通常用が。',
  },
  {
    id: 'qg009',
    type: 'grammar',
    prompt: '先生に作文を直して＿。',
    options: ['あげました', 'くれました', 'もらいました', 'しました'],
    answer: 2,
    explanation: '我请老师帮忙、得到帮助，用てもらいました。',
  },
  {
    id: 'qg010',
    type: 'grammar',
    prompt: '友達が本を＿。',
    options: ['あげました', 'くれました', 'もらいました', 'いきました'],
    answer: 1,
    explanation: '朋友给我东西，用くれました。',
  },
  {
    id: 'qg011',
    type: 'grammar',
    prompt: '駅に着い＿、電話してください。',
    options: ['たら', 'と', 'ば', 'なら'],
    answer: 0,
    explanation: '后项是请求，用たら最自然。',
  },
  {
    id: 'qg012',
    type: 'grammar',
    prompt: '春になる＿、桜が咲きます。',
    options: ['たら', 'と', 'なら', 'ので'],
    answer: 1,
    explanation: '自然规律、必然结果用と。',
  },
  {
    id: 'qg013',
    type: 'grammar',
    prompt: 'お金が＿、旅行します。',
    options: ['あると', 'あれば', 'あったら', 'あるなら'],
    answer: 1,
    explanation: 'ば形表示一般假设：あれば。',
  },
  {
    id: 'qg014',
    type: 'grammar',
    prompt: '日本へ行く＿、春がいいですよ。',
    options: ['と', 'ば', 'たら', 'なら'],
    answer: 3,
    explanation: '承接对方话题给建议，用なら。',
  },
  {
    id: 'qg015',
    type: 'grammar',
    prompt: '私は部長に残業＿。',
    options: ['させました', 'させられました', 'されました', 'しました'],
    answer: 1,
    explanation: '被迫做用使役被动：させられました。',
  },
  {
    id: 'qg016',
    type: 'grammar',
    prompt: '先生は学生に作文を＿。',
    options: ['書かれた', '書かせた', '書いた', '書けた'],
    answer: 1,
    explanation: '老师让学生写，用使役形書かせた。',
  },
  {
    id: 'qg017',
    type: 'grammar',
    prompt: '私は先生に＿。',
    options: ['褒めさせました', '褒められました', '褒めました', '褒めさせられました'],
    answer: 1,
    explanation: '我被老师表扬，用被动形褒められました。',
  },
  {
    id: 'qg018',
    type: 'grammar',
    prompt: '明日は雨＿と思います。',
    options: ['だ', 'の', 'な', 'を'],
    answer: 0,
    explanation: '引用名词时保留だ：雨だと思います。',
  },
  {
    id: 'qg019',
    type: 'grammar',
    prompt: '明日は寒い＿です。',
    options: ['そう', 'よう', 'らしい', 'みたい'],
    answer: 0,
    explanation: '传闻「そうです」接普通形：寒いそうです。',
  },
  {
    id: 'qg020',
    type: 'grammar',
    prompt: '彼は来ない＿。',
    options: ['でしょう', 'かもしれません', 'そうです', 'んです'],
    answer: 1,
    explanation: '不确定的“也许”用かもしれません。',
  },
  {
    id: 'qg021',
    type: 'grammar',
    prompt: '忙しい＿、行けません。',
    options: ['のに', 'ので', 'ために', 'ように'],
    answer: 1,
    explanation: '说明原因用ので。',
  },
  {
    id: 'qg022',
    type: 'grammar',
    prompt: '一生懸命勉強した＿、試験に落ちました。',
    options: ['ので', 'のに', 'ために', 'ように'],
    answer: 1,
    explanation: '明明努力却落榜，逆接用のに。',
  },
  {
    id: 'qg023',
    type: 'grammar',
    prompt: '日本へ留学する＿、お金を貯めています。',
    options: ['ために', 'ように', 'のに', 'ので'],
    answer: 0,
    explanation: '意志性目的用ために。',
  },
  {
    id: 'qg024',
    type: 'grammar',
    prompt: '日本語が話せる＿、毎日練習しています。',
    options: ['ために', 'ように', 'のに', 'ので'],
    answer: 1,
    explanation: '能力目标用ように。',
  },
  {
    id: 'qg025',
    type: 'grammar',
    prompt: 'ここで写真を＿ください。',
    options: ['撮らないで', '撮らなくて', '撮らない', '撮らなかった'],
    answer: 0,
    explanation: '请不要做，用ないでください。',
  },
  {
    id: 'qg026',
    type: 'grammar',
    prompt: 'このペンを使っ＿いいですか。',
    options: ['ても', 'ては', 'たら', 'ながら'],
    answer: 0,
    explanation: '许可用てもいいですか。',
  },
  {
    id: 'qg027',
    type: 'grammar',
    prompt: 'ここで写真を撮っ＿いけません。',
    options: ['ても', 'ては', 'たら', 'ので'],
    answer: 1,
    explanation: '禁止用てはいけません。',
  },
  {
    id: 'qg028',
    type: 'grammar',
    prompt: '今、雨が＿。',
    options: ['降ります', '降っています', '降りました', '降りません'],
    answer: 1,
    explanation: '正在下雨用降っています。',
  },
  {
    id: 'qg029',
    type: 'grammar',
    prompt: '音楽を聞き＿勉強します。',
    options: ['ながら', 'てから', 'たり', 'ので'],
    answer: 0,
    explanation: '同时进行用ながら。',
  },
  {
    id: 'qg030',
    type: 'grammar',
    prompt: '宿題をし＿、遊びます。',
    options: ['ながら', 'てから', 'ても', 'のに'],
    answer: 1,
    explanation: '做完作业再玩，用てから。',
  },
  {
    id: 'qg031',
    type: 'grammar',
    prompt: '先生はもう＿か。',
    options: ['食べました', '召し上がりました', 'いただきました', '食べさせました'],
    answer: 1,
    explanation: '对方吃用尊敬语召し上がりました。',
  },
  {
    id: 'qg032',
    type: 'grammar',
    prompt: 'お荷物を＿します。',
    options: ['持ち', 'お持ち', '持って', '持た'],
    answer: 1,
    explanation: '自谦语「お + ます stem + します」：お持ちします。',
  },
  {
    id: 'qg033',
    type: 'grammar',
    prompt: 'この店はあの店＿有名じゃありません。',
    options: ['より', 'ほど', '一番', 'だけ'],
    answer: 1,
    explanation: 'A不如B用「Bほど…ない」。',
  },
  {
    id: 'qg034',
    type: 'grammar',
    prompt: '一年＿夏が一番好きです。',
    options: ['に', 'で', 'を', 'が'],
    answer: 1,
    explanation: '范围用「の中で」：一年で。',
  },
  {
    id: 'qg035',
    type: 'grammar',
    prompt: 'コーヒーを飲み＿話しました。',
    options: ['ながら', 'てから', 'たり', 'ので'],
    answer: 0,
    explanation: '一边喝咖啡一边聊天，用ながら。',
  },
  {
    id: 'qg036',
    type: 'grammar',
    prompt: '寝る＿、歯を磨きます。',
    options: ['前に', 'までに', 'あとで', 'ながら'],
    answer: 0,
    explanation: '睡前：寝る前に。',
  },
  {
    id: 'qg037',
    type: 'grammar',
    prompt: '朝ご飯を食べ＿学校へ行きました。',
    options: ['なくて', 'ないで', 'ない', 'なかった'],
    answer: 1,
    explanation: '没吃早饭就出门，用ないで。',
  },
  {
    id: 'qg038',
    type: 'grammar',
    prompt: '明日は晴れる＿。',
    options: ['でしょう', 'そうです', 'んです', 'ようです'],
    answer: 0,
    explanation: '自己的推测用でしょう。',
  },
  {
    id: 'qg039',
    type: 'grammar',
    prompt: '彼は学生＿と思います。',
    options: ['だ', 'の', 'な', 'と'],
    answer: 0,
    explanation: '引用名词内容时要有だ。',
  },
  {
    id: 'qg040',
    type: 'grammar',
    prompt: 'この店ではカードが＿か。',
    options: ['使います', '使えます', '使いです', '使わせます'],
    answer: 1,
    explanation: '“能用”用可能形使えます。',
  },
]

export const grammarQuizBank = grammarBank

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function uniqueOptions(correct: string, pool: string[]) {
  const distractors = shuffle([...new Set(pool.filter((item) => item !== correct))]).slice(0, 3)
  const options = shuffle([correct, ...distractors])
  return { options, answer: options.indexOf(correct) }
}

function buildVocabQuestions(count: number): QuizQuestion[] {
  return shuffle(words)
    .slice(0, count)
    .map((word, index) => {
      const makeReading = index % 3 === 2
      if (makeReading) {
        const pool = words.filter((item) => item.id !== word.id).map((item) => item.kana)
        const result = uniqueOptions(word.kana, pool)
        return {
          id: `vq-${word.id}`,
          type: 'vocab',
          prompt: `「${word.word}」的读音是？`,
          hint: word.pos,
          options: result.options,
          answer: result.answer,
          explanation: `「${word.word}」读作「${word.kana}」，意思是“${word.meaning}”。`,
        }
      }
      const pool = words.filter((item) => item.id !== word.id).map((item) => item.meaning)
      const result = uniqueOptions(word.meaning, pool)
      return {
        id: `vm-${word.id}`,
        type: 'vocab',
        prompt: `「${word.word}」的意思是？`,
        hint: word.kana,
        options: result.options,
        answer: result.answer,
        explanation: `「${word.word}（${word.kana}）」意思是“${word.meaning}”。`,
      }
    })
}

function buildKanjiQuestions(count: number): QuizQuestion[] {
  return shuffle(kanjiList)
    .slice(0, count)
    .map((kanji, index) => {
      const target = kanji.words[0]
      if (index % 2 === 0) {
        const pool = kanjiList.flatMap((item) => item.words.map((entry) => entry.kana))
        const result = uniqueOptions(target.kana, pool)
        return {
          id: `kr-${kanji.char}`,
          type: 'kanji',
          prompt: `「${target.word}」的读音是？`,
          hint: kanji.char,
          options: result.options,
          answer: result.answer,
          explanation: `「${target.word}」读作「${target.kana}」，意思是“${target.meaning}”。`,
          audioText: target.word,
        }
      }
      const pool = kanjiList.map((item) => item.meaning)
      const result = uniqueOptions(kanji.meaning, pool)
      return {
        id: `km-${kanji.char}`,
        type: 'kanji',
        prompt: `汉字「${kanji.char}」的主要意思是？`,
        hint: `音读：${kanji.on.join('、') || '—'}`,
        options: result.options,
        answer: result.answer,
        explanation: `「${kanji.char}」意为“${kanji.meaning}”，例词「${target.word}（${target.kana}）」。`,
      }
    })
}

export function buildKanaQuestions(count: number): QuizQuestion[] {
  return shuffle(allKana)
    .slice(0, count)
    .map((kana, index) => {
      if (index % 2 === 0) {
        const pool = allKana.map((item) => item.romaji)
        const result = uniqueOptions(kana.romaji, pool)
        return {
          id: `ka-${kana.hira}-${index}`,
          type: 'kana',
          prompt: `「${kana.hira}」的罗马字是？`,
          hint: kana.row,
          options: result.options,
          answer: result.answer,
          explanation: `「${kana.hira}」读作 ${kana.romaji}，片假名是「${kana.kata}」。`,
          audioText: kana.hira,
        }
      }
      const pool = allKana.map((item) => item.hira)
      const result = uniqueOptions(kana.hira, pool)
      return {
        id: `kk-${kana.kata}-${index}`,
        type: 'kana',
        prompt: `片假名「${kana.kata}」对应哪个平假名？`,
        hint: kana.romaji,
        options: result.options,
        answer: result.answer,
        explanation: `「${kana.kata}」对应「${kana.hira}」，读作 ${kana.romaji}。`,
        audioText: kana.hira,
      }
    })
}

export function buildQuiz(mode: QuizMode): QuizQuestion[] {
  const config = quizModes.find((item) => item.id === mode) ?? quizModes[0]
  if (mode === 'grammar') {
    return shuffle(grammarBank).slice(0, config.count)
  }
  if (mode === 'vocab') {
    return buildVocabQuestions(config.count)
  }
  if (mode === 'kanji') {
    return buildKanjiQuestions(config.count)
  }
  if (mode === 'kana') {
    return buildKanaQuestions(config.count)
  }
  if (mode === 'mock') {
    const grammar = shuffle(grammarBank).slice(0, 8)
    const vocab = buildVocabQuestions(5)
    const kanji = buildKanjiQuestions(4)
    const kana = buildKanaQuestions(3)
    return shuffle([...grammar, ...vocab, ...kanji, ...kana])
  }
  const grammar = shuffle(grammarBank).slice(0, 4)
  const vocab = buildVocabQuestions(3)
  const kanji = buildKanjiQuestions(2)
  const kana = buildKanaQuestions(1)
  return shuffle([...grammar, ...vocab, ...kanji, ...kana])
}
