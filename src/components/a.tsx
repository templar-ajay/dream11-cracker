"use client";

import { useState } from "react";

// Function to calculate combinations
const getCombinations = (arr: string[], size: number): string[][] => {
  if (size > arr.length) return [];
  if (size === arr.length) return [arr];
  if (size === 1) return arr.map((item) => [item]);

  const combinations: string[][] = [];
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
  const [captains, setCaptains] = useState<string[]>(Array(4).fill(""));
  const [preferredPlayers, setPreferredPlayers] = useState<string[]>(
    Array(10).fill("")
  );
  const [players, setPlayers] = useState<string[]>(Array(15).fill(""));
  const [teams, setTeams] = useState<
    { captains: string[]; players: string[] }[]
  >([]);
  const [error, setError] = useState<string>("");

  const handleInputChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleCaptainsChange = (index: number, value: string) => {
    const newCaptains = [...captains];
    newCaptains[index] = value;
    setCaptains(newCaptains.filter((c) => c.trim())); // Remove empty strings
  };

  const handlePreferredChange = (index: number, value: string) => {
    const newPreferred = [...preferredPlayers];
    newPreferred[index] = value;
    setPreferredPlayers(newPreferred.filter((p) => p.trim())); // Remove empty strings
  };

  const handleGenerate = () => {
    const validPlayers = players.filter((player) => player.trim());
    const validCaptains = captains.filter((captain) => captain.trim());
    const validPreferred = preferredPlayers.filter((preferred) =>
      preferred.trim()
    );

    if (validPlayers.length !== totalPlayers) {
      setError(`Please fill out exactly ${totalPlayers} player names.`);
      return;
    }
    if (validCaptains.length > teamSize) {
      setError(
        `The number of captains cannot exceed the team size (${teamSize}).`
      );
      return;
    }
    if (validPreferred.length + validCaptains.length > teamSize) {
      setError(
        `The combined number of captains and preferred players cannot exceed the team size (${teamSize}).`
      );
      return;
    }
    setError("");

    // Generate teams
    const guaranteedPlayers = [...validCaptains, ...validPreferred];
    const remainingPlayers = validPlayers.filter(
      (player) => !guaranteedPlayers.includes(player)
    );
    const combos = getCombinations(
      remainingPlayers,
      teamSize - guaranteedPlayers.length
    );

    const allTeams = combos.map((combo) => ({
      captains: validCaptains,
      players: [...validPreferred, ...combo],
    }));

    setTeams(allTeams);
  };

  const downloadAsFile = () => {
    const fileContent = teams
      .map(
        (team) =>
          `Captains: ${team.captains.join(", ")}\nPlayers: ${team.players.join(
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
        Enter the total number of players, captains (0-4), preferred players
        (0-10), and the team size to generate combinations.
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
      </div>

      <h3>Enter Captains (0-4):</h3>
      {Array.from({ length: 4 }).map((_, index) => (
        <input
          key={`captain-${index}`}
          value={captains[index] || ""}
          placeholder={`Captain ${index + 1}`}
          onChange={(e) => handleCaptainsChange(index, e.target.value)}
          style={{ marginBottom: "10px", width: "300px", display: "block" }}
        />
      ))}

      <h3>Enter Preferred Players (0-10):</h3>
      {Array.from({ length: 10 }).map((_, index) => (
        <input
          key={`preferred-${index}`}
          value={preferredPlayers[index] || ""}
          placeholder={`Preferred Player ${index + 1}`}
          onChange={(e) => handlePreferredChange(index, e.target.value)}
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
                <strong>Captains:</strong> {team.captains.join(", ")} <br />
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
