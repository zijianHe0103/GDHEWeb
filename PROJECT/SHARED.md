# Shared Project Facts

schema_version: DPG-LANES-1.0.0

## Project

- name: GDHE 海外企业官网
- type: software

## Stable Goal

- 交付一个面向海外 B2B 客户、SEO 友好、快速、可访问、可人工管理九种语言的 GDHE 企业官网。
- 公开站使用独立前端，WordPress 是 Headless CMS，`wp-admin` 是最终内容后台。

## Boundaries

- 当前不开发第二套后台、订单/报价引擎、CRM 或生产管理。
- RapidDirect 只作为结构、视觉、交互、SEO 和转化参考，不复制未授权资产。
- 未确认框架、API、多语言插件和字段模型前，不初始化正式前端或自有 CMS 插件。

## Constraints

- 英语是默认源文，其他八种语言独立编辑、审核和发布；未发布译文不公开且不输出 hreflang。
- 阿拉伯语支持 RTL；语言切换保持当前页面语义。
- 前端自定义代码使用 TypeScript；WordPress 服务端自有扩展使用 PHP。
- 每次开发 1～3 个模块，在 1440/1024/768/390 px 对照验收后等待用户确认。
- 密钥、密码、`wp-config.php`、SQL 备份和运行数据不入库。

## Terms

- **Public frontend**: 独立框架生成的公开多语言网站。
- **Headless WordPress**: 内容和发布后台，通过受控 API 向前端提供数据，不承担公开站渲染。
- **Source locale**: 英语 `/`。
- **Translation sibling**: 同一内容实体的另一语言版本，具有自己的 slug、SEO 和发布状态。
- **Reference parity**: 在不复制未授权资产的前提下，对齐参考站的信息层级、视觉节奏、交互和转化效果。

## Cross-Lane Agreements

- 路线决策写入 `MEMORY/DECISIONS/`，任务状态只写入 `TASKS/` 和 `PROJECT/STATE.md`。
- 不用历史参考文档覆盖当前 ADR，不用聊天记忆替代项目文件。
- 产品代码只由对应拥有 lane 在已确认任务范围内修改；评审 lane 不直接修复。
- 未经用户精确验收口令，不生成正式提交、推送或合并。
