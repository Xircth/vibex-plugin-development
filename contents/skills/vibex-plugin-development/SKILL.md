---
name: vibex-plugin-development
description: >
  按当前 Host 的 v4 契约创建、校验、测试、链接并打包 VibeX 产品插件。
  覆盖 README summary、contents、config.json、integrations、Worker/App/MCP/Skill、
  可编辑文件 Tab、stdio 入口、candidate 激活与 .vxp。
  Use when the user runs /create-skill, /create-plugin, /vibex-plugin, or asks to
  开发/创建/编写/调试 VibeX 插件、.vibex-plugin/plugin.json、@vibex/plugin-sdk、
  vibex-plugin CLI、linked install.
---

# VibeX 插件开发

做一个**用户可安装的产品包**，对着**正在运行的 Host**（或当前检出的 VibeX）写。App、Agent、Host、Runtime 是包内部接线，不是插件分类。

完成标准见文末「完成门」。任何一步失败就停在该步，按「排障」处理后再继续。

## 0. 定位本机契约

按顺序尝试，成功即停止：

1. 当前工作区根同时存在 `CONTEXT.md` 与 `packages/plugin-sdk`：这是 VibeX 源码树。
   - 执行 `python3 .agents/skills/vibex-plugin-development/scripts/locate_toolchain.py`
   - 阅读输出 `required` 中的每一份文件；`missing` 非空则先补齐。
   - CLI：`node packages/plugin-cli/dist/cli.js`（下文记为 `vibex-plugin`）。
2. 否则执行 `vibex-plugin toolchain`。读打印的 `cli`、`js`、`python`、`rust`、`templates`。
3. 否则执行 `vibex plugin toolchain`。
4. 否则使用 Host 可执行文件同目录下的 `vibex-plugin`。

随后阅读本 Skill 旁的参考：

- [references/contract.md](references/contract.md) — 清单、handler、lock、capability
- [references/templates.md](references/templates.md) — 模板产物
- [references/node-worker.md](references/node-worker.md) — Node stdio 入口
- [references/link-mcp.md](references/link-mcp.md) — 开发 MCP 与链接

以本机契约为准。网上示例与过期 `format=javascript-esm` 包只作对照。

只使用公开 SDK：`@vibex/plugin-sdk`、`/worker`、`/app`、`/testing`、`/protocol`、`/stdio`；Python `vibex-plugin`；Rust `vibex-plugin-sdk`。公共 SDK 表达不了的能力：先在 Host 补通用 capability 与 SDK 导出，再写进插件。禁止把 VibeX `crates/` 或 `src-tauri/` 拷进插件。

## 1. 确认产品边界

动手前向用户逐项确认并写下答案：

1. 产品显示名。
2. 一句话 `summary`（纯文本，最多 200 个 Unicode 字符）。
3. `publisher` 与 `id`（`id`：`^[a-z0-9][a-z0-9._-]{1,62}$`；`publisher`：`^[a-z0-9][a-z0-9._-]{0,62}$`）。
4. 用户启用后能完成的操作（例如打开某种文件、投影 Skill、托管 MCP、详情面板）。
5. 需要的 integration 种类（对照 [templates.md](references/templates.md)）。
6. 开发目录的绝对路径。缺省在当前工作区旁新建 `<id>` 目录。

用户没有指定模板时：只投影知识用 `skill`；只要托管 MCP 用 `mcp`；只要周期任务用 `host-service`；只要只读预览用 `file-tab`；Worker+App+Workflow 用 `full`。可编辑 UTF-8 文件 Tab 在 `full`/`file-tab` 之上按 [contract.md](references/contract.md) 的文件 Tab 四步另行声明。

## 2. 初始化

```text
vibex-plugin init <dir> --publisher <publisher> --template <template>
```

`init` 会写清单、README、`config.json`、内容索引、测试，并立刻 `build`。默认模板 `full`。`--template agent` 已删除。

然后立刻改 README frontmatter 的 `summary` 为第 1 步记下的那句话。改 `plugin.json` 的 `id`、`name`、`engines`（`vibex`: `>=0.1.3 <1.0.0`，`pluginSdk`: `^1.0.0`）。

## 3. 组装产品包

按 [contract.md](references/contract.md) 核对目录与清单。只声明真实实现的 integration。

最低要求：至少一项 Host 认识的 integration。Skill 可选。

固定约定：

- `readme` = `README.md`；`content.root` = `contents`；配置文件 = 根 `config.json`。
- Worker：`entrypoints.worker.runtime` 为 `node` | `python` | `native`，`protocol` 为 `1.1`。省略 `format`。
- App：`entrypoints.app.protocol` 为 `1.0`，`root` + `document` 指向 `dist/app/index.html`。
- `.vibex-plugin/content.index.json` 的 `items[].path` 必须是 `contents/` 下的真实文件。

把用户可读说明写进 README 正文：运行要求、离线与网络、排障、第三方许可、卸载后配置去留。持久设置只写 `config.json`，并在 `config.schema` 描述。

## 4. 实现可执行入口

**Node Worker**（`node-worker` / `ts-worker` / `full` / `file-tab` / `host.service`）：必须按 [node-worker.md](references/node-worker.md) 接好 `runStdioPluginWorker`。Host 执行 `node --max-old-space-size=128 dist/worker.mjs`。该文件在顶层进入协议 1.1 循环。`init` 只写出 handler 定义；补上 stdio 入口后再 `build`。

