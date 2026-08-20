export const ROUNDTRIP = {
  manifest: {
  "$schema": "https://schemas.vibex.dev/plugin/v4/plugin.schema.json",
  "manifestVersion": 4,
  "apiVersion": "1.0",
  "id": "vibex.plugin-development",
  "publisher": "vibex",
  "version": "1.0.0",
  "name": "插件开发",
  "readme": "README.md",
  "engines": { "vibex": ">=0.1.3 <1.0.0", "pluginSdk": "^1.0.0" },
  "content": {
    "root": "contents",
    "index": ".vibex-plugin/content.index.json"
  },
  "config": {
    "schema": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "devMcp": {
          "title": "开发 MCP",
          "description": "允许当前会话在确认后链接本机插件。",
          "type": "boolean",
          "default": false
        }
      }
    }
  },
  "integrations": [
    {
      "id": "vibex-plugin-development",
      "kind": "content.skill",
      "resource": "contents/skills/vibex-plugin-development",
      "targets": ["codex", "claude-code", "acp"]
    },
    {
      "id": "vibex-plugin-dev-mcp",
      "kind": "content.mcp",
      "resource": "contents/mcps/plugin-dev.json"
    }
  ],
  "interface": { "icon": "assets/icon.svg" }
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
      "path": "contents/skills/vibex-plugin-development/references/node-worker.md",
      "kind": "reference",
      "title": "Node Worker 入口"
    },
    {
      "path": "contents/skills/vibex-plugin-development/references/link-mcp.md",
      "kind": "reference",
      "title": "开发 MCP 与链接"
    },
    {
      "path": "contents/mcps/plugin-dev.json",
      "kind": "mcp",
      "title": "插件开发 MCP"
    }
  ]
},
  config: {
  "devMcp": false
},
  readme: "---\nsummary: 让 Agent 在本机用当前 Host 的 SDK 与 CLI 开发、校验并链接插件。\n---\n\n# 插件开发\n\n给正在写 VibeX 插件的人一套跟当前 Host 一致的本机工具链：Skill、SDK、CLI，以及可选的开发 MCP。Agent 应先定位本机契约，再 `init` / `validate` / `test` / `build` / `pack`。\n\n这是随 Host 分发的内置插件，默认关闭。详情页可以停用。启用后，开发 Skill 投影到已安装且支持 Skill 的 Agent。开发 MCP 默认关闭。\n\n## 启用\n\n1. 在 `/plugins` 打开「插件开发」。此时只投递 Skill。\n2. 若要让 Agent 发起「链接本机目录」，到配置打开「开发 MCP」。\n3. 新开或重新绑定会话。官方 MCP 进入启用之后的新会话或 rebind 会话。\n\n链接本机插件仍要在 Host 上确认 Full Trust。令牌不会出现在工具结果里。\n\n## 让 Agent 创建插件\n\n在已启用本插件的会话里，用 `/create-skill` 或直接描述要做的产品。Agent 会：\n\n1. 定位 `vibex-plugin` / Host 附带 SDK。\n2. 确认 summary、publisher、id、integration。\n3. `vibex-plugin init`，接好 Node stdio 入口。\n4. `build`、`validate`、`test`。\n5. 若已打开开发 MCP，走 `plugin_dev_link_request` 链接目录。\n\n## 工具链\n\n```text\nvibex-plugin toolchain\nvibex-plugin init [dir] --publisher you --template full\nvibex-plugin build\nvibex-plugin validate\nvibex-plugin test\nvibex-plugin pack\n```\n\nVibeX 源码树内可用 `node packages/plugin-cli/dist/cli.js`。\n\n一个产品包要有：README 的 `summary`、`contents/`、根 `config.json`、至少一项声明过的 integration。可执行代码按 Full Trust 运行。\n\n## 链接本机目录\n\n1. 打开本插件，并打开「开发 MCP」。\n2. 新开或重新绑定会话。\n3. Agent 调用 `plugin_dev_link_request`。第一次结果是待确认。\n4. 在 VibeX 里确认 Full Trust。\n5. `plugin_dev_link_status` 返回 `grantId` 和 `endpoint`。之后在这台 Host 上跑 `vibex-plugin install --link .` 或 `vibex-plugin dev`。\n\nHost 保留开发目录。源内容变化后重新校验身份、贡献和配置。\n\n## 配置\n\n**开发 MCP** 默认关闭。打开后才会把 `plugin_dev_link_request` / `plugin_dev_link_status` 注入后续会话。\n\n卸载本插件的链接引用时，开发目录仍在。`config.json` 随 Host 数据目录保留策略处理；缺省保留。本包不存储密钥。\n\n## 离线与网络\n\nSDK、CLI、校验和链接都在本机。本包不把源码发到外部市场。\n\n## 排障\n\n- `vibex-plugin toolchain` 找不到：使用当前 Host 附带的 CLI，或 VibeX 仓库里的 `packages/plugin-cli/dist/cli.js`。\n- Agent 没有 link 工具：开发 MCP 默认关着。打开配置后必须新开会话。\n- 链接一直 pending：到 VibeX 里确认 Full Trust。\n- 改完源码界面没变：按候选代流程重新校验、激活。\n- `worker_entrypoint_invalid`：Worker 需要 `runtime` + `protocol: \"1.1\"`，删除 `format`。\n- Node Worker 立刻退出：`runtime/main.mjs` 必须调用 `runStdioPluginWorker`。\n",
  skill: "---\nname: vibex-plugin-development\ndescription: >\n  按当前 Host 的 v4 契约创建、校验、测试、链接并打包 VibeX 产品插件。\n  覆盖 README summary、contents、config.json、integrations、Worker/App/MCP/Skill、\n  可编辑文件 Tab、stdio 入口、candidate 激活与 .vxp。\n  Use when the user runs /create-skill, /create-plugin, /vibex-plugin, or asks to\n  开发/创建/编写/调试 VibeX 插件、.vibex-plugin/plugin.json、@vibex/plugin-sdk、\n  vibex-plugin CLI、linked install.\n---\n\n# VibeX 插件开发\n\n做一个**用户可安装的产品包**，对着**正在运行的 Host**（或当前检出的 VibeX）写。App、Agent、Host、Runtime 是包内部接线，不是插件分类。\n\n完成标准见文末「完成门」。任何一步失败就停在该步，按「排障」处理后再继续。\n\n## 0. 定位本机契约\n\n按顺序尝试，成功即停止：\n\n1. 当前工作区根同时存在 `CONTEXT.md` 与 `packages/plugin-sdk`：这是 VibeX 源码树。\n   - 执行 `python3 .agents/skills/vibex-plugin-development/scripts/locate_toolchain.py`\n   - 阅读输出 `required` 中的每一份文件；`missing` 非空则先补齐。\n   - CLI：`node packages/plugin-cli/dist/cli.js`（下文记为 `vibex-plugin`）。\n2. 否则执行 `vibex-plugin toolchain`。读打印的 `cli`、`js`、`python`、`rust`、`templates`。\n3. 否则执行 `vibex plugin toolchain`。\n4. 否则使用 Host 可执行文件同目录下的 `vibex-plugin`。\n\n随后阅读本 Skill 旁的参考：\n\n- [references/contract.md](references/contract.md) — 清单、handler、lock、capability\n- [references/templates.md](references/templates.md) — 模板产物\n- [references/node-worker.md](references/node-worker.md) — Node stdio 入口\n- [references/link-mcp.md](references/link-mcp.md) — 开发 MCP 与链接\n\n以本机契约为准。网上示例与过期 `format=javascript-esm` 包只作对照。\n\n只使用公开 SDK：`@vibex/plugin-sdk`、`/worker`、`/app`、`/testing`、`/protocol`、`/stdio`；Python `vibex-plugin`；Rust `vibex-plugin-sdk`。公共 SDK 表达不了的能力：先在 Host 补通用 capability 与 SDK 导出，再写进插件。禁止把 VibeX `crates/` 或 `src-tauri/` 拷进插件。\n\n## 1. 确认产品边界\n\n动手前向用户逐项确认并写下答案：\n\n1. 产品显示名。\n2. 一句话 `summary`（纯文本，最多 200 个 Unicode 字符）。\n3. `publisher` 与 `id`（`id`：`^[a-z0-9][a-z0-9._-]{1,62}$`；`publisher`：`^[a-z0-9][a-z0-9._-]{0,62}$`）。\n4. 用户启用后能完成的操作（例如打开某种文件、投影 Skill、托管 MCP、详情面板）。\n5. 需要的 integration 种类（对照 [templates.md](references/templates.md)）。\n6. 开发目录的绝对路径。缺省在当前工作区旁新建 `<id>` 目录。\n\n用户没有指定模板时：只投影知识用 `skill`；只要托管 MCP 用 `mcp`；只要周期任务用 `host-service`；只要只读预览用 `file-tab`；Worker+App+Workflow 用 `full`。可编辑 UTF-8 文件 Tab 在 `full`/`file-tab` 之上按 [contract.md](references/contract.md) 的文件 Tab 四步另行声明。\n\n## 2. 初始化\n\n```text\nvibex-plugin init <dir> --publisher <publisher> --template <template>\n```\n\n`init` 会写清单、README、`config.json`、内容索引、测试，并立刻 `build`。默认模板 `full`。`--template agent` 已删除。\n\n然后立刻改 README frontmatter 的 `summary` 为第 1 步记下的那句话。改 `plugin.json` 的 `id`、`name`、`engines`（`vibex`: `>=0.1.3 <1.0.0`，`pluginSdk`: `^1.0.0`）。\n\n## 3. 组装产品包\n\n按 [contract.md](references/contract.md) 核对目录与清单。只声明真实实现的 integration。\n\n最低要求：至少一项 Host 认识的 integration。Skill 可选。\n\n固定约定：\n\n- `readme` = `README.md`；`content.root` = `contents`；配置文件 = 根 `config.json`。\n- Worker：`entrypoints.worker.runtime` 为 `node` | `python` | `native`，`protocol` 为 `1.1`。省略 `format`。\n- App：`entrypoints.app.protocol` 为 `1.0`，`root` + `document` 指向 `dist/app/index.html`。\n- `.vibex-plugin/content.index.json` 的 `items[].path` 必须是 `contents/` 下的真实文件。\n\n把用户可读说明写进 README 正文：运行要求、离线与网络、排障、第三方许可、卸载后配置去留。持久设置只写 `config.json`，并在 `config.schema` 描述。\n\n## 4. 实现可执行入口\n\n**Node Worker**（`node-worker` / `ts-worker` / `full` / `file-tab` / `host.service`）：必须按 [node-worker.md](references/node-worker.md) 接好 `runStdioPluginWorker`。Host 执行 `node --max-old-space-size=128 dist/worker.mjs`。该文件在顶层进入协议 1.1 循环。`init` 只写出 handler 定义；补上 stdio 入口后再 `build`。\n\n**Python Worker**：`runtime/worker.py` 已含 `run_stdio_plugin_worker`。`requires-python = \">=3.12\"`。Host Isolated 解释器为 CPython 3.12.11。\n\n**native Worker**：`entrypoints.worker.path` 必须指向**已编译二进制**。在与 Host 相同的 OS/CPU 上 `cargo build --release`，把产物放到 `dist/`，再改清单 path。`vibex-plugin build` 编译 JS Worker 与托管 MCP 源，不编译 Rust。\n\n**App**：`definePluginApp`。`bridge.ready()` 在首屏挂上之后调用。可编辑文件使用 `bridge.artifact.readText()` / `writeText(content, expectedRevision)`。冲突码 `artifact_revision_conflict`。\n\nhandler id 必须匹配：\n\n```text\n^[a-z][A-Za-z0-9]*(?:[.-][a-z][A-Za-z0-9]*)*$\n```\n\n合法：`hello`、`surface.createSession`、`office-preview`。非法：`Hello`、`save.XML`、`task.1`。\n\n## 5. 测试\n\n在 `test/*.test.mjs`（或模板生成的测试）覆盖适用路径：\n\n- 声明式：summary、schema、索引、integration 引用。\n- Worker：`createWorkerHarness` 注册、invoke、未声明 handler、dispose。\n- generation：`createGenerationHarness` 在缺 required handler 时回滚。\n- App / 文件 Tab：`createAppHarness` 的 read、write、revision 冲突、revoke。\n\n测试从 **定义模块**（例如 `runtime/worker.mjs`）导入 Worker。`vibex-plugin test` 会先 `build`，再把测试打进临时目录；禁止用 `import.meta.url` 去读插件根文件，把 fixture 写成模块导出。\n\n## 6. 本机校验\n\n在插件根目录：\n\n```text\nvibex-plugin build\nvibex-plugin validate\nvibex-plugin test\n```\n\n`build` 校验清单并编译 `runtime/main.mjs` → `dist/worker.mjs`（以及 App、MCP source）。`pack` 与 `install --link` 才写入 `.vibex-plugin/package.lock.json`。\n\n## 7. 链接运行中的 Host\n\n按 [link-mcp.md](references/link-mcp.md)：\n\n1. 用户已启用内置「插件开发」，并打开配置「开发 MCP」。\n2. 当前会话是启用之后新开或 rebind 的。\n3. 调用 `plugin_dev_link_request`。首次结果为 pending。\n4. 用户在 VibeX 确认 Full Trust。禁止向用户索要 loopback token。\n5. `plugin_dev_link_status` 得到 `grantId` 与 `endpoint`。设置 `VIBEX_PLUGIN_DEV_GRANT` 与 `VIBEX_PLUGIN_DEV_HOST`。\n6. `vibex-plugin install --link .` 或 `vibex-plugin dev`。\n7. 在 `/plugins` 启用被开发的包，按实际声明的 integration 点一遍。\n8. `vibex-plugin doctor .`\n\n传入 `--token` 或 `VIBEX_PLUGIN_DEV_TOKEN` 会被拒绝。Host URL 必须是回环 HTTP origin。\n\n开发 MCP 工具缺失时：请用户打开「插件开发 → 开发 MCP」，然后新开或 rebind 会话。禁止编造 grant。\n\n## 8. 打包\n\n```text\nvibex-plugin pack [--output file.vxp]\n```\n\n打印 `sha256:`。发布物含 README、config 初值、contents、depends、dist、`.vibex-plugin`。源码树保留 `runtime/`、`test/`、`package.json`。\n\n## 完成门\n\n- 只导入公开 SDK。\n- 每一项 integration 在清单、SDK、CLI validate、Host 解析、UI 上一致。\n- handler 已注册；Node 包 `dist/worker.mjs` 含 stdio 循环；native path 为二进制。\n- `build` / `validate` / `test` / `pack` 通过。\n- 链接安装后，用户路径在真实 Host 上可用（文件 Tab、预览、Runtime、远程观察以 Host 为准）。\n- README 写明要求、离线与网络、排障、许可、卸载后配置去留。\n- 旧会话保持创建时的工具清单；新开或 rebind 的会话获得新清单。\n\n## 排障\n\n| 现象 | 处理 |\n| --- | --- |\n| `worker_entrypoint_invalid` | 补 `runtime: \"node\"`，`protocol: \"1.1\"`，删除 `format` |\n| `handler_id_invalid` | 按第 4 步正则改 id |\n| `file_opener_target_invalid` | 恰好一个 `previewProvider` 或一个 `artifact.editor` |\n| `readme_summary_invalid` | frontmatter 独立 `summary`，单行 ≤200 字 |\n| Worker 进程立刻退出 | `runtime/main.mjs` 未调用 `runStdioPluginWorker` |\n| `plugin_dev_host_missing` | 未设置回环 `VIBEX_PLUGIN_DEV_HOST` |\n| `dev_link_host_only` | 使用 `VIBEX_PLUGIN_DEV_GRANT`，去掉 `--token` |\n| link 工具不存在 | 开发 MCP 关闭；打开后新开会话 |\n| 链接一直 pending | 用户在 VibeX 确认 Full Trust |\n| validate 通过但文件页空白 | 尚未链接并在 Host 上打开该文件 |\n| Isolated 字段写入 v4 清单 | Isolated 使用 v5 schema；v4 缺省 full-trust |\n\n禁止：把密钥写入 `config.json` 或 README；把 token 贴进对话；把校验成功当成 App/Runtime 已在 Host 上可用；未经用户要求发布到市场。\n",
  mcp: {
  "managedRuntime": {
    "kind": "hostFamilyBinary",
    "binaryId": "vibex-mcp",
    "product": "plugin-dev",
    "protocolRevision": "2026-07-28",
    "defaultBinding": "all-compatible-agents"
  }
},
};
