# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, use **GitHub Private Vulnerability Reporting**:

1. Go to the [Security tab](https://github.com/Cipher208/mimocode-rtk-hook/security) of the repository
2. Click "Report a vulnerability"
3. Fill in the form with details about the vulnerability

You should receive a response within 48 hours. If the vulnerability is confirmed, a fix will be released as soon as possible.

## Scope

This project is a MiMoCode hook file (~50 lines). Security concerns are limited to:

- **Command injection** — The hook rewrites shell commands. Ensure rewrite rules don't introduce injection vectors.
- **File system access** — The hook writes to a log file when `RTK_HOOK_LOG` is set. Ensure the log path is safe.
- **RTK binary** — The hook delegates to `rtk rewrite`. Ensure RTK is installed from the official source.