**Python Worker**：`runtime/worker.py` 已含 `run_stdio_plugin_worker`。`requires-python = ">=3.12"`。Host Isolated 解释器为 CPython 3.12.11。

**native Worker**：`entrypoints.worker.path` 必须指向**已编译二进制**。在与 Host 相同的 OS/CPU 上 `cargo build --release`，把产物放到 `dist/`，再改清单 path。`vibex-plugin build` 编译 JS Worker 与托管 MCP 源，不编译 Rust。

**App**：`definePluginApp`。`bridge.ready()` 在首屏挂上之后调用。可编辑文件使用 `bridge.artifact.readText()` / `writeText(content, expectedRevision)`。冲突码 `artifact_revision_conflict`。

handler id 必须匹配：

```text
^[a-z][A-Za-z0-9]*(?:[.-][a-z][A-Za-z0-9]*)*$
```

合法：`hello`、`surface.createSession`、`office-preview`。非法：`Hello`、`save.XML`、`task.1`。

## 5. 测试

在 `test/*.test.mjs`（或模板生成的测试）覆盖适用路径：

- 声明式：summary、schema、索引、integration 引用。
- Worker：`createWorkerHarness` 注册、invoke、未声明 handler、dispose。
- generation：`createGenerationHarness` 在缺 required handler 时回滚。
- App / 文件 Tab：`createAppHarness` 的 read、write、revision 冲突、revoke。

测试从 **定义模块**（例如 `runtime/worker.mjs`）导入 Worker。`vibex-plugin test` 会先 `build`，再把测试打进临时目录；禁止用 `import.meta.url` 去读插件根文件，把 fixture 写成模块导出。

## 6. 本机校验

在插件根目录：

```text
vibex-plugin build
vibex-plugin validate
vibex-plugin test
```

`build` 校验清单并编译 `runtime/main.mjs` → `dist/worker.mjs`（以及 App、MCP source）。`pack` 与 `install --link` 才写入 `.vibex-plugin/package.lock.json`。

## 7. 链接运行中的 Host

按 [link-mcp.md](references/link-mcp.md)：

1. 用户已启用内置「插件开发」，并打开配置「开发 MCP」。
2. 当前会话是启用之后新开或 rebind 的。
3. 调用 `plugin_dev_link_request`。首次结果为 pending。
4. 用户在 VibeX 确认 Full Trust。禁止向用户索要 loopback token。
5. `plugin_dev_link_status` 得到 `grantId` 与 `endpoint`。设置 `VIBEX_PLUGIN_DEV_GRANT` 与 `VIBEX_PLUGIN_DEV_HOST`。
6. `vibex-plugin install --link .` 或 `vibex-plugin dev`。
7. 在 `/plugins` 启用被开发的包，按实际声明的 integration 点一遍。
8. `vibex-plugin doctor .`

传入 `--token` 或 `VIBEX_PLUGIN_DEV_TOKEN` 会被拒绝。Host URL 必须是回环 HTTP origin。

开发 MCP 工具缺失时：请用户打开「插件开发 → 开发 MCP」，然后新开或 rebind 会话。禁止编造 grant。

## 8. 打包

```text
vibex-plugin pack [--output file.vxp]
```

打印 `sha256:`。发布物含 README、config 初值、contents、depends、dist、`.vibex-plugin`。源码树保留 `runtime/`、`test/`、`package.json`。

## 完成门

- 只导入公开 SDK。
- 每一项 integration 在清单、SDK、CLI validate、Host 解析、UI 上一致。
- handler 已注册；Node 包 `dist/worker.mjs` 含 stdio 循环；native path 为二进制。
- `build` / `validate` / `test` / `pack` 通过。
- 链接安装后，用户路径在真实 Host 上可用（文件 Tab、预览、Runtime、远程观察以 Host 为准）。
- README 写明要求、离线与网络、排障、许可、卸载后配置去留。
- 旧会话保持创建时的工具清单；新开或 rebind 的会话获得新清单。

## 排障

| 现象 | 处理 |
| --- | --- |
| `worker_entrypoint_invalid` | 补 `runtime: "node"`，`protocol: "1.1"`，删除 `format` |
| `handler_id_invalid` | 按第 4 步正则改 id |
| `file_opener_target_invalid` | 恰好一个 `previewProvider` 或一个 `artifact.editor` |
| `readme_summary_invalid` | frontmatter 独立 `summary`，单行 ≤200 字 |
| Worker 进程立刻退出 | `runtime/main.mjs` 未调用 `runStdioPluginWorker` |
| `plugin_dev_host_missing` | 未设置回环 `VIBEX_PLUGIN_DEV_HOST` |
| `dev_link_host_only` | 使用 `VIBEX_PLUGIN_DEV_GRANT`，去掉 `--token` |
| link 工具不存在 | 开发 MCP 关闭；打开后新开会话 |
| 链接一直 pending | 用户在 VibeX 确认 Full Trust |
| validate 通过但文件页空白 | 尚未链接并在 Host 上打开该文件 |
| Isolated 字段写入 v4 清单 | Isolated 使用 v5 schema；v4 缺省 full-trust |

禁止：把密钥写入 `config.json` 或 README；把 token 贴进对话；把校验成功当成 App/Runtime 已在 Host 上可用；未经用户要求发布到市场。
