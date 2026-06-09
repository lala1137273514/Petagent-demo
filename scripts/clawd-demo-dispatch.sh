#!/usr/bin/env bash
set -euo pipefail

cwd=""
agent="codex"
prompt_file=""
codex_bin="codex"
claude_bin="claude"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cwd)
      cwd="${2:-}"
      shift 2
      ;;
    --agent)
      agent="${2:-codex}"
      shift 2
      ;;
    --prompt-file)
      prompt_file="${2:-}"
      shift 2
      ;;
    --codex-bin)
      codex_bin="${2:-codex}"
      shift 2
      ;;
    --claude-bin)
      claude_bin="${2:-claude}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$cwd" || ! -d "$cwd" ]]; then
  echo "Clawd demo dispatch: working directory is missing or invalid: $cwd" >&2
  exit 2
fi

if [[ -z "$prompt_file" || ! -f "$prompt_file" ]]; then
  echo "Clawd demo dispatch: prompt file is missing: $prompt_file" >&2
  exit 2
fi

prompt="$(cat "$prompt_file")"
rm -f "$prompt_file" || true

cd "$cwd"
clear || true

printf "Clawd Demo Dispatch\n"
printf "===================\n\n"
printf "工作目录: %s\n" "$cwd"
printf "目标 Agent: %s\n\n" "$agent"
printf "任务:\n%s\n\n" "$prompt"

run_demo_fallback() {
  printf "没有找到可用的 %s CLI，进入可展示的本地模拟流程。\n\n" "$agent"
  printf "[1/5] 理解任务语义...\n"
  sleep 0.5
  printf "[2/5] 检查项目结构...\n"
  sleep 0.5
  printf "[3/5] 规划改动路径...\n"
  sleep 0.5
  printf "[4/5] 等待真实 Agent 接入或手动执行...\n"
  sleep 0.5
  printf "[5/5] Demo 流程完成。\n\n"
  printf "提示: 安装并登录 Codex 或 Claude CLI 后，这里会执行真实 agent run。\n"
}

if [[ "$agent" == "codex" ]]; then
  if command -v "$codex_bin" >/dev/null 2>&1 || [[ -x "$codex_bin" ]]; then
    printf "启动 Codex...\n\n"
    "$codex_bin" exec "$prompt"
  else
    run_demo_fallback
  fi
elif [[ "$agent" == "claude" ]]; then
  if command -v "$claude_bin" >/dev/null 2>&1 || [[ -x "$claude_bin" ]]; then
    printf "启动 Claude Code...\n\n"
    printf "%s" "$prompt" | "$claude_bin" -p --permission-mode "${CLAWD_DISPATCH_PERMISSION_MODE:-default}"
  else
    run_demo_fallback
  fi
else
  run_demo_fallback
fi

printf "\nClawd runner 已结束。按任意键关闭这个窗口。"
read -r -n 1 -s || true
