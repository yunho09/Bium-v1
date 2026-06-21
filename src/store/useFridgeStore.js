/*
 * 냉장고 상태를 관리하는 전역 스토어다.
 * 식재료 이동, 프리셋 수정, 커스텀 재료 추가를 한곳에서 처리한다.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_FOOD_PRESETS } from "./fridgePresets";

const STORE_VERSION = 4;
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
    makeFood(presetById("egg"), 9),
    makeFood(presetById("lettuce"), 4),
    makeFood(presetById("pork"), 3),
    makeFood(presetById("strawberry"), 2),
    makeFood(presetById("bread"), 1),
    makeFood(presetById("tofu"), 5),
  ],
  pantry: [
    makeFood(presetById("onion"), 16, "pantry"),
    makeFood(presetById("potato"), 35, "pantry"),
    makeFood(presetById("sweet-potato"), 22, "pantry"),
    makeFood(presetById("garlic"), 28, "pantry"),
    makeFood(presetById("canned-tuna"), 180, "pantry"),
    makeFood(presetById("ramen"), 90, "pantry"),
  ],
  fridge: [
    makeFood(presetById("salmon"), -1, "fridge"),
    makeFood(presetById("chicken"), 0, "fridge"),
    makeFood(presetById("spinach"), 1, "fridge"),
    makeFood(presetById("tofu"), 3, "fridge"),
    makeFood(presetById("tomato"), 4, "fridge"),
    makeFood(presetById("milk"), 5, "fridge"),
    makeFood(presetById("green-onion"), 7, "fridge"),
    makeFood(presetById("carrot"), 14, "fridge"),
    makeFood(presetById("kimchi"), 30, "fridge"),
  ],
  freezer: [
    makeFood(presetById("rice-cake"), 10, "freezer"),
    makeFood(presetById("mackerel"), 14, "freezer"),
    makeFood(presetById("shrimp"), 25, "freezer"),
    makeFood(presetById("dumpling"), 80, "freezer"),
  ],
  leftDoor: [
    makeFood(presetById("milk"), 5, "leftDoor"),
    makeFood(presetById("yogurt"), 8, "leftDoor"),
    makeFood(presetById("cheese"), 12, "leftDoor"),
    makeFood(presetById("butter"), 35, "leftDoor"),
  ],
  rightDoor: [
    makeFood(presetById("banana"), 2, "rightDoor"),
    makeFood(presetById("grape"), 6, "rightDoor"),
    makeFood(presetById("orange"), 10, "rightDoor"),
    makeFood(presetById("apple"), 21, "rightDoor"),
  ],
};

function mergePresets(savedPresets = [], { keepSavedDefaults = true, deletedPresetIds = [] } = {}) {
  const deletedIds = new Set(deletedPresetIds);
  const savedById = new Map(savedPresets.map((preset) => [preset.id, preset]));
  const mergedDefaults = DEFAULT_FOOD_PRESETS.filter((preset) => !deletedIds.has(preset.id)).map((preset) =>
    keepSavedDefaults ? savedById.get(preset.id) || preset : preset,
  );
  const customPresets = savedPresets.filter(
    (preset) => preset.custom && !deletedIds.has(preset.id) && !DEFAULT_FOOD_PRESETS.some((item) => item.id === preset.id),
  );

  return [...mergedDefaults, ...customPresets];
}

export const useFridgeStore = create(
  persist((set, get) => ({
    zones: initialZones,
    presets: DEFAULT_FOOD_PRESETS,
    deletedPresetIds: [],

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
        const currentZoneKey = CONTAINER_IDS.find((key) => state.zones[key].some((item) => item.id === nextFood.id));

        if (currentZoneKey === nextFood.zoneKey) {
          return {
            zones: {
              ...state.zones,
              [currentZoneKey]: state.zones[currentZoneKey].map((item) => (item.id === nextFood.id ? nextFood : item)),
            },
          };
        }

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

    removePreset: (presetId) => {
      set((state) => ({
        presets: state.presets.filter((preset) => preset.id !== presetId),
        deletedPresetIds: state.deletedPresetIds.includes(presetId)
          ? state.deletedPresetIds
          : [...state.deletedPresetIds, presetId],
      }));
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
    version: STORE_VERSION,
    partialize: (state) => ({
      zones: state.zones,
      presets: state.presets,
      deletedPresetIds: state.deletedPresetIds,
    }),
    migrate: (persistedState) => ({
      ...persistedState,
      zones: initialZones,
      deletedPresetIds: persistedState?.deletedPresetIds || [],
      presets: mergePresets(persistedState?.presets, {
        keepSavedDefaults: false,
        deletedPresetIds: persistedState?.deletedPresetIds || [],
      }),
    }),
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState,
      deletedPresetIds: persistedState?.deletedPresetIds || [],
      presets: mergePresets(persistedState?.presets, {
        deletedPresetIds: persistedState?.deletedPresetIds || [],
      }),
    }),
  }),
);
