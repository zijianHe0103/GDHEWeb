'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const repoRoot = path.resolve(root, '../../../../../..');
const Ajv2020 = require(path.join(repoRoot, 'frontend/node_modules/ajv/dist/2020')).default;
const addFormats = require(path.join(repoRoot, 'frontend/node_modules/ajv-formats'));
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));
const exactJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const setJsonPointer = (document, pointer, value) => {
  const segments = pointer.split('/').slice(1).map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'));
  if (segments.length === 0) throw new Error('root_pointer_forbidden');
  let target = document;
  for (const segment of segments.slice(0, -1)) target = target[segment];
  target[segments.at(-1)] = value;
  return document;
};

const schemaDir = path.join(root, 'schemas');
const schemaFiles = fs.readdirSync(schemaDir).filter((name) => name.endsWith('.json')).sort();
if (schemaFiles.length !== 5) throw new Error(`expected exactly 5 v2 schemas, found ${schemaFiles.length}`);
const schemas = schemaFiles.map((name) => readJson(`schemas/${name}`));
const refs = [];
const walkRefs = (value) => {
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach(walkRefs);
  for (const [key, child] of Object.entries(value)) {
    if (key === '$ref') refs.push(child);
    walkRefs(child);
  }
};
schemas.forEach(walkRefs);
for (const ref of refs) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref)) throw new Error(`network or absolute ref forbidden: ${ref}`);
  const [file] = ref.split('#');
  if (file && !schemaFiles.includes(file)) throw new Error(`unclosed local ref: ${ref}`);
}

const ajv = new Ajv2020({ allErrors: true, strict: true, loadSchema: async () => { throw new Error('network resolution disabled'); } });
addFormats(ajv);
for (const schema of schemas) ajv.addSchema(schema);
const validator = (name) => {
  const validate = ajv.getSchema(name);
  if (!validate) throw new Error(`missing compiled schema: ${name}`);
  return validate;
};

const assertUnicodeScalarString = (value) => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error('invalid_unicode');
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new Error('invalid_unicode');
    }
  }
};

const assertUnicodeScalars = (value) => {
  if (typeof value === 'string') return assertUnicodeScalarString(value);
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach(assertUnicodeScalars);
  for (const [key, child] of Object.entries(value)) {
    assertUnicodeScalarString(key);
    assertUnicodeScalars(child);
  }
};

const canonicalize = (value) => {
  if (typeof value === 'string') {
    assertUnicodeScalarString(value);
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('unsupported_canonical_value');
    return JSON.stringify(value);
  }
  if (value === null || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value !== 'object') throw new Error('unsupported_canonical_value');
  return `{${Object.keys(value).sort().map((key) => {
    assertUnicodeScalarString(key);
    return `${JSON.stringify(key)}:${canonicalize(value[key])}`;
  }).join(',')}}`;
};
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const hmac256 = (keyHex, text) => crypto.createHmac('sha256', Buffer.from(keyHex, 'hex')).update(text).digest('hex');
const utf8Length = (value) => Buffer.byteLength(canonicalize(value), 'utf8');

const assertUnique = (lines, keyFn, errorCode) => {
  const seen = new Set();
  for (const line of lines) {
    const key = keyFn(line);
    if (seen.has(key)) throw new Error(errorCode);
    seen.add(key);
  }
};
const publicIdentity = (line) => line.lineKind === 'configured_product'
  ? canonicalize({ lineKind: line.lineKind, canonicalPath: line.canonicalPath, selection: line.selection, packaging: line.packaging, quantityUnit: line.quantityUnit })
  : canonicalize({ lineKind: line.lineKind, articleNumber: line.articleNumber, quantityUnit: line.quantityUnit });

const assertPublicSemantics = (document) => {
  assertUnicodeScalars(document);
  const lines = document.basket.items;
  assertUnique(lines, (line) => line.entryId.toLowerCase(), 'duplicate_entry_id');
  assertUnique(lines, publicIdentity, 'duplicate_merge_identity');
  if (utf8Length(document.basket) > 163840) throw new Error('basket_too_large');
  const snapshot = document.basket.sourceBasket;
  if (Date.parse(snapshot.expiresAt) - Date.parse(snapshot.updatedAt) !== 2592000000) throw new Error('invalid_basket_ttl');
};

