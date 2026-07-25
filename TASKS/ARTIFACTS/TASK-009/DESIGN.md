# TASK-009 server-only `/resolve` Transport 设计

status: FROZEN
task_id: TASK-009
confirmed_at: 2026-07-25T04:55:14Z
owner_lane: planner
implementation_lane: frontend

## 1. 目的和边界

本任务把 TASK-008 的离线 `/resolve` 合同快照推进到“Next.js 服务端可以安全取得未知 JSON”的最小运行时层。它只负责：

1. 校验 CMS REST base；
2. 构造唯一允许的 `/gdhe/v1/resolve` 请求；
3. 发起一次匿名 GET；
4. 对超时、网络、协议和 HTTP 状态做稳定分类；
5. 把成功或错误 JSON 保持为 `unknown` 交给未来 Validator。

本任务不判断页面 DTO 是否符合 Schema，不渲染页面，也不把 404 转为 Next.js `notFound()`。

## 2. 文件和导入边界

生产实现位于 `frontend/src/lib/cms/server/`，采用少量聚焦模块：

- `config.ts`：REST base 解析与安全校验；
- `resolve-url.ts`：canonical public path 校验和固定 `/gdhe/v1/resolve` URL；
- `errors.ts`：typed errors 与受控响应 metadata；
- `transport.ts`：单次 HTTP 请求、超时、一次性 JSON 解析和状态映射；
- `index.ts`：唯一文档化的公共入口。

所有生产模块都必须导入官方 Next.js `server-only` marker，防止深层文件被 Client Component 绕过公共入口直接导入。不得把 CMS origin 或环境值导出。

Vitest 不运行 Next.js bundler，因此新增 `frontend/vitest.config.ts`，只把裸模块 `server-only` 精确映射到 `frontend/tests/server-only-stub.ts` 空模块。该 alias 只作用于测试，不改变 Next.js build。隔离证明使用一个临时工程或临时 Client Component 负例运行真实 Next.js build，并在结束后清理，确认导入受保护入口会因 `server-only` 失败。

## 3. 配置合同

`WORDPRESS_API_URL` 表示 REST base，不是 WordPress 首页，例如：

- 本地：`http://127.0.0.1:8080/wp-json`
- 生产：`https://cms.example.com/wp-json`

解析后必须满足：

- 是绝对 URL；
- scheme 只能为 HTTP 或 HTTPS；
- username、password、query 和 fragment 为空；
- pathname 规范化后精确为 `/wp-json`；
- HTTP 仅允许 `localhost`、`127.0.0.1` 或 IPv6 loopback；
- 非 loopback 必须使用 HTTPS；
- 缺失或非法值在任何 fetch 前产生 `CmsConfigurationError`。

错误 message 只描述配置类别，不回显输入值或 CMS origin。

## 4. 路径和 URL 合同

调用方只提供 canonical public path。Transport 固定：

- endpoint：`/gdhe/v1/resolve`
- `locale=en`
- `schema=3.0.0`

public path 使用 TASK-008 `public-path.schema.json` 已冻结规则：

- `/`，或一段以上小写 ASCII slug；
- 每段以字母或数字开头，只含小写字母、数字和连字符；
- 必须以 `/` 结尾；
- 最大 500 字符；
- 拒绝 query、fragment、反斜线、双斜线、点段、encoded separator、缺失尾斜线和大写。

使用 `URL` 与 `URLSearchParams` 编码，不手工拼接查询字符串。调用方不能覆盖 origin、endpoint、locale、schema 或新增参数。

## 5. 请求合同

Transport 只执行一次：

- method：`GET`
- header：`Accept: application/json`
- credentials：不设置 cookie、Authorization、nonce、Application Password 或其他认证 header
- redirect：`error`，不允许跳转到未审查 origin
- cache：技术接入阶段使用 `no-store`
- timeout：冻结默认值 `5000 ms`
- retry：`0`

生产入口读取 `process.env.WORDPRESS_API_URL`。测试通过内部依赖参数使用显式 base、较短 timeout 和原生 fetch，但不得向正式调用方公开任意 endpoint 或 credential 注入。

