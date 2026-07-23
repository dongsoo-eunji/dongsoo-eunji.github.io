<script lang="ts">
  import { onMount } from "svelte";
  import type { GalleryImage } from "$lib/gallery/gallery-data";

  type Props = {
    image: GalleryImage;
    alt: string;
  };

  let { image, alt }: Props = $props();
  let opened = $state(false);

  function toggleEnvelope(): void {
    opened = !opened;
  }

  onMount(() => {
    let previousScrollY = window.scrollY;
    let touchStartY = 0;
    opened = previousScrollY > 12;

    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY - previousScrollY;

      if (direction > 1 && currentScrollY > 12) {
        opened = true;
      } else if (direction < -1 && currentScrollY <= 32) {
        opened = false;
      }

      previousScrollY = currentScrollY;
    };

    const handleWheel = (event: WheelEvent): void => {
      if (event.deltaY > 0) {
        opened = true;
      } else if (event.deltaY < 0 && window.scrollY <= 32) {
        opened = false;
      }
    };

    const handleTouchStart = (event: TouchEvent): void => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent): void => {
      const currentTouchY = event.touches[0]?.clientY ?? touchStartY;

      if (currentTouchY < touchStartY - 4) {
        opened = true;
      } else if (currentTouchY > touchStartY + 4 && window.scrollY <= 32) {
        opened = false;
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (["ArrowDown", "PageDown", " ", "End"].includes(event.key)) {
        opened = true;
      } else if (
        ["ArrowUp", "PageUp", "Home"].includes(event.key) &&
        window.scrollY <= 32
      ) {
        opened = false;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  });
</script>

<div
  class="envelope-scene"
  style={`--photo-offset: ${opened ? 28 : 106}%; --flap-closed-opacity: ${opened ? 0 : 1}; --flap-open-opacity: ${opened ? 1 : 0};`}
>
  <div class="envelope-back" aria-hidden="true"></div>
  <svg
    class="envelope-flap envelope-flap-open"
    viewBox="0 0 100 50"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path d="M 0 0 L 47 47 Q 50 50 53 47 L 100 0 Z"></path>
  </svg>
  <div class="envelope-photo">
    <img
      src={image.src}
      {alt}
      width={image.width}
      height={image.height}
    />
  </div>
  <svg
    class="envelope-flap envelope-flap-closed"
    viewBox="0 0 100 50"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path d="M 0 0 L 47 47 Q 50 50 53 47 L 100 0 Z"></path>
  </svg>
  <div class="envelope-front" aria-hidden="true">
    <svg
      class="envelope-fold-left"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path d="M 0 0 L 55 48 Q 59 52 55 56 L 0 100 Z"></path>
    </svg>
    <svg
      class="envelope-fold-right"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path d="M 100 0 L 45 48 Q 41 52 45 56 L 100 100 Z"></path>
    </svg>
    <svg
      class="envelope-fold-center"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path d="M 0 100 L 46 47 Q 50 42 54 47 L 100 100 Z"></path>
    </svg>
  </div>
</div>

<button
  class="reveal-button"
  type="button"
  aria-expanded={opened}
  onclick={toggleEnvelope}
>
  {opened ? "초대장 접기" : "아래로 내려 펼쳐보기"}
  <span aria-hidden="true">{opened ? "⌃" : "⌄"}</span>
</button>

<style>
  .envelope-scene {
    --envelope-color: #3d352f;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 3 / 5.9;
    margin: 0 auto 18px;
  }

  .envelope-photo {
    position: absolute;
    z-index: 2;
    top: 3%;
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
    transition: transform .8s cubic-bezier(.22, .72, .2, 1);
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
    top: 68.5%;
    right: 3%;
    bottom: 0;
    left: 3%;
    overflow: hidden;
    background: var(--envelope-color);
    box-shadow: 0 10px 24px rgb(34 27 23 / 24%);
  }

  .envelope-back::before {
    position: absolute;
    top: 10px;
    right: 10px;
    left: 10px;
    height: 54%;
    border-radius: 24px 24px 52% 52%;
    background: #584c43;
    content: "";
  }

  .envelope-flap {
    position: absolute;
    right: 3%;
    left: 3%;
    height: 22%;
    width: 94%;
    color: #4a4039;
  }

  .envelope-flap path {
    fill: currentcolor;
  }

  .envelope-flap-open {
    z-index: 0;
    top: 68.5%;
    filter: drop-shadow(0 -3px 3px rgb(24 18 15 / 18%));
    opacity: var(--flap-open-opacity);
    transform: scaleY(-1);
    transform-origin: 50% 0;
    transition: opacity .4s ease;
  }

  .envelope-flap-closed {
    z-index: 4;
    top: 68.5%;
    filter: drop-shadow(0 3px 3px rgb(24 18 15 / 20%));
    opacity: var(--flap-closed-opacity);
    transition: opacity .35s ease;
  }

  .envelope-front {
    position: absolute;
    z-index: 3;
    top: 68.5%;
    right: 3%;
    bottom: 0;
    left: 3%;
    overflow: hidden;
  }

  .envelope-front svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .envelope-fold-left {
    z-index: 1;
    fill: #493e36;
    filter: drop-shadow(3px -1px 3px rgb(24 18 15 / 18%));
  }

  .envelope-fold-right {
    z-index: 1;
    fill: #332c27;
    filter: drop-shadow(-3px -1px 3px rgb(24 18 15 / 18%));
  }

  .envelope-fold-center {
    z-index: 2;
    fill: #40362f;
    filter: drop-shadow(0 -4px 4px rgb(24 18 15 / 22%));
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
      transition: none;
    }

    .envelope-flap-open,
    .envelope-flap-closed {
      transition: none;
    }
  }
</style>
