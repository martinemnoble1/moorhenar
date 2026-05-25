import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import checker from 'vite-plugin-checker';
import pluginRewriteAll from 'vite-plugin-rewrite-all'; // <= import the plugin
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
    plugins: [
        {
            name: "usdz-content-type",
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url && req.url.split('?')[0].endsWith('.usdz')) {
                        res.setHeader('Content-Type', 'model/vnd.usdz+zip');
                    }
                    next();
                });
            },
        },
        {
            name: "serve-root-html",
            configureServer(server) {
                server.middlewares.use((req, _res, next) => {
                    if (!req.url) return next();
                    const path = req.url.split('?')[0];
                    if (path === '/' || path === '/index.html') return next();
                    if (!path.endsWith('.html')) return next();
                    const file = resolve(__dirname, '.' + path);
                    if (!existsSync(file)) return next();
                    req.url = path;
                    server.transformIndexHtml(path, readFileSync(file, 'utf-8'))
                        .then(html => {
                            _res.setHeader('Content-Type', 'text/html');
                            _res.end(html);
                        })
                        .catch(next);
                });
            },
        },
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