const allowedErrorFields = {
  invalid_customer_fields: new Set(['fullName', 'companyName', 'whatsApp', 'weChat', 'businessEmail', 'phone', 'countryRegion', 'city', 'companyWebsite', 'message', 'contactMethods', 'privacyNotice']),
  invalid_line_count: new Set(['lineCount']),
  invalid_quantity: new Set(['quantity']),
  basket_refresh_required: new Set(['basket']),
  product_unavailable: new Set(['selection']),
  configuration_changed: new Set(['selection', 'packaging']),
};
const errorCodeRules = {
  invalid_line_count: new Set(['invalid']), invalid_quantity: new Set(['invalid']),
  basket_refresh_required: new Set(['expired', 'changed', 'unavailable']), product_unavailable: new Set(['unavailable']),
  configuration_changed: new Set(['changed', 'unavailable']),
};
const assertErrorSemantics = (document) => {
  assertUnicodeScalars(document);
  const { code, messageKey, fieldErrors, retryAfterSeconds } = document.error;
  if (messageKey !== `rfq.error.${code}`) throw new Error('message_key_mismatch');
  if ((code === 'rate_limited') !== (retryAfterSeconds !== undefined)) throw new Error('retry_pair_mismatch');
  const allowed = allowedErrorFields[code];
  if (allowed) {
    if (!fieldErrors?.length) throw new Error('required_field_errors_missing');
    for (const item of fieldErrors) {
      if (!allowed.has(item.field)) throw new Error('cross_domain_field_error');
      const codes = errorCodeRules[code];
      if (codes && !codes.has(item.code)) throw new Error('cross_domain_field_error');
    }
  } else if (fieldErrors !== undefined) throw new Error('field_errors_forbidden');
};

const assertAuthoritativeSemantics = (document, digestContext) => {
  assertUnicodeScalars(document);
  assertUnique(document.lines, (line) => line.entryId.toLowerCase(), 'duplicate_entry_id');
  for (const line of document.lines) {
    if (line.lineKind === 'configured_product' && line.resolution === 'resolved_article_number' && line.articleNumber !== line.selection.articleNumber) {
      throw new Error('authoritative_article_number_mismatch');
    }
  }
  if (Date.parse(document.idempotency.expiresAt) - Date.parse(document.idempotency.createdAt) !== 2592000000) throw new Error('invalid_idempotency_ttl');
  if (!digestContext) throw new Error('missing_digest_context');
  if (document.payloadDigest.keyVersion !== digestContext.keyVersion || document.payloadDigest.value !== digestContext.value) {
    throw new Error('authoritative_payload_digest_mismatch');
  }
};

const task025RequestSchema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'cms/wp-content/plugins/gdhe-site/config/schemas/mixed-quote-line-validation-request.v1.schema.json'), 'utf8'));
const task025ResponseSchema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'cms/wp-content/plugins/gdhe-site/config/schemas/mixed-quote-line-validation-response.v1.schema.json'), 'utf8'));
const task025PublicPathSchema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'cms/wp-content/plugins/gdhe-site/config/schemas/public-path.schema.json'), 'utf8'));
const task025BasketSchema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'frontend/src/lib/quote-basket-contract/v3/schemas/quote-basket.v3.schema.json'), 'utf8'));
const task025PublicPathAlias = { ...task025PublicPathSchema, $id: 'https://gdhe.example/schemas/product-card/v1/public-path.schema.json' };
// Frozen TASK-025 Schemas predate strictTypes annotations. The new v2 graph
// compiles strictly above; compatibility loads frozen bytes without mutation.
const compatAjv = new Ajv2020({ allErrors: true, strict: false, loadSchema: async () => { throw new Error('network resolution disabled'); } });
addFormats(compatAjv);
compatAjv.addSchema(task025PublicPathSchema);
compatAjv.addSchema(task025PublicPathAlias);
compatAjv.addSchema(task025RequestSchema);
compatAjv.addSchema(task025ResponseSchema);
compatAjv.addSchema(task025BasketSchema);
const validateTask025Request = compatAjv.getSchema(task025RequestSchema.$id);
const validateTask025Response = compatAjv.getSchema(task025ResponseSchema.$id);
const validateTask025Basket = compatAjv.getSchema(task025BasketSchema.$id);

