# Petagent Demo

一个“会监工的桌宠 Agent”展示 demo。

这个 demo 面向两个选题方向：

1. **如何杀死 Agent 思考的那 30 秒？**
2. **终结点按式 OS 设计，探索 AI 驱动的新范式。**

我的答案不是再做一个 dashboard，也不是把 Claude / Codex 包一层聊天窗口，而是做一个贴在桌面上的“Agent 监督者”：它看得懂 Agent 当前在等待、执行、确认、报错还是完成；它用动画、HUD、TTS 旁白和轻量语音入口，把等待时间变成可理解、可介入、可展示的体验。

这两个选题在我看来其实是同一件事的两面：当 AI 开始替用户执行多步骤任务，操作系统的核心交互就不应该只围绕“用户点哪个按钮”设计，而应该围绕“用户表达了什么意图、哪个 Agent 在执行、现在卡在哪里、什么时候需要用户介入”来设计。

## 一句话

Petagent Demo 把终端 Agent 的“黑盒等待”变成一个有生命的桌宠监督层：

- 你把任务派给 Claude / Codex。
- 桌宠在旁边监工，展示状态、用量、动作入口和 mock 演示。
- Agent 卡住、等待确认、执行很久或完成时，桌宠用动画和 TTS 解释发生了什么。
- 用户可以通过文本按钮、HUD 快捷动作和语音式交互理解、介入、继续任务。

## 视觉预览

<p align="center">
  <img src="assets/hero.gif" alt="Petagent Demo 桌宠预览" width="760">
</p>

Clawd 不是一个贴在桌面上的 loading 图标，而是这个 demo 的“监督者角色”。所以 README 里也尽量用动画而不是纯静态截图来介绍它：等待、工作、调试、完成、进入 mini mode，这些状态本身就是体验的一部分。

## 下载

macOS Apple Silicon demo 包在 GitHub Releases：

