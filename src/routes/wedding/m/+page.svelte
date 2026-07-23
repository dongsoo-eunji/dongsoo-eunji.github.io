<script lang="ts">
  import WeddingInvitation from "$lib/WeddingInvitation.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<WeddingInvitation {data} canonicalPath="/wedding/m/" />
