# Shared Project Facts

schema_version: DPG-LANES-1.0.0

## Project

- name: 图像生成站
- type: software

## Stable Goal

- Build a deterministic, browser-local GDHE curtain-track sales visualizer.
- Use manual geometry and user-provided calibration to place verified track and motor assets at a calibrated visual scale.
- Export fixed GDHE-branded static images without uploading customer photos.

## Boundaries

- No image-generation model, AI rendering service, quota, billing, project history, cloud sharing, dealer branding, construction measurement, BOM, AR, 3D or curtain animation in v1.
- Customer photos and SceneState remain ephemeral in the browser.
- Curtain templates are non-product visual aids; hardware assets represent verified GDHE products.

## Constraints

- Recessed motorized scenes must show the motor.
- Product facts require authoritative GDHE evidence and business confirmation.
- Missing or unverified assets disable a combination.
- Outputs always contain GDHE branding and a visualization disclaimer.
- Current parent worktree is dirty and unrelated changes must be preserved.

## Terms

- `windowQuad`: four-point window region.
- `curtainQuad`: independent four-point curtain coverage region.
- `calibrationLine`: user-selected line with a user-provided real-world length.
- `trackLine`: track placement start and end.
- `calibrated visual scale`: visual mapping based on user input, not automatic measurement.
- `CurtainTemplate`: static, non-sale curtain visual.
- `TrackVisual` / `MotorVisual`: verified product visual assets with dimensions and anchors.
- `approval_required` / `public` / `disabled`: the only v1 access modes.

## Cross-Lane Agreements

- Planning and implementation must label confirmed facts, unverified product inputs and future separate decisions.
- Graber and other references are workflow evidence only.
- Preview and export must share the same normalized geometry functions.
- Product data, visual assets, scene rules and access control require independent validation evidence.
