<script lang="ts">
  import { onMount } from "svelte";
  import GalleryLightbox from "$lib/gallery/GalleryLightbox.svelte";
  import type { GalleryImage } from "$lib/gallery/gallery-data";
  import {
    canSubmitPhotoUpload,
    getPhotoEventPhase,
    isAcceptedPhotoFile,
    photoUploadFailureMessage,
    type PhotoEventPhase,
    type PhotoUploadState,
  } from "./photo-event-state";

  const apiRoot = "https://api.hided.net/wedding/photo-event";
  const maximumFileBytes = 15 * 1024 * 1024;
  type PublicPhoto = {
    id: string;
    rank: number;
    src: string;
    thumbnailSrc: string;
    width: number;
    height: number;
    caption?: string;
  };

  let phase: PhotoEventPhase = $state(getPhotoEventPhase(Date.now()));
  let selectedFile: File | null = $state(null);
  let previewUrl = $state("");
  let participantName = $state("");
  let participantContact = $state("");
  let uploadState: PhotoUploadState = $state("idle");
  let uploadProgress = $state(0);
  let uploadMessage = $state("");
  let resultPhotos: GalleryImage[] = $state([]);
  let resultsLoading = $state(false);
  let resultsLoaded = $state(false);
  let resultsError = $state(false);
  let failedResultIds: string[] = $state([]);
  let resultLightboxOpen = $state(false);
  let selectedResultIndex = $state(0);
  let fileInput = $state<HTMLInputElement>();

  onMount(() => {
    const updatePhase = (): void => {
      const nextPhase = getPhotoEventPhase(Date.now());
      if (nextPhase !== phase) phase = nextPhase;
      if (nextPhase === "published" && !resultsLoaded && !resultsLoading) {
        void loadResults();
      }
    };
    const handleVisibility = (): void => {
      if (document.visibilityState !== "visible") return;
      updatePhase();
      if (phase === "published") void loadResults();
    };

    updatePhase();
    const timer = window.setInterval(updatePhase, 30_000);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  });

  function selectFile(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    uploadState = "idle";
    uploadMessage = "";
    uploadProgress = 0;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = "";
    selectedFile = null;

    if (!file) return;
    if (!isAcceptedPhotoFile(file)) {
      uploadState = "error";
      uploadMessage = "JPEG, PNG, WebP 또는 HEIC 사진을 선택해 주세요.";
      input.value = "";
      return;
    }
    if (file.size > maximumFileBytes) {
      uploadState = "error";
      uploadMessage = "사진은 15MB 이하만 올릴 수 있습니다.";
      input.value = "";
      return;
    }
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);
  }

  function resetUpload(): void {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = "";
    selectedFile = null;
    uploadState = "idle";
    uploadMessage = "";
    uploadProgress = 0;
    if (fileInput) fileInput.value = "";
  }

  function submitUpload(event: SubmitEvent): void {
    event.preventDefault();
    if (!canSubmitPhotoUpload(phase, selectedFile !== null, uploadState) || !selectedFile) return;

    uploadState = "uploading";
    uploadProgress = 0;
    uploadMessage = "사진을 준비하고 있습니다.";
    const formData = new FormData();
    formData.append("participantName", participantName);
    formData.append("participantContact", participantContact);
    formData.append("photo", selectedFile, selectedFile.name);

    const request = new XMLHttpRequest();
    request.open("POST", `${apiRoot}/uploads`);
    request.timeout = 120_000;
    request.upload.addEventListener("progress", (progressEvent) => {
      if (!progressEvent.lengthComputable) {
        uploadMessage = "사진을 올리고 있습니다.";
        return;
      }
      uploadProgress = Math.min(100, Math.round((progressEvent.loaded / progressEvent.total) * 100));
      uploadMessage = `사진을 올리고 있습니다. ${uploadProgress}%`;
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        uploadState = "success";
        uploadProgress = 100;
        uploadMessage = "사진이 잘 접수되었습니다. 참여해 주셔서 감사합니다.";
        return;
      }
      let serverMessage = "";
      try {
        const response = JSON.parse(request.responseText) as { message?: string };
        if (response.message) serverMessage = response.message;
      } catch {
        // Use the friendly fallback when the response is not JSON.
      }
      if (request.status === 403) phase = getPhotoEventPhase(Date.now());
      uploadState = "error";
      uploadMessage = photoUploadFailureMessage("server", serverMessage);
    });
    request.addEventListener("error", () => {
      uploadState = "error";
      uploadMessage = photoUploadFailureMessage("network");
    });
    request.addEventListener("timeout", () => {
      uploadState = "error";
      uploadMessage = photoUploadFailureMessage("timeout");
    });
    request.send(formData);
  }

  async function loadResults(): Promise<void> {
    if (resultsLoading) return;
    resultsLoading = true;
    resultsError = false;
    try {
      const response = await fetch(`${apiRoot}/results?refresh=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Result request failed with ${response.status}`);
      const result = (await response.json()) as { items?: PublicPhoto[] };
      if (!Array.isArray(result.items)) throw new Error("Invalid result response");
      resultPhotos = result.items.map((photo) => ({
        id: photo.id,
        src: photo.src,
        thumbnailSrc: photo.thumbnailSrc,
        width: photo.width,
        height: photo.height,
        alt: `베스트 사진 ${String(photo.rank).padStart(2, "0")}`,
        caption: photo.caption,
      }));
      failedResultIds = [];
      resultsLoaded = true;
    } catch (error) {
      console.error("Photo event results failed to load.", error);
      resultsError = true;
    } finally {
      resultsLoading = false;
    }
  }

  function openResult(index: number): void {
    selectedResultIndex = index;
    resultLightboxOpen = true;
  }
