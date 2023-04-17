import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [videoId, setVideoId] = useState('');
  const [transcript, setTranscript] = useState('');

  const fetchTranscript = async () => {
    const apiUrl = `/api/transcript/${videoId}`;
    const response = await axios.get(apiUrl);
    setTranscript(response.data.transcript);
  };

  return (
    <div>
      <input
        type="text"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />
      <button onClick={fetchTranscript}>Get Transcript</button>
      <div>{transcript}</div>
    </div>
  );
}

export default App;
