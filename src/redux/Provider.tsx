"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ReactQueryProvider } from "@/app/ReactQueryProvider";
import { AuthProvider } from "@/app/AuthProvider";
import { childrenProps } from "@/types";
import Navbar from "@/components/navbar";

export function Providers({ children }: childrenProps) {
  return (
    <ReactQueryProvider>
      <Provider store={store}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </Provider>
    </ReactQueryProvider>
  );
}
