# 开发 MCP 与链接安装

内置插件「插件开发」（`vibex.plugin-development`）把本 Skill 投影给 Agent。开发 MCP 由根 `config.json` 的 `devMcp` 控制，缺省 `false`。

## 打开开发 MCP

1. `/plugins` 启用「插件开发」。
2. 配置 Tab 打开「开发 MCP」。
3. 新开或 rebind 会话。此后会话才能看到 `plugin_dev_link_request` / `plugin_dev_link_status`。

## 链接本机目录

1. `plugin_dev_link_request`，参数为插件源码绝对路径。首次返回 pending。
2. 用户在 VibeX 确认 Full Trust。安装即 Full Trust，没有逐 capability 弹窗。
3. `plugin_dev_link_status` 返回 `grantId` 与 `endpoint`。
4. 环境变量：`VIBEX_PLUGIN_DEV_GRANT=<grantId>`，`VIBEX_PLUGIN_DEV_HOST=<endpoint>`。
5. 在插件根执行 `vibex-plugin install --link .` 或 `vibex-plugin dev`。
6. `/plugins` 启用被开发的包，按声明的 integration 验收。
7. `vibex-plugin doctor .`

CLI 拒绝 `--token` 与 `VIBEX_PLUGIN_DEV_TOKEN`。`VIBEX_PLUGIN_DEV_HOST` 必须是回环 HTTP origin：`http://127.0.0.1`、`http://localhost`、`http://[::1]`，pathname `/`。grant 文件权限 `0600`。

Host 保留开发目录。卸载链接只去掉 VibeX 一侧引用。源变化后重新 validate、激活候选代。

工具缺失：请用户打开「开发 MCP」并新开会话。禁止编造 HTTP grant 或让用户粘贴 token。
