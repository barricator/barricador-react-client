import { createContext } from "react";
import type { BarricatorStore } from "./store";

/** Internal context carrying the singleton {@link BarricatorStore}. */
export const BarricatorContext = createContext<BarricatorStore | null>(null);