const projectBasketV3 = (source) => {
  assertUnicodeScalars(source);
  if (!validateTask025Basket(source)) throw new Error('invalid_basket_v3');
  if (source.items.length < 1 || source.items.length > 50) throw new Error('invalid_line_count');
  if (source.items.some((line) => line.state !== 'ready')) throw new Error('basket_line_not_ready');
  const items = source.items.map((line) => {
    if (line.lineKind === 'catalog_accessory') {
      return {
        entryId: line.entryId.toLowerCase(), lineKind: 'catalog_accessory', articleNumber: line.articleNumber,
        quantityUnit: line.quantityUnit, quantity: line.quantity,
      };
    }
    const custom = line.selection.type === 'custom';
    return {
      entryId: line.entryId.toLowerCase(), lineKind: 'configured_product', canonicalPath: line.product.publicPath,
      selection: {
        type: custom ? 'custom_length' : 'article_number', articleNumber: line.articleNumber,
        lengthMeters: line.selection.lengthMeters, color: clone(line.selection.color), resolution: line.resolution,
      },
      packaging: {
        basePackaging: line.packaging.basePackaging.key, logoPrinting: line.packaging.logoPrinting,
        protectionArrangement: line.packaging.protectionArrangement?.key ?? null,
      },
      quantityUnit: line.quantityUnit, quantity: line.quantity,
    };
  });
  return {
    contractVersion: '2.0.0',
    sourceBasket: {
      schemaVersion: source.schemaVersion, revision: source.revision, writerId: source.writerId.toLowerCase(),
      mutationId: source.mutationId.toLowerCase(), updatedAt: source.updatedAt, expiresAt: source.expiresAt,
    },
    items,
  };
};

const toTask025Request = (publicDocument) => ({ apiVersion: '1', schemaVersion: '1.0.0', locale: 'en', lines: clone(publicDocument.basket.items) });
const bindTask025Response = (request, response) => {
  if (!validateTask025Request(request)) throw new Error('invalid_task025_request');
  if (!validateTask025Response(response)) throw new Error('invalid_task025_response');
  if (request.lines.length !== response.lines.length) throw new Error('task025_response_mismatch');
  const lines = [];
  for (let index = 0; index < request.lines.length; index += 1) {
    const submitted = request.lines[index];
    const resolved = response.lines[index];
    if (resolved.entryId !== submitted.entryId || resolved.lineKind !== submitted.lineKind || resolved.quantityUnit !== submitted.quantityUnit || resolved.quantity !== submitted.quantity) {
      throw new Error('task025_response_mismatch');
    }
    if (submitted.lineKind === 'catalog_accessory') {
      if (resolved.resolution !== 'resolved_article_number' || resolved.publicPath !== null || resolved.articleNumber !== submitted.articleNumber) throw new Error('task025_response_mismatch');
      lines.push(clone(resolved));
      continue;
    }
    if (resolved.publicPath !== submitted.canonicalPath || !exactJson(resolved.packaging, submitted.packaging) || resolved.selection.lengthMeters !== submitted.selection.lengthMeters || !exactJson(resolved.selection.color, submitted.selection.color)) {
      throw new Error('task025_response_mismatch');
    }
    if (submitted.selection.resolution === 'sales_follow_up') {
      if (resolved.resolution !== 'sales_follow_up' || resolved.articleNumber !== null || resolved.selection.type !== 'custom_length' || resolved.selection.articleNumber !== null) throw new Error('task025_response_mismatch');
      lines.push({ ...clone(resolved), followUpReason: 'custom_length' });
      continue;
    }
    if (resolved.resolution !== 'resolved_article_number' || typeof resolved.articleNumber !== 'string' || resolved.selection.type !== 'article_number' || resolved.selection.articleNumber !== resolved.articleNumber || resolved.articleNumber !== submitted.selection.articleNumber) {
      throw new Error('task025_response_mismatch');
    }
    lines.push(clone(resolved));
  }
  return lines;
};
const assertBoundAuthoritative = (request, response, document) => {
  const bound = bindTask025Response(request, response);
  if (!exactJson(bound, document.lines)) throw new Error('authoritative_binding_mismatch');
};