[下载 Kill-The-Time-Demo-0.1.0-arm64.dmg](https://github.com/lala1137273514/Petagent-demo/releases/tag/v0.1.0-demo)

说明：

- 当前 DMG 是 `arm64`，适合 Apple Silicon Mac。
- GitHub 仓库的 `Code` 文件列表里不会直接出现 DMG，安装包在 Release 页面底部的 Assets 里。
- 当前包是 ad-hoc 签名，未做 Apple notarization。首次打开如果 macOS 拦截，可以在“系统设置 → 隐私与安全性”里允许打开。
- API Key 不会写进代码或安装包。LLM / TTS / ASR 配置从本地设置读取。

## 课题 1：如何杀死 Agent 思考的 30 秒

Agent 的等待之所以无聊，不只是因为慢，而是因为用户不知道它在干什么。

传统 loading spinner 隐藏了太多真实信息：

- 它是在规划，还是已经开始执行？
- 它是在等网络、等权限、等子任务，还是卡住了？
- 它是不是需要我确认？
- 它如果跑了很久，我该继续等，还是应该介入？

所以这个 demo 的核心不是“假装 Agent 更快”，而是让等待变得 **透明、有生命、可介入、可听见**。

### 透明

HUD 不做一个巨大的控制台，而是围绕 pet 展开几张轻量卡片：

- Agent 状态卡：当前 Agent、阶段、是否等待确认、最近动作。
- 用量卡：展示已登录服务的用量百分比，未登录服务不展示。
- 工具/动作卡：终端、文件夹、截图、设置、Claude / Codex 派活入口、mock 演示入口。

这些信息不是为了塞满屏幕，而是让用户一眼知道“现在发生到哪了”。

### 有生命

主项目原本最强的是 Clawd 动画体系，所以 demo 没有把动画简化成几个普通状态。

状态映射围绕已有动画展开：

| Agent 状态 | 桌宠表现 |
|---|---|
| `idle` 待命 | 呼吸、眼动、鼠标靠近唤醒 |
| `thinking` 思考/规划 | 思考态、轻微节奏变化 |
| `working` 执行/打字/构建 | 工作态、忙碌反馈 |
| `debugging` 调试/检查 | 检查、排错、反复确认 |
| `permission` / `waiting` 等待确认 | 提醒、警觉、等待用户动作 |
| `compacting` 压缩上下文 | 清扫/整理感的反馈 |
| `subagent single/multi` 子任务 | 单子任务/多子任务编排、律动或杂耍感 |
| `error` 报错 | 受挫、提醒、解释 |
| `done` 完成 | 开心、庆祝、总结 |
| `dragging` 拖拽 | 搬运、被提起、拖拽短句 |
| `long idle` 长时间空闲 | 睡眠序列 |
| `mini mode` 迷你模式 | 边缘吸附、探头、mini idle、mini alert |

这个取舍很重要：桌宠不是状态灯，它应该像一个知道工作进展的小监督员。

### Clawd 动画图鉴

| 待命 | 思考 | 执行 | 调试 |
|---|---|---|---|
| <img src="assets/gif/clawd-idle.gif" alt="Clawd idle" width="140"> | <img src="assets/gif/clawd-thinking.gif" alt="Clawd thinking" width="140"> | <img src="assets/gif/clawd-typing.gif" alt="Clawd working" width="140"> | <img src="assets/gif/clawd-debugger.gif" alt="Clawd debugging" width="140"> |

| 子任务编排 | 压缩/整理 | 完成 | Mini Mode |
|---|---|---|---|
| <img src="assets/gif/clawd-juggling.gif" alt="Clawd subagent juggling" width="140"> | <img src="assets/gif/clawd-sweeping.gif" alt="Clawd compacting" width="140"> | <img src="assets/gif/clawd-happy.gif" alt="Clawd done" width="140"> | <img src="assets/gif/clawd-mini-peek.gif" alt="Clawd mini mode" width="140"> |

### 可介入

等待期间最关键的不是“看动画”，而是知道什么时候该介入。

demo 里把介入点分成几类：

- 等待确认：提醒用户现在需要批准、拒绝或查看。
- 报错：说明失败发生在哪里，而不是只给红色状态。
- 长时间执行：TTS 旁白解释“我还在等什么”，降低用户焦虑。
- 完成：用一句总结告诉用户结果已经回来。

### 可听见

TTS 不做持续唠叨，而是只在关键事件出现：

- 拖拽时随机短句。
- 等待确认时提醒。
- 报错时说明。
- 执行很久时安抚和解释。
- 完成时总结。

设计上我更偏向“你在看它时它少说话，你走开时它帮你听进展”。TTS 的价值不是替代 UI，而是让等待变成一种可以离开屏幕的体验。

## 课题 2：终结点按式 OS 设计，AI 驱动的新范式

传统点按式 OS 的基本单位是 App、窗口、菜单、按钮和文件。用户为了完成一个目标，必须自己决定打开哪个 App、找哪个菜单、点哪个按钮、复制哪段内容、切到哪个窗口。

但 Agent 改变了这个前提。用户不再只是操作界面，而是在发出目标：查资料、改代码、跑测试、总结进度、等待确认、继续执行。此时 OS 的关键能力不再是“把按钮排好”，而是“理解意图、选择执行者、监督过程、解释状态、在正确时刻请求用户介入”。

这个 demo 的方向是：**桌宠是入口，但不是主应用；语音和文本是意图，内置脚本和终端 Agent 是执行层；HUD 是贴近桌面的 Agent 状态层。**

### 我对新范式的判断

AI 驱动 OS 不应该只是把聊天框放进系统托盘，也不应该把所有按钮换成自然语言。更合理的变化是：

- 从 App-centric 到 Intent-centric：用户先说目标，系统再决定打开 Claude、Codex、终端、文件夹还是某个脚本。
- 从用户亲自操作到 Agent 执行、用户监督：用户不需要盯着每一步，但需要知道执行是否可靠。
- 从前台窗口到环境式状态层：重要状态可以浮在桌面边缘，只有需要时展开。
- 从固定点按路径到“语义路由 + 确定性动作”：LLM 负责理解意图，脚本负责稳定执行。
- 从单 App 单任务到多 Agent 调度：Claude、Codex、本地脚本、session 日志和用量状态都应该被统一编排。

桌宠在这里不是装饰物，而是一个轻量 OS Agent：它一直在桌面上，但不抢主工作区；它平时安静，靠近时展开；它在 Agent 卡住时提醒，在执行很久时解释，在完成时总结。

### 为什么不是普通语音助手

我没有把 demo 做成一个“你说什么它都回答”的语音助手，因为那会重新落回聊天框范式。

这个 demo 更关心的是系统级动作：

- 打开或聚焦 Claude / Codex。
- 把当前 query 发给对应终端 Agent。
- 查询当前进程或项目进展。
- 打开项目文件夹。
- 截图、刷新用量、进入设置。
- 通过 mock 展示 Agent 编排、等待确认、长时间执行和完成总结。

也就是说，语音不是为了闲聊，而是为了把“点十几个按钮”变成“一句话 + 可监督的执行”。

### 语音优先，但不迷信全自动

语音很适合这些场景：

- “帮我看一下现在有哪些进程。”
- “这个项目进展如何？”
- “帮我打开 Claude。”
- “把这句话发给 Codex。”
- “现在它是不是卡住了？”
- “批准。”

但我没有把所有执行都交给 LLM。原因是 demo 展示里需要稳定、可控、可复现。

当前取舍是：

- LLM 主要做语义路由：理解用户大概想找 Claude、Codex、进程、项目进展还是 mock 演示。
- 真正派活尽量走内置脚本或确定性动作：打开终端、打开项目文件夹、发送 query、刷新用量、播放 mock 流程。
- Agent 输出和项目进展类功能可以逐步从 mock 过渡到读取本地 `.claude` / Codex session 记录。

这样做牺牲了一些“全自动魔法感”，换来了 demo 稳定性和可解释性。

### 终结点按，不等于取消所有按钮

这里的“终结点按式 OS”不是说按钮都消失，而是按钮不再是主要思考方式。

在旧范式里，用户围绕控件组织行为：我要先点 App，再点菜单，再点命令。

在新范式里，用户围绕目标组织行为：我要知道项目进展、我要让 Codex 继续、我要批准这一步、我要把这段任务交给 Claude。按钮仍然存在，但它们更像确认、兜底和快速入口，而不是主要路径。

所以 HUD 里的按钮被控制在少量高价值动作：

- 终端：回到 Agent 执行现场。
- 文件夹：回到项目上下文。
- 截图：把当前屏幕状态交给后续 Agent 或演示流程。
- 用量：理解 Agent 服务是否还能继续跑。
- 设置：配置 LLM / TTS / ASR，而不是把模型细节暴露在主界面。
- Mock：稳定展示新交互范式的理想形态。

### 为什么不是大面板

一个普通 dashboard 可以展示更多信息，但它会把桌宠变成一个悬浮管理后台。

我想保留的是“桌宠在桌面上陪你等 Agent”的感觉，所以 HUD 采用 pet 周围展开的多卡片结构：

- 卡片轻、紧凑、分区明确。
- 鼠标悬浮 pet / HUD / 气泡时共享 hover 保持区域。
- 输入框不强行塞进 HUD，避免 HUD 变成聊天 App。
- 功能按钮尽量用图标和 tooltip，而不是堆 emoji 或大段文字。

## 功能映射

| 课题问题 | Demo 功能 | 用户看到什么 | 当前状态 |
|---|---|---|---|
| Agent 等待时不透明 | Agent 状态卡 | 当前 Agent、阶段、等待确认、最近动作 | 已实现 |
| 信息散落、UI 割裂 | 统一 HUD 视觉体系 | 状态、用量、动作、TTS 气泡风格统一 | 已实现 |
| 不想打开大窗口 | pet 周围展开 HUD | 悬浮桌宠后丝滑展开多卡片 | 已实现 |
| 不知道是否该介入 | permission / waiting 映射 | 等待确认时动画和旁白提醒 | 已实现 |
| 执行很久很焦虑 | TTS 事件旁白 | “我在等什么 / 它现在做什么 / 需要你做什么” | 已实现基础 |
| 想快速派活 | Claude / Codex 快捷按钮 | 输入 query 后发给对应终端 Agent | 已实现基础 |
| 想看进程进展 | Mock 进展问答 | 点击后模拟读取 session、总结项目进展 | Mock 展示 |
| 想展示语音玩法 | Mock 语音流 | 模拟“问进度、确认、继续执行”的节奏 | Mock 展示 |
| 想展示 Agent 编排 | Mock 子任务/动画表演 | pet 进入多 Agent、工作、完成等动画 | Mock 展示 |
| 想控制常用动作 | HUD 工具按钮 | 终端、文件夹、截图、设置、刷新用量 | 已实现基础 |
| 想配置模型 | 设置页模型入口 | LLM / TTS / ASR 三类配置 | 已实现入口 |
| 点按路径太长 | 语义路由入口 | “打开 Claude / 发给 Codex / 查进展”变成一句话或一个快捷按钮 | 已实现基础 |
| OS 缺少 Agent 监督层 | 桌宠常驻 + HUD 状态层 | 不打开大 App 也能知道 Agent 在做什么 | 已实现 |
| 用户不知道该打开哪个工具 | Agent 快捷派活 | 根据意图选择 Claude、Codex 或本地脚本 | 已实现基础 |
| 新 OS 需要可解释执行 | TTS + 状态卡 + mock 进展 | 解释执行者、阶段、卡点和下一步 | 已实现基础 |

## Demo 里什么是真的，什么是 Mock

为了展示清楚，也为了避免把半成品包装成已经完整生产化的 Agent OS，这里明确标注边界。

### 已经是真功能

- 桌宠窗口、hover HUD、拖拽反馈、mini mode、睡眠序列。
- Clawd 动画状态机和多种 Agent 状态映射。
- 统一后的 HUD 卡片、动作栏、TTS 气泡。
- Claude / Codex 快捷派活入口的基础链路。
- 本地设置里的 LLM / TTS / ASR 配置结构。
- TTS 事件旁白基础能力。
- Codex 等已登录服务的用量展示入口，未登录服务不显示。
- macOS DMG 打包和源码启动脚本。

### 当前是 Mock 或半真

- “这个项目进展如何？”目前用于 demo 时可以 mock 出进程进展总结。理想版本会读取当前项目目录下的 `.claude`、Codex session、日志和任务记录。
- “有哪些进程？”目前更偏演示入口。理想版本会聚合本机 Claude / Codex / 终端会话。
- 语音发起复杂任务目前优先展示交互形态，真实执行侧仍建议通过 Claude / Codex 快捷派活或内置脚本。
- ASR 已有配置入口，但不是当前最高优先级完成项。

这个边界是有意保留的：demo 的目标是把体验方向讲明白，而不是假装已经完成一个完整 Agent 操作系统。

## 典型演示流程

可以按这个顺序展示：

1. 启动桌宠，桌面上只出现 Clawd。
2. 鼠标靠近 pet，HUD 在周围展开。
3. 拖动 pet，观察拖拽动画和短句旁白。
4. 打开输入框，输入“帮我打开 Claude”，或输入一段任务后点 Claude / Codex 按钮。
5. 点击 HUD 里的 mock 进展功能，展示“它正在读哪些 session、项目进展如何”的理想效果。
6. 点击 mock Agent 编排或动画表演，展示 thinking / working / debugging / permission / done / subagent 等状态映射。
7. 打开设置，展示 LLM / TTS / ASR 三类模型入口和事件旁白配置。
8. 回到 pet，展示 mini mode、睡眠序列或完成庆祝。

这条路径对应两个课题：

- 杀死 Agent 思考的 30 秒：通过 HUD、动画、TTS、状态映射让等待变得有信息。
- 终结点按式 OS 设计：通过桌宠、语音意图、快捷动作和终端派活，把 Agent 操作变成桌面环境里的自然交互。

## 核心设计取舍

| 取舍点 | 没选的方向 | 当前选择 | 原因 |
|---|---|---|---|
| 信息展示 | 大型 dashboard | pet 周围轻 HUD | 保留桌宠存在感，不把它变成管理后台 |
| 思考展示 | 展示完整思维链 | 展示阶段、工具、事件、摘要 | 用户需要可理解的进展，不需要被内部细节淹没 |
| 执行链路 | LLM 直接控制一切 | LLM 路由 + 内置脚本执行 | demo 更稳定，也更容易解释 |
| 语音交互 | 全双工语音助手 | 事件 TTS + 可扩展 ASR | 先把等待和介入讲清楚，再升级实时语音 |
| Mock 策略 | 所有功能都等真实现 | 关键体验先 mock | 展示方向优先，但明确标注真/半真 |
| 动画系统 | 简化成几个 loading 态 | 保留并强化 Clawd 状态机 | 主项目最大优势就是动画生命感 |
| 输入框 | 塞进 HUD | 保持独立 | HUD 负责状态和动作，不承担完整聊天界面 |
| OS 范式 | 把 AI 做成另一个 App | 把 AI 做成桌面监督层 | Agent 应该跨 App、跨终端、跨任务存在 |
| 点按关系 | 用户找按钮 | 用户表达目标，系统给出动作 | 降低操作路径，把注意力留给判断和确认 |
| 自动化程度 | 完全自治 | 可监督自动化 | demo 场景里可信比炫技更重要 |

## 项目结构

主要目录：

```text
src/        Electron 主进程、桌宠窗口、HUD、动画状态、TTS、设置等核心代码
agents/     Claude / Codex / Gemini / Kimi 等 Agent 适配层
hooks/      各类 Agent hook、session 记录、权限与事件接入
scripts/    启动、sidecar、demo 派活、打包辅助脚本
assets/     图标、声音、SVG 动画、桌宠资源
themes/     主题资源
pwa/        辅助 PWA 入口
```

几个 demo 相关入口：

```text
start-demo.command    macOS 双击源码启动
start-demo.sh         macOS / Linux 终端源码启动
start-demo.bat        Windows 源码启动
scripts/clawd-demo-dispatch.sh
README.md
DEMO-PLAN.md
DEMO-RUNBOOK.md
DEMO-SEED-PROMPT.md
```

## 本地运行

如果没有看到 DMG，或者你在 Windows / Linux 上看 demo，可以从源码启动。

macOS 双击启动：

```text
start-demo.command
```

macOS / Linux 终端启动：

```bash
./start-demo.sh
```

Windows 双击或命令行启动：

```bat
start-demo.bat
```

这些脚本会检查 Node.js/npm，首次运行时自动安装依赖，然后复用项目已有启动命令。
macOS 脚本会优先通过 `open` 拉起 Electron，避免从临时 shell 启动时父进程退出导致窗口闪退。

源码启动需要本机已安装 Node.js/npm。macOS 如果提示脚本无权限，执行：

```bash
chmod +x start-demo.command start-demo.sh
```

手动启动方式：

```bash
node scripts/ensure-sidecar-binaries.js
node launch.js
```

如果本机有 npm，也可以：

```bash
npm start
```

## 模型与语音配置

设置页包含三类模型入口：

- 对话模型 LLM：`baseURL`、`model`、`apiKey`
- TTS：`baseURL`、`model`、`voice`、`apiKey`
- ASR：`baseURL`、`model`、`apiKey`

固定事件旁白内容可以在设置中调整，例如：

- 拖拽时说什么。
- 等待确认时怎么提醒。
- 报错时怎么解释。
- 长时间执行时怎么安抚。
- 完成时怎么总结。

API Key 不提交到仓库，也不写进包内。

## 打包

项目内置 demo 打包脚本：

```bash
npm run build:demo:mac
```

当前环境如果没有系统 npm，可以用项目已有 Electron 运行 builder。示例：

```bash
ELECTRON_RUN_AS_NODE=1 \
CSC_IDENTITY_AUTO_DISCOVERY=false \
./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron \
-e "process.noAsar=true; process.argv=[process.argv[0],'--mac','dmg','--arm64','--publish','never']; require('./node_modules/electron-builder/cli.js')"
```

产物路径：

```text
dist/Kill-The-Time-Demo-0.1.0-arm64.dmg
```

## 下一步

如果继续往完整产品推进，我会优先做这些：

1. 真正读取 `.claude` / Codex session 记录，生成“项目进展”和“当前卡点”摘要。
2. 把 ASR 从设置入口推进到稳定的 push-to-talk 语音命令。
3. 给 Claude / Codex 派活链路增加更强的会话发现、终端选择和失败反馈。
4. 把 mock 动画演示整理成可录屏的一键 demo 剧本。
5. 增加 Windows 安装包和 macOS notarization，减少首次打开阻力。
6. 把桌宠从单项目 demo 扩展成系统级 Agent 控制层：发现会话、理解上下文、路由任务、监督多个 Agent。

## 说明

本 demo 基于 Clawd on Desk 改造，保留主项目优秀的桌宠动画、状态机、眼动追踪、睡眠序列、mini mode 和拖拽反馈，并针对“Agent 监工/调度者”体验做了 HUD、派活、旁白、mock 展示优化。

相关版权与第三方资产说明见 [NOTICE.md](NOTICE.md) 和 [assets/LICENSE](assets/LICENSE)。
