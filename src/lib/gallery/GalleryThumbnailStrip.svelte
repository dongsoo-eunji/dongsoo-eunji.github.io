<script lang="ts">
  import type { GalleryImage } from './gallery-data';

  type Props = {
    images: GalleryImage[];
    selectedIndex: number;
    onselect: (index: number) => void;
  };

  let { images, selectedIndex, onselect }: Props = $props();
  let strip: HTMLDivElement;
  let thumbnails: HTMLButtonElement[] = [];
  let pointerId: number | null = null;
  let pointerStartX = 0;
  let scrollStartLeft = 0;
  let dragged = false;
  let pressedIndex: number | null = null;
  let suppressClick = false;

  $effect(() => {
    const thumbnail = thumbnails[selectedIndex];
    if (!strip || !thumbnail) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const centeredLeft = thumbnail.offsetLeft + thumbnail.offsetWidth / 2 - strip.clientWidth / 2;
    const maximumLeft = strip.scrollWidth - strip.clientWidth;

    strip.scrollTo({
      left: Math.max(0, Math.min(centeredLeft, maximumLeft)),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  });

  function startDrag(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    scrollStartLeft = strip.scrollLeft;
    dragged = false;
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[data-index]') : null;
    pressedIndex = button ? Number(button.dataset.index) : null;
    strip.setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent): void {
    if (pointerId !== event.pointerId) return;
    const movement = event.clientX - pointerStartX;
    dragged ||= Math.abs(movement) > 4;
    strip.scrollLeft = scrollStartLeft - movement;
  }

  function finishDrag(event: PointerEvent): void {
    if (pointerId !== event.pointerId) return;
    if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
    const wasDragged = dragged;
    const shouldSelect = !wasDragged && pressedIndex !== null && event.type !== 'pointercancel';
    pointerId = null;

    if (wasDragged || shouldSelect) {
      suppressClick = true;
      setTimeout(() => {
        suppressClick = false;
      }, 0);
    }

    if (shouldSelect && pressedIndex !== null) {
      // Pointer capture moves pointerup from the button to the strip, which can
      // suppress its native click. Select here so mouse taps stay dependable.
      onselect(pressedIndex);
    }

    pressedIndex = null;
    dragged = false;
  }

  function selectImage(index: number): void {
    if (suppressClick) return;
    onselect(index);
  }
</script>

<div
  class="gallery-thumbnail-strip"
  bind:this={strip}
  role="group"
  aria-label="사진 썸네일"
  onpointerdown={startDrag}
  onpointermove={drag}
  onpointerup={finishDrag}
  onpointercancel={finishDrag}
>
  {#each images as image, index (image.id)}
    <button
      bind:this={thumbnails[index]}
      class:current={index === selectedIndex}
      type="button"
      data-index={index}
      aria-label={`${index + 1}번 사진 보기`}
      aria-current={index === selectedIndex ? 'true' : undefined}
      onclick={() => selectImage(index)}
    >
      <img src={image.thumbnailSrc} alt="" width="120" height="150" loading="lazy" />
    </button>
  {/each}
</div>