const computeCryptoEvidence = (vector, business) => {
  const canonicalBusinessPayload = canonicalize(business);
  const sourceBasketCanonical = canonicalize(business.basket.sourceBasket);
  return {
    canonicalBusinessPayload,
    payloadDigestHmacSha256Hex: hmac256(vector.algorithm.testSecretKeyHex, vector.algorithm.macInputPrefixUtf8 + canonicalBusinessPayload),
    comparisonTokenSha256Hex: sha256(vector.algorithm.comparisonInputPrefixUtf8 + canonicalBusinessPayload),
    sourceBasketCanonical,
    submittedBasketTokenSha256Hex: sha256(vector.algorithm.snapshotInputPrefixUtf8 + sourceBasketCanonical),
  };
};
const assertCryptoEvidence = (vector, business) => {
  assertUnicodeScalars(business);
  if (vector.algorithm.canonicalization !== 'RFC8785-JCS' || vector.algorithm.macInputPrefixUtf8 !== 'GDHE-RFQ-DIGEST-V2\n2.0.0\n' || vector.algorithm.comparisonInputPrefixUtf8 !== 'GDHE-RFQ-COMPARISON-V2\n2.0.0\n' || vector.algorithm.snapshotInputPrefixUtf8 !== 'GDHE-RFQ-BASKET-SNAPSHOT-V2\n') throw new Error('algorithm_mismatch');
  const actual = computeCryptoEvidence(vector, business);
  if (actual.canonicalBusinessPayload !== vector.canonicalBusinessPayload) throw new Error('canonical_bytes_mismatch');
  if (actual.payloadDigestHmacSha256Hex !== vector.payloadDigestHmacSha256Hex) throw new Error('hmac_mismatch');
  if (actual.comparisonTokenSha256Hex !== vector.comparisonTokenSha256Hex) throw new Error('comparison_token_mismatch');
  if (actual.sourceBasketCanonical !== vector.sourceBasketCanonical || actual.submittedBasketTokenSha256Hex !== vector.submittedBasketTokenSha256Hex) throw new Error('snapshot_token_mismatch');
  return actual;
};

const replayPrefix = ['source_traffic_telemetry', 'transport_and_closed_contract_gates', 'canonical_digest', 'bounded_idempotency_lookup'];
const evaluateReplay = (input, retentionMs) => {
  const inputKeys = Object.keys(input).sort();
  if (!exactJson(inputKeys, ['now', 'preReservationGate', 'record', 'submittedDigest'])) throw new Error('invalid_replay_input');
  const nowMs = Date.parse(input.now);
  if (!Number.isFinite(nowMs)) throw new Error('invalid_replay_time');
  if (input.record !== null) {
    const recordKeys = Object.keys(input.record).sort();
    if (!exactJson(recordKeys, ['createdAt', 'digest', 'expiresAt', 'status'])) throw new Error('invalid_replay_record');
    const createdAtMs = Date.parse(input.record.createdAt);
    const expiresAtMs = Date.parse(input.record.expiresAt);
    if (expiresAtMs - createdAtMs !== retentionMs) throw new Error('invalid_first_reservation_anchor');
    if (nowMs < expiresAtMs) {
      const same = input.submittedDigest === input.record.digest;
      return {
        decision: same ? 'return_stored_public_state' : 'idempotency_conflict',
        effectOrder: [...replayPrefix, same ? 'return_stored_public_state' : 'return_idempotency_conflict'],
        durableBusinessState: 'unchanged', createdAt: input.record.createdAt, expiresAt: input.record.expiresAt,
        downstreamDispatches: 0, replayExtendsExpiry: false, automaticResend: false,
      };
    }
    if (input.record.status === 'delivery_indeterminate') {
      return {
        decision: 'controlled_reconciliation_required',
        effectOrder: [...replayPrefix, 'recognize_expired_indeterminate', 'require_controlled_reconciliation'],
        durableBusinessState: 'unchanged', createdAt: input.record.createdAt, expiresAt: input.record.expiresAt,
        downstreamDispatches: 0, replayExtendsExpiry: false, automaticResend: false,
      };
    }
  }
  if (input.preReservationGate === 'reject') {
    return {
      decision: 'pre_reservation_rejection', effectOrder: [...replayPrefix, 'pre_reservation_gates', 'return_rejection'],
      durableBusinessState: 'none', createdAt: null, expiresAt: null, downstreamDispatches: 0,
      replayExtendsExpiry: false, automaticResend: false,
    };
  }
  if (input.preReservationGate !== 'pass') throw new Error('invalid_replay_gate');
  return {
    decision: 'new_business_attempt', effectOrder: [...replayPrefix, 'pre_reservation_gates', 'durable_reservation', 'authoritative_resolution_eligible'],
    durableBusinessState: 'new_reservation', createdAt: input.now,
    expiresAt: new Date(nowMs + retentionMs).toISOString(), downstreamDispatches: 0,
    replayExtendsExpiry: false, automaticResend: false,
  };
};
const replayIds = ['unexpired_same_digest', 'unexpired_different_digest', 'unseen_fresh_valid', 'pre_reservation_rejected', 'expired_indeterminate'];
const assertReplayEvidence = (vector) => {
  if (!exactJson(vector.replayCases.map((item) => item.id), replayIds)) throw new Error('replay_tuple_set_mismatch');
  for (const tuple of vector.replayCases) {
    if (!exactJson(evaluateReplay(tuple.input, vector.retentionMs), tuple.expected)) throw new Error('replay_effect_mismatch');
  }
};