如调用方传入 `AbortSignal`，使用 Node 24 支持的组合 signal；默认 timeout 与调用方 abort 必须映射为不同错误种类。所有 timer/listener 在完成后释放。

## 6. 响应和 metadata

唯一成功状态为 `200`。响应必须具有 JSON media type，允许 `application/json` 或 `application/*+json`，可带 charset。正文只读取一次并执行一次 JSON parse；结果类型始终为 `unknown`。

成功结果：

```ts
type CmsTransportResponse = {
  body: unknown;
  metadata: {
    status: 200;
    requestId?: string;
    etag?: string;
    lastModified?: string;
    retryAfter?: string;
    contentType: string;
  };
};
```

metadata 只从 `X-GDHE-Request-ID`、`ETag`、`Last-Modified`、`Retry-After` 和 `Content-Type` 读取，不复制所有 headers。

`204`、`206`、`304` 或其他非 200 成功/重定向状态均为协议错误，因为本任务不发送条件请求且禁止 redirect。

## 7. Typed errors

错误使用稳定 class 和判别字段：

- `CmsConfigurationError`：环境/base 配置缺失或不安全；
- `CmsTransportError`：`timeout`、`aborted` 或 `network`；
- `CmsProtocolError`：`redirect`、`unexpected_success_status`、`invalid_content_type`、`empty_body` 或 `invalid_json`；
- `CmsHttpError`：HTTP 非 2xx，包含 status、受控 metadata 和稳定 kind。

`CmsHttpError.kind` 至少区分：

- `bad_request`：400
- `unauthorized`：401
- `forbidden`：403
- `not_found`：404
- `conflict`：409
- `rate_limited`：429
- `upstream_failure`：500/502/503
- `unexpected_status`：其他状态

HTTP 错误正文同样要求 JSON 并只解析一次；为了未来错误 Schema Validator，可通过非枚举只读访问器取得 `unknown` body。`message`、默认枚举属性和 JSON 序列化不得包含 body、CMS origin、cookie 或 credential。404 只标记 `kind: "not_found"`，不调用 `notFound()`。

## 8. 测试矩阵

测试先行，使用 Node `http` 在 loopback 随机端口创建真实进程内服务器：

1. 缺失/非法/带凭据/query/hash/base path/非 loopback HTTP 配置在零请求时拒绝；
2. `localhost`、IPv4 loopback、IPv6 loopback和 HTTPS base 接受；
3. canonical root/多段路径正确编码，非法 path 在零请求时拒绝；
4. 服务端实际收到一次 GET、固定 path/query、Accept JSON，且没有认证/cookie；
5. 200 JSON 返回 `unknown` body 和 allowlisted metadata；
6. 400/401/403/404/409/429/500/502/503/418 状态映射正确，429 保留 `Retry-After`；
7. redirect、204、304、非 JSON、空 JSON、畸形 JSON为协议错误；
8. 延迟响应触发 timeout，调用方 abort 与 timeout 可区分，无第二次请求；
9. 连接失败映射为 network；
10. error message、枚举和 JSON 序列化不出现 CMS origin 或响应正文；
11. 真实 Next.js client-import 负例失败，正常 production build 通过；
12. TASK-008 parity、现有全量测试和禁止范围保持通过。

测试必须关闭 HTTP server、socket 和临时目录，不留下固定端口或后台进程。

## 9. 文档

`frontend/README.md` 必须说明：

- `WORDPRESS_API_URL` 现在由 server-only Transport 实际使用；
- 本地 HTTP 仅允许 loopback，生产使用 HTTPS；
- Transport 只完成网络和错误分类，返回值仍未经过 Schema Validator；
- 当前没有可见 CMS 页面、正式 route、缓存、Preview 或重试；
- 如何运行 focused test、全量测试和 build。

根 README 仅在现有治理规则要求时增加最小指针，不复制完整设计。

## 10. 明确非目标

- Runtime Schema Validator、Ajv/Zod；
- frontend DTO、Adapter、route、`notFound()` 和可见页面；
- live WordPress E2E、Fixture 或数据库写入；
- dependency/lockfile 修改；
- collection/navigation/route-manifest；
- cache、deduplication、retry、Preview、Webhook、SEO、多语言和部署。
