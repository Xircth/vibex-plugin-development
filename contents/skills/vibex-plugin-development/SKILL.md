---
name: vibex-plugin-development
description: >
  按当前 Host 的 v4 契约创建、校验、测试、链接并打包 VibeX 产品插件。
  覆盖 README summary、contents、config.json、integrations、Worker/App/MCP/Skill、
  可编辑文件 Tab、stdio 入口、candidate 激活、.vxp 与市场发布。
  Use when the user runs /create-skill, /create-plugin, /vibex-plugin, or asks to
  开发/创建/编写/调试 VibeX 插件、.vibex-plugin/plugin.json、@vibex/plugin-sdk、
  vibex-plugin CLI、vibex plugin add --dev、vibex plugin publish、linked install.
---

# VibeX 插件开发

做一个**用户可安装的产品包**，对着**本机正在运行的 Host 所附带的 SDK 与 CLI** 写。App、Agent、Host、Runtime 是包内部接线，不是插件分类。

完成标准见文末「完成门」。任何一步失败就停在该步，按「排障」处理后继续。契约细节以本 Skill 旁的参考和本机 SDK 类型为准，不要用网上示例顶替。

## 0. 定位本机契约

按顺序尝试，成功即停止：

1. 当前工作区根同时存在 `CONTEXT.md` 与 `packages/plugin-sdk`：这是 VibeX 源码树。
   - 执行 `python3 .agents/skills/vibex-plugin-development/scripts/locate_toolchain.py`
   - 阅读输出 `required` 中的每一份文件；`missing` 非空则先补齐。
   - 作者 CLI：`node packages/plugin-cli/dist/cli.js`（下文记为 `vibex-plugin`）。
   - 产品 CLI：仓库里的 `npx-cli`（下文 `vibex plugin …`）。
2. 否则执行 `vibex-plugin toolchain`。读打印的 `cli`、`js`、`python`、`rust`、`templates`。Host 版本当前为 `0.1.3`。
3. 否则使用 Host 可执行文件同目录下的 `vibex-plugin`。

随后阅读：

- [references/contract.md](references/contract.md) — 目录、清单、integrations
- [references/templates.md](references/templates.md) — `init` 实际写出的产物
- [references/runtime.md](references/runtime.md) — Worker / App / stdio / `host.call` / 测试
- [references/link.md](references/link.md) — 链接运行中的 Host 与发布

只使用公开 SDK：`@vibex/plugin-sdk` 及其 `/worker`、`/app`、`/testing`、`/protocol`、`/stdio`；Python `vibex_plugin`；Rust `vibex-plugin-sdk`。公共 SDK 表达不了的能力：先在 Host 补通用 capability 与 SDK 导出，再写进插件。禁止把 VibeX `crates/` 或 `src-tauri/` 拷进插件。

## 1. 确认产品边界

动手前向用户逐项确认并写下答案：

1. 产品显示名。
2. 一句话 `summary`（纯文本，最多 200 个 Unicode 字符）。
3. `publisher` 与 `id`（`id`：`^[a-z0-9][a-z0-9._-]{1,62}$`；`publisher`：`^[a-z0-9][a-z0-9._-]{0,62}$`）。
4. 用户启用后能完成的操作。
5. 需要的 integration 种类（对照 [templates.md](references/templates.md) 与 [contract.md](references/contract.md)）。
6. 开发目录的绝对路径。缺省在当前工作区旁新建 `<id>` 目录。

用户没有指定模板时：只投影知识用 `skill`；只要托管 MCP 用 `mcp`；只要 Hook 用 `hooks`；只要周期任务用 `host-service`；只要 `.txt` 只读预览加详情面板用 `file-tab`；可编辑 UTF-8 文件 Tab 用 `editor-tab`；Worker+App+Workflow 用 `full`。参考实现：Office（预览 + Runtime）、Workflow Creator（`artifact.editor`）。

## 2. 初始化

```text
vibex-plugin init <dir> --publisher <publisher> --template <template>
```

`init` 会写清单、README、`config.json`、内容索引、测试，并立刻 `build`。默认模板 `full`。Node / TS / file-tab / editor-tab / full / host-service 已写出 `runStdioPluginWorker` 入口，不要删掉。

然后立刻：

1. 把 README frontmatter 的 `summary` 改成第 1 步记下的那句话。
2. 改 `plugin.json` 的 `id`、`name`。
3. 确认 `engines` 为 `{ "vibex": ">=0.1.3 <1.0.0", "pluginSdk": "^1.0.0" }`。
4. 确认 Node 包 `runtime/main.mjs` 调用 `runStdioPluginWorker`，测试从定义模块导入。

