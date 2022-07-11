# Contributing guide

## General guidelines

- Do not modify or add SVGs or PNGs directly to the repository. Instead, modify `.afdesign` sources and mass export SVGs. The GitHub workflow will automatically render PNG versions and optimize SVGs.
- When editing in Affinity Designer, use __global colors__ wherever possible. Currently two global colors exist:
  - `brand-light` – the brand color for light backgrounds
  - `brand-dark` – the brand color for dark backgrounds
- In Affinity Designer, use *Symbols* to reuse base designs without duplicating them. For example, the Wordmark uses both the Word and Mark symbol. In addition, when creating dark mode variants, modify a symbol to use the `brand-dark` color.

### Changing PNG export sizes

Each subfolder in [`Branding/`](Branding/) has a `sizes.json` with a list of sizes. For example, the [`sizes.json`](Branding/Mark/sizes.json) for the logo mark ![](Branding/Mark/mark-light__16x16.png) contains the following:

```json
[32, 48, 64, 96, 128, 192, 256, 384, 512]
```

Each number in the list represents a width in pixels. The PNGs will be exported at the given widths and named `<name>__<width>x<height>.png`.
