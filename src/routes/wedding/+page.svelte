<script lang="ts">
  import WeddingInvitation from "$lib/WeddingInvitation.svelte";
  import WeddingAccessGate from "$lib/WeddingAccessGate.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<WeddingAccessGate {...data.weddingAccess}>
  <WeddingInvitation {data} canonicalPath="/wedding/" />
</WeddingAccessGate>