let failures = 0;
let checks = 0;
let positiveChecks = 0;
let negativeChecks = 0;
const check = (label, condition, category = 'positive') => {
  checks += 1;
  if (category === 'negative') negativeChecks += 1; else positiveChecks += 1;
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
  if (!condition) failures += 1;
};
const rejects = (fn, expected) => {
  try { fn(); return false; } catch (error) { return error instanceof Error && (!expected || error.message === expected); }
};

const matrix = readJson('samples/matrix.json');
const negativeManifest = readJson('samples/negative/manifest.json');
if (negativeManifest.cases.length !== 21) throw new Error(`expected 21 original deterministic negatives, found ${negativeManifest.cases.length}`);
const manifestIds = new Set(negativeManifest.cases.map((item) => item.id));
if (matrix.generatedNegativeProbes.some((id) => !manifestIds.has(id)) || manifestIds.size !== matrix.generatedNegativeProbes.length) throw new Error('negative sample matrix/manifest mismatch');

const base = readJson('samples/positive/public-mixed.json');
const expected = readJson('vectors/expected.v2.json');
const business = { basket: base.basket, customer: base.customer, privacyNotice: base.privacyNotice };
const computedCrypto = assertCryptoEvidence(expected, business);
const digestContext = { keyVersion: expected.algorithm.testKeyVersion, value: computedCrypto.payloadDigestHmacSha256Hex };

for (const [schemaName, file] of matrix.positiveFiles) {
  const value = readJson(file);
  const valid = validator(schemaName)(value);
  check(`schema positive ${file}`, valid);
  if (schemaName.startsWith('public-rfq-submission')) check(`semantic positive ${file}`, !rejects(() => assertPublicSemantics(value)));
  else if (schemaName.startsWith('authoritative')) check(`semantic positive ${file}`, !rejects(() => assertAuthoritativeSemantics(value, digestContext)));
  else if (schemaName.startsWith('public-rfq-error')) check(`semantic positive ${file}`, !rejects(() => assertErrorSemantics(value)));
  else check(`Unicode semantic positive ${file}`, !rejects(() => assertUnicodeScalars(value)));
}

const readySource = readJson('samples/basket-v3/ready-mixed.json');
check('ready Basket 3.0 source validates against frozen Schema', validateTask025Basket(readySource));
const projectedBasket = projectBasketV3(readySource);
const projectedDocument = clone(base); projectedDocument.basket = projectedBasket;
check('ready Basket 3.0 projection is exact public v2 Basket', exactJson(projectedBasket, base.basket) && validator('public-rfq-submission-draft.v2.schema.json')(projectedDocument) && !rejects(() => assertPublicSemantics(projectedDocument)));
check('ready configured standard cell projects', projectedBasket.items[0].selection.type === 'article_number' && projectedBasket.items[0].selection.articleNumber === 'GDHEPRD000172');
check('ready configured custom cell projects', projectedBasket.items[1].selection.type === 'custom_length' && projectedBasket.items[1].selection.articleNumber === null && projectedBasket.items[1].selection.resolution === 'sales_follow_up');
check('ready catalog accessory cell projects', projectedBasket.items[2].lineKind === 'catalog_accessory' && projectedBasket.items[2].articleNumber === 'GDHEPRD000901');
for (const [name, file] of [['requires_validation', 'samples/basket-v3/requires-validation.json'], ['requires_readd', 'samples/basket-v3/requires-readd.json']]) {
  const source = readJson(file);
  check(`${name} source is a real valid Basket 3.0 fixture`, validateTask025Basket(source));
  check(`${name} rejects before projection`, rejects(() => projectBasketV3(source), 'basket_line_not_ready'), 'negative');
}

