# 项目约束

schema_version: DPG-LANES-1.0.0

## 硬约束

- 不覆盖 managed block 之外的用户文件。
- 不复制已有权威文档。
- 不把 Codex 原生 memory 当作项目规则、任务状态或关键决策的唯一来源。

## 项目特定约束

- 架构为独立前端 + Headless WordPress；`wp-admin` 是唯一最终内容管理后台。
- 不将 Elementor、WordPress 主题或 RapidDirect 的私有 `mml-theme` 作为公开站实施基础。
- 自定义前端代码使用 TypeScript；页面、组件、数据访问和 SEO 配置必须分层并复用。
- WordPress 服务端扩展使用 PHP，只放入 GDHE 自有插件或 MU Plugin；不直接修改 WordPress 核心或第三方插件。
- 英语 URL 为 `/`；法语 `/fr/`、德语 `/de/`、西班牙语 `/es/`、简体中文 `/zh-CN/`、阿拉伯语 `/ar/`、印地语 `/hi/`、日语 `/ja/`、葡萄牙语 `/pt/`。
- 语言切换必须指向当前页面的对应译文，不得统一返回首页。
- 英语是源文；其他语言在 `wp-admin` 分别保存、编辑、审核和发布。未发布译文不输出公开页面或 hreflang。
- 机器翻译不作为正式发布流程；阿拉伯语必须在组件、布局、排版和交互层支持 RTL。
- 只参考 RapidDirect 的可见结构和模式；使用 GDHE 自有品牌、Logo、内容、媒体、联系方式和 SEO 文案。
- 开发以小批次进行：每次 1～3 个模块，本地运行后按 1440/1024/768/390 px 截图对照，优先修正严重和明显差异，再等待用户确认。
- 不擅自提交、推送、合并、部署或开发范围外的后台功能。
- 凭据、`.env*`、`wp-config.php`、SQL 备份、上传和运行时产物不得入库。
