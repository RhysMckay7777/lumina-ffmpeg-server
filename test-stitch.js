import axios from 'axios';

const FFMPEG_SERVER = "http://127.0.0.1:3333";

// Replace these with actual URLs from your Supabase if possible, 
// or use these dummy ones for testing connectivity.
const sceneUrls = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
];

async function testStitch() {
  console.log("Triggering test stitch...");
  try {
    const response = await axios.post(`${FFMPEG_SERVER}/api/project/stitch`, {
      sceneUrls,
      transition: "crossfade",
      duration: 0.8
    }, {
      timeout: 600000 // 10 minutes
    });
    console.log("Success!", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Server Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network Error (No response):", error.message);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testStitch();
