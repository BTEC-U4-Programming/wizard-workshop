import {defineConfig} from 'vite';
import {lessonHighlighting} from './scripts/lesson-highlighting.mjs';
export default defineConfig({plugins:[lessonHighlighting()],worker:{format:'es'},test:{include:['tests/**/*.test.js'],testTimeout:15000}});
