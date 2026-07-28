<script lang="ts">
  import { onMount } from "svelte";

  const API_URL = "https://api.hided.net/wedding/guestbook";
  const PAGE_SIZE = 20;
  const NAME_LIMIT = 30;
  const CONTENT_LIMIT = 500;

  type GuestbookEntry = {
    id: number | string;
    name?: string;
    content: string;
    isPrivate: boolean;
    createdAt: string;
  };

  type GuestbookResponse = {
    items?: GuestbookEntry[];
  };

  let entries = $state<GuestbookEntry[]>([]);
  let name = $state("");
  let content = $state("");
  let isPrivate = $state(false);
  let website = $state("");
  let loading = $state(true);
  let loadingMore = $state(false);
  let submitting = $state(false);
  let hasMore = $state(false);
  let listMessage = $state("");
  let formMessage = $state("");
  let formSucceeded = $state(false);

  const nameLength = $derived(Array.from(name).length);
  const contentLength = $derived(Array.from(content).length);
  const canSubmit = $derived(
    !submitting &&
      name.trim().length > 0 &&
      content.trim().length > 0 &&
      nameLength <= NAME_LIMIT &&
      contentLength <= CONTENT_LIMIT,
  );

  onMount(() => {
    void loadEntries(true);
  });

  async function loadEntries(reset = false): Promise<void> {
    if (reset) {
      loading = true;
      listMessage = "";
    } else {
      loadingMore = true;
    }

    const offset = reset ? 0 : entries.length;

    try {
      const response = await fetch(
        `${API_URL}?limit=${PAGE_SIZE}&offset=${offset}`,
        {
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(`Guestbook request failed with ${response.status}.`);
      }

      const payload = (await response.json()) as GuestbookResponse;
      if (!Array.isArray(payload.items)) {
        throw new Error("Guestbook response did not contain an item list.");
      }

      entries = reset ? payload.items : [...entries, ...payload.items];
      hasMore = payload.items.length === PAGE_SIZE;
    } catch (error) {
      console.error("Guestbook list request failed.", error);
      listMessage = reset
        ? "방명록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
        : "다음 글을 불러오지 못했습니다.";
    } finally {
      loading = false;
      loadingMore = false;
    }
  }

  async function submitEntry(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!canSubmit) return;

    submitting = true;
    formMessage = "";
    formSucceeded = false;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          content: content.trim(),
          isPrivate,
          ...(website ? { website } : {}),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("rate-limit");
        }
        if (response.status >= 400 && response.status < 500) {
          throw new Error("invalid-request");
        }
        throw new Error(`Guestbook submission failed with ${response.status}.`);
      }

      name = "";
      content = "";
      isPrivate = false;
      website = "";
      formSucceeded = true;
      formMessage = "따뜻한 마음을 남겨주셔서 감사합니다.";
      await loadEntries(true);
    } catch (error) {
      console.error("Guestbook submission failed.", error);
      if (error instanceof Error && error.message === "rate-limit") {
        formMessage =
          "짧은 시간에 여러 글이 등록되었습니다. 잠시 후 다시 시도해 주세요.";
      } else if (
        error instanceof Error &&
        error.message === "invalid-request"
      ) {
        formMessage = "입력 내용을 확인한 뒤 다시 시도해 주세요.";
      } else {
        formMessage =
          "글을 등록하지 못했습니다. 네트워크 상태를 확인해 주세요.";
      }
    } finally {
      submitting = false;
    }
  }

  function formatCreatedAt(createdAt: string): string {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Seoul",
    }).format(date);
  }
</script>