## 3. 组装产品包

按 [contract.md](references/contract.md) 核对目录与清单。只声明稳定面上真实实现的 integration。最低要求：至少一项 Host 认识的 integration。Skill 可选。

固定约定：

- `readme` = `README.md`；`content.root` = `contents`；配置文件 = 根 `config.json`。
- Worker：`runtime` 为 `node` | `python` | `native`，`protocol` 为 `"1.1"`。不要写 `format`。
- App：`protocol` 为 `"1.0"`，`root` + `document` 指向 `dist/app/index.html`。
- `.vibex-plugin/content.index.json` 的 `items[].path` 必须是 `contents/` 下的真实文件。
- `dependencies` 只声明 `kind: "runtime"`，descriptor 指向 `depends/` 下已存在的文件。CLI `validate` 与 Host inspect 都拒绝 `kind: "plugin"`。
- `permissions` 可省略。安装或启用即 Full Trust，不产生逐能力审批。
- `app.surface.slot` 只能是 `plugin.detail.panel` 或 `artifact.editor`。

把用户说明写进 README 正文：运行要求、离线与网络、排障、第三方许可、卸载后配置去留。持久设置只写 `config.json`，并在 `config.schema` 描述。

官方包可对照，但不要复制其内部实现：`vibex.office`、`vibex.workflow-creator`、`vibex.session-enhance`、`vibex.multi-agent`。

## 4. 实现可执行入口

细节见 [runtime.md](references/runtime.md)。

**Node Worker**（`node-worker` / `ts-worker` / `full` / `file-tab` / `editor-tab` / `host-service`）：Host 执行 `node --max-old-space-size=128 dist/worker.mjs`。该文件必须在顶层进入协议 1.1 循环。`definePluginWorker` 在 `runtime/worker.mjs`，`runtime/main.mjs` 调用 `runStdioPluginWorker`。`vibex-plugin build` 打包 `runtime/main.mjs` → `dist/worker.mjs`。

**Python Worker**：`runtime/worker.py` 已含 `run_stdio_plugin_worker`。`requires-python = ">=3.12"`。Host Isolated 解释器为 CPython 3.12.11。

**native Worker**：`entrypoints.worker.path` 必须指向**已编译二进制**。在与 Host 相同的 OS/CPU 上编译，把产物放到 `dist/`，再改清单 path。`vibex-plugin build` 编译 JS Worker 与托管 MCP 源，不编译 Rust。

**App**：`definePluginApp`。首屏挂上之后调用 `bridge.ready()`。可编辑文件使用 `bridge.artifact.readText()` / `writeText(content, expectedRevision)`。冲突码 `artifact_revision_conflict`。`app.surface` 的 `slot` 只能是 `plugin.detail.panel` 或 `artifact.editor`，`appEntrypoint` 为 `app`，`handler` 为 `surface.createSession`。

**托管 MCP**：资源 JSON 的 `managedRuntime.protocolRevision` 必须是 `2026-07-28`。两种入口：包内 `source` + `entrypoint`（CLI 会编译 source），或 `kind: "hostFamilyBinary"` 加 `binaryId`。默认绑定 `all-compatible-agents`。官方产品面只有 `session`、`delegation`、`workflow`。

handler id 必须匹配 `^[a-z][A-Za-z0-9]*(?:[.-][a-z][A-Za-z0-9]*)*$`。合法：`hello`、`surface.createSession`、`office-preview`。非法：`Hello`、`save.XML`、`task.1`。

## 5. 测试

在 `test/*.test.mjs` 覆盖适用路径：

- 声明式：summary、schema、索引、integration 引用。
- Worker：`createWorkerHarness` 注册、invoke、未声明 handler、dispose。
- generation：`createGenerationHarness` 在缺 required handler 时回滚。
- App / 文件 Tab：`createAppHarness` 的 read、write、revision 冲突、revoke。

Worker 测试从**定义模块**导入（`runtime/worker.mjs`），不要从 `dist/worker.mjs` 导入——stdio 入口在 import 时会抢 stdin。`vibex-plugin test` 会先 `build`，再把测试打进临时目录；禁止用 `import.meta.url` 去读插件根文件，把需要对照的 JSON/句子写成模块导出。

`init` 生成的无 Worker 测试若仍用 `import.meta.url` 读 `plugin.json`，在 `vibex-plugin test` 下会找不到文件。改成 fixture 导出。

## 6. 本机校验

