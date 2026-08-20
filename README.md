---
summary: 让 Agent 在本机用当前 Host 的 SDK 与 CLI 开发、校验并链接插件。
---

# 插件开发

给正在写 VibeX 插件的人一套跟当前 Host 一致的本机工具链：Skill、SDK、CLI，以及可选的开发 MCP。Agent 应先定位本机契约，再 `init` / `validate` / `test` / `build` / `pack`。

这是随 Host 分发的内置插件，默认关闭。详情页可以停用。启用后，开发 Skill 投影到已安装且支持 Skill 的 Agent。开发 MCP 默认关闭。

## 启用

1. 在 `/plugins` 打开「插件开发」。此时只投递 Skill。
2. 若要让 Agent 发起「链接本机目录」，到配置打开「开发 MCP」。
3. 新开或重新绑定会话。官方 MCP 进入启用之后的新会话或 rebind 会话。

链接本机插件仍要在 Host 上确认 Full Trust。令牌不会出现在工具结果里。

## 让 Agent 创建插件

在已启用本插件的会话里，用 `/create-skill` 或直接描述要做的产品。Agent 会：

1. 定位 `vibex-plugin` / Host 附带 SDK。
2. 确认 summary、publisher、id、integration。
3. `vibex-plugin init`，接好 Node stdio 入口。
4. `build`、`validate`、`test`。
5. 若已打开开发 MCP，走 `plugin_dev_link_request` 链接目录。

## 工具链

```text
vibex-plugin toolchain
vibex-plugin init [dir] --publisher you --template full
vibex-plugin build
vibex-plugin validate
vibex-plugin test
vibex-plugin pack
```

VibeX 源码树内可用 `node packages/plugin-cli/dist/cli.js`。

一个产品包要有：README 的 `summary`、`contents/`、根 `config.json`、至少一项声明过的 integration。可执行代码按 Full Trust 运行。

## 链接本机目录

1. 打开本插件，并打开「开发 MCP」。
2. 新开或重新绑定会话。
3. Agent 调用 `plugin_dev_link_request`。第一次结果是待确认。
4. 在 VibeX 里确认 Full Trust。
5. `plugin_dev_link_status` 返回 `grantId` 和 `endpoint`。之后在这台 Host 上跑 `vibex-plugin install --link .` 或 `vibex-plugin dev`。

Host 保留开发目录。源内容变化后重新校验身份、贡献和配置。

## 配置

**开发 MCP** 默认关闭。打开后才会把 `plugin_dev_link_request` / `plugin_dev_link_status` 注入后续会话。

卸载本插件的链接引用时，开发目录仍在。`config.json` 随 Host 数据目录保留策略处理；缺省保留。本包不存储密钥。

## 离线与网络

SDK、CLI、校验和链接都在本机。本包不把源码发到外部市场。

## 排障

- `vibex-plugin toolchain` 找不到：使用当前 Host 附带的 CLI，或 VibeX 仓库里的 `packages/plugin-cli/dist/cli.js`。
- Agent 没有 link 工具：开发 MCP 默认关着。打开配置后必须新开会话。
- 链接一直 pending：到 VibeX 里确认 Full Trust。
- 改完源码界面没变：按候选代流程重新校验、激活。
- `worker_entrypoint_invalid`：Worker 需要 `runtime` + `protocol: "1.1"`，删除 `format`。
- Node Worker 立刻退出：`runtime/main.mjs` 必须调用 `runStdioPluginWorker`。
