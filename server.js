const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: process.env });

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});




// Define a schema for the transcript collection
const transcriptSchema = new mongoose.Schema({
  videoId: String,
  transcript: String,
});

// Create a model for the transcript collection
const Transcript = mongoose.model('Transcript', transcriptSchema);

// Define an API endpoint for retrieving the transcript of a YouTube video
app.get('/api/transcript/:videoId', async (req, res) => {
  const { videoId } = req.params;

  // Check if the transcript for this video has already been cached in MongoDB
  const cachedTranscript = await Transcript.findOne({ videoId }).exec();
  if (cachedTranscript) {
    return res.json({ transcript: cachedTranscript.transcript });
  }

  // Retrieve the transcript using the OpenAI Whisper API
  const apiKey = process.env.OPENAI_API_KEY;
  const whisperApiUrl = 'https://api.openai.com/v1/whisper/summarize';
  const whisperApiParams = { video_id: videoId };
  const whisperApiHeaders = { Authorization: `Bearer ${apiKey}` };
  const whisperApiResponse = await axios.get(whisperApiUrl, {
    params: whisperApiParams,
    headers: whisperApiHeaders,
  });

  const transcript = whisperApiResponse.data.result.transcript;

  // Cache the transcript in MongoDB for future requests
  const newTranscript = new Transcript({ videoId, transcript });
  await newTranscript.save();

  res.json({ transcript });
});

// Serve the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) =>  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  );
}
// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
console.log(`Server started on port ${port}`);
});

