import type { KanaCell } from './types'

const b = (hira: string, kata: string, romaji: string, row: string): KanaCell => ({
  hira,
  kata,
  romaji,
  row,
  group: 'basic',
})

export const basicKana: KanaCell[] = [
  b('あ', 'ア', 'a', 'あ行'),
  b('い', 'イ', 'i', 'あ行'),
  b('う', 'ウ', 'u', 'あ行'),
  b('え', 'エ', 'e', 'あ行'),
  b('お', 'オ', 'o', 'あ行'),
  b('か', 'カ', 'ka', 'か行'),
  b('き', 'キ', 'ki', 'か行'),
  b('く', 'ク', 'ku', 'か行'),
  b('け', 'ケ', 'ke', 'か行'),
  b('こ', 'コ', 'ko', 'か行'),
  b('さ', 'サ', 'sa', 'さ行'),
  b('し', 'シ', 'shi', 'さ行'),
  b('す', 'ス', 'su', 'さ行'),
  b('せ', 'セ', 'se', 'さ行'),
  b('そ', 'ソ', 'so', 'さ行'),
  b('た', 'タ', 'ta', 'た行'),
  b('ち', 'チ', 'chi', 'た行'),
  b('つ', 'ツ', 'tsu', 'た行'),
  b('て', 'テ', 'te', 'た行'),
  b('と', 'ト', 'to', 'た行'),
  b('な', 'ナ', 'na', 'な行'),
  b('に', 'ニ', 'ni', 'な行'),
  b('ぬ', 'ヌ', 'nu', 'な行'),
  b('ね', 'ネ', 'ne', 'な行'),
  b('の', 'ノ', 'no', 'な行'),
  b('は', 'ハ', 'ha', 'は行'),
  b('ひ', 'ヒ', 'hi', 'は行'),
  b('ふ', 'フ', 'fu', 'は行'),
  b('へ', 'ヘ', 'he', 'は行'),
  b('ほ', 'ホ', 'ho', 'は行'),
  b('ま', 'マ', 'ma', 'ま行'),
  b('み', 'ミ', 'mi', 'ま行'),
  b('む', 'ム', 'mu', 'ま行'),
  b('め', 'メ', 'me', 'ま行'),
  b('も', 'モ', 'mo', 'ま行'),
  b('や', 'ヤ', 'ya', 'や行'),
  b('ゆ', 'ユ', 'yu', 'や行'),
  b('よ', 'ヨ', 'yo', 'や行'),
  b('ら', 'ラ', 'ra', 'ら行'),
  b('り', 'リ', 'ri', 'ら行'),
  b('る', 'ル', 'ru', 'ら行'),
  b('れ', 'レ', 're', 'ら行'),
  b('ろ', 'ロ', 'ro', 'ら行'),
  b('わ', 'ワ', 'wa', 'わ行'),
  b('を', 'ヲ', 'wo', 'わ行'),
  b('ん', 'ン', 'n', 'ん'),
]

const d = (hira: string, kata: string, romaji: string, row: string): KanaCell => ({
  hira,
  kata,
  romaji,
  row,
  group: 'dakuten',
})

export const dakutenKana: KanaCell[] = [
  d('が', 'ガ', 'ga', 'が行'),
  d('ぎ', 'ギ', 'gi', 'が行'),
  d('ぐ', 'グ', 'gu', 'が行'),
  d('げ', 'ゲ', 'ge', 'が行'),
  d('ご', 'ゴ', 'go', 'が行'),
  d('ざ', 'ザ', 'za', 'ざ行'),
  d('じ', 'ジ', 'ji', 'ざ行'),
  d('ず', 'ズ', 'zu', 'ざ行'),
  d('ぜ', 'ゼ', 'ze', 'ざ行'),
  d('ぞ', 'ゾ', 'zo', 'ざ行'),
  d('だ', 'ダ', 'da', 'だ行'),
  d('ぢ', 'ヂ', 'ji', 'だ行'),
  d('づ', 'ヅ', 'zu', 'だ行'),
  d('で', 'デ', 'de', 'だ行'),
  d('ど', 'ド', 'do', 'だ行'),
  d('ば', 'バ', 'ba', 'ば行'),
  d('び', 'ビ', 'bi', 'ば行'),
  d('ぶ', 'ブ', 'bu', 'ば行'),
  d('べ', 'ベ', 'be', 'ば行'),
  d('ぼ', 'ボ', 'bo', 'ば行'),
]

