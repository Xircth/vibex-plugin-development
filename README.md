---
summary: 让 Agent 在本机用当前 Host 的 SDK 与 CLI 开发、校验、链接并发布插件。
---

# 插件开发

给正在写 VibeX 插件的人一套跟当前 Host 一致的本机工具链：Skill、SDK、CLI。Agent 先定位本机契约，再 `init` / `validate` / `test` / `build` / `pack`，用 `vibex plugin add --dev` 链到正在跑的 Host，用 `vibex plugin publish` 提交官网市场。

从设置 → 插件 → 插件市场的官方分类安装。默认关闭，可以卸载。启用后，开发 Skill 投影到已安装且支持 Skill 的 Agent。新开或重新绑定的会话才会带上这条 Skill。

## 启用

1. 从市场官方分类安装「插件开发」，在已安装 Tab 打开启用。
2. 新开或重新绑定会话，再用 `/create-skill` 或直接描述要做的产品。

安装或链接被开发的包即 Full Trust。不要把 Host token 贴进对话。

## 让 Agent 创建插件

在已启用本插件的会话里，Agent 会：

1. 定位 `vibex-plugin` 与本机 SDK。
2. 确认 summary、publisher、id、integration。
3. `vibex-plugin init`。Node 模板已含 stdio 入口。
4. `build`、`validate`、`test`。
5. `vibex plugin add --dev .` 链到本机 Host。
6. 用户要求上架时 `vibex plugin publish`。

## 工具链

作者 CLI：

```text
vibex-plugin toolchain
vibex-plugin init [dir] --publisher you --template full
vibex-plugin build
vibex-plugin validate
vibex-plugin test
vibex-plugin pack
```

产品 CLI：

```text
vibex plugin add --dev .
vibex plugin test --host
vibex plugin pack
vibex plugin publish
vibex plugin add --profile file.vxp
vibex plugin add --web https://github.com/<owner>/<repo>#tag
vibex plugin list
```

VibeX 源码树内作者 CLI 为 `node packages/plugin-cli/dist/cli.js`。

一个产品包要有：README 的 `summary`、`contents/`、根 `config.json`、至少一项声明过的 integration。可执行代码按 Full Trust 运行。

## 链接本机目录

1. 启用本插件并新开会话。
2. Desktop 或 `vibex serve` 正在跑。
3. 在被开发的插件根执行 `vibex plugin add --dev .`。未加 `--detach` 时，Worker stderr 打到当前终端。
4. 若尚未启用，到「设置 → 插件」打开被开发的包。
5. 按声明的 integration 验收。源码变化后 Host 按 digest 发布候选代。

Host 保留开发目录。卸载链接只去掉 VibeX 一侧引用。

## 配置

本包没有可配置项。卸载本插件时，开发目录仍在。`config.json` 随 Host 数据目录保留策略处理；缺省保留。本包不存储密钥。

## 离线与网络

SDK、CLI、校验和链接都在本机。`vibex plugin add --web` 才会按你给的 Git 地址取包。`vibex plugin publish` 才会把包或仓库提交到官网待审队列。

## 排障

- `vibex-plugin toolchain` 找不到：使用当前 Host 附带的 CLI，或 VibeX 仓库里的 `packages/plugin-cli/dist/cli.js`。
- `No running VibeX Host`：先开 Desktop 或 `vibex serve`。未运行时 `--dev` 会排队到 `~/.vibex/imports`。
- 当前会话没有开发 Skill：启用本插件后新开或 rebind 会话。
- 改完源码界面没变：按候选代流程重新校验、激活；文件页、预览、MCP 以 Host 为准。
- `worker_entrypoint_invalid`：Worker 需要 `runtime` + `protocol: "1.1"`，删除 `format`。
- Node Worker 立刻退出：`runtime/main.mjs` 必须调用 `runStdioPluginWorker`。
