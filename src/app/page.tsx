"use client";

import { useState } from "react";

// Function to calculate combinations
const getCombinations = (arr: string[], size: number): string[][] => {
  if (size > arr.length) return [];
  if (size === arr.length) return [arr];
  if (size === 1) return arr.map((item) => [item]);

  let combinations: string[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const remaining = arr.slice(i + 1);
    const subCombos = getCombinations(remaining, size - 1);
    subCombos.forEach((combo) => combinations.push([arr[i], ...combo]));
  }
  return combinations;
};

const Home: React.FC = () => {
  const [totalPlayers, setTotalPlayers] = useState<number>(15);
  const [teamSize, setTeamSize] = useState<number>(11);
  const [captainCount, setCaptainCount] = useState<number>(1); // Number of captains (1-3)
  const [players, setPlayers] = useState<string[]>(Array(15).fill(""));
  const [captains, setCaptains] = useState<string[]>(Array(3).fill(""));
  const [teams, setTeams] = useState<
    { captain: string[]; players: string[] }[]
  >([]);
  const [error, setError] = useState<string>("");

  const handleInputChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleCaptainChange = (index: number, value: string) => {
    const newCaptains = [...captains];
    newCaptains[index] = value;
    setCaptains(newCaptains);
  };

  const handleGenerate = () => {
    const validPlayers = players.filter((player) => player.trim());
    const validCaptains = captains.filter((captain) => captain.trim());
    if (validPlayers.length !== totalPlayers) {
      setError(`Please fill out exactly ${totalPlayers} player names.`);
      return;
    }
    if (validCaptains.length < captainCount) {
      setError(`Please provide at least ${captainCount} captains.`);
      return;
    }
    if (teamSize < 11 || teamSize > totalPlayers) {
      setError(`Team size must be between 11 and ${totalPlayers}.`);
      return;
    }
    setError("");

    // Generate combinations for the selected number of captains
    const allTeams: { captain: string[]; players: string[] }[] = [];

    // Combination of captains
    const captainCombinations = getCombinations(validCaptains, captainCount);

    captainCombinations.forEach((captainCombo) => {
      const remainingPlayers = validPlayers.filter(
        (player) => !captainCombo.includes(player)
      );
      const combos = getCombinations(
        remainingPlayers,
        teamSize - captainCombo.length
      ); // Adjust size to account for captains

      combos.forEach((combo) =>
        allTeams.push({ captain: captainCombo, players: combo })
      );
    });

    setTeams(allTeams);
  };

  const downloadAsFile = () => {
    const fileContent = teams
      .map(
        (team) =>
          `Captains: ${team.captain.join(", ")}\nPlayers: ${team.players.join(
            ", "
          )}\n`
      )
      .join("\n");
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teams.txt";
    link.click();
  };

  return (
    <div className="container">
      <h1>Dynamic Team Combination Generator</h1>
      <p>
        Enter the total number of players, the number of captains (1-3), and the
        team size to generate combinations.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Total Players:
          <input
            type="number"
            value={totalPlayers}
            onChange={(e) => {
              const value = Math.max(11, parseInt(e.target.value) || 15);
              setTotalPlayers(value);
              setPlayers(Array(value).fill("")); // Adjust player inputs
            }}
            min="11"
            style={{ marginLeft: "10px", marginBottom: "10px", width: "50px" }}
          />
        </label>

        <label>
          Team Size:
          <input
            type="number"
            value={teamSize}
            onChange={(e) => {
              const value = Math.min(
                totalPlayers,
                Math.max(11, parseInt(e.target.value) || 11)
              );
              setTeamSize(value);
            }}
            min="11"
            max={totalPlayers}
            style={{ marginLeft: "10px", width: "50px" }}
          />
        </label>

        <label>
          Number of Captains (1-3):
          <input
            type="number"
            value={captainCount}
            onChange={(e) => {
              const value = Math.max(
                1,
                Math.min(3, parseInt(e.target.value) || 1)
              );
              setCaptainCount(value);
            }}
            min="1"
            max="3"
            style={{ marginLeft: "10px", width: "50px" }}
          />
        </label>
      </div>

      <h3>Enter Captains (1-3 required):</h3>
      {Array.from({ length: 3 }).map((_, index) => (
        <input
          key={`captain-${index}`}
          value={captains[index] || ""}
          placeholder={`Captain ${index + 1}`}
          onChange={(e) => handleCaptainChange(index, e.target.value)}
          style={{ marginBottom: "10px", width: "300px", display: "block" }}
        />
      ))}

      <h3>Enter Players:</h3>
      {Array.from({ length: totalPlayers }).map((_, index) => (
        <input
          key={`player-${index}`}
          value={players[index] || ""}
          placeholder={`Player ${index + 1}`}
          onChange={(e) => handleInputChange(index, e.target.value)}
          style={{ marginBottom: "10px", width: "300px", display: "block" }}
        />
      ))}

      <button onClick={handleGenerate} style={{ marginTop: "20px" }}>
        Generate Teams
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {teams.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Teams:</h2>
          <p>
            <strong>Total Teams:</strong> {teams.length}
          </p>
          <button onClick={downloadAsFile}>Download as File</button>
          <ul>
            {teams.map((team, idx) => (
              <li key={idx}>
                <strong>Captains:</strong> {team.captain.join(", ")} <br />
                <strong>Players:</strong> {team.players.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
