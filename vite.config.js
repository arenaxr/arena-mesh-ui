import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'src/main.js'),
            name: 'arena-mesh-ui',
            // the proper extensions will be added
            fileName: 'arena-mesh-ui',
        },
        rollupOptions: {
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    aframe: 'AFRAME',
                    three: 'THREE',
                },
            },
        },
    },
});
