<script>
  const wedding = {
    groom: '이동수',
    bride: '조은지',
    date: '2026년 10월 4일',
    dateShort: '2026. 10. 04',
    venue: '예식장 정보 예정',
    address: '주소 정보 예정'
  };
</script>

<svelte:head>
  <meta property="og:title" content={`${wedding.groom} · ${wedding.bride} 결혼합니다`} />
  <meta property="og:description" content={wedding.date} />
  <meta property="og:type" content="website" />
</svelte:head>

<main>
  <section class="hero section">
    <p class="eyebrow">WE ARE GETTING MARRIED</p>
    <h1>{wedding.groom} <span>그리고</span> {wedding.bride}</h1>
    <p class="date">{wedding.dateShort}</p>
    <div class="photo-placeholder" aria-label="대표 사진 자리">
      <span>대표 사진을 여기에 넣어주세요</span>
    </div>
  </section>

  <section class="section invitation">
    <p class="section-label">INVITATION</p>
    <h2>저희 두 사람, 결혼합니다.</h2>
    <p>
      함께 걷고 싶은 사람을 만나<br />
      새로운 계절을 시작하려 합니다.<br />
      귀한 걸음으로 축복해 주시면 감사하겠습니다.
    </p>
  </section>

  <section class="section details">
    <p class="section-label">DATE & PLACE</p>
    <h2>{wedding.date}</h2>
    <p>{wedding.venue}</p>
    <p class="muted">{wedding.address}</p>
  </section>

  <section class="section gallery">
    <p class="section-label">GALLERY</p>
    <h2>우리의 순간들</h2>
    <div class="gallery-grid">
      {#each Array(6) as _, index}
        <div class="gallery-placeholder">사진 {index + 1}</div>
      {/each}
    </div>
  </section>

  <section class="section notice">
    <p class="section-label">INFORMATION</p>
    <h2>안내</h2>
    <p>교통, 주차, 연락처, 마음 전하실 곳 등을 추가할 자리입니다.</p>
  </section>

  <footer>
    <p>{wedding.groom} · {wedding.bride}</p>
    <small>{wedding.dateShort}</small>
  </footer>
</main>
