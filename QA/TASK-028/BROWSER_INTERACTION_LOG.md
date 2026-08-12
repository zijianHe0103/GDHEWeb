# TASK-028 Visual QA Browser Interaction Log

Date: 2026-08-12
Controlled request: `MSG-TASK-028-VISUAL-QA-R1`

## Runtime and seed

- Planner-owned Next runtime: PID `46538`, `127.0.0.1:3000`.
- Planner-owned delayed mixed-validation fixture: PID `46560`, `127.0.0.1:18080`.
- Exact seed: `frontend/src/lib/rfq-submission-contract/v2/samples/basket-v3/ready-mixed.json`.
- Seed SHA-256: `0bdcf375459c49dccf65ec383c5d35cc0538f242c698850dc8166b1c65ae38b9`.
- Browser: fresh Chrome Guest for ready/form/keyboard/Console/Network evidence; isolated in-app browser for the empty 1440 capture.

## Authentic sequence

1. Empty state at 1440: zero form, `noindex,nofollow`, canonical URL `/request-a-quote`.
2. Exact ready-mixed seed: three visible lines and ten customer fields.
3. Responsive samples: 1440/1024/768/390/320 all returned `innerWidth == clientWidth == scrollWidth` and zero viewport offenders.
4. Native Tab order reached Basket links, quantities, Remove buttons, Full Name, Company Name, Country/Region, City, WhatsApp, WeChat, Business Email, Phone, Company Website, Additional Requirements and Submit Request. The first quantity accepted Arrow Up and Arrow Down and returned to `2`.
5. Empty native Enter submission focused the error summary. The summary and `aria-describedby` exposed only `Enter at least one contact method.`; the four empty required fields had no field errors.
6. Native keyboard filled `Ada Buyer`, `Example Contracting Ltd`, `United States`, `Seattle`, WhatsApp, Website and Additional Requirements, then activated Submit Request.
7. Console recorded `POST http://127.0.0.1:3000/api/rfq/intent/ net::ERR_FAILED 308 (Permanent Redirect)`. Network contained one failed intent fetch and no intake fetch. The page rendered the stable temporary-unavailable result and retained the Basket.
8. Direct non-following POST reproduced `308`, `location: /api/rfq/intent`; the client source uses `/api/rfq/intent/` and `/api/rfq/intake/` with `redirect: "error"`.
9. Explicit 320 reduced-motion emulation returned `reduced=true`, `320/320/320`, zero moving elements, then was restored to no emulation.
10. Document/visible/resource scan returned `noindex,nofollow`, zero Article Number/UUID/private marker in visible text, zero private marker in HTML, zero external resource and `privacyLinks=[]`.

## Dispatch stop gate

The authentic accepted flow could not reach pending intake or accepted receipt because intent issuance failed first. The controlled Planner processing-runtime switch was therefore not requested. Accepted-cleared, accepted-changed, processing and explicit retry remain untested in this round rather than inferred.

`task028-pending-accepted-320.png` is preserved as a timing diagnostic: the 308 failure had already resolved to the temporary-unavailable state by capture time. It is byte-identical to `task028-temporary-error-320.png` and is not claimed as pending evidence.

The Chrome Guest window was closed, reduced-motion emulation was restored, the in-app viewport was reset/finalized, and both Planner-owned listeners remained untouched.

# Round 2 interaction log

Controlled request: `MSG-TASK-028-VISUAL-QA-R2`

