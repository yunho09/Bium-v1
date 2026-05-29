import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRecipeStore = create(
  persist(
    (set) => ({
      recipes: [],
      errorMessage: "",
      setRecipes: (recipes) => set({ recipes }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      clearRecipes: () => set({ recipes: [], errorMessage: "" }),
    }),
    {
      name: "bium-recipe-store",
      partialize: (state) => ({
        recipes: state.recipes,
        errorMessage: state.errorMessage,
      }),
    },
  ),
);
