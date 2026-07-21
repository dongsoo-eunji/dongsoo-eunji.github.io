<svelte:head>
  <title>이동수 · 조은지</title>
  <meta http-equiv="refresh" content="0; url=/wedding/" />
  <meta name="robots" content="noindex, nofollow, noarchive" />
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    window.location.replace('/wedding/');
  });
</script>

<main>
  <p>결혼식 페이지로 이동하고 있습니다.</p>
  <a href="/wedding/">자동으로 이동하지 않으면 여기를 눌러 주세요.</a>
</main>
