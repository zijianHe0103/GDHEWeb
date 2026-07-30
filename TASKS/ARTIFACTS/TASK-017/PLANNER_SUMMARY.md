# TASK-017 Planner Summary

Date: 2026-07-31
Task: `TASK-017`
Planner result: `PASS`
Acceptance: `NOT_ACCEPTED`
Git delivery: `NOT_STARTED`

## 完成内容

TASK-017 建立了第一个可在本地浏览器中查看的英语 ProductCard 列表纵向切片：

```text
/products/
  -> server-only 本地模式门
  -> preview 保护图候选，或 TASK-016 CMS consumer
  -> 只读 ProductCard DTO
  -> ProductCard 列表与安全状态
```

实现包含：

- `/products/` 英语 Server Component 页面；
- `GDHE_PRODUCT_LIST_MODE=preview|cms` 单一 server-only 本地开关；
- 默认、未知模式和 production 环境固定 404；
- 页面固定 `noindex,nofollow` 且动态渲染；
- DTO-only ProductCard 组件和响应式网格；
- 图片、型号、英文名称、主分类、关键属性、摘要、停产状态和合同动作；
- `View Product`、`Request a Quote`、`Contact Us for Replacement` 三类冻结动作；
- 明确的 ready、empty、unavailable 和 preview 状态；
- 带 GDHE 品牌保护的 FGD X15 本地测试图片；
- CMS 模式一次 ProductCard collection 请求、零逐卡 `/resolve`；
- 生产环境本地模式禁用 smoke。

## 媒体安全修订

Adversarial Round 1 发现 Schema-valid 的 WordPress 远程媒体 URL 会穿过
Validator/Adapter，并由 React 输出浏览器 preload 和 `img`。

窄修订在 TASK-017 的 server-only 页面编排层增加固定 synthetic-origin
媒体门：

- 未授权绝对、协议相对、反斜线混淆、带凭据或格式错误的路径在 React 前拒绝；
- 非空集合只要包含非授权媒体，整组进入脱敏 unavailable；
- 不部分隐藏卡片，不猜测 CDN，不代理任意 URL，也不替换为内部原图；
- 合法空集合仍显示独立 empty 状态；
- preview 仍只使用仓库内受保护测试图；
- 真实页面回归证明一次 collection、零 `/resolve`，HTML 不含 hostile
  URL、origin、preload、`img`、raw payload 或诊断信息。

生产公开媒体 origin 和 Next Image allowlist 仍是后续独立任务，不在
TASK-017 中猜测。

## 视觉验证

Visual Round 1：`FAIL / 严重 0 / 明显 1 / 细节 1`。

- 1024px 首次渲染 CTA 被卡片固定高度裁切；
- 媒体链接焦点轮廓被卡片边界裁切。

窄 CSS 修订只将现有 64rem 断点的卡片正文改为内容高度，并把媒体焦点
轮廓收进卡片内部。Visual Round 2：
`PASS / 严重 0 / 明显 0 / 细节 0`。

证据覆盖 1440、1024、768、390 px，以及 320 CSS px reflow、键盘顺序、
焦点可见和 CTA pointer hit-test。

## 独立审查

Adversarial Round 1：
`FAIL / P0=0 / P1=1 / P2=2`。该历史完整保留。

- P1：远程 WordPress media 造成浏览器直连面；
- P2：`next-env.d.ts` 留有 dev route-types 生成差异；
- P2：review ACK 叙述滞后。

Adversarial Round 2：
`PASS / P0=0 / P1=0 / P2=0`。

审查独立复现媒体攻击关闭、`next-env.d.ts` 基线恢复、治理叙述同步和受
保护范围一致。

## Planner 最终验证范围

冻结工具链：Node.js `v24.18.0`、npm `11.16.0`。

- ProductList：`4 files / 29 tests`；
- TASK-016 focused：`5 files / 73 tests`；
- 完整 Vitest：`19 files / 273 tests`；
- ProductCard verifier：`8 Schema / 3 success / 6 errors`；
- 旧 CMS verifier：`16 Schema / 2 success / 2 errors`；
- ESLint、TypeScript typecheck、Next.js production build：PASS；
- production smoke：preview/cms 都是 404，root 200，integration 404，
  CMS requests 0；
- package/lock、CMS、TASK-014～016 contracts/runtime 和现有路由：
  基线一致；
- `next-env.d.ts`：基线零差异；
- 保护图 SHA-256：
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`；
- `git diff --check` 与 DPG project、registry、messages、strict lane：
  PASS。

## 本地查看

在 `frontend/` 中运行：

```sh
GDHE_PRODUCT_LIST_MODE=preview npm run dev
```

然后打开：

```text
http://localhost:3000/products/
```

该页面会显示带明确本地测试提示的 FGD X15 保护图候选。它不是正式产品
目录，也不会在 production 模式公开。

## 明确未完成

TASK-017 没有实现完整 Header、Mega Menu、Footer、产品详情页、分类筛选、
分页、可提交 RFQ、Contact 页面、飞书写入、正式 SEO、真实产品导入、
生产媒体配置、多语言、部署或公开发布。

CMS 模式当前只用于验证真实消费链；正式媒体 gate 未完成前，带远程媒体
的非空集合会安全显示 unavailable。

## 下一门

任务具备进入用户验收等待状态的技术条件，但当前仍为
`NOT_ACCEPTED / DIRTY`。只有用户输入精确口令：

```text
确认 TASK-017 完成并提交到远端
```

才允许执行正式提交、推送任务分支、合并并推送 `main`。在此之前不开始
TASK-018 或其他正式前端页面。
