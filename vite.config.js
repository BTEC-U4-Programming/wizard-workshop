import {defineConfig} from 'vite';
import {lessonHighlighting} from './scripts/lesson-highlighting.mjs';

// GitHub Pages serves this project from a sub-path such as /wizard-workshop/.
// The deploy workflow sets PAGES_BASE_PATH (from actions/configure-pages) so
// built asset, worker and WASM URLs include that prefix. Locally the variable
// is unset, so dev, preview and the Playwright tests keep using '/'.
const pagesBasePath = process.env.PAGES_BASE_PATH;
const base = pagesBasePath ? `${pagesBasePath.replace(/\/+$/, '')}/` : '/';

export default defineConfig({
  base,
  plugins: [lessonHighlighting()],
  worker: {format: 'es'},
  test: {include: ['tests/**/*.test.js'], testTimeout: 15000},
});
