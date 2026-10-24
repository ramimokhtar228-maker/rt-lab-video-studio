import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { generateSpeechAudio, polishAnnouncementScript } from './src/server/geminiApi';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/gemini/')) {
          return next();
        }

        const parseBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.url === '/api/gemini/tts' && req.method === 'POST') {
            const body = await parseBody();
            const text = body.text || '';
            const voiceName = body.voiceName || 'Kore';

            if (!text.trim()) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Text is required for TTS' }));
              return;
            }

            const result = await generateSpeechAudio(text, voiceName);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/gemini/polish-script' && req.method === 'POST') {
            const body = await parseBody();
            const result = await polishAnnouncementScript(body.topic || '', body.duration || 30);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (error: any) {
          console.error('API Error:', error);
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error: error?.message || 'Server error occurred',
              fallbackAvailable: true,
            })
          );
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
