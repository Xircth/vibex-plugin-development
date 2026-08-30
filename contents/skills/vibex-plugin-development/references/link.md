# 链接运行中的 Host

安装或链接即 Full Trust。Worker、App 与声明的 Runtime 使用与 Host 相同的本机权限。独立进程和 App frame 管热更新、崩溃和 dispose。安装确认句：

> 安装后该插件以你的本机用户权限运行，不是沙箱。

Host 保留开发目录。卸载链接只去掉 VibeX 一侧引用，永不删除该目录。源内容变化后重新校验身份、贡献和配置；候选代失败则上一完整代仍对外可见。

## 产品 CLI

本机已安装 `vibex`，且 Desktop 或 `vibex serve` 在跑：

```text
vibex plugin add --dev . -y
```

行为（`npx vibex plugin`）：

1. `build`（失败只警告）。
2. `validate`，失败则停止。
3. 用本机 Host token（`VIBEX_TOKEN` 或数据目录里的 `host.token`）调用 `plugin_control_import`，`developerLink: true`。
4. 尝试 `plugin_control_set_enabled`。
5. 监视源码；digest 变化后重新 build。未加 `--detach` 时把该插件 Worker stderr 打到当前终端。`--detach` 则链接后返回，由 Host 继续监视。

Host 未运行时，路径写入 `~/.vibex/imports/links.jsonl`，下次启动再导入。不要向用户或对话索要 token。

其它产品命令：

```text
vibex plugin pack [dir] [--output file.vxp]
vibex plugin add --profile file.vxp -y
vibex plugin add --web <git>#tag -y
vibex plugin add --web https://vibex.xforever.xin/marketplace/<owner>/<name> -y
vibex plugin list
vibex plugin update <id>
vibex plugin remove <id>
vibex plugin test --host [dir]
vibex plugin publish
```

`test --host` 会链接、启用、改一份 Skill、等待 digest 更新、再卸载；开发目录必须还在。

没有 `vibex plugin toolchain`。查 SDK/CLI 路径用 `vibex-plugin toolchain`。

`vibex-plugin install --link` / `dev` 若仍实现，只能作为同一 Host import 的别名。优先使用 `add --dev`。

## 来源锁与发布

市场安装记下 `sourceKind=marketplace`，更新问官网 Catalog `versions`。GitHub `--web` 记下 `sourceKind=github`，更新问该仓库的 tag。链接开发没有远端更新通道，不显示「可更新」。

用户明确要求上架：

```text
vibex plugin publish . --owner <市场用户名> --password <密码> [--show-tree]
vibex plugin publish --web <github-owner/repo[#tag]> --owner <市场用户名> --password <密码>
```

凭据也可用 `VIBEX_MARKET_OWNER` / `VIBEX_MARKET_PASSWORD`。GitHub owner 必须与市场用户名相同。待审包不会出现在 Catalog。
