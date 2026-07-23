# Contributing to mimocode-rtk-hook

Thanks for your interest in contributing!

## Quick Start

1. Fork the repository
2. Clone your fork
3. Create a branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Test with MiMoCode
6. Commit: `git commit -m "feat: add X"`
7. Push: `git push origin feature/my-feature`
8. Open a Pull Request

## Development

### Testing the hook

1. Copy the hook to your MiMoCode config:
   ```bash
   cp hooks/rtk.ts ~/.config/mimocode/hooks/
   ```

2. Restart MiMoCode

3. Run a command and verify it's rewritten:
   ```bash
   # Should execute as "rtk ls /tmp"
   ls /tmp
   ```

4. Enable debug logging:
   ```bash
   export RTK_HOOK_LOG=/tmp/rtk-hook.log
   ```

### Adding rewrite rules

Edit `hooks/rtk.ts` and add a new entry to the `RULES` array:

```typescript
[/^mycommand(\s|$)/, (c) => c.replace(/^mycommand/, "rtk mycommand")],
```

### Code Style

- TypeScript
- No external dependencies (the hook must be self-contained)
- No `console.log` in production (use `RTK_HOOK_LOG` for debugging)

## Pull Request Guidelines

- Keep changes focused — one feature/fix per PR
- Test with MiMoCode before submitting
- Update README.md if adding new features
- Follow existing code style

## Reporting Issues

Use [GitHub Issues](https://github.com/Cipher208/mimocode-rtk-hook/issues) for bug reports and feature requests.

For security vulnerabilities, see [SECURITY.md](SECURITY.md).