const one = clone(base); one.basket.items = [one.basket.items[0]];
check('one-line boundary', validator('public-rfq-submission-draft.v2.schema.json')(one) && !rejects(() => assertPublicSemantics(one)));
const fifty = clone(base); fifty.basket.items = Array.from({ length: 50 }, (_, index) => ({
  ...clone(base.basket.items[0]), entryId: `26000000-0000-4000-8000-${String(1000 + index).padStart(12, '0')}`,
  canonicalPath: `/products/task-026-${index + 1}/`,
  selection: { ...clone(base.basket.items[0].selection), articleNumber: `GDHEPRD${String(100000 + index).padStart(6, '0')}` },
}));
check('fifty-line boundary', validator('public-rfq-submission-draft.v2.schema.json')(fifty) && !rejects(() => assertPublicSemantics(fifty)));

const negativeMutations = [
  ['missing standard Article Number', (v) => { delete v.basket.items[0].selection.articleNumber; }],
  ['missing accessory Article Number', (v) => { delete v.basket.items[2].articleNumber; }],
  ['fabricated custom Article Number', (v) => { v.basket.items[1].selection.articleNumber = 'GDHEPRD000999'; }],
  ['unknown public state field', (v) => { v.basket.items[0].state = 'requires_validation'; }],
  ['zero lines', (v) => { v.basket.items = []; }],
  ['fifty-one lines', (v) => { v.basket.items = fifty.basket.items.concat(clone(fifty.basket.items[0])); }],
  ['zero quantity', (v) => { v.basket.items[0].quantity = 0; }],
  ['unsafe quantity', (v) => { v.basket.items[0].quantity = 9007199254740992; }],
  ['display field leakage', (v) => { v.basket.items[0].model = 'FGD X15+PVC'; }],
  ['internal field leakage', (v) => { v.basket.items[0].wordpressId = 42; }],
  ['unknown top-level key', (v) => { v.debug = true; }],
  ['no contact method', (v) => { delete v.customer.whatsApp; }],
];
for (const [label, mutate] of negativeMutations) {
  const value = clone(base); mutate(value);
  check(`reject ${label}`, !validator('public-rfq-submission-draft.v2.schema.json')(value), 'negative');
}
const duplicateId = clone(base); duplicateId.basket.items[1].entryId = duplicateId.basket.items[0].entryId;
check('reject duplicate entryId', validator('public-rfq-submission-draft.v2.schema.json')(duplicateId) && rejects(() => assertPublicSemantics(duplicateId), 'duplicate_entry_id'), 'negative');
const duplicateMerge = clone(base); duplicateMerge.basket.items = [clone(base.basket.items[0]), clone(base.basket.items[0])]; duplicateMerge.basket.items[1].entryId = '26000000-0000-4000-8000-000000000199';
check('reject duplicate merge identity', validator('public-rfq-submission-draft.v2.schema.json')(duplicateMerge) && rejects(() => assertPublicSemantics(duplicateMerge), 'duplicate_merge_identity'), 'negative');

const authoritative = readJson('samples/positive/authoritative-mixed.json');
const states = [
  ['idempotency_reserved', 'not_started', 0], ['resolving_lines', 'not_started', 0], ['delivery_pending', 'pending', 1],
  ['accepted', 'accepted', 1], ['delivery_indeterminate', 'indeterminate', 1], ['rejected_before_delivery', 'rejected', 0],
];
for (const [status, state, attemptCount] of states) {
  const value = clone(authoritative); value.status = status; value.delivery.state = state; value.delivery.attemptCount = attemptCount;
  check(`authoritative state ${status}`, validator('authoritative-rfq-document.v2.schema.json')(value) && !rejects(() => assertAuthoritativeSemantics(value, digestContext)));
}
const badState = clone(authoritative); badState.delivery.state = 'not_started'; badState.delivery.attemptCount = 0;
check('reject invalid authoritative state combination', !validator('authoritative-rfq-document.v2.schema.json')(badState), 'negative');

