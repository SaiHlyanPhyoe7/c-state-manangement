"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { z, ZodError } from "zod";
import { login } from "@/redux/feature/auth/loginSlice";

const schema = z.object({
  username: z.string().min(4, "Username must be at least 4 characters"),
});

interface CustomError {
  message: string;
  path: (string | number)[];
}

function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<CustomError | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleLogin = async () => {
    try {
      schema.parse({ username });
      dispatch(login({ username }));
      router.push("/");
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const firstError = validationError.errors[0];
        const customError: CustomError = {
          message: firstError.message,
          path: firstError.path,
        };
        setError(customError);
      }
    }
  };

  return (
    <div className="container flex justify-center items-center min-h-screen mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <label className="text-gray-700 text-sm" htmlFor="username">
          Username :
        </label>
        <br />
        <input
          id="username"
          ref={inputRef}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(null); // Clear the error when the user starts typing again
          }}
          placeholder="Username"
          className="border border-emerald-400 p-2 rounded-md"
        />
        <button
          className="bg-emerald-400 text-white px-4 py-2 ml-4 rounded-md"
          type="submit"
        >
          Login
        </button>
        {error && <p className="text-red-500 text-sm pt-2">{error.message}</p>}
      </form>
    </div>
  );
}

export default Page;
