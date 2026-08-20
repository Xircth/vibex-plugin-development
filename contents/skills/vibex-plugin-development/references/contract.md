# 产品包契约

对照 Host 0.1.3、协议 1.1、SDK 1.0.0。

## 目录

```text
my-plugin/
├─ .vibex-plugin/plugin.json
├─ .vibex-plugin/content.index.json
├─ .vibex-plugin/package.lock.json    # pack 或 install --link 写入
├─ README.md                          # frontmatter.summary 必填
├─ config.json                        # 配置唯一事实
├─ contents/                          # Skill / MCP / Hook / Workflow / 其它
├─ depends/                           # 仅当 dependencies 引用时
├─ runtime/                           # 作者源码
└─ dist/                              # build 输出
```

`vibex-plugin build`：校验 summary、schema、索引、integrations、dependencies；编译 `runtime/main.mjs` → `dist/worker.mjs`；编译 App 与 `managedRuntime.source`。

`vibex-plugin pack` 与 `install --link`：写入 `package.lock.json`，`.vxp` 收录 README、config 初值、contents、depends、dist、`.vibex-plugin`。

## plugin.json 要点

- `manifestVersion` 4，`apiVersion` `"1.0"`，`readme` `"README.md"`。
- `engines.vibex` 例：`>=0.1.3 <1.0.0`；`engines.pluginSdk`：`^1.0.0`。
- Worker：`path`、`runtime`（`node`|`python`|`native`）、`protocol` `"1.1"`。禁止字段 `format`。
- App：`root`、`document`、`protocol` `"1.0"`。
- v4 缺省执行类 `full-trust`。Isolated 属于 v5：`packages/plugin-contract/schemas/plugin.v5-isolated.json`。
- `dependencies[].kind` 为 `runtime` 或 `plugin`；`descriptor` 指向 `depends/` 下文件。

## handler id

```text
^[a-z][A-Za-z0-9]*(?:[.-][a-z][A-Za-z0-9]*)*$
```

`.` 或 `-` 之后的每一段以小写字母开头。

## integrations

`file.opener` 声明恰好一个 `previewProvider` 或恰好一个 `editorSurface`。编辑面的 `app.surface.slot` 必须是 `artifact.editor`，`appEntrypoint` 为 `app`，`handler` 为 `surface.createSession`。

`content.skill` 的 `resource` 指向 `contents/` 下已存在路径。官方包使用技能目录（内含 `SKILL.md`）。内容索引 `items[].path` 指向具体文件。

`host.service`：`intervalSeconds` 下限 5，缺省 30；同一包最多 8 条。

`app.status`：界面最多展示 3 条。

托管 MCP `managedRuntime.protocolRevision` 必须为 `2026-07-28`。入口为包内 `entrypoint`，或 `kind: "hostFamilyBinary"` 加 `binaryId`。

## 可编辑文件 Tab

1. `file.opener`：`extensions` / `fileNameSuffixes` / `mediaTypes` 之一，并设 `editorSurface`。
2. `app.surface`：`slot: artifact.editor`，`handler: surface.createSession`。
3. Worker 注册该 handler。
4. App：`readText()` 保留 revision；`writeText(content, expectedRevision)`。冲突码 `artifact_revision_conflict`。

Host 持有规范路径。App 获得文件名、revision 与 `bridge.artifact`。

## Host capability（Worker `host.call`）

| 调用 | 结果 |
| --- | --- |
| `runtime.execute` | 按 Runtime lock 启动进程 |
| `artifact.preview` | 打开预览；需要约 30 秒单次 `artifactHandle` |
| `storage.kv.*` | 按插件 ID 隔离的进程内 KV |
| `storage.settings.*` | 回传本次 input；持久设置写 `config.json` |
| `log.*` | scoped 诊断 |
| `network.fetch` | `network_denied`；Full Trust 用语言运行时联网 |
| `files.*` | `files_root_denied` |
| `conversation.read.get` / `conversation.append.enqueueInput` | `conversation_scope_denied` |
| `agent.invoke` | `handler_not_visible` |
| `secrets.*` | `{ "present": false }` |
| `artifact.readText` / `writeText` | `artifact_not_found`；文本 I/O 在 App bridge |
| 其它 | `capability_unimplemented` |

## 协议握手

`initialize`（谈成 `1.1`，此时 `registrations` 为空）→ `activate`（回复已注册 handler）→ `invoke` / `ping` / `dispose`。单帧 1 MiB，请求缺省超时 30 秒。
