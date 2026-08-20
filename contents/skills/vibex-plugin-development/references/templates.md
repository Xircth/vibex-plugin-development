# init 模板产物

`vibex-plugin init <dir> --publisher <id> --template <name>`

| 模板 | 清单 integrations | 源码 | 作者补齐 |
| --- | --- | --- | --- |
| `skill` | `content.skill` | `contents/skills/hello/SKILL.md` | 改 summary 与 Skill 正文 |
| `mcp` | `content.mcp` | `contents/mcps/hello.json` + `runtime/mcp.mjs` | 实现 MCP 进程 |
| `hooks` | `content.hook` | `contents/hooks/before-prompt.md` | 改 Hook 正文 |
| `file-tab` | `.txt` 的 `file.opener`+`artifact.preview`，以及 `plugin.detail.panel` | Node Worker 定义、`runtime/app.mjs` | 接 stdio 入口；可编辑文件 Tab 按 contract 四步另行声明 |
| `full` | Workflow + file-tab 那一组 | Node Worker 定义、App、workflow JSON | 接 stdio 入口 |
| `ts-worker` | Workflow | `runtime/main.ts` 定义 | `main.mjs` 调用 `runStdioPluginWorker` |
| `node-worker` | Workflow | `runtime/main.mjs` 定义 | 调用 `runStdioPluginWorker` |
| `python-worker` | Workflow | `runtime/worker.py`（已含 stdio） | `requires-python >=3.12` |
| `rust-worker` | Workflow | `runtime/src/main.rs`（已含 stdio） | 编译二进制并改 `entrypoints.worker.path` |
| `host-service` | `host.service` | Node Worker 定义 | 接 stdio；`intervalSeconds` 缺省 30 |

`--template agent` 已删除。
