import { grammarPoints, grammarById } from '../src/data/grammar'
import { kanjiList } from '../src/data/kanji'
import { lessons, lessonsByUnit, units } from '../src/data/lessons'
import { listeningItems } from '../src/data/listening'
import { readingPassages } from '../src/data/reading'
import { grammarQuizBank } from '../src/data/quiz'
import { words, wordsById } from '../src/data/vocabulary'
import { allKana } from '../src/data/kana'

const failures: string[] = []
const fail = (message: string) => failures.push(message)

// Core counts
console.log({ lessons: lessons.length, units: units.length, words: words.length, grammar: grammarPoints.length, kanji: kanjiList.length, kana: allKana.length })

const unique = <T>(items: T[], label: string, key: (item: T) => string) => {
  const seen = new Set<string>()
  for (const item of items) {
    const id = key(item)
    if (seen.has(id)) fail(`duplicate ${label}: ${id}`)
    seen.add(id)
  }
}
unique(lessons, 'lesson id', (lesson) => lesson.id)
unique(words, 'word id', (word) => word.id)
unique(grammarPoints, 'grammar id', (point) => point.id)
unique(kanjiList, 'kanji', (kanji) => kanji.char)
unique(readingPassages, 'reading id', (passage) => passage.id)
unique(listeningItems, 'listening id', (item) => item.id)
unique(allKana, 'kana', (cell) => `${cell.hira}-${cell.kata}`)

for (const unit of units) {
  const count = lessonsByUnit(unit.id).length
  if (count !== 3) fail(`unit ${unit.id} has ${count} lessons, expected 3`)
}

for (const lesson of lessons) {
  if (!units.some((unit) => unit.id === lesson.unitId)) fail(`lesson ${lesson.id} has unknown unit ${lesson.unitId}`)
  if (lesson.steps.length < 4) fail(`lesson ${lesson.id} has too few steps`)
  if (!lesson.steps.some((step) => step.type === 'check')) fail(`lesson ${lesson.id} has no check`)
  for (const vocabId of lesson.vocabIds) {
    if (!wordsById[vocabId]) fail(`lesson ${lesson.id} references missing word ${vocabId}`)
  }
  for (const grammarId of lesson.grammarIds) {
    if (!grammarById[grammarId]) fail(`lesson ${lesson.id} references missing grammar ${grammarId}`)
  }
  for (const [stepIndex, step] of lesson.steps.entries()) {
    if (step.type !== 'check') continue
    for (const [questionIndex, question] of step.questions.entries()) {
      if (question.answer < 0 || question.answer >= question.options.length) {
        fail(`lesson ${lesson.id} step ${stepIndex} q${questionIndex}: answer out of range`)
      }
      if (new Set(question.options).size !== question.options.length) {
        fail(`lesson ${lesson.id} step ${stepIndex} q${questionIndex}: duplicate options ${JSON.stringify(question.options)}`)
      }
      if (question.options.length < 2) fail(`lesson ${lesson.id} step ${stepIndex} q${questionIndex}: too few options`)
      if (!question.explanation.trim()) fail(`lesson ${lesson.id} step ${stepIndex} q${questionIndex}: no explanation`)
    }
  }
}

for (const point of grammarPoints) {
  if (!point.examples.length) fail(`grammar ${point.id} has no examples`)
  if (!point.formation.length) fail(`grammar ${point.id} has no formation`)
  for (const related of point.related ?? []) {
    if (!grammarById[related]) fail(`grammar ${point.id} references missing related ${related}`)
  }
  if (point.lessonId && !lessons.some((lesson) => lesson.id === point.lessonId)) {
    fail(`grammar ${point.id} references missing lesson ${point.lessonId}`)
  }
}

for (const question of grammarQuizBank) {
  if (question.answer < 0 || question.answer >= question.options.length) fail(`quiz ${question.id}: answer out of range`)
  if (new Set(question.options).size !== question.options.length) fail(`quiz ${question.id}: duplicate options`)
}

for (const passage of readingPassages) {
  for (const [index, question] of passage.questions.entries()) {
    if (question.answer < 0 || question.answer >= question.options.length) fail(`reading ${passage.id} q${index}: answer out of range`)
    if (new Set(question.options).size !== question.options.length) fail(`reading ${passage.id} q${index}: duplicate options`)
  }
  if (!passage.paragraphs.length) fail(`reading ${passage.id} has no paragraphs`)
}

for (const item of listeningItems) {
  for (const [index, question] of item.questions.entries()) {
    if (question.answer < 0 || question.answer >= question.options.length) fail(`listening ${item.id} q${index}: answer out of range`)
    if (new Set(question.options).size !== question.options.length) fail(`listening ${item.id} q${index}: duplicate options`)
  }
  if (!item.lines.length) fail(`listening ${item.id} has no lines`)
}

for (const kanji of kanjiList) {
  if (!kanji.words.length) fail(`kanji ${kanji.char} has no words`)
  if (!kanji.meaning.trim()) fail(`kanji ${kanji.char} has no meaning`)
}

const wordCategoryCounts = Object.entries(
  words.reduce<Record<string, number>>((counts, word) => ({ ...counts, [word.category]: (counts[word.category] ?? 0) + 1 }), {}),
)
console.log('word categories', wordCategoryCounts)
console.log('grammar by level', grammarPoints.reduce<Record<string, number>>((counts, point) => ({ ...counts, [point.level]: (counts[point.level] ?? 0) + 1 }), {}))
console.log('kanji by level', kanjiList.reduce<Record<string, number>>((counts, kanji) => ({ ...counts, [kanji.level]: (counts[kanji.level] ?? 0) + 1 }), {}))

if (failures.length) {
  console.error(`\n${failures.length} content failures:`)
  failures.forEach((failure) => console.error('-', failure))
  process.exit(1)
} else {
  console.log('\nContent validation passed.')
}
