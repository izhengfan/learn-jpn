import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { QuizMode } from '../data/quiz'

export interface CardState {
  wordId: string
  stage: number
  due: number
  reps: number
  lapses: number
  lastReviewed: number
  learned: boolean
}

export interface QuizRecord {
  id: string
  mode: QuizMode
  score: number
  total: number
  date: number
  duration: number
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

interface ProgressState {
  version: 1
  name: string
  dailyGoal: number
  onboarded: boolean
  startedAt: number | null
  xp: number
  streak: number
  lastStudyDate: string | null
  daysStudied: string[]
  activity: Record<string, number>
  completedLessons: string[]
  lessonCompletions: Record<string, string>
  lastLessonId: string | null
  cards: Record<string, CardState>
  bookmarkedWords: string[]
  bookmarkedGrammar: string[]
  grammarMastered: string[]
  kanjiMastered: string[]
  readPassages: string[]
  completedListening: string[]
  quizHistory: QuizRecord[]
  kanaStats: Record<string, { correct: number; total: number }>
}

const STORAGE_KEY = 'dojo-n4-progress-v1'

export const todayKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateKeyOffset = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return todayKey(date)
}

const initialProgress: ProgressState = {
  version: 1,
  name: '同学',
  dailyGoal: 25,
  onboarded: false,
  startedAt: null,
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  daysStudied: [],
  activity: {},
  completedLessons: [],
  lessonCompletions: {},
  lastLessonId: null,
  cards: {},
  bookmarkedWords: [],
  bookmarkedGrammar: [],
  grammarMastered: [],
  kanjiMastered: [],
  readPassages: [],
  completedListening: [],
  quizHistory: [],
  kanaStats: {},
}

function normalizeProgress(input: Partial<ProgressState>): ProgressState {
  const merged: ProgressState = { ...initialProgress, ...input }
  if (merged.lastStudyDate && merged.lastStudyDate !== todayKey() && merged.lastStudyDate !== dateKeyOffset(-1)) {
    merged.streak = 0
  }
  return merged
}

function loadProgress(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialProgress
    return normalizeProgress(JSON.parse(raw) as Partial<ProgressState>)
  } catch {
    return initialProgress
  }
}

function applyStudy(state: ProgressState, minutes: number): ProgressState {
  const today = todayKey()
  const yesterday = dateKeyOffset(-1)
  const alreadyToday = state.daysStudied.includes(today)
  const daysStudied = alreadyToday ? state.daysStudied : [...state.daysStudied, today]
  let streak = state.streak
  if (!alreadyToday) {
    streak = state.lastStudyDate === yesterday ? Math.max(1, state.streak + 1) : 1
  }
  return {
    ...state,
    activity: {
      ...state.activity,
      [today]: Math.round(((state.activity[today] ?? 0) + Math.max(0, minutes)) * 10) / 10,
    },
    daysStudied,
    lastStudyDate: today,
    streak,
  }
}

function addDays(timestamp: number, days: number) {
  return timestamp + days * 24 * 60 * 60 * 1000
}