const crossDomain = readJson('samples/positive/public-error.json'); crossDomain.error.fieldErrors[0].field = 'fullName'; delete crossDomain.error.fieldErrors[0].entryId;
check('reject cross-domain field error', validator('public-rfq-error.v2.schema.json')(crossDomain) && rejects(() => assertErrorSemantics(crossDomain), 'cross_domain_field_error'), 'negative');
const publicLeak = JSON.stringify([readJson('samples/positive/accepted-receipt.json'), readJson('samples/positive/processing-receipt.json'), readJson('samples/positive/public-error.json')]);
check('public receipt/error excludes Article Number and identity', !/GDHEPRD|articleNumber|canonicalPath|publicPath|model|customer|rfqId|idempotencyKey/.test(publicLeak));

const task025Request = readJson('samples/task025/batch-request-ready-mixed.json');
const task025Response = readJson('samples/task025/batch-response-ready-mixed.json');
check('projected lines equal deterministic TASK-025 request fixture', exactJson(toTask025Request(projectedDocument), task025Request));
check('TASK-025 mixed request compatibility', validateTask025Request(task025Request));
check('TASK-025 mixed response compatibility', validateTask025Response(task025Response));
check('complete TASK-025 response binds exact authoritative lines', !rejects(() => assertBoundAuthoritative(task025Request, task025Response, authoritative)));

const responseBindingMutations = [
  ['count', (v) => { v.lines.pop(); }], ['order and kind', (v) => { [v.lines[0], v.lines[2]] = [v.lines[2], v.lines[0]]; }],
  ['entryId', (v) => { v.lines[0].entryId = '26000000-0000-4000-8000-000000000199'; }],
  ['quantity unit', (v) => { v.lines[0].quantityUnit = 'roll'; }], ['quantity', (v) => { v.lines[0].quantity = 9; }],
  ['canonical product path', (v) => { v.lines[0].publicPath = '/products/different/'; }],
  ['selection', (v) => { v.lines[0].selection.lengthMeters = 7; }],
  ['packaging', (v) => { v.lines[0].packaging.logoPrinting = true; }],
  ['resolution', (v) => { v.lines[0].resolution = 'sales_follow_up'; v.lines[0].articleNumber = null; v.lines[0].selection.type = 'custom_length'; v.lines[0].selection.articleNumber = null; }],
  ['configured root Article Number', (v) => { v.lines[0].articleNumber = 'GDHEPRD000999'; }],
  ['configured nested Article Number', (v) => { v.lines[0].selection.articleNumber = 'GDHEPRD000999'; }],
  ['accessory Article Number', (v) => { v.lines[2].articleNumber = 'GDHEPRD000999'; }],
];
for (const [label, mutate] of responseBindingMutations) {
  const value = clone(task025Response); mutate(value);
  check(`reject TASK-025 response binding mismatch: ${label}`, rejects(() => bindTask025Response(task025Request, value)), 'negative');
}
const authoritativeBindingMutations = [
  ['current model', (v) => { v.lines[0].model = 'MUTATED MODEL'; }],
  ['current path', (v) => { v.lines[0].publicPath = '/products/mutated/'; }],
  ['complete selection', (v) => { v.lines[0].selection.color.label = 'Mutated'; }],
  ['complete packaging', (v) => { v.lines[0].packaging.basePackaging = 'carton'; }],
  ['resolution', (v) => { v.lines[0].resolution = 'sales_follow_up'; }],
  ['root Article Number', (v) => { v.lines[0].articleNumber = 'GDHEPRD000999'; }],
  ['nested Article Number', (v) => { v.lines[0].selection.articleNumber = 'GDHEPRD000999'; }],
  ['quantity', (v) => { v.lines[0].quantity = 9; }],
];
for (const [label, mutate] of authoritativeBindingMutations) {
  const value = clone(authoritative); mutate(value);
  check(`reject authoritative response-owned field mutation: ${label}`, rejects(() => assertBoundAuthoritative(task025Request, task025Response, value), 'authoritative_binding_mismatch'), 'negative');
}

