# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-23

### Added

- Initial release
- `tool.execute.before` hook for automatic command rewriting
- Rewrite rules for git, gh, ls, cat, grep, find, tree, docker, kubectl
- Multi-line script support (line-by-line processing)
- Debug logging via `RTK_HOOK_LOG` environment variable
- Safety: skips comments, empty lines, and commands already prefixed with `rtk`
