"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ReactQueryProvider } from "@/app/ReactQueryProvider";
import { MantineProvider, createTheme } from "@mantine/core";
import { AuthProvider } from "@/app/AuthProvider";
import { Notifications } from "@mantine/notifications";
import { childrenProps } from "@/types";
import Navbar from "@/components/navbar";

const theme = createTheme({
  /** Put your mantine theme override here */
});

export function Providers({ children }: childrenProps) {
  return (
    <ReactQueryProvider>
      <Provider store={store}>
        <MantineProvider defaultColorScheme="light">
          <Notifications position="top-right" />
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </MantineProvider>
      </Provider>
    </ReactQueryProvider>
  );
}
