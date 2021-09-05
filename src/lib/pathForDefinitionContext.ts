import { createContext, useContext } from "react";
import { PathForItemFn } from "types";

const context = createContext<PathForItemFn>(() => "");

export const Provider = context.Provider;

export const usePathForDefinition = () => useContext(context);
