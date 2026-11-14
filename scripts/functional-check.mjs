import { chromium } from 'playwright-core'

const base = 'http://127.0.0.1:5173'
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--disable-gpu', '--no-sandbox'],
})
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN' })
const page = await context.newPage()
const errors = []
page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`) })
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

const results = []
function check(name, condition, detail = '') {
  results.push({ name, pass: Boolean(condition), detail })
  console.log(condition ? 'PASS' : 'FAIL', name, detail)
}
async function progress() {
  return page.evaluate(() => JSON.parse(localStorage.getItem('dojo-n4-progress-v1') || '{}'))
}

await page.goto(base, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /定制我的路线/ }).click()
await page.locator('.onboarding-field input').fill('测试君')
await page.getByRole('button', { name: /出发，开始第 1 课/ }).click()
await page.waitForTimeout(400)
check('onboarding completes', (await page.locator('.hero-copy h1').textContent())?.includes('把日语'))

// Complete lesson 1
await page.goto(`${base}/#/lesson/l01`, { waitUntil: 'networkidle' })
for (let i = 0; i < 3; i += 1) {
  await page.locator('.lesson-footer .button-primary').click()
  await page.waitForTimeout(120)
}
check('lesson check reached', (await page.locator('.check-question').count()) === 4)
const lessonAnswers = [0, 1, 1, 1]
for (let i = 0; i < 4; i += 1) {
  await page.locator('.check-question').nth(i).locator('.check-option').nth(lessonAnswers[i]).click()
}
check('check shows correct count', (await page.locator('.check-question.answered').count()) === 4)
await page.locator('.lesson-footer .button-primary').click()
await page.waitForTimeout(150)
await page.getByRole('button', { name: /完成本课/ }).click()
await page.waitForTimeout(500)
check('lesson completion screen', (await page.locator('.lesson-complete').count()) === 1)
let state = await progress()
check('lesson saved', state.completedLessons?.includes('l01'), JSON.stringify(state.completedLessons))
check('xp awarded', state.xp >= 30, String(state.xp))
check('cards added', Object.keys(state.cards || {}).length >= 5, String(Object.keys(state.cards || {}).length))
check('study minutes recorded', state.activity && Object.values(state.activity).some((v) => v >= 10), JSON.stringify(state.activity))

// SRS review
await page.goto(`${base}/#/vocabulary?tab=review`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /开始今日复习/ }).click()
await page.waitForTimeout(200)
const queueSize = await page.locator('.session-progress span').first().textContent()
check('review session starts', Boolean(queueSize), queueSize ?? '')
let reviewed = 0
for (let i = 0; i < 8; i += 1) {
  if (await page.locator('.review-summary').count()) break
  const reveal = page.getByRole('button', { name: /显示答案/ })
  if (await reveal.count()) await reveal.click()
  const good = page.locator('.rating.good')
  if (await good.count()) {
    await good.click()
    reviewed += 1
    await page.waitForTimeout(80)
  } else break
}
await page.waitForTimeout(250)
check('review ratings work', reviewed >= 1, `reviewed ${reviewed}`)
state = await progress()
check('reviewed cards have reps', Object.values(state.cards || {}).some((card) => card.reps > 0))

// Grammar quiz
await page.goto(`${base}/#/practice?tab=quiz`, { waitUntil: 'networkidle' })
await page.locator('.quiz-mode-card').filter({ hasText: '语法专项' }).locator('.quiz-mode-start').click()
await page.waitForTimeout(200)
for (let i = 0; i < 12; i += 1) {
  await page.locator('.quiz-option').first().click()
  await page.waitForTimeout(30)
  await page.locator('.quiz-feedback .button-primary').click()
  await page.waitForTimeout(80)
}
await page.waitForTimeout(300)
check('quiz result appears', (await page.locator('.quiz-result').count()) === 1)
state = await progress()
check('quiz history saved', (state.quizHistory || []).length === 1, String((state.quizHistory || []).length))

// Reading
await page.goto(`${base}/#/reading/r01`, { waitUntil: 'networkidle' })
const readingAnswers = [1, 2, 2]
for (let i = 0; i < 3; i += 1) {
  await page.locator('.reading-question').nth(i).locator('.reading-option').nth(readingAnswers[i]).click()
}
await page.getByRole('button', { name: /提交答案/ }).click()
await page.waitForTimeout(350)
check('reading result appears', (await page.locator('.reading-result').count()) === 1)
state = await progress()
check('reading saved', state.readPassages?.includes('r01'))

// Listening
await page.goto(`${base}/#/listening/li01`, { waitUntil: 'networkidle' })
const listeningAnswers = [1, 0, 1]
for (let i = 0; i < 3; i += 1) {
  await page.locator('.reading-question').nth(i).locator('.reading-option').nth(listeningAnswers[i]).click()
}
await page.getByRole('button', { name: /提交答案/ }).click()
await page.waitForTimeout(350)
check('listening result appears', (await page.locator('.reading-result').count()) === 1)
state = await progress()
check('listening saved', state.completedListening?.includes('li01'))

// Grammar bookmark + mastered
await page.goto(`${base}/#/grammar?point=g001`, { waitUntil: 'networkidle' })
await page.waitForTimeout(250)
check('grammar modal opens', (await page.locator('.grammar-detail-modal').count()) === 1)
await page.locator('.grammar-detail-actions').getByRole('button', { name: '收藏' }).click()
await page.locator('.grammar-detail-actions').getByRole('button', { name: /标记掌握/ }).click()
state = await progress()
check('grammar bookmark saved', state.bookmarkedGrammar?.includes('g001'))
check('grammar mastered saved', state.grammarMastered?.includes('g001'))
await page.locator('.modal-close').click()

// Kanji mastered
await page.goto(`${base}/#/kanji`, { waitUntil: 'networkidle' })
await page.locator('.kanji-tile').first().click()
await page.waitForTimeout(200)
check('kanji modal opens', (await page.locator('.kanji-detail-modal').count()) === 1)
await page.getByRole('button', { name: /标记掌握/ }).click()
state = await progress()
check('kanji mastered saved', (state.kanjiMastered || []).length === 1)
await page.locator('.modal-close').click()

// Settings name update
await page.locator('.topbar-avatar').click()
await page.waitForTimeout(150)
await page.locator('.settings-form input').fill('道场学员')
await page.getByRole('button', { name: '保存设置' }).click()
await page.waitForTimeout(300)
state = await progress()
check('settings name saved', state.name === '道场学员', state.name)

// Persistence after reload
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
check('onboarding does not reappear', (await page.locator('.onboarding').count()) === 0)
check('name persists', (await page.locator('.topbar-avatar').textContent())?.includes('道'))
check('saved lesson visible on dashboard', (await page.locator('body').innerText()).includes('1 / 18'))

// Mobile drawer
await page.setViewportSize({ width: 390, height: 844 })
await page.goto(base, { waitUntil: 'networkidle' })
await page.locator('.mobile-menu').click()
await page.waitForTimeout(200)
check('mobile drawer opens', await page.locator('.mobile-drawer').isVisible())
await page.locator('.mobile-drawer').getByRole('link', { name: /语法库/ }).click()
await page.waitForTimeout(300)
check('mobile nav works', page.url().includes('/grammar'))

console.log('\nERRORS', errors.length ? JSON.stringify(errors, null, 2) : 'none')
const failed = results.filter((item) => !item.pass)
console.log(`\nRESULT ${results.length - failed.length}/${results.length} passed`)
if (failed.length) console.log('FAILED', JSON.stringify(failed, null, 2))
await browser.close()
process.exitCode = failed.length ? 1 : 0
