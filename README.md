# mimocode-rtk-hook

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MiMoCode](https://img.shields.io/badge/MiMoCode-%3E%3D0.38.0-blue.svg)](https://github.com/nicepkg/mimocode)
[![RTK](https://img.shields.io/badge/RTK-%3E%3D0.43.0-red.svg)](https://github.com/rtk-ai/rtk)

> Shell commands cost 60-90% fewer tokens — just install one file, restart MiMoCode.

Your AI agent runs `git status` → 200 lines of output → $0.002 per call. This hook rewrites it to `rtk git status` → 5 lines → $0.0001. Same information, 97% cheaper. Works automatically — no `rtk` prefix needed.

## How it works

MiMoCode has a **file hooks** system that loads TypeScript/JavaScript files from `~/.config/mimocode/hooks/`. This hook uses the `tool.execute.before` hook to intercept shell commands and rewrite them through RTK before execution.

```
Agent calls: ls /tmp
  ↓ hook intercepts
Rewritten:  rtk ls /tmp
  ↓ shell executes
Output:     compact tree format (60-90% smaller)
```

## Prerequisites

- [RTK](https://github.com/rtk-ai/rtk) >= 0.43.0 installed and in PATH
- MiMoCode >= 0.38.0

```bash
# Install RTK
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Verify
rtk --version
```

## Installation

```bash
# Clone the repo
git clone https://github.com/Cipher208/mimocode-rtk-hook.git /tmp/mimocode-rtk-hook

# Copy the hook file
mkdir -p ~/.config/mimocode/hooks
cp /tmp/mimocode-rtk-hook/hooks/rtk.ts ~/.config/mimocode/hooks/

# Restart MiMoCode
```

Or one-liner:

```bash
mkdir -p ~/.config/mimocode/hooks && curl -fsSL https://raw.githubusercontent.com/Cipher208/mimocode-rtk-hook/master/hooks/rtk.ts -o ~/.config/mimocode/hooks/rtk.ts
```

No config changes needed — MiMoCode auto-discovers files in `hooks/`.

## Verify

After restarting MiMoCode, run a command:

```bash
ls /tmp
```

Check that it executes as `rtk ls /tmp` by looking at the output format (tree vs list).

## Debugging

Set the `RTK_HOOK_LOG` environment variable to log rewrite activity:

```bash
export RTK_HOOK_LOG=/tmp/rtk-hook.log
```

Then check the log:

```bash
tail -f /tmp/rtk-hook.log
```

## Supported commands

| Command | Rewritten to |
|---------|-------------|
| `ls` | `rtk ls` |
| `cat` | `rtk read` |
| `grep` | `rtk grep` |
| `find` | `rtk find` |
| `tree` | `rtk tree` |
| `git status/diff/log/add/commit/push/pull/branch/fetch/stash/show` | `rtk git ...` |
| `gh pr/issue/run/api/release` | `rtk gh ...` |
| `docker ps/images/logs` | `rtk docker ...` |
| `kubectl get/logs/describe` | `rtk kubectl ...` |

Commands already prefixed with `rtk` are passed through unchanged.

Multi-line scripts are processed line-by-line — each command in a script is independently rewritten.

## How MiMoCode file hooks work

MiMoCode scans `hook/` and `hooks/` directories in the config path for `*.ts` and `*.js` files. Each file must `export default` a `Hooks` object (from `@mimo-ai/plugin`).

File hooks are:
- **Compiled** with Bun.build on load (TypeScript works)
- **Hot-reloaded** when the file changes on disk
- **Circuit-breakered** — skipped after 3 consecutive failures

Available hooks: `tool.execute.before`, `tool.execute.after`, `shell.env`, `event`, `chat.message`, `session.pre`, `session.post`, and more. See the [MiMoCode plugin SDK](https://www.npmjs.com/package/@mimo-ai/plugin) for the full `Hooks` interface.

## Examples

### Safety guard

Block dangerous commands:

```typescript
// ~/.config/mimocode/hooks/safety.ts
export default {
  "tool.execute.before": async (input, output) => {
    if (input.tool !== "bash") return
    const cmd = output.args?.command ?? ""
    if (/rm\s+-rf\s+\//.test(cmd)) {
      output.cancel = true
      output.cancelReason = "Blocked: dangerous rm -rf on root"
    }
  },
}
```

### Inject environment variables

```typescript
// ~/.config/mimocode/hooks/env.ts
export default {
  "shell.env": async (input, output) => {
    output.env.NODE_ENV = "development"
    output.env.DEBUG = "true"
  },
}
```

### Auto-approve reads

```typescript
// ~/.config/mimocode/hooks/auto-read.ts
export default {
  "permission.ask": async (input, output) => {
    if (["read", "glob", "grep"].includes(input.permission)) {
      output.status = "allow"
    }
  },
}
```

## Comparison with external plugins

MiMoCode's **external plugin system** (`"plugin": ["..."]` in config) discovers plugin files but does not execute their module code. File hooks (`hooks/*.ts`) are the only working mechanism for custom hook logic.

| Mechanism | Status | Works? |
|-----------|--------|--------|
| External plugins (`"plugin": [...]`) | Module code never executed | No |
| File hooks (`hooks/*.ts`) | Compiled and executed | Yes |
| Internal plugins (compiled into binary) | Always work | Yes |

## License

MIT
