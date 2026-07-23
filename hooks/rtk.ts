/**
 * RTK (Rust Token Killer) hook for MiMoCode
 *
 * Automatically rewrites shell commands to use RTK for token-optimized output.
 * Requires: rtk >= 0.43.0 in PATH
 *
 * Installation:
 *   cp hooks/rtk.ts ~/.config/mimocode/hooks/
 *
 * All rewrite logic lives in RTK's Rust `rtk rewrite` registry.
 * To change rewrite rules, edit the Rust registry — not this file.
 */

import { writeFileSync } from "fs"

const LOG = process.env.RTK_HOOK_LOG || ""

function log(msg: string) {
  if (LOG) writeFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`, { flag: "a" })
}

const RULES: [RegExp, (c: string) => string][] = [
  // Git — status, diff, log, add, commit, push, pull, branch, fetch, stash, show
  [/^git\s+status(\s|$)/, (c) => c.replace(/^git status/, "rtk git status")],
  [/^git\s+diff(\s|$)/, (c) => c.replace(/^git diff/, "rtk git diff")],
  [/^git\s+log(\s|$)/, (c) => c.replace(/^git log/, "rtk git log")],
  [/^git\s+add(\s|$)/, (c) => c.replace(/^git add/, "rtk git add")],
  [/^git\s+commit(\s|$)/, (c) => c.replace(/^git commit/, "rtk git commit")],
  [/^git\s+push(\s|$)/, (c) => c.replace(/^git push/, "rtk git push")],
  [/^git\s+pull(\s|$)/, (c) => c.replace(/^git pull/, "rtk git pull")],
  [/^git\s+branch(\s|$)/, (c) => c.replace(/^git branch/, "rtk git branch")],
  [/^git\s+fetch(\s|$)/, (c) => c.replace(/^git fetch/, "rtk git fetch")],
  [/^git\s+stash(\s|$)/, (c) => c.replace(/^git stash/, "rtk git stash")],
  [/^git\s+show(\s|$)/, (c) => c.replace(/^git show/, "rtk git show")],
  // GitHub CLI
  [/^gh\s+(pr|issue|run|api|release)(\s|$)/, (c) => c.replace(/^gh /, "rtk gh ")],
  // Files — ls, cat, grep, find, tree
  [/^ls(\s|$)/, (c) => c.replace(/^ls/, "rtk ls")],
  [/^cat(\s|$)/, (c) => c.replace(/^cat/, "rtk read")],
  [/^grep(\s|$)/, (c) => c.replace(/^grep/, "rtk grep")],
  [/^find(\s|$)/, (c) => c.replace(/^find/, "rtk find")],
  [/^tree(\s|$)/, (c) => c.replace(/^tree/, "rtk tree")],
  // Docker
  [/^docker\s+(ps|images|logs)(\s|$)/, (c) => c.replace(/^docker/, "rtk docker")],
  // Kubernetes
  [/^kubectl\s+(get|logs|describe)(\s|$)/, (c) => c.replace(/^kubectl/, "rtk kubectl")],
  // Rust/Cargo
  [/^cargo\s+(test|build|clippy|check|install)(\s|$)/, (c) => c.replace(/^cargo/, "rtk cargo")],
  // Python — pytest, ruff
  [/^pytest(\s|$)/, (c) => c.replace(/^pytest/, "rtk pytest")],
  [/^ruff\s+(check|format)(\s|$)/, (c) => c.replace(/^ruff/, "rtk ruff")],
  // Go
  [/^go\s+(test|build|lint)(\s|$)/, (c) => c.replace(/^go/, "rtk go")],
  // npm/pnpm
  [/^npm\s+(test|run|list|outdated)(\s|$)/, (c) => c.replace(/^npm/, "rtk npm")],
  [/^pnpm\s+(test|run|list)(\s|$)/, (c) => c.replace(/^pnpm/, "rtk pnpm")],
  // curl with output
  [/^curl(\s+--silent|\s+-s)(\s|$)/, (c) => c.replace(/^curl/, "rtk curl")],
  // wget
  [/^wget(\s|$)/, (c) => c.replace(/^wget/, "rtk wget")],
]

function rewriteLine(line: string): string {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) return line
  if (trimmed.startsWith("rtk ")) return line
  for (const [re, rw] of RULES) {
    if (re.test(trimmed)) return rw(trimmed)
  }
  return line
}

function rewrite(cmd: string): string | null {
  if (!cmd || typeof cmd !== "string") return null
  const lines = cmd.split("\n")
  let changed = false
  const result = lines.map((line) => {
    const rewritten = rewriteLine(line)
    if (rewritten !== line) changed = true
    return rewritten
  })
  return changed ? result.join("\n") : null
}

export default {
  "tool.execute.before": async (
    input: { tool: string },
    output: { args: any },
  ) => {
    const tool = input.tool?.toLowerCase()
    if (tool !== "bash" && tool !== "shell") return
    const args = output.args
    if (!args || typeof args !== "object") return
    const command = args.command
    if (typeof command !== "string" || !command) return
    const rewritten = rewrite(command)
    if (rewritten) {
      log(`REWRITE: ${JSON.stringify(command)} -> ${JSON.stringify(rewritten)}`)
      args.command = rewritten
    }
  },
}
