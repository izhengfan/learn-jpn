# 道场 N4 · 从五十音到日语 N4

一个面向「学过五十音、但还没真正开口」的中文母语者的日语学习 Web 应用。把 N4 拆成 12 周、18 节互动课，并用单词 SRS、语法手册、假名/汉字训练、阅读、听力与模拟测验形成学习闭环。

**在线访问：https://izhengfan.github.io/learn-jpn/**

## 启动

```bash
npm install
npm run dev
```

访问 `http://127.0.0.1:5173`。

生产构建：

```bash
npm run build
npm run preview
```

## 部署

推送到 `main` 后，GitHub Actions（[deploy.yml](.github/workflows/deploy.yml)）会自动构建并部署到 GitHub Pages。

- 仓库 Pages Source 使用 **GitHub Actions**
- 构建时自动使用仓库名作为 Vite `base`，本地开发仍使用根路径
- 线上地址：`https://izhengfan.github.io/learn-jpn/`

## 功能

- **18 节互动课**：6 个单元，从假名复习、助词骨架到被动使役、引用敬语，课内即时检查 + 例句发音。
- **180 个 N4 核心词**：12 个主题，TTS 发音、例句、中文释义，按记忆曲线安排复习。
- **48 个语法点**：接续、语感、例句、易错提示与相关语法互链。
- **文字训练**：完整五十音图（平假名/片假名/浊音/拗音），听音 + 20 题反应训练；123 个 N4 核心汉字。
- **练习场**：每日小测、语法/词汇/汉字/假名专项、20 题 N4 综合模拟、5 篇阅读、6 组场景听力。
- **学习报告**：课节、单词、阅读、听力、测验、连续学习天数、技能覆盖、成就与 12 周路线。
- **本地优先**：所有进度存于浏览器 `localStorage`，无需注册。

## 内容与验证

```bash
npm run check:content   # 校验课节引用、选项、答案索引、选项重复
npm run check:e2e       # 使用 Playwright + 已安装的 Edge 进行端到端流程测试
```

端到端脚本默认连接 `http://127.0.0.1:5173`，并调用本机 Edge；如浏览器路径不同，请修改 `scripts/functional-check.mjs` 中的 `executablePath`。

## 说明

应用内包含的是 N4 的**核心**语法与高频词，不是完整 1500 词的词表。真正的 N4 词汇量需要搭配课外泛读与听力输入持续扩展；本应用负责把发音、语法骨架、复习节奏和练习反馈搭稳。

所有日语语音通过浏览器 `speechSynthesis` 生成。若设备没有安装日语音色，例句按钮可能无声，课节内仍提供完整假名/原文。
