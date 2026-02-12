import app from './src/app.js';
import config from './src/config/storage.js';

const server = app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`
  🎬 FFmpeg Playground Server running! (MODULAR V2)
  
  Local Address: http://127.0.0.1:${config.PORT}
  Network: http://0.0.0.0:${config.PORT}
  
  Make sure FFmpeg is installed:
  - Windows: choco install ffmpeg  OR  download from https://ffmpeg.org/download.html
  - Mac: brew install ffmpeg
  - Linux: sudo apt install ffmpeg
  `);
});

// Set server timeout to 10 minutes (600,000ms) for long-running FFmpeg tasks
server.timeout = 600000;
