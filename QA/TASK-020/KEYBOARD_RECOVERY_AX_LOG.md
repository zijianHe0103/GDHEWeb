# TASK-020 Keyboard Recovery AX Log

- message: `MSG-TASK-020-VISUAL-QA-KEYBOARD-RECOVERY`
- executed: `2026-08-01T08:21:56Z`
- application: Google Chrome Guest window
- channel: system-level native keys through the plugin-owned computer-use sky wrapper
- mouse use: one initial click on Chrome Guest mode; no mouse thereafter
- target URL before and after submit: `127.0.0.1:3000/products/fgd-x15-pvc`

## Continuous forward Tab AX focus

1. `MANUAL CURTAIN TRACKS` link
2. `Configure & Add to Quote` link
3. `Standard length`, checked
4. `Published option`, value `6 m — Ivory White`
5. `Ceiling Mount`, unchecked
6. `Base packaging`, value `Choose packaging`
7. `Customer Logo Printing`, unchecked
8. `Protection arrangement (optional)`, value `None`
9. `Quantity (piece)` text field
10. `Add to Quote` button
11. `Open Next.js Dev Tools`
12. Chrome `Tab Search`

Native radio groups expose one Tab stop per group. `Custom length` and `Wall
Mount` are reached with arrow keys inside their groups rather than as separate
Tab stops. This is native browser radio-group behavior.

## Native radio operation

- Before `Right`: Standard `Value: 1`; Custom `Value: 0`.
- After `Right`: Standard `Value: 0`; Custom `Value: 1`; AX focus on Custom.
- After `Left`: Standard `Value: 1`; Custom `Value: 0`; AX focus on Standard.

## Keyboard-only standard configuration

- Published option: `Home` retained `6 m — Ivory White`.
- Installation: `Space` on Ceiling produced Ceiling `Value: 1`, Wall `Value: 0`.
- Base packaging: native `s` selection produced `Standard Packaging`.
- Customer Logo Printing: `Value: 0`.
- Protection arrangement: `Home` retained `None`.
- Quantity: native text input produced `Value: 2`.
- Final Tab: AX focus on `Add to Quote`.
- Native `Return`: summary appeared while focus remained on `Add to Quote`.

## Result AX state

- Latest-summary count: one visible `Latest temporary quote item` container.
- Model: `FGD X15+PVC`.
- Length Type: `Standard Length`.
- Length: `6 m`.
- Color: `Ivory White`.
- Installation: `Ceiling Mount`.
- Base Packaging: `Standard Packaging`.
- Customer Logo Printing: `No`.
- Protection Arrangement: `None`.
- Quantity: `2 piece`.
- Article Number/raw enum/JSON/internal/sent/saved claim: absent.
- URL navigation: none.

## Network and console

- Chrome Network was opened and left recording with an empty request table.
- A second native `Return` on the focused Add to Quote button kept the request
  table empty and retained one latest summary; no external, WordPress,
  ProductCard, submission or Feishu request appeared.
- Chrome Console contained three messages: React DevTools information, local
  HMR connected, and one error:
  `:3000/favicon.ico:1 Failed to load resource: the server responded with a
  status of 404 (Not Found)`.
- The favicon error is a same-origin page-load request, not a keyboard-chain
  request, but it fails the dispatch's absolute no-console-error gate.
