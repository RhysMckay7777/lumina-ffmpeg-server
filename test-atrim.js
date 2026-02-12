
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

const FFMPEG_SERVER = "http://127.0.0.1:3333";
const UPLOADS_DIR = "c:/Users/USER/Desktop/desktop/test/novel/novel/ffmpeg-playground/uploads";

async function testAudioTrim() {
  const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.mp3'));
  if (files.length === 0) {
    console.log("No MP3 files found in uploads to test with.");
    return;
  }

  const testFile = path.join(UPLOADS_DIR, files[0]);
  console.log(`Testing with: ${testFile}`);

  const form = new FormData();
  form.append('file', fs.createReadStream(testFile));
  form.append('start', '5.0');
  form.append('duration', '3.5');

  try {
    const response = await axios.post(`${FFMPEG_SERVER}/api/audio-trim`, form, {
      headers: {
        ...form.getHeaders()
      }
    });

    console.log("Trim Result:", response.data);
    
    // Check durations if probe is available on server
    console.log("Probing output file:", response.data.outputFile);
    // Use the agent probe which handles path based probing better
    const probeRes = await axios.post(`${FFMPEG_SERVER}/api/agent/probe`, { 
      filename: path.basename(response.data.outputFile)
    });
    console.log("Probe Result Duration:", probeRes.data.metadata.format.duration);
    
    if (Math.abs(probeRes.data.metadata.format.duration - 3.5) < 0.1) {
      console.log("SUCCESS: Audio trim is precise.");
    } else {
      console.log("FAILURE: Audio trim duration mismatch.");
    }

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testAudioTrim();
