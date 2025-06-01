const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const HEYGEN_API_KEY = "ZTVlNTQ4YWU2MGFiNGQwZDhmNWFhNGU2ZTQ0NzMzYzMtMTc0NzQ4MTYxMA==";
const AVATAR_ID = "19225cfb89f64e58a664912a52268362";
const VOICE_ID = "35080bd3c9c14110b52a832b362e838f";

app.post("/generate", async (req, res) => {
  const { script_text } = req.body;

  try {
    const createRes = await axios.post(
      "https://api.heygen.com/v1/video",
      {
        script: script_text,
        avatar_id: AVATAR_ID,
        voice_id: VOICE_ID,
        output_format: "mp4",
        test: false
      },
      {
        headers: {
          Authorization: `Bearer ${HEYGEN_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const videoId = createRes.data.data.video_id;

    // Poll status
    let status = "pending";
    let videoUrl = "";

    while (status === "pending" || status === "processing") {
      await new Promise((r) => setTimeout(r, 5000)); // 5 sec wait

      const statusRes = await axios.get(
        `https://api.heygen.com/v1/video/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${HEYGEN_API_KEY}`
          }
        }
      );

      status = statusRes.data.data.status;
      if (status === "completed") {
        videoUrl = statusRes.data.data.video_url;
        break;
      } else if (status === "failed") {
        return res.status(500).json({ error: "Video generation failed" });
      }
    }

    return res.json({ video_url: videoUrl });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8000, () => {
  console.log("🚀 Server started on port 8000");
});
