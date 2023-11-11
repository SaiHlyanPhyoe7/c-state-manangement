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
  const [players, setPlayers] = useState<any[]>([]);
  console.log("players", players);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [addPlayerModalIsOpen, setAddPlayerModalIsOpen] = useState(false);
  const [viewTeamDetailsModalIsOpen, setViewTeamDetailsModalIsOpen] =
    useState(false);

  const [name, setName] = useState("");
  const [playerCount, setPlayerCount] = useState(0);
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalIsOpen(false);
        setAddPlayerModalIsOpen(false);
        setViewTeamDetailsModalIsOpen(false);
      }
    };

    // Add event listener when component mounts
    document.addEventListener("keydown", handleEscKey);

    // Remove event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [modalIsOpen, addPlayerModalIsOpen, viewTeamDetailsModalIsOpen]);

  useEffect(() => {
    const storedTeams = localStorage.getItem("teams");
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    }
  }, []);

  useEffect(() => {
    if (teams.length > 0 && players.length > 0) {
      localStorage.setItem("teams", JSON.stringify(teams));
    }
  }, [teams, players]);

  useEffect(() => {
    const fetchPlayers = async () => {
      setPlayerFetchLoading(true);
      try {
        const response = await axios.get(
          `https://www.balldontlie.io/api/v1/players?per_page=50`
        );

        // Use the filterUniquePlayers function to get unique players from teams
        const uniquePlayers = filterUniquePlayers(teams, response.data.data);

        // Set the state players with the unique players
        setPlayers(uniquePlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setTimeout(() => {
          setPlayerFetchLoading(false);
        }, 1000);
      }
    };

    fetchPlayers();
  }, [teams]);

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

  const handleRemoveTeam = (team: Team) => {
    const updatedTeams = teams.filter((t) => t.id !== team.id);
    setTeams(updatedTeams);
    if (teams.length <= 1) {
      localStorage.removeItem("teams");
    }

    // Push the players of the removed team back to the players array
    team.players.forEach((player) => {
      setPlayers((prevPlayers) => [...prevPlayers, player]);
    });
  };

  const [clickedTeamDetails, setClickedTeamDetails] = useState<Team>();
  const handleViewTeam = (team: any) => {
    setClickedTeamDetails(team);
    setViewTeamDetailsModalIsOpen(true);
  };
  const [selectedAddPlayer, setSelectedAddPlayer] = useState<SelectedPlayer>();
  const handleAddPlayerToTeam = (player: any) => {
    setAddPlayerModalIsOpen(true);
    setSelectedAddPlayer(player);
  };

  const handleRemovePlayerFromTeam = (playerDetails: SelectedPlayer) => {
    setPlayers((prevPlayers) => [...prevPlayers, playerDetails]);

    // players.push(playerDetails);
    const updatedTeams = teams.map((team) => {
      if (team.id === clickedTeamDetails?.id) {
        // Remove the player from the team's players array
        const updatedPlayers = team.players.filter(
          (player) => player.id !== playerDetails.id
        );

        // Update the team with the new players array
        const updatedTeam = {
          ...team,
          players: updatedPlayers,
          playerCount: updatedPlayers.length, // Update the playerCount as well
        };

        // Update the clickedTeamDetails state
        setClickedTeamDetails(updatedTeam);

        return updatedTeam;
      }
      return team;
    });

    // Update the state with the modified teams array
    setTeams(updatedTeams);
  };

  const handleAddPlayerToSelectedTeam = (team: Team) => {
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

  const [playerFetchLoading, setPlayerFetchLoading] = useState(false);
  const filterUniquePlayers = (teams: Team[], allPlayers: any[]): any[] => {
    // Create a set to store unique player IDs
    const uniquePlayerIds = new Set<string>();

    // Iterate through each team
    teams.forEach((team) => {
      // Iterate through each player in the team
      team.players.forEach((player) => {
        // Add the player's ID to the set
        uniquePlayerIds.add(player.id);
      });
    });

    // Filter the allPlayers array to keep only those players whose IDs are not in the set
    const uniquePlayers = allPlayers.filter(
      (player) => !uniquePlayerIds.has(player.id)
    );

    return uniquePlayers;
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
              {teams.length > 0 ? (
                teams.map((team) => (
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
                ))
              ) : (
                <p className="text-red-400 text-sm">
                  Please Create Team First to add player.
                </p>
              )}
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

      {viewTeamDetailsModalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white max-h-[500px] max-w-[100%] overflow-scroll p-4 rounded w-11/12 lg:w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Team Details</h2>
            <ul>
              {clickedTeamDetails !== undefined ? (
                <div key={clickedTeamDetails?.id}>
                  <div className="flex justify-between items-center">
                    <p>Country : </p>
                    <p>{clickedTeamDetails?.country || "null"}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Name : </p>
                    <p>{clickedTeamDetails?.name || "null"}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Id : </p>
                    <p>{clickedTeamDetails?.id || "null"}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Player Count : </p>
                    <p>{clickedTeamDetails?.playerCount || "null"}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Region : </p>
                    <p>{clickedTeamDetails?.region || "null"}</p>
                  </div>

                  <div className="grid grid-cols-1">
                    {clickedTeamDetails.players.length > 0 && (
                      <table className="w-full mt-4 border-collapse border border-gray-300">
                        <thead>
                          <tr className="">
                            <th className="p-2 border border-gray-300">
                              Player Name
                            </th>
                            <th className="p-2 border border-gray-300">
                              Player Height Feet
                            </th>
                            <th className="p-2 border border-gray-300">
                              Player Position
                            </th>
                            <th className="p-2 border border-gray-300">
                              Player Height Inches
                            </th>
                            <th className="p-2 border border-gray-300">
                              Remove
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {clickedTeamDetails.players.map(
                            (playerDetails: SelectedPlayer, index: number) => (
                              <tr
                                key={playerDetails.id}
                                className={index % 2 === 0 ? "bg-gray-100" : ""}
                              >
                                <td className="p-2 border border-gray-300">
                                  {playerDetails.first_name || "null"}{" "}
                                  {playerDetails.last_name || "null"}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {playerDetails.height_feet || "null"}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {playerDetails.position || "null"}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {playerDetails.height_inches || "null"}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  <button
                                    onClick={() =>
                                      handleRemovePlayerFromTeam(playerDetails)
                                    }
                                    className="text-sm text-center bg-red-500 text-white shadow-md rounded-md hover:bg-red-400 px-2 py-1"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ) : (
                <div>Please Create Team First</div>
              )}
            </ul>
            <button
              onClick={() => setViewTeamDetailsModalIsOpen(false)}
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
                  onClick={() => handleRemoveTeam(team)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleViewTeam(team)}
                  className="bg-indigo-500 mx-2 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded"
                >
                  Team Details
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
        {playerFetchLoading ? (
          <div className="flex items-center justify-center mt-40">
            <div className="animate-spin rounded-full h-40 w-40 border-t-8 border-b-8 border-gray-700"></div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-3">
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
        )}
      </div>
    </div>
  );
};

export default TeamFormation;
