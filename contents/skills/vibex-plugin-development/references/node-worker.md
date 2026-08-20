# Node Worker 可运行入口

Host 启动：

```text
node --max-old-space-size=128 <entrypoints.worker.path>
```

该进程必须在 stdin/stdout 上执行协议 1.1。

## 推荐拆分

```text
runtime/worker.mjs   # definePluginWorker(...)
runtime/main.mjs     # runStdioPluginWorker(definition)
```

`runtime/worker.mjs`：

```js
import { definePluginWorker } from '@vibex/plugin-sdk/worker';

export default definePluginWorker((registrar) => {
  registrar.handle('hello', async (input) => ({ ok: true, input }));
});
```

`runtime/main.mjs`：

```js
import { runStdioPluginWorker } from '@vibex/plugin-sdk/stdio';
import definition from './worker.mjs';

await runStdioPluginWorker(definition);
```

`vibex-plugin build` 把 `runtime/main.mjs` 打包为 `dist/worker.mjs`。清单：

```json
"entrypoints": {
  "worker": {
    "path": "dist/worker.mjs",
    "runtime": "node",
    "protocol": "1.1"
  }
}
```

官方 Office 采用此拆分。`init` 生成的 `runtime/main.mjs` 只有定义：在该文件增加 `runStdioPluginWorker` 调用，或拆成两个模块。

测试从 `runtime/worker.mjs` 导入定义。

TypeScript：定义放 `runtime/worker.ts`；`runtime/main.mjs` 导入该定义并调用 `runStdioPluginWorker`。
