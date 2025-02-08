import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "js/[name].js",
        chunkFileNames: "js/[name].js",
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split(".").pop(); // Получаем расширение файла
          if (ext === "css") return "css/[name].[ext]"; // CSS → css/
          if (ext === "png") return "png/[name].[ext]"; // PNG → png/
          return "assets/[name].[ext]"; // Остальные файлы → assets/
        },
      },
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: fileURLToPath(
          new URL('./src/quasar-variables.sass', import.meta.url)
      )
    })
  ]
})