<script lang="ts">
  import type { GalleryImage } from './gallery-data';

  type Props = {
    images: GalleryImage[];
    onopen: (index: number, trigger: HTMLElement) => void;
  };

  let { images, onopen }: Props = $props();
  let expanded = $state(false);
  const visibleImages = $derived(expanded ? images : images.slice(0, 6));

  function openImage(event: MouseEvent, index: number): void {
    event.preventDefault();
    const trigger = event.currentTarget;

    if (trigger instanceof HTMLElement) {
      onopen(index, trigger);
    }
  }
</script>

<div id="wedding-gallery-grid" class="wedding-gallery-grid">
  {#each visibleImages as image, index (image.id)}
    <a href={image.src} onclick={(event) => openImage(event, index)}>
      <span class="gallery-photo">
        <img
          src={image.thumbnailSrc}
          alt={image.alt}
          width="400"
          height="400"
          loading="lazy"
        />
      </span>
    </a>
  {/each}
</div>

{#if images.length > 6}
  <button
    class="gallery-expand-button"
    type="button"
    aria-controls="wedding-gallery-grid"
    aria-expanded={expanded}
    onclick={() => (expanded = !expanded)}
  >
    {expanded ? '접기' : '더보기'} <span aria-hidden="true">({images.length})</span>
  </button>
{/if}
