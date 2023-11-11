"use client";
import { login, logout } from "@/redux/feature/auth/loginSlice";
import { RootState } from "@/redux/store";
import { Box, Button, Flex, Text, Title } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";

const Navbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const username = useSelector((state: RootState) => state.auth.username);

  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    dispatch(login({ username: storedUsername }));
  }
  const forDesktop = useMediaQuery("(min-width: 36.25em)");

  return (
    <div className="container mx-auto py-4">
      {username && (
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center text-indigo-700">
            <p>Username :</p>
            <div className="flex justify-start items-center border border-emerald-400 rounded-md py-2 px-4 ml-2">
              <p>{username}</p>
            </div>
          </div>
          <button
            className="bg-red-600 text-white rounded-md px-4 py-2"
            onClick={() => {
              dispatch(logout());
              router.push("/login");
            }}
          >
            logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