export const handakutenKana: KanaCell[] = [
  { hira: 'ぱ', kata: 'パ', romaji: 'pa', row: 'ぱ行', group: 'handakuten' },
  { hira: 'ぴ', kata: 'ピ', romaji: 'pi', row: 'ぱ行', group: 'handakuten' },
  { hira: 'ぷ', kata: 'プ', romaji: 'pu', row: 'ぱ行', group: 'handakuten' },
  { hira: 'ぺ', kata: 'ペ', romaji: 'pe', row: 'ぱ行', group: 'handakuten' },
  { hira: 'ぽ', kata: 'ポ', romaji: 'po', row: 'ぱ行', group: 'handakuten' },
]

const y = (hira: string, kata: string, romaji: string, row: string): KanaCell => ({
  hira,
  kata,
  romaji,
  row,
  group: 'yoon',
})

export const yoonKana: KanaCell[] = [
  y('きゃ', 'キャ', 'kya', 'きゃ行'),
  y('きゅ', 'キュ', 'kyu', 'きゃ行'),
  y('きょ', 'キョ', 'kyo', 'きゃ行'),
  y('しゃ', 'シャ', 'sha', 'しゃ行'),
  y('しゅ', 'シュ', 'shu', 'しゃ行'),
  y('しょ', 'ショ', 'sho', 'しゃ行'),
  y('ちゃ', 'チャ', 'cha', 'ちゃ行'),
  y('ちゅ', 'チュ', 'chu', 'ちゃ行'),
  y('ちょ', 'チョ', 'cho', 'ちゃ行'),
  y('にゃ', 'ニャ', 'nya', 'にゃ行'),
  y('にゅ', 'ニュ', 'nyu', 'にゃ行'),
  y('にょ', 'ニョ', 'nyo', 'にゃ行'),
  y('ひゃ', 'ヒャ', 'hya', 'ひゃ行'),
  y('ひゅ', 'ヒュ', 'hyu', 'ひゃ行'),
  y('ひょ', 'ヒョ', 'hyo', 'ひゃ行'),
  y('みゃ', 'ミャ', 'mya', 'みゃ行'),
  y('みゅ', 'ミュ', 'myu', 'みゃ行'),
  y('みょ', 'ミョ', 'myo', 'みゃ行'),
  y('りゃ', 'リャ', 'rya', 'りゃ行'),
  y('りゅ', 'リュ', 'ryu', 'りゃ行'),
  y('りょ', 'リョ', 'ryo', 'りゃ行'),
  y('ぎゃ', 'ギャ', 'gya', 'ぎゃ行'),
  y('ぎゅ', 'ギュ', 'gyu', 'ぎゃ行'),
  y('ぎょ', 'ギョ', 'gyo', 'ぎゃ行'),
  y('じゃ', 'ジャ', 'ja', 'じゃ行'),
  y('じゅ', 'ジュ', 'ju', 'じゃ行'),
  y('じょ', 'ジョ', 'jo', 'じゃ行'),
  y('びゃ', 'ビャ', 'bya', 'びゃ行'),
  y('びゅ', 'ビュ', 'byu', 'びゃ行'),
  y('びょ', 'ビョ', 'byo', 'びゃ行'),
  y('ぴゃ', 'ピャ', 'pya', 'ぴゃ行'),
  y('ぴゅ', 'ピュ', 'pyu', 'ぴゃ行'),
  y('ぴょ', 'ピョ', 'pyo', 'ぴゃ行'),
]

export const allKana: KanaCell[] = [
  ...basicKana,
  ...dakutenKana,
  ...handakutenKana,
  ...yoonKana,
]

export const kanaRows = Array.from(new Set(basicKana.map((k) => k.row))).map((row) => ({
  row,
  cells: basicKana.filter((k) => k.row === row),
}))

export const kanaNotes = [
  {
    title: 'し · ち · つ · ふ',
    body: '这四个是罗马字最容易写错的一组：し = shi（不是 si），ち = chi（不是 ti），つ = tsu（不是 tu），ふ = fu（不是 hu）。',
  },
  {
    title: '长音与促音',
    body: '长音拉长一拍：おかあさん。促音「っ」停顿一拍：きって。初学时就按节拍读，之后听力会轻松很多。',
  },
  {
    title: 'は 读作 wa',
    body: '助词「は」写作 ha，读作 wa；助词「へ」写作 he，读作 e；助词「を」读作 o。这是 N5 就出现的固定读法。',
  },
  {
    title: '片假名不要单独背',
    body: '把片假名和常用外来语一起记：コーヒー、テレビ、パン。比起默写表，词形记忆更牢。',
  },
]