interface ProgressContextValue {
  progress: ProgressState
  todayMinutes: number
  dueCount: number
  learnedWords: number
  completedLessonCount: number
  totalXP: number
  completeOnboarding: (payload: { name: string; dailyGoal: number; kanaLevel: string }) => void
  updateSettings: (payload: { name: string; dailyGoal: number }) => void
  resetProgress: () => void
  completeLesson: (lessonId: string, vocabIds: string[], xp: number, minutes: number) => boolean
  ensureCards: (wordIds: string[]) => void
  reviewWord: (wordId: string, rating: ReviewRating) => void
  addStudyMinutes: (minutes: number) => void
  toggleWordBookmark: (wordId: string) => void
  toggleGrammarBookmark: (grammarId: string) => void
  toggleGrammarMastered: (grammarId: string) => void
  toggleKanjiMastered: (kanji: string) => void
  recordQuiz: (record: Omit<QuizRecord, 'id' | 'date'>) => void
  recordReading: (passageId: string, correct: number, total: number) => void
  recordListening: (itemId: string, correct: number, total: number) => void
  recordKanaAnswer: (correct: boolean) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const stateRef = useRef(progress)
  stateRef.current = progress

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Storage can be unavailable in private modes; the in-memory session still works.
    }
  }, [progress])

  const completeOnboarding = useCallback((payload: { name: string; dailyGoal: number; kanaLevel: string }) => {
    setProgress((prev) => ({
      ...prev,
      name: payload.name.trim() || '同学',
      dailyGoal: payload.dailyGoal,
      onboarded: true,
      startedAt: prev.startedAt ?? Date.now(),
    }))
  }, [])

  const updateSettings = useCallback((payload: { name: string; dailyGoal: number }) => {
    setProgress((prev) => ({
      ...prev,
      name: payload.name.trim() || '同学',
      dailyGoal: payload.dailyGoal,
    }))
  }, [])

  const resetProgress = useCallback(() => {
    setProgress({ ...initialProgress })
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const completeLesson = useCallback((lessonId: string, vocabIds: string[], xp: number, minutes: number) => {
    const before = stateRef.current.completedLessons.includes(lessonId)
    setProgress((prev) => {
      const alreadyDone = prev.completedLessons.includes(lessonId)
      const today = todayKey()
      const cards = { ...prev.cards }
      for (const id of vocabIds) {
        if (!cards[id]) {
          cards[id] = {
            wordId: id,
            stage: 0,
            due: Date.now(),
            reps: 0,
            lapses: 0,
            lastReviewed: 0,
            learned: true,
          }
        }
      }
      let next: ProgressState = {
        ...prev,
        cards,
        lastLessonId: lessonId,
        xp: alreadyDone ? prev.xp : prev.xp + xp,
        completedLessons: alreadyDone ? prev.completedLessons : [...prev.completedLessons, lessonId],
        lessonCompletions: alreadyDone ? prev.lessonCompletions : { ...prev.lessonCompletions, [lessonId]: today },
      }
      next = applyStudy(next, minutes)
      return next
    })
    return !before
  }, [])

  const ensureCards = useCallback((wordIds: string[]) => {
    setProgress((prev) => {
      const cards = { ...prev.cards }
      for (const id of wordIds) {
        if (!cards[id]) {
          cards[id] = {
            wordId: id,
            stage: 0,
            due: Date.now(),
            reps: 0,
            lapses: 0,
            lastReviewed: 0,
            learned: true,
          }
        }
      }
      return { ...prev, cards }
    })
  }, [])

  const reviewWord = useCallback((wordId: string, rating: ReviewRating) => {
    setProgress((prev) => {
      const previous = prev.cards[wordId]
      const now = Date.now()
      const stage = previous?.stage ?? 0
      const intervals = [1, 3, 7, 14, 30, 60]
      let nextStage = stage
      let due = now
      if (rating === 'again') {
        nextStage = 0
        due = now + 10 * 60 * 1000
      } else if (rating === 'hard') {
        nextStage = Math.max(1, stage)
        due = addDays(now, 1)
      } else if (rating === 'good') {
        nextStage = Math.min(stage + 1, intervals.length - 1)
        due = addDays(now, intervals[nextStage] ?? 1)
      } else {
        nextStage = Math.min(stage + 2, intervals.length - 1)
        due = addDays(now, Math.max(3, intervals[nextStage] ?? 3))
      }
      return {
        ...prev,
        cards: {
          ...prev.cards,
          [wordId]: {
            wordId,
            stage: nextStage,
            due,
            reps: (previous?.reps ?? 0) + 1,
            lapses: (previous?.lapses ?? 0) + (rating === 'again' ? 1 : 0),
            lastReviewed: now,
            learned: true,
          },
        },
      }
    })
  }, [])

  const addStudyMinutes = useCallback((minutes: number) => {
    setProgress((prev) => applyStudy(prev, minutes))
  }, [])

  const toggleWordBookmark = useCallback((wordId: string) => {
    setProgress((prev) => ({
      ...prev,
      bookmarkedWords: prev.bookmarkedWords.includes(wordId)
        ? prev.bookmarkedWords.filter((id) => id !== wordId)
        : [...prev.bookmarkedWords, wordId],
    }))
  }, [])

  const toggleGrammarBookmark = useCallback((grammarId: string) => {
    setProgress((prev) => ({
      ...prev,
      bookmarkedGrammar: prev.bookmarkedGrammar.includes(grammarId)
        ? prev.bookmarkedGrammar.filter((id) => id !== grammarId)
        : [...prev.bookmarkedGrammar, grammarId],
    }))
  }, [])

  const toggleGrammarMastered = useCallback((grammarId: string) => {
    setProgress((prev) => ({
      ...prev,
      grammarMastered: prev.grammarMastered.includes(grammarId)
        ? prev.grammarMastered.filter((id) => id !== grammarId)
        : [...prev.grammarMastered, grammarId],
    }))
  }, [])

  const toggleKanjiMastered = useCallback((kanji: string) => {
    setProgress((prev) => ({
      ...prev,
      kanjiMastered: prev.kanjiMastered.includes(kanji)
        ? prev.kanjiMastered.filter((item) => item !== kanji)
        : [...prev.kanjiMastered, kanji],
    }))
  }, [])

  const recordQuiz = useCallback((record: Omit<QuizRecord, 'id' | 'date'>) => {
    setProgress((prev) => {
      let next = applyStudy(
        {
          ...prev,
          xp: prev.xp + Math.max(5, record.score * 3),
          quizHistory: [
            {
              ...record,
              id: `quiz-${Date.now()}`,
              date: Date.now(),
            },
            ...prev.quizHistory,
          ].slice(0, 50),
        },
        Math.max(1, Math.round(record.duration / 60)),
      )
      next = next
      return next
    })
  }, [])

  const recordReading = useCallback((passageId: string, correct: number, total: number) => {
    setProgress((prev) => {
      const first = !prev.readPassages.includes(passageId)
      return applyStudy(
        {
          ...prev,
          readPassages: first ? [...prev.readPassages, passageId] : prev.readPassages,
          xp: prev.xp + (first ? 20 + correct * 3 : 5),
        },
        first ? 6 : 2,
      )
    })
  }, [])

  const recordListening = useCallback((itemId: string, correct: number, total: number) => {
    setProgress((prev) => {
      const first = !prev.completedListening.includes(itemId)
      return applyStudy(
        {
          ...prev,
          completedListening: first ? [...prev.completedListening, itemId] : prev.completedListening,
          xp: prev.xp + (first ? 20 + correct * 3 : 5),
        },
        first ? 5 : 2,
      )
    })
  }, [])

  const recordKanaAnswer = useCallback((correct: boolean) => {
    setProgress((prev) => {
      const key = todayKey()
      const current = prev.kanaStats[key] ?? { correct: 0, total: 0 }
      return {
        ...prev,
        kanaStats: {
          ...prev.kanaStats,
          [key]: { correct: current.correct + (correct ? 1 : 0), total: current.total + 1 },
        },
      }
    })
  }, [])

  const todayMinutes = progress.activity[todayKey()] ?? 0
  const dueCount = useMemo(
    () => Object.values(progress.cards).filter((card) => card.due <= Date.now()).length,
    [progress.cards],
  )
  const learnedWords = useMemo(
    () => Object.values(progress.cards).filter((card) => card.learned).length,
    [progress.cards],
  )

  const value: ProgressContextValue = {
    progress,
    todayMinutes,
    dueCount,
    learnedWords,
    completedLessonCount: progress.completedLessons.length,
    totalXP: progress.xp,
    completeOnboarding,
    updateSettings,
    resetProgress,
    completeLesson,
    ensureCards,
    reviewWord,
    addStudyMinutes,
    toggleWordBookmark,
    toggleGrammarBookmark,
    toggleGrammarMastered,
    toggleKanjiMastered,
    recordQuiz,
    recordReading,
    recordListening,
    recordKanaAnswer,
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside ProgressProvider')
  return context
}

export function streakForDays(daysStudied: string[], streak: number) {
  if (daysStudied.includes(todayKey())) return Math.max(1, streak)
  if (daysStudied.includes(dateKeyOffset(-1))) return Math.max(1, streak)
  return streak
}