在插件根目录：

```text
vibex-plugin build
vibex-plugin validate
vibex-plugin test
```

`build` 校验清单并编译 `runtime/main.mjs` → `dist/worker.mjs`（以及 App、`managedRuntime.source`）。`pack` 才写入 `.vibex-plugin/package.lock.json`。Harness 绿了不算完。

## 7. 链接运行中的 Host

按 [link.md](references/link.md)。产品入口：

```text
vibex plugin add --dev . -y
```

它 build、validate，经本机 Host token 调用 `plugin_control_import`（`developerLink`），并尝试启用。未加 `--detach` 时把该插件 Worker stderr 打到当前终端。Host 未运行时，链接会写入 `~/.vibex/imports/links.jsonl`，等 Desktop 或 Server 下次启动再导入。不要向用户索要 token。

`vibex-plugin install --link` / `dev` 若仍实现，只能作为同一 Host import 的别名。优先使用 `add --dev`。

链接之后：在「设置 → 插件」启用被开发的包（若尚未启用），按声明的 integration 点一遍用户路径，再 `vibex plugin list` 或 `vibex-plugin doctor .`。需要走真实安装路径时执行 `vibex plugin test --host`。

## 8. 打包与分发

```text
vibex-plugin pack [--output file.vxp]
```

或 `vibex plugin pack [dir] [--output file.vxp]`。打印 `sha256:`。发布物含 README、config 初值、contents、depends、dist、`.vibex-plugin`。不含 `runtime/`、`test/`、`package.json`、source map、`.git`、`node_modules`。

本机安装：

```text
vibex plugin add --profile file.vxp -y
```

Git 源：`vibex plugin add --web <git>#tag -y`。市场页：`vibex plugin add --web https://vibex.xforever.xin/marketplace/<owner>/<name> -y`。

用户明确要求上架时：

```text
vibex plugin publish . --owner <市场用户名> --password <密码> [--show-tree]
vibex plugin publish --web <github-owner/repo[#tag]> --owner <市场用户名> --password <密码>
```

GitHub owner 必须与市场用户名相同。上传包默认隐藏包结构。审核通过前不会出现在 Catalog。未经用户要求不要发布到市场。

之后在「设置 → 插件」启用。新开或 rebind 的会话才拿到新的 Skill / MCP 清单。

## 完成门

- 只导入公开 SDK。
- 每一项 integration 在清单、SDK 类型、CLI `validate`、Host inspect、UI 上一致。
- 有 Worker 时：handler 已注册；Node 包 `dist/worker.mjs` 含 stdio 循环；native path 为已编译二进制。
- `build` / `validate` / `test` / `pack` 通过。
- 链接或导入后，用户路径在真实 Host 上可用。文件 Tab、预览、Runtime、MCP 注入以 Host 为准，不以 harness 为准。
- README 写明要求、离线与网络、排障、许可、卸载后配置去留。
- 旧会话保持创建时的工具清单；新开或 rebind 的会话获得新清单。

## 排障

| 现象 | 处理 |
| --- | --- |
| `worker_entrypoint_invalid` | 补 `runtime` 与 `protocol: "1.1"`，删除 `format` |
| `handler_id_invalid` | 按第 4 步正则改 id |
| `file_opener_target_invalid` | 恰好一个已发布的 `previewProvider` 或一个 `slot=artifact.editor` 的 surface |
| `app_surface_invalid` | `slot` 只能是 `plugin.detail.panel` 或 `artifact.editor`；`handler` 必须是 `surface.createSession` |
| `readme_summary_invalid` | frontmatter 独立 `summary`，单行 ≤200 字 |
| `managed_mcp_invalid` | `protocolRevision` 为 `2026-07-28`；hostFamilyBinary 或包内 entrypoint |
| Worker 进程立刻退出 | `runtime/main.mjs` 未调用 `runStdioPluginWorker` |
| `plugin_dev_host_missing` / `dev_link_host_only` | 改用 `vibex plugin add --dev .` |
| `No running VibeX Host` | 先开 Desktop 或 `vibex serve`；或接受 `~/.vibex/imports` 排队 |
| validate 通过但文件页空白 | 尚未链接/启用，或未在 Host 上打开该文件 |
| Isolated 字段写入 v4 清单 | v4 缺省 `full-trust`；Isolated 属于 v5 schema |

禁止：把密钥写入 `config.json` 或 README；把 Host token 贴进对话；把校验成功当成 App/Runtime/MCP 已在 Host 上可用；未经用户要求发布到市场。
