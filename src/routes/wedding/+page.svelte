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
  <meta property="og:type" content="website" />
  <meta property="og:title" content="이동수 · 조은지 결혼합니다" />
  <meta
    property="og:description"
    content="2026년 10월 4일, 이동수와 조은지의 결혼식에 초대합니다."
  />
  <meta property="og:url" content="https://dongsoo-eunji.github.io/wedding/" />
  <meta
    property="og:image"
    content="https://dongsoo-eunji.github.io/wedding/images/gallery/thumb/r01.webp"
  />
  <meta property="og:image:type" content="image/webp" />
  <meta property="og:image:width" content="400" />
  <meta property="og:image:height" content="400" />
  <meta property="og:image:alt" content="이동수와 조은지의 웨딩 사진" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="이동수 · 조은지 결혼합니다" />
  <meta
    name="twitter:description"
    content="2026년 10월 4일, 이동수와 조은지의 결혼식에 초대합니다."
  />
  <meta
    name="twitter:image"
    content="https://dongsoo-eunji.github.io/wedding/images/gallery/thumb/r01.webp"
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
    <p class="venue">라도무스아트센터 14:30 라도무스홀</p>
    <!-- TODO: 식사는 13:30 부터 제공된다고 적어야 함. 그러나 어디에? -->
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

  <!-- TODO: 뭔가 하나 더 넣고 싶네. 멘트? -->

  <section class="section gallery" aria-labelledby="gallery-title">
    <p class="section-label">GALLERY</p>
    <h2 id="gallery-title">우리의 순간</h2>
    <GalleryGrid images={galleryImages} onopen={(index) => openGallery(index)} />
  </section>

  <section class="section location" aria-labelledby="location-title">
    <p class="section-label">LOCATION</p>
    <h2 id="location-title">오시는 길</h2>
    <address>
      라도무스아트센터 라도무스홀<br />
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

  <section class="section parking" aria-labelledby="parking-title">
    <p class="section-label">PARKING</p>
    <h2 id="parking-title">주차 안내</h2>
    <p class="parking-lead">
      라도무스아트센터 주차타워(1~6층)와<br />
      인근 제2·제3·제4주차장을 이용해 주세요.
    </p>
    <img
      class="parking-map"
      src={`${base}/wedding/images/parking-map.webp`}
      alt="라도무스아트센터와 주차타워, 제2·제3·제4주차장 위치 약도"
      width="728"
      height="418"
      loading="lazy"
    />
    <ul class="parking-list">
      <li><strong>주차타워</strong><span>라도무스아트센터 1~6층</span></li>
      <li><strong>제2주차장</strong><span>대전지방법원 등기국</span></li>
      <li><strong>제3·제4주차장</strong><span>약도에 표시된 인근 야외 주차장</span></li>
    </ul>
    <p class="parking-note">
      예식 당일 주차장이 혼잡할 수 있습니다.<br />
      자차를 이용하시는 하객분들께서는 예식 시간보다<br />
      조금 더 여유 있게 도착해 주시기를 부탁드립니다.
    </p>
    <div class="transit-guide">
      <h3>대중교통 안내</h3>
      <p>
        유성온천역 6번 출구에서 106번 또는 706번 버스 승차<br />
        106번은 홍도초등학교, 706번은 등기소/아이파크시티 하차<br />
        목원대사거리 우측 방향으로 약 500m 도보
      </p>
    </div>
  </section>

  <section class="section contact" aria-labelledby="contact-title">
    <p class="section-label">CONTACT</p>
    <h2 id="contact-title">마음 전하실 곳</h2>
    <div class="contact-message">
      <p>소중한 마음으로 축하를 전해주시는 모든 분들께 진심으로 감사드립니다.</p>
      <p>
        부득이하게 참석이 어려우신 분들을 위해 축하의 마음을 전하실 수 있도록
        계좌번호를 함께 안내드립니다.
      </p>
      <p>따뜻한 마음에 깊이 감사드리며, 오래도록 소중히 간직하겠습니다.</p>
    </div>
    <div class="account-groups">
      <details class="account-group">
        <summary>신랑측</summary>
        <div class="account-list">
          <div class="account-card">
            <div>
              <span>신랑 이동수</span>
              <code>국민은행 501002-04-037448</code>
            </div>
            <button type="button" onclick={() => copyText('501002-04-037448')}>복사</button>
          </div>
          <div class="account-card account-card-empty">
            <div>
              <span>아버지 이병술</span>
              <code>국민은행 502-21-1014-661</code>
            </div>
            <button type="button" onclick={() => copyText('502-21-1014-661')}>복사</button>
          </div>
          <div class="account-card account-card-empty">
            <div>
              <span>어머니 박미향</span>
              <code>신한은행 110-357-089589</code>
            </div>
            <button type="button" onclick={() => copyText('110-357-089589')}>복사</button>
          </div>
        </div>
      </details>
      <details class="account-group">
        <summary>신부측</summary>
        <div class="account-list">
          <div class="account-card">
            <div>
              <span>신부 조은지</span>
              <code>농협 453087-52-032734</code>
            </div>
            <button type="button" onclick={() => copyText('453087-52-032734')}>복사</button>
          </div>
          <div class="account-card account-card-empty">
            <div>
              <span>아버지 조상기</span>
              <code>농협 453087-56-018591</code>
            </div>
            <button type="button" onclick={() => copyText('453087-56-018591')}>복사</button>
          </div>
          <div class="account-card account-card-empty">
            <div>
              <span>어머니 최형숙</span>
              <code>농협 453087-56-032344</code>
            </div>
            <button type="button" onclick={() => copyText('453087-56-032344')}>복사</button>
          </div>
        </div>
      </details>
    </div>
    <p class="copy-status" aria-live="polite">{copyStatus}</p>
    <noscript>
      <p class="noscript-note">JavaScript 없이도 계좌번호와 예식 정보는 확인할 수 있습니다.</p>
    </noscript>
  </section>

  <!-- TODO: 사진 하나 더 넣으면 좋지 않을까? -->
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
