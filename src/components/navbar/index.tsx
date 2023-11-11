"use client";
import { login, logout } from "@/redux/feature/auth/loginSlice";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const router = useRouter();
  const username = useSelector((state: RootState) => state.auth.username);

  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    dispatch(login({ username: storedUsername }));
  }

  return (
    <>
      {username && (
        <div className="mx-auto py-4 fixed top-0 left-0 w-full bg-white shadow-md p-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center text-indigo-700 px-4 rounded-md border border-emerald-400">
              <p className="hidden lg:block">Username :</p>
              <div className="lg:flex hidden justify-start items-center py-2 ml-2">
                <p>{username}</p>
              </div>
            </div>
            <div className="flex justify-between items-center gap-x-3 text-indigo-700">
              <Link href="/infiniteScroll">
                <p
                  className={`cursor-pointer hover:underline hover:opacity-90 ${
                    pathname === "/infiniteScroll"
                      ? "text-indigo-700 underline opacity-100 duration-300"
                      : ""
                  }`}
                >
                  Infinite Scroll
                </p>
              </Link>
              <Link href="/">
                <p
                  className={`cursor-pointer hover:underline hover:opacity-90 ${
                    pathname === "/"
                      ? "text-indigo-700 underline opacity-100 duration-300"
                      : ""
                  }`}
                >
                  Team Formation
                </p>
              </Link>
            </div>
            <button
              className="bg-red-600 text-white hover:bg-red-500 hover:text-red-200 active:ring active:shadow active:shadow-red-500 rounded-md px-4 py-2"
              onClick={() => {
                router.push("/login");
                dispatch(logout());
              }}
            >
              logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
