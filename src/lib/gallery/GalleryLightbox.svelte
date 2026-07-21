<script lang="ts">
  import { onMount, tick } from 'svelte';
  import emblaCarouselSvelte from 'embla-carousel-svelte';
  import type { EmblaCarouselType } from 'embla-carousel';
  import type { GalleryImage } from './gallery-data';
  import GalleryThumbnailStrip from './GalleryThumbnailStrip.svelte';

  type Props = {
    images: GalleryImage[];
    selectedIndex: number;
    onclose: () => void;
    onselect: (index: number) => void;
  };

  let { images, selectedIndex, onclose, onselect }: Props = $props();
  let closeButton: HTMLButtonElement;
  let emblaApi: EmblaCarouselType | undefined;
  let activeElement: HTMLElement | null = null;
  let originalOverflow = '';
  let originalOverscrollBehavior = '';

  const previousIndex = (): number => (selectedIndex - 1 + images.length) % images.length;
  const nextIndex = (): number => (selectedIndex + 1) % images.length;
  const isPreloadedSlide = (index: number): boolean =>
    index === selectedIndex || index === previousIndex() || index === nextIndex();

  function close(): void {
    onclose();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') onselect(previousIndex());
    if (event.key === 'ArrowRight') onselect(nextIndex());
  }

  function setEmblaApi(event: CustomEvent<EmblaCarouselType>): void {
    emblaApi = event.detail;
    emblaApi.scrollTo(selectedIndex, true);
  }

  $effect(() => {
    if (!emblaApi || emblaApi.selectedScrollSnap() === selectedIndex) return;
    emblaApi.scrollTo(selectedIndex);
  });

  $effect(() => {
    if (!emblaApi) return;
    const syncSelectedIndex = (): void => onselect(emblaApi?.selectedScrollSnap() ?? selectedIndex);
    emblaApi.on('select', syncSelectedIndex);
    emblaApi.on('reInit', syncSelectedIndex);

    return () => {
      emblaApi?.off('select', syncSelectedIndex);
      emblaApi?.off('reInit', syncSelectedIndex);
    };
  });

  $effect(() => {
    const neighbours = [previousIndex(), nextIndex()];
    for (const index of neighbours) {
      const preload = new Image();
      preload.src = images[index].src;
    }
  });

  onMount(() => {
    activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    originalOverflow = document.body.style.overflow;
    originalOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.addEventListener('keydown', handleKeydown);
    tick().then(() => closeButton.focus());

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
      document.removeEventListener('keydown', handleKeydown);
      activeElement?.focus();
    };
  });
</script>

<div class="gallery-lightbox" role="dialog" aria-modal="true" aria-label="웨딩 사진 전체 보기">
  <div class="gallery-lightbox-header">
    <p aria-live="polite">{selectedIndex + 1} / {images.length}</p>
    <button bind:this={closeButton} type="button" aria-label="사진 갤러리 닫기" onclick={close}>닫기</button>
  </div>

  <div
    class="gallery-lightbox-image"
    use:emblaCarouselSvelte={{ options: { duration: 28, loop: true }, plugins: [] }}
    onemblaInit={setEmblaApi}
    aria-label="현재 선택된 사진. 좌우로 밀어 사진을 이동할 수 있습니다."
  >
    <div class="gallery-lightbox-track">
      {#each images as image, index (image.id)}
        <div class="gallery-lightbox-slide">
          {#if isPreloadedSlide(index)}
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading={index === selectedIndex ? 'eager' : 'lazy'}
            />
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="gallery-lightbox-controls">
    <button type="button" aria-label="이전 사진" onclick={() => onselect(previousIndex())}>이전</button>
    <button type="button" aria-label="다음 사진" onclick={() => onselect(nextIndex())}>다음</button>
  </div>

  <GalleryThumbnailStrip {images} {selectedIndex} onselect={onselect} />
</div>
