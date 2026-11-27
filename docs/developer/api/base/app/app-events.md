# 应用级事件

| API | 起始版本 | 说明 |
| --- | --- | --- |
| `semi.onAppShow` | 0.8.0 | 注册插件进入前台监听。 |
| `semi.offAppShow` | 0.8.0 | 用同一函数取消插件进入前台监听。 |
| `semi.onAppHide` | 0.8.0 | 注册插件退出前台监听。 |
| `semi.offAppHide` | 0.8.0 | 用同一函数取消插件退出前台监听。 |
| `semi.onThemeChange` | 0.8.0 | 注册主题变化监听。 |
| `semi.offThemeChange` | 0.8.0 | 用同一函数取消主题变化监听。 |

应用级显隐以整个插件为单位。第一个界面显示时触发 `onAppShow`，最后一个界面隐藏、最小化或关闭时触发 `onAppHide`。同一个插件打开第二个界面时仍处于前台。无界面的后台不计入可见界面。建议在就绪握手前注册监听。

```ts
const show = () => resumeRefresh();
const hide = () => pauseRefresh();
semi.onAppShow(show);
semi.onAppHide(hide);
await semi.markViewReady();

// 结束业务时可以注销。
semi.offAppShow(show);
semi.offAppHide(hide);
```

单个窗口或对话框的可见性使用 `onEvent('lifecycle.visibility', callback)`。主题变化时 `onThemeChange` 的回调收到 `{ theme }`，此时 `getAppBaseInfo().theme` 已更新。

## 应用显隐

`onAppShow(callback)` 和 `onAppHide(callback)` 接收无参函数，返回 `void`。同一插件首次有界面可见时触发 show，最后一个可见界面隐藏或关闭时触发 hide。切换本插件的不同界面时，只要整体仍可见，就不会为每个视图分别触发。当前页轮询请监听 [`lifecycle.visibility`](./runtime.md#semi-onevent-name-callback)。

`offAppShow(callback?)` 和 `offAppHide(callback?)` 返回 `void`。传入注册时的同一个函数可移除单个监听，省略则清除此运行实例中该事件的所有监听。

## 主题变化

`onThemeChange(callback)` 的回调接收 `{ theme: 'light' | 'dark' }`。初始化时主动调用 `getAppBaseInfo()`，之后订阅变化。用 `offThemeChange(callback?)` 取消订阅，参数规则与显隐监听一致。

```js
const applyTheme = ({ theme }) => document.body.setAttribute('theme-mode', theme);
const onShow = () => console.log('插件界面进入前台');
const onHide = () => console.log('插件界面全部隐藏');

applyTheme(semi.getAppBaseInfo());
semi.onThemeChange(applyTheme);
semi.onAppShow(onShow);
semi.onAppHide(onHide);

// 组件卸载时执行。
function dispose() {
    semi.offThemeChange(applyTheme);
    semi.offAppShow(onShow);
    semi.offAppHide(onHide);
}
```
