# Kill The Time Demo

一个“会监工的桌宠 Agent”展示 demo。

它不是普通 dashboard，而是把 Agent 执行时最无聊、最不确定的等待时间变成可看、可问、可点、可听的桌面交互：桌宠负责监督进程、解释状态、提醒确认、展示动画，并把语音/文本指令路由给 Claude、Codex 等终端 Agent。

## 下载

macOS Apple Silicon demo 包会放在 GitHub Releases：

[下载 Kill-The-Time-Demo-0.1.0-arm64.dmg](https://github.com/lala1137273514/kill-the-time-demo/releases/tag/v0.1.0-demo)

说明：

- 当前包是 `arm64`，适合 Apple Silicon Mac。
- 当前包是 ad-hoc 签名，未 Apple notarization。首次打开如果 macOS 拦截，可在“系统设置 → 隐私与安全性”里允许打开。
- API Key 不会写进代码或包内。LLM/TTS/ASR 配置从本地设置读取。

## Demo 重点

- 鼠标悬浮桌宠时，HUD 会在 pet 周围展开。
- HUD 包含 Agent 状态、用量、常用动作、Mock 演示入口。
- 支持 Claude / Codex 快捷派活入口。
- 支持 TTS 旁白，用来解释 Agent 正在做什么、在等什么、是否需要用户确认。
- 保留主项目的 Clawd 动画体系：眼动、睡眠序列、mini mode、拖拽反馈、工作/调试/报错/完成/子任务动画。
- 提供 mock demo，用于展示“如何杀死 Agent 思考的 30 秒”和“没有 App 按钮时如何玩 Agent”。

## 主要交互

- 悬浮 pet：展开 HUD。
- 拖动 pet：进入拖拽动画和短句旁白。
- 右键 pet：打开快捷菜单。
- HUD 按钮：
  - 终端：打开/聚焦终端。
  - 文件夹：打开当前项目目录。
  - 截图：触发截图动作。
  - 用量：刷新 Codex / Claude 等已登录服务用量。
  - Mock：展示进程进展、语音流、Agent 编排、动画状态机表演。
- 输入框 Claude / Codex 按钮：把当前 query 发送到对应终端 Agent。

## 本地运行

```bash
node scripts/ensure-sidecar-binaries.js
node launch.js
```

如果本机有 npm，也可以：

```bash
npm start
```

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

## 配置

设置页包含三类模型配置入口：

- 对话模型 LLM：`baseURL`、`model`、`apiKey`
- TTS：`baseURL`、`model`、`voice`、`apiKey`
- ASR：`baseURL`、`model`、`apiKey`

固定事件旁白内容可在设置中调整，例如拖拽、等待确认、报错、长时间执行、完成总结等。

## 说明

本 demo 基于 Clawd on Desk 改造，保留主项目优秀的桌宠动画、状态机、眼动追踪、睡眠序列、mini mode 和拖拽反馈，并针对“Agent 监工/调度者”体验做了 HUD、派活、旁白、mock 展示优化。

相关版权与第三方资产说明见 [NOTICE.md](NOTICE.md) 和 [assets/LICENSE](assets/LICENSE)。
