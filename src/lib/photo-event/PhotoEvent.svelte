<script lang="ts">
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import GalleryGrid from "$lib/gallery/GalleryGrid.svelte";
  import GalleryLightbox from "$lib/gallery/GalleryLightbox.svelte";
  import type { GalleryImage } from "$lib/gallery/gallery-data";

  let photos: GalleryImage[] = $state([]);
  let loading = $state(false);
  let loaded = $state(false);
  let loadError = $state(false);
  let lightboxOpen = $state(false);
  let selectedIndex = $state(0);

  onMount(() => {
    void loadPhotos();
    const handleVisibility = (): void => {
      if (document.visibilityState === "visible") void loadPhotos();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  });

  async function loadPhotos(): Promise<void> {
    if (loading) return;
    loading = true;
    loadError = false;
    try {
      const response = await fetch(`${base}/wedding/images/best-shots/gallery.json?refresh=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Gallery request failed with ${response.status}`);
      const result = (await response.json()) as { galleryImages?: GalleryImage[] };
      if (!Array.isArray(result.galleryImages)) throw new Error("Invalid gallery response");
      photos = result.galleryImages.map((photo) => ({
        ...photo,
        src: `${base}${photo.src}`,
        thumbnailSrc: `${base}${photo.thumbnailSrc}`,
      }));
      selectedIndex = Math.min(selectedIndex, Math.max(0, photos.length - 1));
      if (photos.length === 0) lightboxOpen = false;
      loaded = true;
    } catch (error) {
      console.error("Best shots failed to load.", error);
      loadError = true;
    } finally {
      loading = false;
    }
  }

  function openPhoto(index: number): void {
    selectedIndex = index;
    lightboxOpen = true;
  }
</script>

<section id="photo-event" class="section best-shots" aria-labelledby="best-shots-title">
  <p class="section-label">BEST SHOTS</p>
  <h2 id="best-shots-title">베스트 샷</h2>
  <p class="best-shots-message">응모해 주셔서 감사합니다.<br />선정되신 다섯 분께는 10월 5일 연락드리겠습니다. 감사합니다.</p>

  {#if loading && !loaded}
    <p class="gallery-status" aria-live="polite">베스트 사진을 불러오고 있습니다.</p>
  {/if}
  {#if loadError}
    <p class="gallery-status error" aria-live="polite">사진을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>
    <button class="gallery-retry" type="button" onclick={() => void loadPhotos()} disabled={loading}>다시 확인</button>
  {:else if loaded && photos.length === 0}
    <p class="gallery-status">베스트 사진을 준비하고 있습니다.</p>
  {/if}

  {#if photos.length > 0}
    <div class="best-photo-gallery" aria-label="선정된 베스트 사진">
      <GalleryGrid images={photos} onopen={openPhoto} gridId="best-photo-gallery-grid" collapsible={false} />
    </div>
  {/if}
</section>

{#if lightboxOpen}
  <GalleryLightbox images={photos} {selectedIndex} onclose={() => (lightboxOpen = false)} onselect={(index) => (selectedIndex = index)} />
{/if}

<style>
  .best-shots-message { margin: -3px 0 30px; color: #655c55; font-size: .9rem; line-height: 1.9; }
  .best-photo-gallery { margin-top: 30px; }
  .gallery-status { color: #7e7066; font-size: .84rem; line-height: 1.7; }
  .gallery-status.error { color: #a24e4a; }
  .gallery-retry { min-height: 46px; margin-top: 17px; border: 0; border-radius: 999px; padding: 10px 20px; background: #a98770; color: white; cursor: pointer; }
  .gallery-retry:focus-visible { outline: 2px solid #806854; outline-offset: 3px; }
  .gallery-retry:disabled { cursor: wait; opacity: .55; }
</style>
