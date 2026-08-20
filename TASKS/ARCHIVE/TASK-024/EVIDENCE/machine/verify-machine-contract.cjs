'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020').default;
const addFormats = require('ajv-formats');

const root = __dirname;
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));

const schemaFiles = fs
  .readdirSync(path.join(root, 'schemas'))
  .filter((name) => name.endsWith('.json'))
  .sort();
const schemas = schemaFiles.map((name) => readJson(`schemas/${name}`));
const countReferences = (value) => {
  if (value === null || typeof value !== 'object') return 0;
  if (Array.isArray(value)) return value.reduce((total, item) => total + countReferences(item), 0);
  return Object.entries(value).reduce(
    (total, [key, item]) => total + (key === '$ref' ? 1 : 0) + countReferences(item),
    0,
  );
};
const referenceCount = schemas.reduce(
  (total, schema) => total + countReferences(schema),
  0,
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
for (const schema of schemas) ajv.addSchema(schema);

const validator = (name) => {
  const schema = schemas.find((candidate) => candidate.$id.endsWith(name));
  if (!schema) throw new Error(`missing schema: ${name}`);
  return ajv.getSchema(schema.$id);
};

const canonicalize = (value) => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    .join(',')}}`;
};

const assertUniqueEntryIds = (document) => {
  const items = document?.basket?.items ?? document?.lines;
  if (!Array.isArray(items)) throw new Error('missing line array');
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.entryId)) throw new Error('duplicate_entry_id');
    seen.add(item.entryId);
  }
};

const publicLineIdentityKey = (item) =>
  item.lineKind === 'configured_product'
    ? canonicalize({
        lineKind: item.lineKind,
        resolutionIdentity: item.resolutionIdentity,
        selection: item.selection,
        packaging: item.packaging,
        quantityUnit: item.quantityUnit,
      })
    : canonicalize({
        lineKind: item.lineKind,
        resolutionIdentity: item.resolutionIdentity,
        quantityUnit: item.quantityUnit,
      });

const assertDistinctPublicLines = (document) => {
  assertUniqueEntryIds(document);
  const seen = new Set();
  for (const item of document.basket.items) {
    const identity = publicLineIdentityKey(item);
    if (seen.has(identity)) throw new Error('duplicate_line_identity');
    seen.add(identity);
  }
};

let failures = 0;
let positives = 0;
let negatives = 0;
const check = (label, condition) => {
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
  if (!condition) failures += 1;
};

const positiveCases = [
  ['public-rfq-submission-draft.v1.schema.json', 'vectors/vector-1.public-request.json'],
  ['public-rfq-submission-draft.v1.schema.json', 'vectors/vector-2.public-request.json'],
  ['authoritative-rfq-document.v1.schema.json', 'vectors/vector-1.authoritative.json'],
  ['public-rfq-receipt.v1.schema.json', 'vectors/vector-1.accepted-receipt.json'],
  ['public-rfq-receipt.v1.schema.json', 'vectors/vector-1.processing-receipt.json'],
  ['public-rfq-error.v1.schema.json', 'vectors/vector-1.error.json'],
];
for (const [schema, sample] of positiveCases) {
  const value = readJson(sample);
  const valid = validator(schema)(value);
  if (schema.includes('submission')) {
    try {
      assertDistinctPublicLines(value);
    } catch {
      check(`positive distinct line identity ${sample}`, false);
    }
  } else if (schema.includes('authoritative')) {
    try {
      assertUniqueEntryIds(value);
    } catch {
      check(`positive unique entryId ${sample}`, false);
    }
  }
  positives += 1;
  check(`positive ${sample}`, valid);
}

const schemaNegativeCases = [
  ['public-rfq-error.v1.schema.json', 'vectors/invalid/cross-domain-field-error.json'],
  ['public-rfq-error.v1.schema.json', 'vectors/invalid/cross-domain-customer-line-error.json'],
  ['authoritative-rfq-document.v1.schema.json', 'vectors/invalid/accepted-not-started.authoritative.json'],
  ['authoritative-rfq-document.v1.schema.json', 'vectors/invalid/pre-reservation-outcome.authoritative.json'],
];
for (const [schema, sample] of schemaNegativeCases) {
  negatives += 1;
  check(`schema rejects ${sample}`, !validator(schema)(readJson(sample)));
}

const duplicate = readJson('vectors/invalid/duplicate-entry-id.public-request.json');
check(
  'duplicate entryId vector is structurally valid',
  validator('public-rfq-submission-draft.v1.schema.json')(duplicate),
);
let duplicateRejected = false;
try {
  assertDistinctPublicLines(duplicate);
} catch (error) {
  duplicateRejected = error instanceof Error && error.message === 'duplicate_entry_id';
}
negatives += 1;
check('semantic rule rejects duplicate entryId', duplicateRejected);

const duplicateLine = readJson('vectors/invalid/duplicate-line-identity.public-request.json');
check(
  'duplicate line identity vector is structurally valid',
  validator('public-rfq-submission-draft.v1.schema.json')(duplicateLine),
);
let duplicateLineRejected = false;
try {
  assertDistinctPublicLines(duplicateLine);
} catch (error) {
  duplicateLineRejected =
    error instanceof Error && error.message === 'duplicate_line_identity';
}
negatives += 1;
check('semantic rule rejects duplicate public line identity', duplicateLineRejected);

const authoritative = readJson('vectors/vector-1.authoritative.json');
const stateMatrix = [
  ['idempotency_reserved', 'not_started', 0],
  ['resolving_lines', 'not_started', 0],
  ['delivery_pending', 'pending', 1],
  ['accepted', 'accepted', 1],
  ['delivery_indeterminate', 'indeterminate', 1],
  ['rejected_before_delivery', 'rejected', 0],
];
for (const [status, state, attemptCount] of stateMatrix) {
  const value = clone(authoritative);
  value.status = status;
  value.delivery.state = state;
  value.delivery.attemptCount = attemptCount;
  positives += 1;
  check(`authoritative state ${status}`, validator('authoritative-rfq-document.v1.schema.json')(value));
}

const expected = readJson('vectors/expected.json');
let cryptoVectors = 0;
for (const vector of expected.vectors) {
  const request = readJson(`vectors/${vector.requestFile}`);
  const business = {
    basket: request.basket,
    customer: request.customer,
    privacyNotice: request.privacyNotice,
  };
  const businessCanonical = canonicalize(business);
  const basketCanonical = canonicalize(request.basket.sourceBasket);
  const hmac = crypto
    .createHmac('sha256', Buffer.from(expected.algorithm.testSecretKeyHex, 'hex'))
    .update(expected.algorithm.macInputPrefixUtf8 + businessCanonical)
    .digest('hex');
  const token = crypto
    .createHash('sha256')
    .update(expected.algorithm.snapshotInputPrefixUtf8 + basketCanonical)
    .digest('hex');
  const ttl =
    Date.parse(request.basket.sourceBasket.expiresAt) -
    Date.parse(request.basket.sourceBasket.updatedAt);
  cryptoVectors += 1;
  check(
    `crypto ${vector.requestFile}`,
    businessCanonical === vector.canonicalBusinessPayload &&
      basketCanonical === vector.sourceBasketCanonical &&
      hmac === vector.payloadDigestHmacSha256Hex &&
      token === vector.submittedBasketTokenSha256Hex &&
      ttl === 2592000000,
  );
}

console.log(
  JSON.stringify({
    schemas: schemas.length,
    references: referenceCount,
    positives,
    negatives,
    cryptoVectors,
    failures,
  }),
);
process.exitCode = failures === 0 ? 0 : 1;
