"use client";

import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  increment,
  decrement,
  increaseByAmount,
} from "@/redux/feature/counter/counterSlice";
import Navbar from "@/components/navbar";

export default function Home() {
  const dispatch = useDispatch();

  const count = useSelector((state: RootState) => state.counter.value);

  return (
    <div>
      <Navbar />
      <div>HEllo</div>
    </div>
  );
}
