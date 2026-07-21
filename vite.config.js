import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  // Repository name is "wedding", so GitHub Pages serves the app under /wedding/.
  base: '/wedding/'
});
