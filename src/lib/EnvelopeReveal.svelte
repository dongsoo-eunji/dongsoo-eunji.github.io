<script lang="ts">
  import type { GalleryImage } from "$lib/gallery/gallery-data";

  type Props = {
    image: GalleryImage;
    alt: string;
    onreveal?: () => void;
  };

  let { image, alt, onreveal }: Props = $props();
  let opened = $state(false);

  function reveal(): void {
    opened = true;
    window.setTimeout(() => onreveal?.(), 450);
  }
</script>

<div
  class="envelope-scene"
  style={`--photo-offset: ${opened ? 0 : 55}%; --flap-closed-opacity: ${opened ? 0 : 1}; --flap-open-opacity: ${opened ? 1 : 0};`}
>
  <div class="envelope-back" aria-hidden="true"></div>
  <div class="envelope-flap envelope-flap-open" aria-hidden="true"></div>
  <div class="envelope-photo">
    <img
      src={image.src}
      {alt}
      width={image.width}
      height={image.height}
    />
  </div>
  <div class="envelope-flap envelope-flap-closed" aria-hidden="true"></div>
  <div class="envelope-front" aria-hidden="true"></div>
</div>

<button
  class="reveal-button"
  type="button"
  aria-expanded={opened}
  onclick={reveal}
>
  {opened ? "아래로 보기" : "초대장 펼쳐보기"}
  <span aria-hidden="true">⌄</span>
</button>

<style>
  .envelope-scene {
    --envelope-color: #3d352f;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 3 / 4.25;
    margin: 0 auto 18px;
  }

  .envelope-photo {
    position: absolute;
    z-index: 2;
    top: 7%;
    left: 50%;
    box-sizing: border-box;
    overflow: hidden;
    width: 82%;
    aspect-ratio: 3 / 4.5;
    padding: 10px;
    border-radius: 4px;
    background: #fffdf9;
    box-shadow: 0 8px 24px rgb(34 27 23 / 24%);
    transform: translate(-50%, var(--photo-offset));
    transition: transform .75s cubic-bezier(.22, .72, .2, 1);
    will-change: transform;
  }

  .envelope-photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
  }

  .envelope-back {
    position: absolute;
    z-index: 1;
    top: 62%;
    right: 3%;
    bottom: 0;
    left: 3%;
    overflow: hidden;
    border-radius: 22px;
    background: var(--envelope-color);
    box-shadow: 0 10px 24px rgb(34 27 23 / 24%);
  }

  .envelope-back::before {
    position: absolute;
    top: 10px;
    right: 10px;
    left: 10px;
    height: 46%;
    border-radius: 18px 18px 46% 46%;
    background: #584c43;
    content: "";
  }

  .envelope-flap {
    position: absolute;
    right: 3%;
    left: 3%;
    height: 26%;
    border-radius: 20px 20px 34px 34px;
    clip-path: polygon(0 0, 50% 100%, 100% 0);
  }

  .envelope-flap-open {
    z-index: 1;
    top: 62%;
    background: #4a4039;
    opacity: var(--flap-open-opacity);
    transform: scaleY(-1);
    transform-origin: 50% 0;
    transition: opacity .4s ease;
  }

  .envelope-flap-closed {
    z-index: 4;
    top: 62%;
    background: #4a4039;
    opacity: var(--flap-closed-opacity);
    transition: opacity .35s ease;
  }

  .envelope-front {
    position: absolute;
    z-index: 3;
    top: 62%;
    right: 3%;
    bottom: 0;
    left: 3%;
    overflow: hidden;
    border-radius: 0 0 22px 22px;
    clip-path: polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%);
    background: var(--envelope-color);
  }

  .envelope-front::before,
  .envelope-front::after {
    position: absolute;
    inset: 0;
    content: "";
  }

  .envelope-front::before {
    background: #493e36;
    clip-path: polygon(0 0, 50% 58%, 0 100%);
  }

  .envelope-front::after {
    background: #332c27;
    clip-path: polygon(100% 0, 50% 58%, 100% 100%);
  }

  .reveal-button {
    display: inline-grid;
    justify-items: center;
    gap: 2px;
    min-height: 44px;
    margin: 0 auto 34px;
    border: 0;
    padding: 4px 16px;
    background: transparent;
    color: #6d5a4d;
    font-family: "Gowun Batang", serif;
    font-size: .9rem;
    cursor: pointer;
  }

  .reveal-button span {
    font-family: sans-serif;
    font-size: 1.25rem;
    line-height: .8;
  }

  .reveal-button:focus-visible {
    border-radius: 8px;
    outline: 2px solid #806854;
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .envelope-photo {
      transform: translate(-50%, 0) !important;
    }

    .envelope-flap-open {
      opacity: 1 !important;
    }

    .envelope-flap-closed {
      opacity: 0 !important;
    }
  }
</style>