1. Revalidated the twenty Round 1 visual hashes and preserved the historical `FAIL 1/2/0` report before creating `QA/TASK-028/r2/**`.
2. Reused accepted Next PID `54945` and fixture PID `54901`; seeded the same exact `ready-mixed.json` (`0bdcf375459c49dccf65ec383c5d35cc0538f242c698850dc8166b1c65ae38b9`) in a fresh Chrome Guest.
3. Native Basket quantity Arrow Up/Down returned `2 -> 3 -> 2`; native focus reached Remove, all fields, Privacy Policy and Submit Request.
4. Empty native Submit focused the error summary and exposed the stable five-message set plus four field-specific ARIA associations and contact guidance/error association.
5. Native Enter on Privacy Policy reached the same-page fragment and focused `#rfq-privacy-policy` with no external request.
6. Valid accepted submission rendered authentic pending. Repeated Enter while disabled did not duplicate the request. The browser recorded exactly slashless intent then intake, and accepted unchanged removed the exact Basket key.
7. Reseeded the frozen Basket, submitted again, opened a second same-origin tab and changed first quantity `2 -> 3` while pending. Accepted retained all three lines and the changed quantity and emitted the cross-tab polite message.
8. Measured result layouts: 1440/1024/768 had exact client/scroll equality; 390 measured `390/427` and 320 measured `320/361`. In both narrow cases `#rfq-privacy-policy` was the sole measured offender and visibly clipped to the right.
9. Enabled explicit reduced motion at 320: `reduced=true`, zero running animations; restored `No emulation` afterward. The policy overflow persisted.
10. Sent exactly one controlled processing-switch request. Planner response confirmed accepted PID `54945` exited before processing PID `57285` started; fixture PID `54901` remained untouched.
11. Reseeded the exact Basket and submitted natively. Processing recorded one intent `200` and one intake `202`, retained three items and rendered a polite receipt.
12. After 2.2 seconds request counts stayed `1/1`. Native Tab reached the only Submit Request action; Enter explicitly replayed the unchanged live attempt. Final counts were intent `1`, intake `2`, statuses `200/202/202`, same public reference, retained Basket and zero external request.
13. Clean authoritative Console/DOM scans returned zero protected visible marker, zero protected HTML marker and zero external resource. Two exploratory Console scripts in non-authoritative captures had QA-authored syntax errors; those were cleared and are not app findings.
14. Closed the isolated Chrome Guest after restoring motion. visual_qa did not start, stop or reconfigure the Planner listeners.

Round 2 result: `FAIL / severe 0 / obvious 1 / detail 0`, limited to the 390/320 nested Privacy Policy overflow.

# Overflow bounded closure interaction log

Controlled request: `MSG-TASK-028-VISUAL-QA-OVERFLOW-CLOSURE`

1. Revalidated all twenty Round 1 and forty-two Round 2 visual hashes before creating new evidence; preserved historical `FAIL 1/2/0` and `FAIL 0/1/0` results unchanged.
2. Reused only Planner-owned Next PID `64211`; seeded the same frozen ready-mixed Basket (`0bdcf375459c49dccf65ec383c5d35cc0538f242c698850dc8166b1c65ae38b9`) in a fresh Chrome Guest. No server lifecycle action or form submission occurred.
3. At 390 CSS px, direct browser geometry returned exact `innerWidth/clientWidth/scrollWidth = 390/390/390`. The form and `#rfq-privacy-policy` both measured left `44.5`, right `345.5`, width `301`; containment true, clipping false, overlap false, offender list empty.
4. At 320 CSS px, direct browser geometry returned exact `320/320/320`. The form and policy both measured left `41`, right `279`, width `238`; containment true, clipping false, overlap false, offender list empty.
5. From a fresh page document, 23 native Tabs reached Privacy Policy and one further Tab reached Submit Request. Native Shift+Tab returned to Privacy; Enter changed only the fragment to `#rfq-privacy-policy` and accessibility focus moved to the real policy container.
6. The same-page activation left the local policy copy unchanged and created no request. The final resource record contained 24 same-origin resources, zero external/WordPress/Feishu/analytics entry and zero RFQ intent/intake request.
7. Closed the temporary Guest and DevTools windows. Planner-owned PID `64211` remained the sole listener on `127.0.0.1:3000` and was not started, stopped or reconfigured.

Bounded closure result: `PASS / severe 0 / obvious 0 / detail 0` for the sole Round 2 overflow finding.