</script>

<section id="photo-event" class="section photo-event" aria-labelledby="photo-event-title">
  <p class="section-label">PHOTO EVENT</p>
  <h2 id="photo-event-title">오늘의 베스트 사진을 찾아요</h2>
  <p class="photo-event-lead">
    예식 중 신랑·신부의 모습을 자유롭게 찍어주세요.<br />
    여러분이 담아주신 사진 중 마음에 드는 세 장을 골라<br />
    작은 선물을 보내드립니다.
  </p>

  <ol class="participation-steps">
    <li><span>01</span>예식 중 신랑·신부의 사진을 찍어주세요.</li>
    <li><span>02</span>이 페이지에서 마음에 드는 사진을 올려주세요.</li>
    <li><span>03</span>선정된 촬영자에게 기프티콘을 보내드립니다.</li>
  </ol>

  <dl class="photo-event-schedule">
    <div><dt>사진 접수</dt><dd>지금부터 10월 4일 오후 8시까지</dd></div>
    <div><dt>결과 발표</dt><dd>10월 4일 오후 10시</dd></div>
  </dl>

  <div class="event-state-card">
    {#if phase === "open"}
      <div class="accepting-copy">
        <strong>사진 접수 중</strong>
        <p>10월 4일 오후 8시까지 미리 참여하실 수 있습니다.</p>
      </div>
      <form class="photo-upload-form" onsubmit={submitUpload}>
        <div class="participant-fields">
          <label>
            <span>이름</span>
            <input bind:value={participantName} name="participantName" maxlength="30" autocomplete="name" required disabled={uploadState === "uploading"} />
          </label>
          <label>
            <span>연락처</span>
            <input bind:value={participantContact} name="participantContact" maxlength="100" inputmode="tel" autocomplete="tel" placeholder="기프티콘을 받으실 연락처" required disabled={uploadState === "uploading"} />
          </label>
        </div>
        <label class="file-picker" class:has-preview={previewUrl}>
          <span>{selectedFile ? "다른 사진 선택" : "사진 선택"}</span>
          <input bind:this={fileInput} type="file" name="photo" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onchange={selectFile} disabled={uploadState === "uploading"} />
        </label>
        {#if previewUrl}
          <div class="upload-preview">
            <img src={previewUrl} alt="선택한 사진 미리보기" />
          </div>
        {/if}
        <p class="upload-help">JPEG, PNG, WebP, HEIC · 최대 15MB</p>
        <p class="privacy-copy">이름과 연락처, 미선정 사진은 베스트 사진 선정과 선물 전달에만 사용되며 이 페이지에 공개되지 않습니다.</p>
        {#if uploadState === "success"}
          <button class="upload-button secondary" type="button" onclick={resetUpload}>다른 사진 올리기</button>
        {:else}
          <button class="upload-button" type="submit" disabled={!canSubmitPhotoUpload(phase, selectedFile !== null, uploadState)}>
            {uploadState === "uploading" ? "업로드 중" : uploadState === "error" ? "다시 업로드" : "사진 올리기"}
          </button>
        {/if}
        {#if uploadState === "uploading"}
          <progress max="100" value={uploadProgress}>업로드 {uploadProgress}%</progress>
        {/if}
        <p class:error={uploadState === "error"} class:success={uploadState === "success"} class="upload-status" aria-live="polite">{uploadMessage}</p>
      </form>
    {:else if phase === "selecting"}
      <strong>사진 접수가 마감되었습니다.</strong>
      <p>베스트 사진은 오늘 오후 10시에 공개됩니다.</p>
    {:else}
      {#if resultsLoading && !resultsLoaded}
        <strong>베스트 사진을 불러오고 있습니다.</strong>
      {:else if resultPhotos.length > 0}
        <strong>베스트 사진을 공개합니다.</strong>
        <p>멋진 순간을 담아주신 모든 분들께 감사드립니다.</p>
      {:else}
        <strong>베스트 사진을 선정하고 있습니다.</strong>
        <p>잠시 후 다시 확인해 주세요.</p>
        <button class="result-refresh" type="button" onclick={() => void loadResults()} disabled={resultsLoading}>다시 확인</button>
      {/if}
      {#if resultsError}
        <p class="result-error" aria-live="polite">결과를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>
      {/if}
    {/if}
  </div>

  {#if phase === "published" && resultPhotos.length > 0}
    <div class="best-photo-grid" aria-label="선정된 베스트 사진">
      {#each resultPhotos as photo, index (photo.id)}
        <article>
          <p>BEST PHOTO {String(index + 1).padStart(2, "0")}</p>
          {#if failedResultIds.includes(photo.id)}
            <div class="result-image-fallback">사진을 불러오지 못했습니다.</div>
          {:else}
            <button type="button" onclick={() => openResult(index)} aria-label={`${photo.alt} 크게 보기`}>
              <span>
                <img src={photo.thumbnailSrc} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" onerror={() => (failedResultIds = [...failedResultIds, photo.id])} />
              </span>
            </button>
          {/if}
        </article>
      {/each}
    </div>
  {/if}
</section>

{#if resultLightboxOpen}
  <GalleryLightbox images={resultPhotos} selectedIndex={selectedResultIndex} onclose={() => (resultLightboxOpen = false)} onselect={(index) => (selectedResultIndex = index)} />
{/if}

<style>
  .photo-event-lead { margin: -3px 0 30px; color: #655c55; font-size: .9rem; line-height: 1.9; }
  .participation-steps { display: grid; gap: 13px; margin: 0; padding: 0; list-style: none; text-align: left; }
  .participation-steps li { display: grid; grid-template-columns: 34px 1fr; align-items: start; gap: 10px; color: #625950; font-size: .86rem; line-height: 1.65; }
  .participation-steps span { color: #a98770; font-size: .7rem; font-weight: 700; letter-spacing: .08em; }
  .photo-event-schedule { display: grid; gap: 1px; overflow: hidden; margin: 28px 0; border: 1px solid #e3d8ce; border-radius: 12px; background: #e3d8ce; text-align: left; }
  .photo-event-schedule div { display: grid; grid-template-columns: 82px 1fr; gap: 12px; padding: 13px 14px; background: #f8f3ed; }
  .photo-event-schedule dt { color: #7c6657; font-size: .82rem; font-weight: 700; }
  .photo-event-schedule dd { margin: 0; color: #625950; font-size: .84rem; }
  .event-state-card { padding: 22px 18px; border: 1px solid #ded1c4; border-radius: 14px; background: #fffdf9; }
  .event-state-card > strong, .accepting-copy strong { display: block; color: #594940; font-family: "Gowun Batang", serif; }
  .event-state-card > p, .accepting-copy p { margin: 8px 0 0; color: #7e7066; font-size: .84rem; line-height: 1.7; }
  .photo-upload-form { margin-top: 22px; padding-top: 22px; border-top: 1px dashed #d9cec4; }
  .participant-fields { display: grid; gap: 12px; text-align: left; }
  .participant-fields label > span { display: block; margin-bottom: 6px; color: #66574d; font-size: .8rem; font-weight: 700; }
  .participant-fields input { width: 100%; min-height: 46px; border: 1px solid #d8cabc; border-radius: 9px; padding: 10px 12px; background: white; color: #352f2a; font: inherit; }
  .participant-fields input:focus-visible, .file-picker:focus-within, button:focus-visible { outline: 2px solid #806854; outline-offset: 3px; }
  .file-picker { display: grid; min-height: 48px; margin-top: 14px; place-items: center; border: 1px dashed #bca38f; border-radius: 10px; color: #6d5646; cursor: pointer; }
  .file-picker input { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; }
  .upload-preview { display: grid; overflow: hidden; width: 100%; margin-top: 12px; place-items: center; aspect-ratio: 4 / 3; border-radius: 10px; background: #eee8e1; }
  .upload-preview img { width: 100%; height: 100%; object-fit: contain; }
  .upload-help { margin: 9px 0 0; color: #96877c; font-size: .73rem; }
  .privacy-copy { margin: 15px 0 0; color: #85776d; font-size: .73rem; line-height: 1.65; text-align: left; }
  .upload-button, .result-refresh { min-height: 46px; margin-top: 17px; border: 0; border-radius: 999px; padding: 10px 20px; background: #a98770; color: white; cursor: pointer; }
  .upload-button { width: 100%; }
  .upload-button.secondary { border: 1px solid #a98770; background: transparent; color: #6d5646; }
  .upload-button:disabled, .result-refresh:disabled { cursor: wait; opacity: .55; }
  progress { width: 100%; height: 6px; margin-top: 12px; accent-color: #a98770; }
  .upload-status { min-height: 1.4em; margin: 10px 0 0; color: #806c5e; font-size: .78rem; line-height: 1.6; }
  .upload-status.error, .result-error { color: #a24e4a; }
  .upload-status.success { color: #55705b; }
  .best-photo-grid { display: grid; gap: 24px; margin-top: 30px; }
  .best-photo-grid article > p { margin: 0 0 8px; color: #9b7f69; font-size: .68rem; letter-spacing: .18em; }
  .best-photo-grid button { width: 100%; border: 0; padding: 9px 9px 26px; background: white; box-shadow: 0 8px 20px rgb(66 50 38 / 16%); cursor: zoom-in; }
  .best-photo-grid button > span { display: grid; overflow: hidden; width: 100%; place-items: center; background: #eee8e1; }
  .best-photo-grid img { width: 100%; height: auto; object-fit: contain; }
  .result-image-fallback { display: grid; min-height: 180px; place-items: center; border: 1px dashed #d8cabc; color: #8b8077; font-size: .8rem; }
</style>
