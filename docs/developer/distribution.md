# 构建与分发

## 独立构建

插件使用标准前端或 Node 构建工具。页面与 SDK 一起打包，资源地址使用相对路径：

```json
{
    "scripts": { "build": "vite build --base=./" },
    "files": ["dist"]
}
```

Node 后台可用 esbuild 等工具生成 CJS 或 ESM 入口。

## 检查发行内容

```sh
npm run build
npm pack --dry-run
npm pack
```

确认 `package.json.semi` 引用的入口与资源都在 tarball 中。安装接口接收已经可以运行的解包目录，不会替插件执行 `npm install` 或安装脚本。

依赖可以直接打入产物，或通过 npm `bundleDependencies` 分发。原生模块还需匹配平台、架构和 Electron ABI。

## 安装与分发

通过本地目录安装接口测试时，选择含有 `package.json` 和构建产物的插件目录。社区插件可从 Semi 的「发现」页安装。社区收录和分发方式见 [semi-plugins](https://github.com/LTDSA/semi-plugins)。

## 调试

开发模式下，插件页按 F12 打开自己的开发者工具。页面改动后刷新或重新打开；包声明和后台变化后重启应用。发行版不提供插件开发者工具。

## SDK 与宿主版本

SDK 跟随 Semi 发布，插件自己的版本独立维护：

```json
{
    "name": "my-semi-example",
    "version": "1.0.0",
    "engines": { "semi": ">=0.7.2" }
}
```

`engines.semi` 声明插件支持的 Semi 版本范围，`semi.canIUse()` 用于判断可选接口。
