import { createContext } from "react";
import type { BarricadorStore } from "./store";

/** Internal context carrying the singleton {@link BarricadorStore}. */
export const BarricadorContext = createContext<BarricadorStore | null>(null);
