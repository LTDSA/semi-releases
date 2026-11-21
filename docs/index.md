---
layout: home

hero:
  name: Semi
  text: 桌面设备管理
  tagline: 在 macOS 和 Windows 上管理路由器、NAS 和智能设备，并通过插件扩展功能。
  image:
    src: /logo.png
    alt: Semi 应用图标
  actions:
    - theme: brand
      text: 下载 Semi
      link: /download
    - theme: alt
      text: 快速开始
      link: /guide/
    - theme: alt
      text: 插件开发
      link: /developer/

features:
  - title: 小米路由器
    details: 查看路由状态和联网设备，管理网络与系统设置。支持本地登录和小米账号在线登录。
  - title: 绿联云 NAS
    details: 查看 CPU、GPU 和内存使用情况，按设备支持情况执行重启等操作。
  - title: 智能设备与音频
    details: 查看和控制米家智能设备，或安装音频互联插件，将 AirPlay 音频输出到兼容的小米音箱。
---

<div class="vp-doc" style="max-width: 1152px; margin: 64px auto 24px; padding: 0 24px;">

## 设备看板与统计图表

在设备看板查看已添加的设备及连接状态。统计图表按设备展示支持的指标，例如路由器网速和 NAS 内存占用。

功能可用性取决于设备型号、固件与实际能力。音频互联为实验性功能，米家设备和音箱的兼容性可能有所不同。

[了解连接方式 →](/guide/devices)

## 为 Semi 开发插件

使用标准 npm 包和无框架依赖的 SDK，连接设备、账号与服务，构建窗口、对话框和托盘功能。

[编写第一个插件 →](/developer/getting-started)

</div>
