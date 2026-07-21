<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import GalleryGrid from '$lib/gallery/GalleryGrid.svelte';
  import GalleryLightbox from '$lib/gallery/GalleryLightbox.svelte';
  import '$lib/gallery/gallery.css';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const galleryImages = $derived(data.galleryImages);
  const coverImage = $derived(galleryImages.find((image) => image.id === 'wedding-r01')!);

  const weddingDate = new Date('2026-10-04T13:00:00+09:00');
  let remainingDays: number | null = $state(null);
  let copyStatus = $state('');
  let selectedImageIndex = $state(0);
  let galleryOpen = $state(false);

  onMount(() => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    remainingDays = Math.max(
      0,
      Math.ceil((weddingDate.getTime() - Date.now()) / millisecondsPerDay)
    );
  });

  async function copyText(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      copyStatus = '복사되었습니다.';
    } catch {
      copyStatus = '길게 눌러 직접 복사해 주세요.';
    }
  }

  function openGallery(index: number): void {
    selectedImageIndex = index;
    galleryOpen = true;
  }

  function closeGallery(): void {
    galleryOpen = false;
  }
</script>

<svelte:head>
  <title>이동수 · 조은지 결혼합니다</title>
  <meta
    name="description"
    content="2026년 10월 4일, 이동수와 조은지의 결혼식에 초대합니다."
  />
  <meta name="robots" content="noindex, nofollow, noarchive" />
</svelte:head>

<main>
  <section class="hero" aria-labelledby="wedding-title">
    <p class="eyebrow">WE ARE GETTING MARRIED</p>
    <div class="photo-frame">
      <img
        src={coverImage.src}
        alt="신랑 이동수와 신부 조은지의 대표 사진"
        width={coverImage.width}
        height={coverImage.height}
      />
    </div>
    <h1 id="wedding-title">이동수 <span>그리고</span> 조은지</h1>
    <p class="date">2026. 10. 04. SUN</p>
    <p class="venue">예식 장소와 시간은 추후 입력해 주세요.</p>
  </section>

  <section class="section intro" aria-labelledby="intro-title">
    <p class="section-label">INVITATION</p>
    <h2 id="intro-title">소중한 분들을 초대합니다</h2>
    <p>
      서로의 하루를 가장 가까이에서 나누며<br />
      이제 한 가족으로 새로운 길을 시작합니다.<br />
      귀한 걸음으로 축복해 주시면 감사하겠습니다.
    </p>
  </section>

  <section class="section calendar" aria-labelledby="date-title">
    <p class="section-label">DATE</p>
    <h2 id="date-title">2026년 10월 4일</h2>
    <div class="calendar-grid" aria-label="2026년 10월 달력">
      <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
      <i></i><i></i><i></i><i></i><b>1</b><b>2</b><b>3</b>
      <strong>4</strong><b>5</b><b>6</b><b>7</b><b>8</b><b>9</b><b>10</b>
      <b>11</b><b>12</b><b>13</b><b>14</b><b>15</b><b>16</b><b>17</b>
      <b>18</b><b>19</b><b>20</b><b>21</b><b>22</b><b>23</b><b>24</b>
      <b>25</b><b>26</b><b>27</b><b>28</b><b>29</b><b>30</b><b>31</b>
    </div>
    {#if remainingDays !== null}
      <p class="countdown">결혼식까지 <strong>{remainingDays}</strong>일 남았습니다.</p>
    {:else}
      <p class="countdown no-js-copy">2026년 10월 4일에 만나요.</p>
    {/if}
  </section>

  <section class="section gallery" aria-labelledby="gallery-title">
    <p class="section-label">GALLERY</p>
    <h2 id="gallery-title">우리의 순간</h2>
    <GalleryGrid images={galleryImages} onopen={(index) => openGallery(index)} />
  </section>

  <section class="section location" aria-labelledby="location-title">
    <p class="section-label">LOCATION</p>
    <h2 id="location-title">오시는 길</h2>
    <address>
      예식장 이름<br />
      서울특별시 예시구 예시로 123
    </address>
    <a class="button-link" href="https://map.kakao.com" target="_blank" rel="noreferrer">
      지도에서 보기
    </a>
  </section>

  <section class="section contact" aria-labelledby="contact-title">
    <p class="section-label">CONTACT</p>
    <h2 id="contact-title">마음 전하실 곳</h2>
    <p class="muted">계좌 정보는 실제 정보로 교체해 주세요.</p>
    <div class="account-card">
      <div>
        <span>신랑 이동수</span>
        <code>은행 000-0000-0000</code>
      </div>
      <button type="button" onclick={() => copyText('000-0000-0000')}>복사</button>
    </div>
    <div class="account-card">
      <div>
        <span>신부 조은지</span>
        <code>은행 000-0000-0000</code>
      </div>
      <button type="button" onclick={() => copyText('000-0000-0000')}>복사</button>
    </div>
    <p class="copy-status" aria-live="polite">{copyStatus}</p>
    <noscript>
      <p class="noscript-note">JavaScript 없이도 계좌번호와 예식 정보는 확인할 수 있습니다.</p>
    </noscript>
  </section>

  <footer>
    <p>이동수 · 조은지</p>
    <small>2026년 10월 4일</small>
  </footer>
</main>

{#if galleryOpen}
  <GalleryLightbox
    images={galleryImages}
    selectedIndex={selectedImageIndex}
    onclose={closeGallery}
    onselect={(index) => (selectedImageIndex = index)}
  />
{/if}