<div class="guestbook-form-wrap">
  <form class="guestbook-form" onsubmit={submitEntry}>
    <div class="guestbook-field">
      <div class="guestbook-label-row">
        <label for="guestbook-name">이름</label>
        <span class:over-limit={nameLength > NAME_LIMIT}>
          {nameLength}/{NAME_LIMIT}
        </span>
      </div>
      <input
        id="guestbook-name"
        name="name"
        type="text"
        bind:value={name}
        maxlength={NAME_LIMIT}
        autocomplete="name"
        placeholder="이름을 적어주세요"
        disabled={submitting}
        required
      />
    </div>

    <div class="guestbook-field">
      <div class="guestbook-label-row">
        <label for="guestbook-content">축하 메시지</label>
        <span class:over-limit={contentLength > CONTENT_LIMIT}>
          {contentLength}/{CONTENT_LIMIT}
        </span>
      </div>
      <textarea
        id="guestbook-content"
        name="content"
        bind:value={content}
        maxlength={CONTENT_LIMIT}
        rows="5"
        placeholder="두 사람에게 따뜻한 마음을 전해주세요"
        disabled={submitting}
        required
      ></textarea>
    </div>

    <div class="honeypot" aria-hidden="true">
      <label for="guestbook-website">웹사이트</label>
      <input
        id="guestbook-website"
        name="website"
        type="text"
        bind:value={website}
        tabindex="-1"
        autocomplete="off"
      />
    </div>

    <label class="private-toggle">
      <input type="checkbox" bind:checked={isPrivate} disabled={submitting} />
      <span>
        <strong>비공개로 남기기</strong>
        <small>작성한 이름과 내용은 신랑·신부만 볼 수 있어요.</small>
      </span>
    </label>

    <button class="guestbook-submit" type="submit" disabled={!canSubmit}>
      {submitting ? "마음을 전하는 중…" : "축하 메시지 남기기"}
    </button>

    <p
      class:success={formSucceeded}
      class="guestbook-form-message"
      aria-live="polite"
    >
      {formMessage}
    </p>
  </form>
</div>

