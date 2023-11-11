"use client";
import ShowTeamHome from "@/components/showTeam";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export default function Home() {
  const username = useSelector((state: RootState) => state.auth.username);

  return <div className="mt-20">{username && <ShowTeamHome />}</div>;
}
