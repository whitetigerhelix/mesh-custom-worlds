import { useState } from 'react';
import './App.css';

function App() {
  const [mood, setMood] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [moodBoard, setMoodBoard] = useState('');

  const handleMoodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMood(event.target.value);
  };

  // Generate mood board and playlist, and update state with the results
  const generateMoodBoard = async (e) => {
    console.log("Generating mood board...");
    e.preventDefault();

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      }
      console.log("Request options:", requestOptions);

      const response = await fetch('http://localhost:5000/api/generate_playlist_for_mood', requestOptions);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      setPlaylist(data.playlist.map((song: { artist: string, title: string }) => `${song.title} by ${song.artist}`));
      setMoodBoard(`http://localhost:5000/images/${data.moodBoard}`);
    } catch (error) {
      console.error("Error generating mood board:", error);
    }
  };

  return (
    <div className="app">

      <h1>Music Mood Board</h1>

      {/* Mood selection */}
      <div className="mood-selection">
        <label htmlFor="mood">Choose a mood:</label>

        <select id="mood" value={mood} onChange={handleMoodChange}>
          <option value="">Select a mood</option>
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="energetic">Energetic</option>
          <option value="calm">Calm</option>
        </select>

        <button type="button" onClick={generateMoodBoard}>Generate</button>
      </div>

      {/* Playlist */}
      <div className="playlist">
        <h2>Playlist</h2>
        
        <ul>
          {playlist.map((song, index) => (
            <li key={index}>{song}</li>
          ))}
        </ul>
      </div>

      {/* Mood Board */}
      <div className="mood-board">
        <h2>Mood Board</h2>
        {moodBoard && <img src={moodBoard} alt="Mood Board" />}
      </div>

    </div>
  );
}

export default App;