export const ROUNDTRIP = {
  manifest: {
  "$schema": "https://schemas.vibex.dev/plugin/v4/plugin.schema.json",
  "manifestVersion": 4,
  "apiVersion": "1.0",
  "id": "vibex.plugin-development",
  "publisher": "vibex",
  "version": "1.1.0",
  "name": "插件开发",
  "readme": "README.md",
  "engines": {
    "vibex": ">=0.1.3 <1.0.0",
    "pluginSdk": "^1.0.0"
  },
  "content": {
    "root": "contents",
    "index": ".vibex-plugin/content.index.json"
  },
  "config": {
    "schema": {
      "type": "object",
      "additionalProperties": false,
      "properties": {}
    }
  },
  "integrations": [
    {
      "id": "vibex-plugin-development",
      "kind": "content.skill",
      "resource": "contents/skills/vibex-plugin-development",
      "targets": [
        "codex",
        "claude-code",
        "acp"
      ]
    }
  ],
  "interface": {
    "icon": "assets/icon.svg"
  }
},
  index: {
  "schemaVersion": 1,
  "items": [
    {
      "path": "contents/skills/vibex-plugin-development/SKILL.md",
      "kind": "skill",
      "title": "VibeX 插件开发"
    },
    {
      "path": "contents/skills/vibex-plugin-development/references/contract.md",
      "kind": "reference",
      "title": "产品包契约"
    },
    {
      "path": "contents/skills/vibex-plugin-development/references/templates.md",
      "kind": "reference",
      "title": "init 模板产物"
    },
    {
      "path": "contents/skills/vibex-plugin-development/references/runtime.md",
      "kind": "reference",
      "title": "Worker 与 App 运行时"
    },
    {
      "path": "contents/skills/vibex-plugin-development/references/link.md",
      "kind": "reference",
      "title": "链接运行中的 Host"
    }
  ]
},
  config: {},
  skill: "---\nname: vibex-plugin-development\ndescription: >\n  按当前 Host 的 v4 契约创建、校验、测试、链接并打包 VibeX 产品插件。\n  覆盖 README summary、contents、config.json、integrations、Worker/App/MCP/Skill、\n  可编辑文件 Tab、stdio 入口、candidate 激活、.vxp 与市场发布。\n  Use when the user runs /create-skill, /create-plugin, /vibex-plugin, or asks to\n  开发/创建/编写/调试 VibeX 插件、.vibex-plugin/plugin.json、@vibex/plugin-sdk、\n  vibex-plugin CLI、vibex plugin add --dev、vibex plugin publish、linked install.\n---\n\n# VibeX 插件开发\n\n做一个**用户可安装的产品包**，对着**本机正在运行的 Host 所附带的 SDK 与 CLI** 写。App、Agent、Host、Runtime 是包内部接线，不是插件分类。\n\n完成标准见文末「完成门」。任何一步失败就停在该步，按「排障」处理后继续。契约细节以本 Skill 旁的参考和本机 SDK 类型为准，不要用网上示例顶替。\n\n## 0. 定位本机契约\n\n按顺序尝试，成功即停止：\n\n1. 当前工作区根同时存在 `CONTEXT.md` 与 `packages/plugin-sdk`：这是 VibeX 源码树。\n   - 执行 `python3 .agents/skills/vibex-plugin-development/scripts/locate_toolchain.py`\n   - 阅读输出 `required` 中的每一份文件；`missing` 非空则先补齐。\n   - 作者 CLI：`node packages/plugin-cli/dist/cli.js`（下文记为 `vibex-plugin`）。\n   - 产品 CLI：仓库里的 `npx-cli`（下文 `vibex plugin …`）。\n2. 否则执行 `vibex-plugin toolchain`。读打印的 `cli`、`js`、`python`、`rust`、`templates`。Host 版本当前为 `0.1.3`。\n3. 否则使用 Host 可执行文件同目录下的 `vibex-plugin`。\n\n随后阅读：\n\n- [references/contract.md](references/contract.md) — 目录、清单、integrations\n- [references/templates.md](references/templates.md) — `init` 实际写出的产物\n- [references/runtime.md](references/runtime.md) — Worker / App / stdio / `host.call` / 测试\n- [references/link.md](references/link.md) — 链接运行中的 Host 与发布\n\n只使用公开 SDK：`@vibex/plugin-sdk` 及其 `/worker`、`/app`、`/testing`、`/protocol`、`/stdio`；Python `vibex_plugin`；Rust `vibex-plugin-sdk`。公共 SDK 表达不了的能力：先在 Host 补通用 capability 与 SDK 导出，再写进插件。禁止把 VibeX `crates/` 或 `src-tauri/` 拷进插件。\n\n## 1. 确认产品边界\n\n动手前向用户逐项确认并写下答案：\n\n1. 产品显示名。\n2. 一句话 `summary`（纯文本，最多 200 个 Unicode 字符）。\n3. `publisher` 与 `id`（`id`：`^[a-z0-9][a-z0-9._-]{1,62}$`；`publisher`：`^[a-z0-9][a-z0-9._-]{0,62}$`）。\n4. 用户启用后能完成的操作。\n5. 需要的 integration 种类（对照 [templates.md](references/templates.md) 与 [contract.md](references/contract.md)）。\n6. 开发目录的绝对路径。缺省在当前工作区旁新建 `<id>` 目录。\n\n用户没有指定模板时：只投影知识用 `skill`；只要托管 MCP 用 `mcp`；只要 Hook 用 `hooks`；只要周期任务用 `host-service`；只要 `.txt` 只读预览加详情面板用 `file-tab`；可编辑 UTF-8 文件 Tab 用 `editor-tab`；Worker+App+Workflow 用 `full`。参考实现：Office（预览 + Runtime）、Workflow Creator（`artifact.editor`）。\n\n## 2. 初始化\n\n```text\nvibex-plugin init <dir> --publisher <publisher> --template <template>\n```\n\n`init` 会写清单、README、`config.json`、内容索引、测试，并立刻 `build`。默认模板 `full`。Node / TS / file-tab / editor-tab / full / host-service 已写出 `runStdioPluginWorker` 入口，不要删掉。\n\n然后立刻：\n\n1. 把 README frontmatter 的 `summary` 改成第 1 步记下的那句话。\n2. 改 `plugin.json` 的 `id`、`name`。\n3. 确认 `engines` 为 `{ \"vibex\": \">=0.1.3 <1.0.0\", \"pluginSdk\": \"^1.0.0\" }`。\n4. 确认 Node 包 `runtime/main.mjs` 调用 `runStdioPluginWorker`，测试从定义模块导入。\n\n## 3. 组装产品包\n\n按 [contract.md](references/contract.md) 核对目录与清单。只声明稳定面上真实实现的 integration。最低要求：至少一项 Host 认识的 integration。Skill 可选。\n\n固定约定：\n\n- `readme` = `README.md`；`content.root` = `contents`；配置文件 = 根 `config.json`。\n- Worker：`runtime` 为 `node` | `python` | `native`，`protocol` 为 `\"1.1\"`。不要写 `format`。\n- App：`protocol` 为 `\"1.0\"`，`root` + `document` 指向 `dist/app/index.html`。\n- `.vibex-plugin/content.index.json` 的 `items[].path` 必须是 `contents/` 下的真实文件。\n- `dependencies` 只声明 `kind: \"runtime\"`，descriptor 指向 `depends/` 下已存在的文件。CLI `validate` 与 Host inspect 都拒绝 `kind: \"plugin\"`。\n- `permissions` 可省略。安装或启用即 Full Trust，不产生逐能力审批。\n- `app.surface.slot` 只能是 `plugin.detail.panel` 或 `artifact.editor`。\n\n把用户说明写进 README 正文：运行要求、离线与网络、排障、第三方许可、卸载后配置去留。持久设置只写 `config.json`，并在 `config.schema` 描述。\n\n官方包可对照，但不要复制其内部实现：`vibex.office`、`vibex.workflow-creator`、`vibex.session-enhance`、`vibex.multi-agent`。\n\n## 4. 实现可执行入口\n\n细节见 [runtime.md](references/runtime.md)。\n\n**Node Worker**（`node-worker` / `ts-worker` / `full` / `file-tab` / `editor-tab` / `host-service`）：Host 执行 `node --max-old-space-size=128 dist/worker.mjs`。该文件必须在顶层进入协议 1.1 循环。`definePluginWorker` 在 `runtime/worker.mjs`，`runtime/main.mjs` 调用 `runStdioPluginWorker`。`vibex-plugin build` 打包 `runtime/main.mjs` → `dist/worker.mjs`。\n\n**Python Worker**：`runtime/worker.py` 已含 `run_stdio_plugin_worker`。`requires-python = \">=3.12\"`。Host Isolated 解释器为 CPython 3.12.11。\n\n**native Worker**：`entrypoints.worker.path` 必须指向**已编译二进制**。在与 Host 相同的 OS/CPU 上编译，把产物放到 `dist/`，再改清单 path。`vibex-plugin build` 编译 JS Worker 与托管 MCP 源，不编译 Rust。\n\n**App**：`definePluginApp`。首屏挂上之后调用 `bridge.ready()`。可编辑文件使用 `bridge.artifact.readText()` / `writeText(content, expectedRevision)`。冲突码 `artifact_revision_conflict`。`app.surface` 的 `slot` 只能是 `plugin.detail.panel` 或 `artifact.editor`，`appEntrypoint` 为 `app`，`handler` 为 `surface.createSession`。\n\n**托管 MCP**：资源 JSON 的 `managedRuntime.protocolRevision` 必须是 `2026-07-28`。两种入口：包内 `source` + `entrypoint`（CLI 会编译 source），或 `kind: \"hostFamilyBinary\"` 加 `binaryId`。默认绑定 `all-compatible-agents`。官方产品面只有 `session`、`delegation`、`workflow`。\n\nhandler id 必须匹配 `^[a-z][A-Za-z0-9]*(?:[.-][a-z][A-Za-z0-9]*)*$`。合法：`hello`、`surface.createSession`、`office-preview`。非法：`Hello`、`save.XML`、`task.1`。\n\n## 5. 测试\n\n在 `test/*.test.mjs` 覆盖适用路径：\n\n- 声明式：summary、schema、索引、integration 引用。\n- Worker：`createWorkerHarness` 注册、invoke、未声明 handler、dispose。\n- generation：`createGenerationHarness` 在缺 required handler 时回滚。\n- App / 文件 Tab：`createAppHarness` 的 read、write、revision 冲突、revoke。\n\nWorker 测试从**定义模块**导入（`runtime/worker.mjs`），不要从 `dist/worker.mjs` 导入——stdio 入口在 import 时会抢 stdin。`vibex-plugin test` 会先 `build`，再把测试打进临时目录；禁止用 `import.meta.url` 去读插件根文件，把需要对照的 JSON/句子写成模块导出。\n\n`init` 生成的无 Worker 测试若仍用 `import.meta.url` 读 `plugin.json`，在 `vibex-plugin test` 下会找不到文件。改成 fixture 导出。\n\n## 6. 本机校验\n\n在插件根目录：\n\n```text\nvibex-plugin build\nvibex-plugin validate\nvibex-plugin test\n```\n\n`build` 校验清单并编译 `runtime/main.mjs` → `dist/worker.mjs`（以及 App、`managedRuntime.source`）。`pack` 才写入 `.vibex-plugin/package.lock.json`。Harness 绿了不算完。\n\n## 7. 链接运行中的 Host\n\n按 [link.md](references/link.md)。产品入口：\n\n```text\nvibex plugin add --dev . -y\n```\n\n它 build、validate，经本机 Host token 调用 `plugin_control_import`（`developerLink`），并尝试启用。未加 `--detach` 时把该插件 Worker stderr 打到当前终端。Host 未运行时，链接会写入 `~/.vibex/imports/links.jsonl`，等 Desktop 或 Server 下次启动再导入。不要向用户索要 token。\n\n`vibex-plugin install --link` / `dev` 若仍实现，只能作为同一 Host import 的别名。优先使用 `add --dev`。\n\n链接之后：在「设置 → 插件」启用被开发的包（若尚未启用），按声明的 integration 点一遍用户路径，再 `vibex plugin list` 或 `vibex-plugin doctor .`。需要走真实安装路径时执行 `vibex plugin test --host`。\n\n## 8. 打包与分发\n\n```text\nvibex-plugin pack [--output file.vxp]\n```\n\n或 `vibex plugin pack [dir] [--output file.vxp]`。打印 `sha256:`。发布物含 README、config 初值、contents、depends、dist、`.vibex-plugin`。不含 `runtime/`、`test/`、`package.json`、source map、`.git`、`node_modules`。\n\n本机安装：\n\n```text\nvibex plugin add --profile file.vxp -y\n```\n\nGit 源：`vibex plugin add --web <git>#tag -y`。市场页：`vibex plugin add --web https://vibex.xforever.xin/marketplace/<owner>/<name> -y`。\n\n用户明确要求上架时：\n\n```text\nvibex plugin publish . --owner <市场用户名> --password <密码> [--show-tree]\nvibex plugin publish --web <github-owner/repo[#tag]> --owner <市场用户名> --password <密码>\n```\n\nGitHub owner 必须与市场用户名相同。上传包默认隐藏包结构。审核通过前不会出现在 Catalog。未经用户要求不要发布到市场。\n\n之后在「设置 → 插件」启用。新开或 rebind 的会话才拿到新的 Skill / MCP 清单。\n\n## 完成门\n\n- 只导入公开 SDK。\n- 每一项 integration 在清单、SDK 类型、CLI `validate`、Host inspect、UI 上一致。\n- 有 Worker 时：handler 已注册；Node 包 `dist/worker.mjs` 含 stdio 循环；native path 为已编译二进制。\n- `build` / `validate` / `test` / `pack` 通过。\n- 链接或导入后，用户路径在真实 Host 上可用。文件 Tab、预览、Runtime、MCP 注入以 Host 为准，不以 harness 为准。\n- README 写明要求、离线与网络、排障、许可、卸载后配置去留。\n- 旧会话保持创建时的工具清单；新开或 rebind 的会话获得新清单。\n\n## 排障\n\n| 现象 | 处理 |\n| --- | --- |\n| `worker_entrypoint_invalid` | 补 `runtime` 与 `protocol: \"1.1\"`，删除 `format` |\n| `handler_id_invalid` | 按第 4 步正则改 id |\n| `file_opener_target_invalid` | 恰好一个已发布的 `previewProvider` 或一个 `slot=artifact.editor` 的 surface |\n| `app_surface_invalid` | `slot` 只能是 `plugin.detail.panel` 或 `artifact.editor`；`handler` 必须是 `surface.createSession` |\n| `readme_summary_invalid` | frontmatter 独立 `summary`，单行 ≤200 字 |\n| `managed_mcp_invalid` | `protocolRevision` 为 `2026-07-28`；hostFamilyBinary 或包内 entrypoint |\n| Worker 进程立刻退出 | `runtime/main.mjs` 未调用 `runStdioPluginWorker` |\n| `plugin_dev_host_missing` / `dev_link_host_only` | 改用 `vibex plugin add --dev .` |\n| `No running VibeX Host` | 先开 Desktop 或 `vibex serve`；或接受 `~/.vibex/imports` 排队 |\n| validate 通过但文件页空白 | 尚未链接/启用，或未在 Host 上打开该文件 |\n| Isolated 字段写入 v4 清单 | v4 缺省 `full-trust`；Isolated 属于 v5 schema |\n\n禁止：把密钥写入 `config.json` 或 README；把 Host token 贴进对话；把校验成功当成 App/Runtime/MCP 已在 Host 上可用；未经用户要求发布到市场。\n",
  readme: "---\nsummary: 让 Agent 在本机用当前 Host 的 SDK 与 CLI 开发、校验、链接并发布插件。\n---\n\n# 插件开发\n\n给正在写 VibeX 插件的人一套跟当前 Host 一致的本机工具链：Skill、SDK、CLI。Agent 先定位本机契约，再 `init` / `validate` / `test` / `build` / `pack`，用 `vibex plugin add --dev` 链到正在跑的 Host，用 `vibex plugin publish` 提交官网市场。\n\n从设置 → 插件 → 插件市场的官方分类安装。默认关闭，可以卸载。启用后，开发 Skill 投影到已安装且支持 Skill 的 Agent。新开或重新绑定的会话才会带上这条 Skill。\n\n## 启用\n\n1. 从市场官方分类安装「插件开发」，在已安装 Tab 打开启用。\n2. 新开或重新绑定会话，再用 `/create-skill` 或直接描述要做的产品。\n\n安装或链接被开发的包即 Full Trust。不要把 Host token 贴进对话。\n\n## 让 Agent 创建插件\n\n在已启用本插件的会话里，Agent 会：\n\n1. 定位 `vibex-plugin` 与本机 SDK。\n2. 确认 summary、publisher、id、integration。\n3. `vibex-plugin init`。Node 模板已含 stdio 入口。\n4. `build`、`validate`、`test`。\n5. `vibex plugin add --dev .` 链到本机 Host。\n6. 用户要求上架时 `vibex plugin publish`。\n\n## 工具链\n\n作者 CLI：\n\n```text\nvibex-plugin toolchain\nvibex-plugin init [dir] --publisher you --template full\nvibex-plugin build\nvibex-plugin validate\nvibex-plugin test\nvibex-plugin pack\n```\n\n产品 CLI：\n\n```text\nvibex plugin add --dev .\nvibex plugin test --host\nvibex plugin pack\nvibex plugin publish\nvibex plugin add --profile file.vxp\nvibex plugin add --web https://github.com/<owner>/<repo>#tag\nvibex plugin list\n```\n\nVibeX 源码树内作者 CLI 为 `node packages/plugin-cli/dist/cli.js`。\n\n一个产品包要有：README 的 `summary`、`contents/`、根 `config.json`、至少一项声明过的 integration。可执行代码按 Full Trust 运行。\n\n## 链接本机目录\n\n1. 启用本插件并新开会话。\n2. Desktop 或 `vibex serve` 正在跑。\n3. 在被开发的插件根执行 `vibex plugin add --dev .`。未加 `--detach` 时，Worker stderr 打到当前终端。\n4. 若尚未启用，到「设置 → 插件」打开被开发的包。\n5. 按声明的 integration 验收。源码变化后 Host 按 digest 发布候选代。\n\nHost 保留开发目录。卸载链接只去掉 VibeX 一侧引用。\n\n## 配置\n\n本包没有可配置项。卸载本插件时，开发目录仍在。`config.json` 随 Host 数据目录保留策略处理；缺省保留。本包不存储密钥。\n\n## 离线与网络\n\nSDK、CLI、校验和链接都在本机。`vibex plugin add --web` 才会按你给的 Git 地址取包。`vibex plugin publish` 才会把包或仓库提交到官网待审队列。\n\n## 排障\n\n- `vibex-plugin toolchain` 找不到：使用当前 Host 附带的 CLI，或 VibeX 仓库里的 `packages/plugin-cli/dist/cli.js`。\n- `No running VibeX Host`：先开 Desktop 或 `vibex serve`。未运行时 `--dev` 会排队到 `~/.vibex/imports`。\n- 当前会话没有开发 Skill：启用本插件后新开或 rebind 会话。\n- 改完源码界面没变：按候选代流程重新校验、激活；文件页、预览、MCP 以 Host 为准。\n- `worker_entrypoint_invalid`：Worker 需要 `runtime` + `protocol: \"1.1\"`，删除 `format`。\n- Node Worker 立刻退出：`runtime/main.mjs` 必须调用 `runStdioPluginWorker`。\n",
};
