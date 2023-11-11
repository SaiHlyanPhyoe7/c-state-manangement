"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { z, ZodError } from "zod";

const TeamFormation: React.FC = () => {
  const TeamSchema = z.object({
    name: z.string().min(3, "Name must be at least 4 characters"),
    playerCount: z.number().int(),
    region: z.string(),
    country: z.string(),
  });

  interface Team {
    id: string;
    name: string;
    playerCount: number;
    region: string;
    country: string;
    players: any[];
  }

  interface SelectedPlayer {
    id: string;
    first_name: string;
    height_feet: number;
    height_inches: string;
    last_name: string;
    position: any[];
  }

  const [teams, setTeams] = useState<Team[]>([]);
  console.log("Teams ", teams);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [addPlayerModalIsOpen, setAddPlayerModalIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [playerCount, setPlayerCount] = useState(0);
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(
          `https://www.balldontlie.io/api/v1/players?per_page=50`
        );
        setPlayers(response.data.data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  const openModal = (team: Team | null = null) => {
    setCurrentTeam(team);
    setName(team?.name || "");
    setPlayerCount(team?.playerCount || 0);
    setRegion(team?.region || "");
    setCountry(team?.country || "");
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setCurrentTeam(null);
    setModalIsOpen(false);
  };

  const handleCreateUpdateTeam = () => {
    try {
      const validatedData = TeamSchema.parse({
        name,
        playerCount,
        region,
        country,
      });

      if (!currentTeam) {
        const newTeam: Team = {
          id: Date.now().toString(),
          ...validatedData,
          players: [],
        };

        if (teams.some((team) => team.name === newTeam.name)) {
          alert("Team name must be unique!");
          return;
        }

        setTeams((prevTeams) => [...prevTeams, newTeam]);
      } else {
        const updatedTeams = teams.map((team) =>
          team.id === currentTeam.id ? { ...team, ...validatedData } : team
        );

        setTeams(updatedTeams);
      }

      closeModal();
    } catch (error) {
      if (error instanceof ZodError) {
        alert(`Validation Error: ${error.errors}`);
      } else {
        console.error("Unexpected validation error:", error);
      }
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    const updatedTeams = teams.filter((team) => team.id !== teamId);
    setTeams(updatedTeams);
  };

  const [selectedAddPlayer, setSelectedAddPlayer] = useState<SelectedPlayer>();
  const handleAddPlayerToTeam = (player: any) => {
    setAddPlayerModalIsOpen(true);
    setSelectedAddPlayer(player);
    console.log("selectedAddPlayerId", selectedAddPlayer);
  };

  const handleRemovePlayerFromTeam = (playerId: string) => {
    if (currentTeam) {
      setCurrentTeam((prevTeam) => {
        if (prevTeam) {
          const updatedPlayers = prevTeam.players.filter(
            (player) => player.id !== playerId
          );
          return {
            ...prevTeam,
            playerCount: prevTeam.playerCount - 1,
            players: updatedPlayers,
          };
        }
        return null;
      });
    }
  };

  const handleAddPlayerToSelectedTeam = (team: Team) => {
    console.log("team is", team);
    // Find the player in the players list
    const selectedPlayer = players.find(
      (player) => player.id === selectedAddPlayer?.id
    );

    if (selectedPlayer) {
      // Remove the selected player from the players list
      const updatedPlayers = players.filter(
        (player) => player.id !== selectedPlayer.id
      );
      setPlayers(updatedPlayers);
      team.players.push(selectedAddPlayer);
      team.playerCount += 1;
    }

    // Remove the player from the players list and add them to the selected team
    setCurrentTeam((prevTeam) => {
      if (prevTeam) {
        return {
          ...prevTeam,
          playerCount: prevTeam.playerCount + 1,
          players: [...prevTeam.players, selectedPlayer],
        };
      }
      return null;
    });
    setAddPlayerModalIsOpen(false);
  };

  const handleAddPlayerModalClose = () => {
    setAddPlayerModalIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentTeam((prevTeam) =>
      prevTeam ? { ...prevTeam, [name]: value } : null
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Team Formation</h2>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create Team
      </button>
      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-4 rounded w-11/12 lg:w-1/2">
            <h2 className="text-2xl font-bold mb-4">
              {currentTeam ? "Update" : "Create"} Team
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Team Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Player Count:
                </label>
                <input
                  type="number"
                  name="playerCount"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(Number(e.target.value))}
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Region:
                </label>
                <input
                  type="text"
                  name="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Country:
                </label>
                <input
                  type="text"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="border p-2 w-full"
                />
              </div>
              <div className="flex justify-end gap-x-4">
                <button
                  className="bg-white text-black rounded-md border border-gray-700 hover:opacity-40 active:opacity-80 py-2 px-4 "
                  onClick={() => setModalIsOpen(false)}
                >
                  Close Modal
                </button>
                <button
                  type="button"
                  onClick={handleCreateUpdateTeam}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {currentTeam ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {addPlayerModalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-4 rounded w-11/12 lg:w-1/2">
            <h2 className="text-2xl font-bold mb-4">
              Select Team to Add Player
            </h2>
            <ul>
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="mb-2 flex justify-between items-center"
                >
                  <p>{team.name}</p>
                  <button
                    onClick={() => handleAddPlayerToSelectedTeam(team)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mx-2"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={handleAddPlayerModalClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Teams</h3>
        {teams.length > 0 ? (
          <ul className="">
            {teams.map((team) => (
              <li key={team.id} className="mb-2">
                {team.name} - {team.playerCount} players{" "}
                <button
                  onClick={() => openModal(team)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mx-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveTeam(team.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p className="text-red-500 text-sm">
              Please Create Team First Before Adding Player to the team.
            </p>
          </div>
        )}
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">Players</h3>
        <ul className="grid gco1 lg:grid-cols-3">
          {players.map((player) => (
            <li
              key={player.id}
              className="mb-2 flex justify-between items-center mx-4"
            >
              <p>
                {player.first_name} {player.last_name} - {player.position}{" "}
              </p>
              <button
                onClick={() => handleAddPlayerToTeam(player)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mx-2"
              >
                Add to Team
              </button>
            </li>
          ))}
        </ul>
      </div>
      {currentTeam && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">Current Team</h3>
          <p>{currentTeam.name}</p>
          <ul>
            {currentTeam.players.map((player) => (
              <li key={player.id} className="mb-2">
                <p>
                  {player.first_name} {player.last_name} - {player.position}{" "}
                </p>
                <button
                  onClick={() => handleRemovePlayerFromTeam(player.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mx-2"
                >
                  Remove from Team
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeamFormation;
