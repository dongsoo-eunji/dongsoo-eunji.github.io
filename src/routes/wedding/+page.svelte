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

  const weddingDate = new Date('2026-10-04T14:30:00+09:00');
  let remainingDays: number | null = $state(null);
  let copyStatus = $state('');
  let selectedImageIndex = $state(0);
  let galleryOpen = $state(false);
  let musicElement: HTMLAudioElement;
  let musicReady = $state(false);
  let musicPlaying = $state(false);
  let musicStarting = $state(false);
  let musicStatus = $state('');
  let musicAttempt = 0;

  onMount(() => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    remainingDays = Math.max(
      0,
      Math.ceil((weddingDate.getTime() - Date.now()) / millisecondsPerDay)
    );
    musicReady = musicElement.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
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

  async function toggleMusic(): Promise<void> {
    if (!musicElement) return;

    if (!musicElement.paused) {
      musicAttempt += 1;
      musicElement.pause();
      return;
    }

    const attempt = ++musicAttempt;
    musicStarting = true;
    musicStatus = '';

    window.setTimeout(() => {
      if (musicStarting && musicAttempt === attempt) {
        musicAttempt += 1;
        musicElement.pause();
        musicStarting = false;
        musicStatus = '음악 재생을 시작하지 못했습니다. 다시 눌러 주세요.';
      }
    }, 4000);

    try {
      await musicElement.play();
    } catch {
      if (musicAttempt !== attempt) return;
      musicStarting = false;
      musicPlaying = false;
      musicStatus = '음악을 재생하지 못했습니다. 다시 눌러 주세요.';
    }
  }

  function handleMusicCanPlay(): void {
    musicReady = true;
  }

  function handleMusicPlaying(): void {
    musicAttempt += 1;
    musicStarting = false;
    musicPlaying = true;
    musicStatus = '';
  }

  function handleMusicPause(): void {
    musicAttempt += 1;
    musicStarting = false;
    musicPlaying = false;
  }

  function handleMusicError(): void {
    musicAttempt += 1;
    musicReady = false;
    musicStarting = false;
    musicPlaying = false;
    musicStatus = '음악 파일을 불러오지 못했습니다.';
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
    <button
      class="music-toggle"
      type="button"
      aria-pressed={musicPlaying}
      aria-busy={!musicReady || musicStarting}
      disabled={!musicReady}
      onclick={() => void toggleMusic()}
    >
      {musicPlaying ? 'Ⅱ 음악 잠시 멈추기' : !musicReady ? '♫ 음악 불러오는 중' : musicStarting ? '♫ 음악 준비 중' : '♫ 음악과 함께 보기'}
    </button>
    <audio
      bind:this={musicElement}
      src={`${base}/wedding/music/alex-morgan-calm-piano-541028.m4a`}
      loop
      preload="auto"
      oncanplay={handleMusicCanPlay}
      onplaying={handleMusicPlaying}
      onpause={handleMusicPause}
      onerror={handleMusicError}
    ></audio>
    {#if musicStatus}
      <p class="music-status" aria-live="polite">{musicStatus}</p>
    {/if}
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
    <p class="venue">라도무스 웨딩홀 14:30</p>
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
      <span class="sunday">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span class="saturday">토</span>
      <i></i><i></i><i></i><i></i><b>1</b><b>2</b><b class="holiday" aria-label="3일, 개천절">3</b>
      <strong class="sunday">4</strong><b class="holiday" aria-label="5일, 개천절 대체공휴일">5</b><b>6</b><b>7</b><b>8</b><b class="holiday" aria-label="9일, 한글날">9</b><b class="saturday">10</b>
      <b class="sunday">11</b><b>12</b><b>13</b><b>14</b><b>15</b><b>16</b><b class="saturday">17</b>
      <b class="sunday">18</b><b>19</b><b>20</b><b>21</b><b>22</b><b>23</b><b class="saturday">24</b>
      <b class="sunday">25</b><b>26</b><b>27</b><b>28</b><b>29</b><b>30</b><b class="saturday">31</b>
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
      라도무스아트센터<br />
      대전 유성구 동서대로 639 3층
    </address>
    <a
      class="kakao-map"
      href="https://place.map.kakao.com/27596552"
      target="_blank"
      rel="noreferrer"
      aria-label="카카오맵에서 라도무스아트센터 위치 보기"
    >
      <img
        src="https://staticmap.kakao.com/staticmap/og?type=place&srs=wgs84&size=800x400&service=placeweb&m=127.33364373611032%2C36.333058550294965"
        alt="라도무스아트센터 위치 지도"
        width="800"
        height="400"
        loading="lazy"
      />
      <span>카카오맵에서 크게 보기</span>
    </a>
  </section>

  <section class="section contact" aria-labelledby="contact-title">
    <p class="section-label">CONTACT</p>
    <h2 id="contact-title">마음 전하실 곳</h2>
    <div class="account-card">
      <div>
        <span>신랑 이동수</span>
        <code>국민은행 501002-04-037448</code>
      </div>
      <button type="button" onclick={() => copyText('501002-04-037448')}>복사</button>
    </div>
    <div class="account-card">
      <div>
        <span>신부 조은지</span>
        <code>농협중앙회 4530-8752-032734</code>
      </div>
      <button type="button" onclick={() => copyText('4530-8752-032734')}>복사</button>
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
