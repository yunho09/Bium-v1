/*
 * 냉장고 상태를 관리하는 전역 스토어다.
 * 식재료 이동, 프리셋 수정, 커스텀 재료 추가를 한곳에서 처리한다.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_FOOD_PRESETS } from "./fridgePresets";

export const CONTAINER_IDS = ["shoppingBag", "leftDoor", "rightDoor", "pantry", "fridge", "freezer"];

function addDays(baseDate, days) {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDateAfter(daysFromToday) {
  return addDays(new Date(), Number(daysFromToday)).toISOString().slice(0, 10);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeFoodFromPreset(preset, zoneKey = "shoppingBag") {
  return {
    id: makeId("food"),
    name: preset.name,
    icon: preset.icon,
    zoneKey,
    expiresAt: getDateAfter(preset.shelfLifeDays),
  };
}

function makeFood(preset, daysFromToday, zoneKey = "shoppingBag") {
  return {
    id: makeId("food"),
    name: preset.name,
    icon: preset.icon,
    zoneKey,
    expiresAt: getDateAfter(daysFromToday),
  };
}

function presetById(id) {
  return DEFAULT_FOOD_PRESETS.find((preset) => preset.id === id);
}

const initialZones = {
  shoppingBag: [
    makeFood(presetById("milk"), 2),
    makeFood(presetById("bread"), 1),
    makeFood(presetById("tofu"), 3),
    makeFood(presetById("egg"), 8),
    makeFood(presetById("banana"), -1),
    makeFood(presetById("bean-sprout"), 2),
    makeFood(presetById("sausage"), 6),
    makeFood(presetById("rice"), 1),
  ],
  pantry: [
    makeFood(presetById("onion"), 12, "pantry"),
    makeFood(presetById("potato"), 18, "pantry"),
    makeFood(presetById("sweet-potato"), 14, "pantry"),
    makeFood(presetById("canned-tuna"), 120, "pantry"),
    makeFood(presetById("noodle"), 24, "pantry"),
    makeFood(presetById("garlic"), 18, "pantry"),
  ],
  fridge: [
    makeFood(presetById("spinach"), 2, "fridge"),
    makeFood(presetById("tofu"), 3, "fridge"),
    makeFood(presetById("kimchi"), 21, "fridge"),
    makeFood(presetById("carrot"), 13, "fridge"),
    makeFood(presetById("zucchini"), 4, "fridge"),
    makeFood(presetById("mushroom"), 3, "fridge"),
    makeFood(presetById("green-onion"), 5, "fridge"),
    makeFood(presetById("cheese"), 11, "fridge"),
  ],
  freezer: [
    makeFood(presetById("dumpling"), 26, "freezer"),
    makeFood(presetById("shrimp"), 20, "freezer"),
    makeFood(presetById("mackerel"), 28, "freezer"),
    makeFood(presetById("chicken"), 18, "freezer"),
  ],
  leftDoor: [
    makeFood(presetById("yogurt"), 6, "leftDoor"),
    makeFood(presetById("butter"), 22, "leftDoor"),
    makeFood(presetById("strawberry"), 2, "leftDoor"),
  ],
  rightDoor: [
    makeFood(presetById("milk"), 5, "rightDoor"),
    makeFood(presetById("orange"), 10, "rightDoor"),
    makeFood(presetById("apple"), 9, "rightDoor"),
  ],
};

function mergePresets(savedPresets = []) {
  const savedById = new Map(savedPresets.map((preset) => [preset.id, preset]));
  const mergedDefaults = DEFAULT_FOOD_PRESETS.map((preset) => savedById.get(preset.id) || preset);
  const customPresets = savedPresets.filter((preset) => preset.custom && !DEFAULT_FOOD_PRESETS.some((item) => item.id === preset.id));

  return [...mergedDefaults, ...customPresets];
}

export const useFridgeStore = create(
  persist((set, get) => ({
    zones: initialZones,
    presets: DEFAULT_FOOD_PRESETS,

    setZones: (updater) => {
      set((state) => ({
        zones: typeof updater === "function" ? updater(state.zones) : updater,
      }));
    },

    saveFood: (foodInput) => {
      const nextFood = {
        id: foodInput.id || makeId("food"),
        name: foodInput.name,
        icon: foodInput.icon,
        expiresAt: foodInput.expiresAt,
        zoneKey: foodInput.zoneKey || "shoppingBag",
      };

      set((state) => {
        // 같은 id의 항목은 먼저 모두 제거한 뒤, 저장할 구역에 다시 넣는다.
        const cleaned = CONTAINER_IDS.reduce((acc, key) => {
          acc[key] = state.zones[key].filter((item) => item.id !== nextFood.id);
          return acc;
        }, {});

        cleaned[nextFood.zoneKey] = [...cleaned[nextFood.zoneKey], nextFood];
        return { zones: cleaned };
      });
    },

    removeFood: (foodId) => {
      set((state) => ({
        zones: CONTAINER_IDS.reduce((acc, key) => {
          acc[key] = state.zones[key].filter((item) => item.id !== foodId);
          return acc;
        }, {}),
      }));
    },

    updateFoodExpiresAt: (foodId, expiresAt) => {
      set((state) => ({
        zones: CONTAINER_IDS.reduce((acc, key) => {
          acc[key] = state.zones[key].map((item) => (item.id === foodId ? { ...item, expiresAt } : item));
          return acc;
        }, {}),
      }));
    },

    addCustomPreset: ({ name, icon, shelfLifeDays, category = "etc" }) => {
      const customPreset = {
        id: makeId("preset"),
        name,
        icon,
        shelfLifeDays: Number(shelfLifeDays),
        category,
        custom: true,
      };

      set((state) => ({
        presets: [...state.presets, customPreset],
      }));

      return customPreset;
    },

    updatePresetShelfLife: (presetId, shelfLifeDays) => {
      set((state) => ({
        presets: state.presets.map((preset) =>
          preset.id === presetId ? { ...preset, shelfLifeDays: Number(shelfLifeDays) } : preset,
        ),
      }));
    },

    updatePresetDetails: (presetId, presetInput) => {
      set((state) => ({
        presets: state.presets.map((preset) =>
          preset.id === presetId
            ? {
                ...preset,
                name: presetInput.name,
                icon: presetInput.icon,
                shelfLifeDays: Number(presetInput.shelfLifeDays),
              }
            : preset,
        ),
      }));
    },

    addPresetToShoppingBag: (presetId) => {
      const preset = get().presets.find((item) => item.id === presetId);
      if (!preset) return;

      // 도감에서 선택한 프리셋은 쇼핑백에 새 식재료로 생성된다.
      const nextFood = makeFoodFromPreset(preset, "shoppingBag");

      set((state) => ({
        zones: {
          ...state.zones,
          shoppingBag: [...state.zones.shoppingBag, nextFood],
        },
      }));
    },
  }), {
    name: "bium-fridge-store",
    partialize: (state) => ({
      zones: state.zones,
      presets: state.presets,
    }),
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState,
      presets: mergePresets(persistedState?.presets),
    }),
  }),
);
