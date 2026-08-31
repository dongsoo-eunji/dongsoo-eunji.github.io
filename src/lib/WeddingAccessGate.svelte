<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { hashWeddingPassword, isWeddingLocked } from "$lib/wedding-access";

  let {
    lockAt,
    passwordSalt,
    passwordHash,
    passwordIterations,
    children,
  }: {
    lockAt: number;
    passwordSalt: string;
    passwordHash: string;
    passwordIterations: number;
    children: Snippet;
  } = $props();

  const sessionKey = "wedding-invitation-access";
  let hydrated = $state(false);
  let unlocked = $state(false);
  let password = $state("");
  let errorMessage = $state("");
  let checking = $state(false);
  let lockTimer: ReturnType<typeof setTimeout> | undefined;

  function hasSessionAccess(): boolean {
    return sessionStorage.getItem(sessionKey) === passwordHash;
  }

  function scheduleLockCheck(): void {
    if (lockTimer) clearTimeout(lockTimer);
    const remaining = lockAt - Date.now();
    if (remaining <= 0) {
      unlocked = hasSessionAccess();
      return;
    }
    unlocked = true;
    lockTimer = setTimeout(scheduleLockCheck, Math.min(remaining, 2_147_000_000));
  }

  onMount(() => {
    if (isWeddingLocked(Date.now(), lockAt)) unlocked = hasSessionAccess();
    else scheduleLockCheck();
    hydrated = true;
    return () => {
      if (lockTimer) clearTimeout(lockTimer);
    };
  });

  async function unlock(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (checking) return;
    checking = true;
    errorMessage = "";
    try {
      if ((await hashWeddingPassword(password, passwordSalt, passwordIterations)) !== passwordHash) {
        errorMessage = "비밀번호를 다시 확인해 주세요.";
        return;
      }
      sessionStorage.setItem(sessionKey, passwordHash);
      unlocked = true;
      password = "";
    } catch {
      errorMessage = "비밀번호를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    } finally {
      checking = false;
    }
  }
</script>

<div class:invitation-pending={!hydrated || !unlocked} aria-hidden={!hydrated || !unlocked} inert={!hydrated || !unlocked}>
  {@render children()}
</div>

{#if hydrated && !unlocked}
  <main class="access-gate">
    <section aria-labelledby="access-title">
      <p class="eyebrow">PRIVATE INVITATION</p>
      <h1 id="access-title">초대장이 잠겨 있습니다</h1>
      <p class="description">비밀번호를 입력하시면 초대장을 다시 보실 수 있습니다.</p>
      <form onsubmit={unlock}>
        <label for="wedding-access-password">비밀번호</label>
        <input
          id="wedding-access-password"
          bind:value={password}
          type="password"
          autocomplete="current-password"
          required
          disabled={checking}
        />
        <button type="submit" disabled={checking || password.length === 0}>
          {checking ? "확인 중" : "초대장 보기"}
        </button>
      </form>
      <p class="error" aria-live="polite">{errorMessage}</p>
    </section>
  </main>
{/if}

<style>
  .invitation-pending {
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }

  .access-gate {
    display: grid;
    min-height: 100svh;
    padding: 28px;
    place-items: center;
    background: #f4eee8;
    color: #4f443d;
    font-family: Pretendard, sans-serif;
  }

  .access-gate section {
    width: min(100%, 380px);
    padding: 38px 28px 30px;
    border: 1px solid #dfd2c7;
    border-radius: 18px;
    background: #fffdf9;
    box-shadow: 0 16px 44px rgb(77 58 43 / 10%);
    text-align: center;
  }

  .eyebrow {
    margin: 0 0 14px;
    color: #a0836e;
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .18em;
  }

  h1 {
    margin: 0;
    color: #55483f;
    font-family: "Gowun Batang", serif;
    font-size: 1.45rem;
    font-weight: 700;
  }

  .description {
    margin: 14px 0 26px;
    color: #81736a;
    font-size: .84rem;
    line-height: 1.7;
  }

  form {
    display: grid;
    gap: 10px;
    text-align: left;
  }

  label {
    color: #685950;
    font-size: .78rem;
    font-weight: 700;
  }

  input {
    width: 100%;
    min-height: 48px;
    border: 1px solid #d5c6ba;
    border-radius: 10px;
    padding: 10px 12px;
    background: white;
    color: #352f2a;
    font: inherit;
  }

  input:focus-visible,
  button:focus-visible {
    outline: 2px solid #806854;
    outline-offset: 3px;
  }

  button {
    min-height: 48px;
    margin-top: 5px;
    border: 0;
    border-radius: 999px;
    background: #a98770;
    color: white;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
  }

  button:disabled {
    cursor: wait;
    opacity: .55;
  }

  .error {
    min-height: 1.5em;
    margin: 12px 0 0;
    color: #a24e4a;
    font-size: .76rem;
    line-height: 1.5;
  }
</style>
