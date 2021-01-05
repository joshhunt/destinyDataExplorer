import { createContext, useContext } from "react";

type ItemPathFunction = (type: string, obj: any) => string;

const context = createContext<ItemPathFunction>(() => "");

export const Provider = context.Provider;

export const usePathForDefinition = () => useContext(context);
