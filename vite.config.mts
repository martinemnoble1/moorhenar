import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import checker from 'vite-plugin-checker';
import pluginRewriteAll from 'vite-plugin-rewrite-all'; // <= import the plugin

export default defineConfig({
    plugins: [
        react(),
        wasm(),
        topLevelAwait(),
        crossOriginIsolation(),
        pluginRewriteAll(),
        checker({
            typescript: {
                root: './',
                tsconfigPath: 'tsconfig.json'
            }
        }),
        {
            name: "configure-response-headers",
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    next();
                });
            },
        },
    ],
    server: {
        port: 3000,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
        watch: {
            ignored: [
                '**/public/baby-gru/monomers/**',
                '**/public/baby-gru/wasm/**',
                '**/public/baby-gru/pixmaps/**',
                '**/public/baby-gru/tutorials/**'
            ]
        },
        proxy: {
            //Focus here
            '/api': {
                target: 'http://localhost:3337',
                changeOrigin: true,
            }
        }
    },
});