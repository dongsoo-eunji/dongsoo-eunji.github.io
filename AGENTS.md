# Repository Guidelines

## Image aspect ratios

- HTML `width` and `height` attributes describe an image's intrinsic dimensions and reserve layout space. Do not rely on them to control the rendered aspect ratio.
- Define the intended rendered ratio in CSS, preferably on a dedicated wrapper with `aspect-ratio`.
- For images that must not be cropped, use `width: 100%`, `height: auto`, the source aspect ratio, and `object-fit: contain`.
- Use `width: 100%`, `height: 100%`, and `object-fit: cover` only when cropping is intentional.
- Wedding gallery thumbnails are 1:1 and must use square wrappers and square controls.
- The hero portrait is an intentional 3:4 crop. The lightbox must preserve each large image's original ratio with `object-fit: contain`.
- Maps, diagrams, and other information-heavy images must preserve their complete source ratio and content.
- When adding an image, verify its actual pixel dimensions and check the rendered result at mobile and desktop widths.

## Verification and commits

- Run `pnpm check` and `pnpm build` before committing.
- Keep each requested task in its own commit.
- Preserve unrelated user changes already present in the working tree.