<div class="guestbook-list" aria-busy={loading || loadingMore}>
  {#if loading}
    <p class="guestbook-state">방명록을 불러오는 중이에요.</p>
  {:else if listMessage && entries.length === 0}
    <div class="guestbook-state">
      <p>{listMessage}</p>
      <button type="button" onclick={() => void loadEntries(true)}>
        다시 불러오기
      </button>
    </div>
  {:else if entries.length === 0}
    <p class="guestbook-state">
      아직 남겨진 글이 없어요.<br />
      첫 번째 축하 메시지를 남겨주세요.
    </p>
  {:else}
    <ul>
      {#each entries as entry (entry.id)}
        <li class:private-entry={entry.isPrivate}>
          <div class="guestbook-entry-header">
            <strong>{entry.isPrivate ? "비공개" : entry.name}</strong>
            {#if entry.isPrivate}
              <span class="private-badge">비공개</span>
            {/if}
          </div>
          <p>{entry.content}</p>
          <time datetime={entry.createdAt}>
            {formatCreatedAt(entry.createdAt)}
          </time>
        </li>
      {/each}
    </ul>

    {#if listMessage}
      <p class="guestbook-list-message" aria-live="polite">{listMessage}</p>
    {/if}

    {#if hasMore}
      <button
        class="guestbook-more"
        type="button"
        disabled={loadingMore}
        onclick={() => void loadEntries()}
      >
        {loadingMore ? "불러오는 중…" : "축하 메시지 더 보기"}
      </button>
    {/if}
  {/if}
</div>

<style>
  .guestbook-form-wrap {
    margin-top: 30px;
    padding: 22px 18px 18px;
    border: 1px solid #e4d9cf;
    border-radius: 16px;
    background: #faf6f1;
    text-align: left;
  }

  .guestbook-form {
    display: grid;
    gap: 18px;
  }

  .guestbook-field {
    display: grid;
    gap: 8px;
  }

  .guestbook-label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    color: #65574d;
    font-size: 0.86rem;
    font-weight: 650;
  }

  .guestbook-label-row span {
    color: #9a8b80;
    font-size: 0.72rem;
    font-weight: 400;
  }

  .guestbook-label-row .over-limit {
    color: #b24d47;
  }

  input[type="text"],
  textarea {
    width: 100%;
    border: 1px solid #d9cec4;
    border-radius: 10px;
    padding: 12px 13px;
    background: #fffdf9;
    color: #453c35;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.6;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  textarea {
    min-height: 126px;
    resize: vertical;
  }

  input[type="text"]::placeholder,
  textarea::placeholder {
    color: #aa9d93;
  }

  input[type="text"]:focus,
  textarea:focus {
    border-color: #9f7e68;
    outline: 0;
    box-shadow: 0 0 0 3px rgb(159 126 104 / 13%);
  }

  input[type="text"]:disabled,
  textarea:disabled {
    opacity: 0.65;
  }

  .honeypot {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .private-toggle {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: #65574d;
    cursor: pointer;
  }

  .private-toggle input {
    width: 18px;
    height: 18px;
    margin: 2px 0 0;
    accent-color: #9b7057;
  }

  .private-toggle span {
    display: grid;
    gap: 4px;
  }

  .private-toggle strong {
    font-size: 0.86rem;
    font-weight: 650;
  }

  .private-toggle small {
    color: #8d7e73;
    font-size: 0.73rem;
    line-height: 1.5;
  }

  .guestbook-submit,
  .guestbook-more,
  .guestbook-state button {
    min-height: 46px;
    border: 0;
    border-radius: 999px;
    padding: 11px 18px;
    background: #9b7057;
    color: #fff;
    font: inherit;
    font-size: 0.86rem;
    font-weight: 650;
    cursor: pointer;
  }

  .guestbook-submit:disabled,
  .guestbook-more:disabled {
    cursor: wait;
    opacity: 0.55;
  }

  .guestbook-submit:focus-visible,
  .guestbook-more:focus-visible,
  .guestbook-state button:focus-visible,
  .private-toggle input:focus-visible {
    outline: 2px solid #806854;
    outline-offset: 3px;
  }

  .guestbook-form-message {
    min-height: 1.5em;
    margin: -4px 0 0;
    color: #a14e48;
    font-size: 0.78rem;
    line-height: 1.5;
    text-align: center;
  }

  .guestbook-form-message.success {
    color: #6f7456;
  }

  .guestbook-list {
    margin-top: 34px;
  }

  .guestbook-list ul {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: left;
  }

  .guestbook-list li {
    padding: 18px;
    border: 1px solid #e7ddd4;
    border-radius: 14px;
    background: #fffdf9;
  }

  .guestbook-list li.private-entry {
    border-style: dashed;
    background: #faf7f3;
  }

  .guestbook-entry-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .guestbook-entry-header strong {
    color: #5e4d42;
    font-family: "Gowun Batang", serif;
    font-size: 0.95rem;
  }

  .private-badge {
    border-radius: 999px;
    padding: 3px 7px;
    background: #eee5dd;
    color: #877568;
    font-size: 0.64rem;
  }

  .guestbook-list li > p {
    margin: 11px 0 14px;
    color: #5f5650;
    font-size: 0.88rem;
    line-height: 1.75;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .guestbook-list time {
    display: block;
    color: #a09389;
    font-size: 0.68rem;
  }

  .guestbook-state {
    margin: 0;
    padding: 24px 12px;
    color: #8a7c72;
    font-size: 0.84rem;
    line-height: 1.8;
  }

  div.guestbook-state p {
    margin: 0 0 14px;
  }

  .guestbook-state button {
    min-height: 42px;
    background: #a98770;
  }

  .guestbook-more {
    width: 100%;
    margin-top: 18px;
    border: 1px solid #cbb8a9;
    background: transparent;
    color: #755e4e;
  }

  .guestbook-list-message {
    margin: 16px 0 0;
    color: #a14e48;
    font-size: 0.78rem;
  }

  @media (max-width: 380px) {
    .guestbook-form-wrap {
      padding-inline: 14px;
    }
  }
</style>