const semanticMutations = readJson('samples/negative/semantic-mutations.json');
for (const item of semanticMutations.cases) {
  const mutationValue = item.valueUtf16CodeUnits
    ? String.fromCharCode(...item.valueUtf16CodeUnits)
    : item.value;
  const value = setJsonPointer(readJson(item.base), item.pointer, mutationValue);
  const schemaValid = validator(item.schema)(value);
  const gate = item.schema.startsWith('authoritative')
    ? () => assertAuthoritativeSemantics(value, digestContext)
    : () => assertPublicSemantics(value);
  check(`semantic vector remains Schema-valid: ${item.id}`, schemaValid);
  check(`semantic vector rejects: ${item.id}`, schemaValid && rejects(gate, item.expectedError), 'negative');
}

if (process.argv.includes('--print-vectors')) {
  console.log(JSON.stringify(computedCrypto, null, 2));
  process.exit(0);
}
check('RFC 8785 canonical business bytes', computedCrypto.canonicalBusinessPayload === expected.canonicalBusinessPayload);
check('version-selected HMAC vector', computedCrypto.payloadDigestHmacSha256Hex === expected.payloadDigestHmacSha256Hex);
check('authoritative payloadDigest is bound to v2 HMAC', authoritative.payloadDigest.keyVersion === expected.algorithm.testKeyVersion && authoritative.payloadDigest.value === computedCrypto.payloadDigestHmacSha256Hex);
check('comparison-token vector', computedCrypto.comparisonTokenSha256Hex === expected.comparisonTokenSha256Hex);
check('Basket snapshot-token vector', computedCrypto.sourceBasketCanonical === expected.sourceBasketCanonical && computedCrypto.submittedBasketTokenSha256Hex === expected.submittedBasketTokenSha256Hex);
check('v2 vector values differ from frozen v1', computedCrypto.payloadDigestHmacSha256Hex !== 'dc2aeeb47e6ab57a2c06b2b9d94305835ffd9c2719e5c18bf2aa35192f81ca44' && computedCrypto.submittedBasketTokenSha256Hex !== '4df2cfc5b4fa6b830fc0eba61f14847b3757aa8be2d6623ae5fcaae2b1d1edd3');
check('exact 30-day retention vector', expected.retentionMs === 2592000000 && Date.parse(base.basket.sourceBasket.expiresAt) - Date.parse(base.basket.sourceBasket.updatedAt) === expected.retentionMs);
for (const tuple of expected.replayCases) check(`exact replay tuple ${tuple.id}`, exactJson(evaluateReplay(tuple.input, expected.retentionMs), tuple.expected));
check('five replay tuples have exact order and effects', !rejects(() => assertReplayEvidence(expected)));

const cryptoMutations = readJson('vectors/invalid/crypto-mutations.v2.json');
for (const item of cryptoMutations.cases) {
  const value = setJsonPointer(clone(expected), item.pointer, item.value);
  const gate = item.expectedError === 'replay_effect_mismatch' ? () => assertReplayEvidence(value) : () => assertCryptoEvidence(value, business);
  check(`real semantic rejection ${item.id}`, rejects(gate, item.expectedError), 'negative');
}

const accepted = readJson('samples/positive/accepted-receipt.json');
const canClear = (receipt, currentSnapshot) => validator('public-rfq-receipt.v2.schema.json')(receipt)
  && receipt.status === 'accepted'
  && canonicalize(receipt.submittedBasketSnapshot) === canonicalize(currentSnapshot)
  && sha256(expected.algorithm.snapshotInputPrefixUtf8 + canonicalize(currentSnapshot)) === receipt.submittedBasketToken;
check('accepted exact snapshot clears', canClear(accepted, base.basket.sourceBasket));
const newerSnapshot = clone(base.basket.sourceBasket); newerSnapshot.revision += 1;
check('newer Basket mutation retains', !canClear(accepted, newerSnapshot), 'negative');
check('processing receipt retains', !canClear(readJson('samples/positive/processing-receipt.json'), base.basket.sourceBasket), 'negative');
const badTokenReceipt = clone(accepted); badTokenReceipt.submittedBasketToken = 'f'.repeat(64);
check('bad snapshot token retains', !canClear(badTokenReceipt, base.basket.sourceBasket), 'negative');

console.log(JSON.stringify({ schemas: schemaFiles.length, localReferences: refs.length, positiveChecks, negativeChecks, checks, failures }));
process.exitCode = failures === 0 ? 0 : 1;
