<script lang="ts">
  import { onMount } from "svelte";
  import { shiftAccountDigits } from "$lib/account-shift";

  type Props = {
    owner: string;
    bank: string;
    shiftedAccount: string;
    onstatus: (message: string) => void;
  };

  let { owner, bank, shiftedAccount, onstatus }: Props = $props();
  let account = $state("");

  onMount(() => {
    account = shiftAccountDigits(shiftedAccount);
  });

  async function copyAccount(): Promise<void> {
    if (!account) return;

    try {
      await navigator.clipboard.writeText(shiftAccountDigits(shiftedAccount));
      onstatus("복사되었습니다.");
    } catch {
      onstatus("길게 눌러 직접 복사해 주세요.");
    }
  }
</script>

<div class="account-card">
  <div>
    <span>{owner}</span>
    <code aria-busy={!account}>
      {account ? `${bank} ${account}` : `${bank} 계좌번호 준비 중`}
    </code>
  </div>
  <button type="button" disabled={!account} onclick={copyAccount}>복사</button>
</div>
