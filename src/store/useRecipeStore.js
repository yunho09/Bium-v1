import { create } from "zustand";
import { persist } from "zustand/middleware";
import { recipeMockData } from "../components/Recipe/recipeMockData";

const STORE_VERSION = 2;

export const useRecipeStore = create(
  persist(
    (set) => ({
      recipes: recipeMockData,
      errorMessage: "",
      setRecipes: (recipes) => set({ recipes }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      clearRecipes: () => set({ recipes: recipeMockData, errorMessage: "" }),
    }),
    {
      name: "bium-recipe-store",
      version: STORE_VERSION,
      partialize: (state) => ({
        recipes: state.recipes,
        errorMessage: state.errorMessage,
      }),
      migrate: () => ({
        recipes: recipeMockData,
        errorMessage: "",
      }),
    },
  ),
);
