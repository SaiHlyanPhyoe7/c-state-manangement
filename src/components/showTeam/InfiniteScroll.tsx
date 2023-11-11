"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

const InfiniteScroll = () => {
  const [players, setPlayers] = useState<any[]>([]); // Specify the type as any[]
  const [page, setPage] = useState<number>(1); // Specify the type as number
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Function to fetch players from the API
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://www.balldontlie.io/api/v1/players?per_page=10&page=${page}`
        );

        // Only replace the existing data when fetching the first set of players
        if (page === 1) {
          setPlayers(response.data.data);
        } else {
          // Concatenate the new data when loading more
          setPlayers((prevPlayers) => [...prevPlayers, ...response.data.data]);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [page]); // Fetch players whenever the page state changes

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div>
      <div className="flex justify-center items-center pb-6">
        <button
          onClick={handleLoadMore}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-100"></div>
            </div>
          ) : (
            "Load 10 More"
          )}
        </button>
      </div>
      <div className="max-w-[90%] mx-auto max-h-[700px] border border-red-400 rounded-md overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-indigo-500 font-semibold text-sm tracking-wider">
              <th scope="col" className="px-6 py-3 text-left uppercase">
                Player Name
              </th>
              <th scope="col" className="px-6 py-3 text-left uppercase">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left uppercase">
                Team
              </th>
              {/* Add more table headers as needed */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {player.first_name} {player.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {player.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {player.team.full_name}
                </td>
                {/* Add more table cells as needed */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InfiniteScroll;
