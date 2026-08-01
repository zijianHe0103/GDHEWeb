# TASK-020 Favicon Round 2 AX / Browser Log

- message: `MSG-TASK-020-VISUAL-QA-FAVICON-R2`
- delivery key: `MSG-TASK-020-VISUAL-QA-FAVICON-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- target: `http://127.0.0.1:3000/products/fgd-x15-pvc`
- context: new Google Chrome Guest window
- result: `PASS / severe 0 / obvious 0 / detail 0`

## Clean-load sequence

1. Opened a new Chrome Guest context with one initial mouse click. No mouse was
   used afterward.
2. Opened DevTools Console before target navigation. The empty new tab reported
   `0 messages in console`.
3. Started Network recording before target navigation; the recording toggle
   exposed AX value `1`.
4. Focused the page, entered the canonical URL with native keys and loaded it
   with native Return.

## Favicon, Console and Network

- The rendered document declared one local icon link:
  `[{"href":"http://127.0.0.1:3000/icon.svg?icon.3pigvvo6ltwt4.svg","type":"image/svg+xml","rel":"icon"}]`.
- Chrome Network recorded
  `http://127.0.0.1:3000/icon.svg?icon.3pigvvo6ltwt4.svg` as `200 OK`, type
  `svg+xml`, 0.8 kB transferred and 0.5 kB resource size.
- Network contained zero `favicon.ico` entries and no favicon 404.
- Console reported `0 messages in console` after page load and again after the
  native Enter submission. No warning or error AX rows were present.
- The page request set contained 24 unique URLs before submission and 24 after
  submission. Set difference after-minus-before was empty.
- Every inspected-page HTTP/WebSocket URL was same-origin
  `127.0.0.1:3000`; there was no external, WordPress, ProductCard, submission
  or Feishu request.

## Minimum native-key retest

- Native Tab reached the selected Standard length radio.
- Native keys selected `6 m — Ivory White`, Ceiling Mount, Standard Packaging,
  Logo No, Protection None and quantity `2`.
- AX focus reached `Add to Quote`; native Return produced exactly one
  `Latest temporary quote item` with Model `FGD X15+PVC`, Standard Length,
  `6 m`, Ivory White, Ceiling Mount, Standard Packaging, Logo `No`, Protection
  `None` and `2 piece`.
- AX focus remained on Add to Quote, the canonical URL did not change, and the
  already-passing layout showed no visual regression.

The Guest window was closed by native keyboard shortcut after evidence capture.
The Planner-owned server was not started, stopped or reconfigured.
