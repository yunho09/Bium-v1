/*
 * 냉장고 상태를 관리하는 전역 스토어다.
 * 식재료 이동, 프리셋 수정, 커스텀 재료 추가를 한곳에서 처리한다.
 */
import { create } from "zustand";
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

const initialZones = {
  shoppingBag: [
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "milk"),
      2,
    ),
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "bread"),
      1,
    ),
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "tofu"),
      3,
    ),
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "egg"),
      8,
    ),
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "banana"),
      -1,
    ),
  ],
  pantry: [
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "onion"),
      12,
      "pantry",
    ),
  ],
  fridge: [
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "spinach"),
      2,
      "fridge",
    ),
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "tofu"),
      3,
      "fridge",
    ),
  ],
  freezer: [
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "dumpling"),
      26,
      "freezer",
    ),
  ],
  leftDoor: [
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "yogurt"),
      6,
      "leftDoor",
    ),
  ],
  rightDoor: [
    makeFood(
      DEFAULT_FOOD_PRESETS.find((preset) => preset.id === "milk"),
      5,
      "rightDoor",
    ),
  ],
};

export const useFridgeStore = create((set, get) => ({
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
}));
