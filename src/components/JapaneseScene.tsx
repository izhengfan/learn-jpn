export function JapaneseScene({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`japanese-scene ${className}`}
      viewBox="0 0 640 460"
      role="img"
      aria-label="富士山、红色鸟居与日出的日本风景插画"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="skyWash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2e8d2" />
          <stop offset="100%" stopColor="#e8ddc6" />
        </linearGradient>
        <linearGradient id="mountainFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9b9ae" />
          <stop offset="100%" stopColor="#c9d2c5" />
        </linearGradient>
        <linearGradient id="mountainNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#354d43" />
          <stop offset="100%" stopColor="#22352e" />
        </linearGradient>
        <linearGradient id="sunFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d65b3e" />
          <stop offset="100%" stopColor="#b53d28" />
        </linearGradient>
        <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0d6bf" />
          <stop offset="100%" stopColor="#efe7d6" />
        </linearGradient>
        <filter id="paperNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono" result="faded">
            <feFuncA type="linear" slope="0.045" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="faded" mode="multiply" />
        </filter>
      </defs>

      <g filter="url(#paperNoise)">
        <rect width="640" height="460" fill="url(#skyWash)" />
        <circle cx="445" cy="130" r="78" fill="url(#sunFill)" opacity="0.94" />
        <circle cx="445" cy="130" r="96" fill="none" stroke="#c74b32" strokeWidth="1.1" opacity="0.28" />

        <path
          d="M0 340 C95 290 140 308 220 258 C300 208 350 235 420 292 C480 340 555 314 640 270 L640 420 L0 420 Z"
          fill="url(#mountainFar)"
          opacity="0.8"
        />
        <path
          d="M248 348 L402 176 C417 159 438 160 453 178 L604 349 Z"
          fill="url(#mountainNear)"
        />
        <path
          d="M345 240 C362 228 380 232 394 240 C405 249 420 250 433 239 C444 229 455 229 465 241 L487 266 C465 257 444 260 421 270 C401 279 380 278 362 266 Z"
          fill="#f4eddf"
          opacity="0.9"
        />
        <path
          d="M402 176 C417 159 438 160 453 178 L469 196 L445 184 L429 194 L414 183 L397 193 Z"
          fill="#f5eee0"
        />

        <g opacity="0.55" fill="#f6f0e4">
          <path d="M90 135 C130 115 175 119 218 141 C176 133 131 137 90 154 Z" />
          <path d="M470 74 C511 59 548 64 585 82 C547 75 508 77 470 91 Z" />
          <path d="M58 208 C91 194 125 198 155 213 C122 207 90 209 58 221 Z" opacity="0.7" />
        </g>

        <g stroke="#24382f" strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round">
          <path d="M138 92 C146 84 153 84 160 91 C167 84 174 84 182 92" />
          <path d="M184 72 C190 66 196 66 202 72 C208 66 214 66 220 72" />
        </g>

        <g>
          <ellipse cx="188" cy="389" rx="105" ry="11" fill="#1e2d27" opacity="0.12" />
          <rect x="147" y="210" width="13" height="190" rx="3" fill="#a43726" />
          <rect x="250" y="210" width="13" height="190" rx="3" fill="#a43726" />
          <path d="M118 208 L292 208 L282 228 L128 228 Z" fill="#bf4a33" />
          <path d="M131 181 L280 181 L271 199 L140 199 Z" fill="#b03e2a" />
          <rect x="120" y="230" width="170" height="12" rx="2" fill="#9e3222" />
          <rect x="193" y="198" width="18" height="32" fill="#a43726" />
          <path d="M166 247 L238 247 L230 260 L174 260 Z" fill="#b54530" opacity="0.9" />
          <path d="M140 205 L271 205" stroke="#7f2a1c" strokeWidth="2" opacity="0.35" />
          <rect x="145" y="207" width="10" height="185" fill="#7f2a1c" opacity="0.18" />
          <rect x="248" y="207" width="10" height="185" fill="#7f2a1c" opacity="0.18" />
        </g>

        <path d="M0 395 C130 376 205 406 338 392 C465 379 545 393 640 376 L640 460 L0 460 Z" fill="url(#waterFill)" />
        <g stroke="#b9ab8f" strokeWidth="1" fill="none" opacity="0.5">
          <path d="M70 418 C130 411 175 420 233 415" />
          <path d="M360 434 C420 427 460 436 519 430" />
          <path d="M110 444 C180 438 225 448 292 441" />
          <path d="M422 411 C474 406 514 412 566 407" />
        </g>

        <g opacity="0.85">
          <path d="M522 186 C526 170 548 160 561 173 C571 183 565 201 550 206 C548 215 538 218 534 209 C520 207 515 194 522 186 Z" fill="#f4eddf" opacity="0.8" />
          <path d="M530 188 C534 178 547 174 555 181" fill="none" stroke="#c74b32" strokeWidth="1.1" opacity="0.55" />
        </g>

        <g transform="translate(43 40)">
          <rect width="48" height="48" fill="#b8462f" rx="2" />
          <path d="M13 12 H35 M13 20 H35 M18 12 V36 M30 12 V36 M13 28 H35" stroke="#f7f0e1" strokeWidth="1.6" fill="none" />
        </g>
        <text x="112" y="61" fontFamily="'Yu Mincho', 'Songti SC', serif" fontSize="13" fill="#49584e" letterSpacing="4">
          五十音の先へ
        </text>
        <text x="112" y="80" fontFamily="'Yu Mincho', 'Songti SC', serif" fontSize="10" fill="#7b8378" letterSpacing="2">
          BEYOND THE KANA
        </text>
      </g>
    </svg>
  )
}
