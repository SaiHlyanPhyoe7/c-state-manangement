"use client";

import InfiniteScroll from "@/components/showTeam/InfiniteScroll";
import { RootState } from "@/redux/store";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const Page = () => {
  const username = useSelector((state: RootState) => state.auth.username);

  return <div className="pt-24">{username && <InfiniteScroll />}</div>;
};

export default Page;
