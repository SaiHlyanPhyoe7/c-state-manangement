"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/redux/feature/auth/loginSlice";
import { useRouter } from "next/navigation";
import { Box, Loader } from "@mantine/core";
import { childrenProps } from "@/types";

export const AuthProvider = ({ children }: childrenProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername !== "") {
      dispatch(login({ username: storedUsername }));
    } else {
      router.push("/login");
    }
    setLoading(false);
  }, [dispatch, router]);

  if (loading) {
    return (
      <Box>
        <Loader />
      </Box>
    );
  }

  return <Box>{children}</Box>;
};
