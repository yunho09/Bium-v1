/*
 * 식재료 도감에서 사용하는 기본 프리셋 목록이다.
 * 카테고리와 기본 보관 기간의 기준 데이터 역할을 한다.
 */
export const DEFAULT_FOOD_PRESETS = [
  { id: "egg", name: "계란", icon: "🥚", shelfLifeDays: 21, category: "dairy" },
  { id: "milk", name: "우유", icon: "🥛", shelfLifeDays: 7, category: "dairy" },
  { id: "bread", name: "식빵", icon: "🍞", shelfLifeDays: 3, category: "etc" },
  { id: "tofu", name: "두부", icon: "🧊", shelfLifeDays: 5, category: "etc" },
  { id: "spinach", name: "시금치", icon: "🥬", shelfLifeDays: 4, category: "vegetable" },
  { id: "banana", name: "바나나", icon: "🍌", shelfLifeDays: 5, category: "fruit" },
  { id: "onion", name: "양파", icon: "🧅", shelfLifeDays: 20, category: "vegetable" },
  { id: "potato", name: "감자", icon: "🥔", shelfLifeDays: 30, category: "vegetable" },
  { id: "dumpling", name: "만두", icon: "🥟", shelfLifeDays: 90, category: "etc" },
  { id: "shrimp", name: "새우", icon: "🦐", shelfLifeDays: 30, category: "meat" },
  { id: "apple", name: "사과", icon: "🍎", shelfLifeDays: 14, category: "fruit" },
  { id: "chicken", name: "닭가슴살", icon: "🍗", shelfLifeDays: 3, category: "meat" },
  { id: "pork", name: "돼지고기", icon: "🥩", shelfLifeDays: 5, category: "meat" },
  { id: "green-onion", name: "대파", icon: "🥬", shelfLifeDays: 10, category: "vegetable" },
  { id: "tomato", name: "토마토", icon: "🍅", shelfLifeDays: 7, category: "vegetable" },
  { id: "cheese", name: "치즈", icon: "🧀", shelfLifeDays: 15, category: "dairy" },
  { id: "yogurt", name: "요거트", icon: "🥣", shelfLifeDays: 10, category: "dairy" },
  { id: "mushroom", name: "버섯", icon: "🍄", shelfLifeDays: 7, category: "vegetable" },
];
