<script lang="ts">
  import type { GalleryImage } from './gallery-data';

  type Props = {
    images: GalleryImage[];
    onopen: (index: number, trigger: HTMLElement) => void;
  };

  let { images, onopen }: Props = $props();

  function openImage(event: MouseEvent, index: number): void {
    event.preventDefault();
    const trigger = event.currentTarget;

    if (trigger instanceof HTMLElement) {
      onopen(index, trigger);
    }
  }
</script>

<div class="wedding-gallery-grid">
  {#each images.slice(0, 6) as image, index (image.id)}
    <a href={image.src} onclick={(event) => openImage(event, index)}>
      <img
        src={image.thumbnailSrc}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
      />
    </a>
  {/each}
</div>

<button class="gallery-all-button" type="button" onclick={(event) => onopen(0, event.currentTarget)}>
  사진 모두 보기 <span aria-hidden="true">({images.length})</span>
</button>
