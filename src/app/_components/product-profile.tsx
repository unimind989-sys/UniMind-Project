"use client";

import { createContext, useContext } from "react";

// The product shell can read a fixture identity without importing mock services.
export const ProductProfileContext = createContext<string | null>(null);
export function useProductProfileName() {
  return useContext(ProductProfileContext);
}
