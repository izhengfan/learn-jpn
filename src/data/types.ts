export type JLPTLevel = 'N5' | 'N4'

export interface Word {
  id: string
  word: string
  kana: string
  meaning: string
  pos: string
  category: string
  level: JLPTLevel
  example: string
  exampleMeaning: string
  note?: string
}

export interface GrammarExample {
  jp: string
  kana: string
  zh: string
}

export interface GrammarPoint {
  id: string
  title: string
  pattern: string
  level: JLPTLevel
  category: string
  meaning: string
  summary: string
  formation: string[]
  nuance: string
  examples: GrammarExample[]
  caution?: string
  related?: string[]
  lessonId?: string
}

export type LessonStep =
  | {
      type: 'teach'
      title: string
      kicker?: string
      body: string
      bullets?: string[]
      examples?: GrammarExample[]
      note?: string
    }
  | {
      type: 'table'
      title: string
      headers: string[]
      rows: string[][]
      note?: string
    }
  | {
      type: 'dialogue'
      title: string
      scene: string
      lines: { speaker: string; jp: string; kana?: string; zh: string }[]
      note?: string
    }
  | {
      type: 'tip'
      title: string
      body: string
      tone?: 'red' | 'green' | 'gold'
    }
  | {
      type: 'check'
      title?: string
      questions: {
        question: string
        options: string[]
        answer: number
        explanation: string
      }[]
    }

export interface Lesson {
  id: string
  unitId: string
  number: number
  title: string
  jpTitle: string
  subtitle: string
  duration: number
  xp: number
  level: JLPTLevel
  objectives: string[]
  grammarIds: string[]
  vocabIds: string[]
  steps: LessonStep[]
}

export interface Unit {
  id: string
  number: number
  code: string
  title: string
  jpTitle: string
  description: string
  outcome: string
  color: 'red' | 'green' | 'gold' | 'blue' | 'plum' | 'ink'
  weeks: string
}

export interface Kanji {
  char: string
  on: string[]
  kun: string[]
  meaning: string
  words: { word: string; kana: string; meaning: string }[]
  strokes: number
  level: JLPTLevel
  radical: string
}

export interface ReadingPassage {
  id: string
  level: JLPTLevel
  title: string
  jpTitle: string
  genre: string
  minutes: number
  intro: string
  paragraphs: { jp: string; kana: string; zh: string }[]
  vocab: { word: string; kana: string; meaning: string }[]
  questions: {
    question: string
    options: string[]
    answer: number
    explanation: string
  }[]
}

export interface ListeningItem {
  id: string
  title: string
  scene: string
  level: JLPTLevel
  minutes: number
  lines: { speaker: string; jp: string; kana: string; zh: string }[]
  questions: {
    question: string
    options: string[]
    answer: number
    explanation: string
  }[]
  tip: string
}

export interface KanaCell {
  hira: string
  kata: string
  romaji: string
  row: string
  group: 'basic' | 'dakuten' | 'handakuten' | 'yoon'
}

export interface QuizQuestion {
  id: string
  type: 'vocab' | 'grammar' | 'kanji' | 'kana'
  prompt: string
  hint?: string
  options: string[]
  answer: number
  explanation: string
  audioText?: string
}
