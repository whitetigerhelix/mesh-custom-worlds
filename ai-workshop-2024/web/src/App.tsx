import { useState } from 'react';
import './App.css';

function App() {
  const [mood, setMood] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [moodBoard, setMoodBoard] = useState('');

  const handleMoodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMood(event.target.value);
  };

  const generateMoodBoard = async () => {
    // Placeholder for API call to generate playlist and mood board
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mood }),
    });
    const data = await response.json();
    setPlaylist(data.playlist);
    setMoodBoard(data.moodBoard);
  };

  return (
    <div className="app">
      <h1>Music Mood Board</h1>
      <div className="mood-selection">
        <label htmlFor="mood">Choose a mood:</label>
        <select id="mood" value={mood} onChange={handleMoodChange}>
          <option value="">Select a mood</option>
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="energetic">Energetic</option>
          <option value="calm">Calm</option>
        </select>
        <button onClick={generateMoodBoard}>Generate</button>
      </div>
      <div className="playlist">
        <h2>Playlist</h2>
        <ul>
          {playlist.map((song, index) => (
            <li key={index}>{song}</li>
          ))}
        </ul>
      </div>
      <div className="mood-board">
        <h2>Mood Board</h2>
        {moodBoard && <img src={moodBoard} alt="Mood Board" />}
      </div>
    </div>
  );
}

export default App;