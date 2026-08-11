# Customer Contact Field Matrix

status: confirmed
public_locale: en

## Rules shared by all fields

- Measure maximum length after trimming as Unicode code points.
- Normalize accepted text to NFC.
- Never silently truncate, auto-correct or infer missing content.
- Omit optional empty values.
- Reject NUL and non-text control characters; single-line fields also reject line breaks.
- Browser validation is guidance. The Next.js server repeats every rule.
- Public validation messages use field names and stable codes, not rejected values.

## Field matrix

| Public English label | Contract key | Required | Max | Server validation and normalization | Privacy class | Public receipt |
|---|---|---:|---:|---|---|---:|
| Full Name | `fullName` | yes | 120 | trim, NFC, non-empty single line | personal identifier | no |
| Company Name | `companyName` | yes | 160 | trim, NFC, non-empty single line | business identity | no |
| WhatsApp | `whatsApp` | conditional | 128 | free text; trim, NFC, non-empty if present; no E.164/OTP | contact data | no |
| WeChat | `weChat` | conditional | 128 | free text; trim, NFC, non-empty if present; no guessed ID pattern/OTP | contact data | no |
| Business Email | `businessEmail` | conditional | 254 | trim; syntactically valid address; lower-case domain only; no DNS/mailbox check | contact data | no |
| Phone | `phone` | conditional | 64 | trim, NFC, non-empty single line; no forced international rewrite | contact data | no |
| Country/Region | `countryRegion` | yes | 100 | trim, NFC, non-empty single line; no guessed ISO code until an approved control exists | location data | no |
| City | `city` | yes | 100 | trim, NFC, non-empty single line | location data | no |
| Company Website | `companyWebsite` | no | 2048 | absolute HTTP/HTTPS URL; no credentials/control characters; never fetch or resolve | business contact metadata | no |
| Additional Requirements | `message` | no | 2000 | trim, NFC, CRLF/CR to LF; allow line breaks; reject other controls | customer-provided business content, may contain personal data | no |

## Conditional contact rule

At least one of `whatsApp`, `weChat`, `businessEmail` and `phone` must remain present and valid after field normalization. Supplying more than one is allowed. An invalid supplied channel is not ignored merely because another channel is valid; the customer must correct or remove it.

Public presentation order is:

1. WhatsApp
2. WeChat
3. Business Email
4. Phone

## Privacy notice record

| Public element | Contract key | Required | Rule |
|---|---|---:|---|
| Privacy purpose notice version | `privacyNotice.version` | yes | exact current public notice version issued by the page/server contract |
| Notice shown time | `privacyNotice.presentedAt` | yes | RFC 3339 timestamp; server verifies it is compatible with the intent window |
| Privacy Policy link | UI only | yes | points to the applicable published policy; not copied as customer data |
| Marketing opt-in | none | not collected | must not be inferred from submission |
| Consent checkbox | none | not used | submission record is a notice record, not a consent record |

## Server-only derived data

The following is never accepted from the browser as authority:

- normalized contact fingerprint used for abuse limits;
- source fingerprint;
- server receive time;
- public support reference;
- retention expiry/last meaningful interaction;
- Feishu field/record identity;
- legal hold or customer/order lifecycle state.

Contact fingerprints use a server secret and include channel names so identical text in different channels is not conflated. Raw contact values and raw IP addresses are prohibited from ordinary application/security logs.

## Website URL safety boundary

The Company Website field is descriptive customer information, not a URL for the intake server to visit. Intake must not perform preview generation, HTTP requests, DNS resolution, favicon retrieval or reputation callbacks from the supplied URL. This prevents the optional field from becoming an SSRF or internal-network discovery path.
