const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash-lite";

const RECIPE_COVERS = [
  "linear-gradient(135deg, rgba(247,224,180,0.72) 0%, rgba(255,255,255,0.35) 45%, rgba(210,174,111,0.72) 100%), #efe7da",
  "linear-gradient(135deg, rgba(184,219,157,0.72) 0%, rgba(255,255,255,0.38) 42%, rgba(102,158,96,0.66) 100%), #e4eadc",
  "linear-gradient(135deg, rgba(234,126,92,0.68) 0%, rgba(255,255,255,0.34) 45%, rgba(176,68,52,0.6) 100%), #f1ded7",
  "linear-gradient(135deg, rgba(244,211,142,0.75) 0%, rgba(255,255,255,0.36) 48%, rgba(213,162,73,0.64) 100%), #eee2c8",
];

const PRACTICAL_RECIPE_TERMS = [
  "볶음",
  "볶음밥",
  "덮밥",
  "비빔밥",
  "죽",
  "국",
  "찌개",
  "탕",
  "조림",
  "찜",
  "구이",
  "전",
  "부침",
  "무침",
  "샐러드",
  "토스트",
  "샌드위치",
  "오믈렛",
  "파스타",
  "수프",
  "스프",
  "라면",
  "만두",
];

const ODD_RECIPE_TERMS = [
  "스무디",
  "주스",
  "음료",
  "칵테일",
  "아이스크림",
  "케이크",
  "쿠키",
  "잼",
  "퓨전",
  "실험",
  "분자",
  "디저트",
];

const BASIC_INGREDIENTS = [
  "밥",
  "물",
  "소금",
  "후추",
  "설탕",
  "식용유",
  "참기름",
  "간장",
  "고추장",
  "된장",
  "다진 마늘",
  "마늘",
  "깨",
  "식초",
  "버터",
  "밀가루",
];

function buildPrompt({ ingredients, prioritizeUrgent }) {
  const ingredientLines = ingredients
    .map((item) => {
      const dDay = item.daysLeft < 0 ? `expired ${Math.abs(item.daysLeft)} days ago` : `D-${item.daysLeft}`;
      return `- ${item.name} (${item.icon || ""}) / ${dDay} / zone: ${item.zoneKey}`;
    })
    .join("\n");

  return `
너는 1인 가구를 위한 냉장고 재료 기반 레시피 추천 AI야.
아래 냉장고 재료만 최대한 활용해서 한국어 레시피 4개를 만들어줘.

조건:
- 유통기한이 지난 재료는 사용하지 마.
- ${prioritizeUrgent ? "D-Day가 낮은 임박 재료를 우선 사용해." : "임박 재료 우선 조건은 약하게 반영해."}
- 냉장고에 없는 특수 재료를 필수 재료로 만들지 마. 소금, 후추, 식용유, 물, 간장 같은 기본 양념은 사용 가능해.
- 이상하거나 실험적인 조합은 만들지 마. 실제 자취생이 바로 먹을 만한 평범한 집밥 메뉴만 추천해.
- 메뉴 유형은 볶음, 볶음밥, 덮밥, 국, 찌개, 조림, 찜, 구이, 전, 무침, 샐러드, 토스트, 샌드위치, 오믈렛, 파스타, 수프 중에서 골라.
- 스무디, 주스, 디저트, 케이크, 아이스크림, 잼, 칵테일, 퓨전 요리는 만들지 마.
- 과일은 단독 요리 재료로 억지 사용하지 말고, 어울릴 때만 샐러드나 토스트의 보조 재료로 써.
- 요리명은 "두부 계란 볶음", "시금치 덮밥"처럼 자연스러운 실제 음식 이름으로 작성해.
- 응답은 JSON만 반환해. 마크다운 코드블록은 쓰지 마.
- recipes 배열 안에 정확히 4개의 레시피를 넣어.

냉장고 재료:
${ingredientLines || "- 사용 가능한 재료 없음"}

JSON 형식:
{
  "recipes": [
    {
      "name": "요리명",
      "time": "15분",
      "level": "쉬움",
      "servings": "1인분",
      "calories": "350kcal",
      "emoji": "🍳",
      "summary": "한 문장 설명",
      "ingredients": ["두부 (D-3)", "계란 (D-8)"],
      "detailIngredients": [
        { "name": "두부", "amount": "1/2모", "status": "냉장고 보유", "required": true }
      ],
      "steps": ["조리 단계 1", "조리 단계 2", "조리 단계 3"],
      "tips": ["팁 1", "팁 2"],
      "nutrition": [
        { "label": "단백질", "value": "20g" },
        { "label": "탄수화물", "value": "45g" },
        { "label": "지방", "value": "12g" }
      ],
      "fridgeMatches": ["두부", "계란"]
    }
  ]
}
`.trim();
}

function extractResponseText(data) {
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim() || "";
}

function parseJsonText(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI 응답을 JSON으로 해석할 수 없습니다.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function isAvailableIngredient(name, availableIngredientNames) {
  return availableIngredientNames.some((availableName) => name.includes(availableName) || availableName.includes(name));
}

function normalizeRecipe(recipe, index, availableIngredientNames) {
  const detailIngredients = ensureArray(recipe.detailIngredients).map((ingredient) => ({
    name: ingredient.name || "재료",
    amount: ingredient.amount || "적당량",
    status:
      ingredient.status ||
      (isAvailableIngredient(ingredient.name || "", availableIngredientNames) ? "냉장고 보유" : "기본 양념 또는 선택 재료"),
    required:
      Boolean(ingredient.required) &&
      (isAvailableIngredient(ingredient.name || "", availableIngredientNames) || BASIC_INGREDIENTS.includes(ingredient.name)),
  }));
  const fallbackIngredients = detailIngredients.map((ingredient) => ingredient.name).filter(Boolean);
  const fallbackMatches = fallbackIngredients.slice(0, 6);

  return {
    id: `ai-recipe-${Date.now()}-${index}`,
    name: recipe.name || `AI 추천 레시피 ${index + 1}`,
    time: recipe.time || "15분",
    level: recipe.level || "쉬움",
    servings: recipe.servings || "1인분",
    calories: recipe.calories || "정보 없음",
    emoji: recipe.emoji || "🍽️",
    summary: recipe.summary || "냉장고 재료를 활용한 맞춤형 레시피입니다.",
    cover: RECIPE_COVERS[index % RECIPE_COVERS.length],
    ingredients: ensureArray(recipe.ingredients).length > 0 ? ensureArray(recipe.ingredients).slice(0, 5) : fallbackIngredients,
    detailIngredients,
    steps: ensureArray(recipe.steps).slice(0, 6),
    tips: ensureArray(recipe.tips).length > 0 ? ensureArray(recipe.tips).slice(0, 3) : ["가지고 있는 재료를 먼저 사용하면 음식물 쓰레기를 줄일 수 있어요."],
    nutrition:
      ensureArray(recipe.nutrition).length > 0
        ? ensureArray(recipe.nutrition).slice(0, 3)
        : [
            { label: "단백질", value: "확인 필요" },
            { label: "탄수화물", value: "확인 필요" },
            { label: "지방", value: "확인 필요" },
          ],
    fridgeMatches: ensureArray(recipe.fridgeMatches).length > 0 ? ensureArray(recipe.fridgeMatches).slice(0, 6) : fallbackMatches,
  };
}

function isPracticalRecipe(recipe, availableIngredientNames) {
  const recipeText = [recipe.name, recipe.summary, ...recipe.ingredients, ...recipe.fridgeMatches].join(" ");
  const hasOddTerm = ODD_RECIPE_TERMS.some((term) => recipeText.includes(term));
  const hasPracticalTerm = PRACTICAL_RECIPE_TERMS.some((term) => recipe.name.includes(term));
  const usesFridgeIngredient = availableIngredientNames.some((name) => recipeText.includes(name));

  return !hasOddTerm && hasPracticalTerm && usesFridgeIngredient;
}

export async function generateRecipes({ ingredients, prioritizeUrgent }) {
  if (!GEMINI_API_KEY) {
    throw new Error(".env.local에 VITE_GEMINI_API_KEY를 설정해 주세요.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt({ ingredients, prioritizeUrgent }) }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const apiMessage = errorPayload?.error?.message;
    throw new Error(apiMessage || "Gemini API 요청에 실패했습니다. API 키와 무료 사용 한도를 확인해 주세요.");
  }

  const data = await response.json();
  const parsed = parseJsonText(extractResponseText(data));
  const availableIngredientNames = ingredients
    .filter((ingredient) => ingredient.daysLeft >= 0)
    .map((ingredient) => ingredient.name);
  const recipes = ensureArray(parsed.recipes)
    .map((recipe, index) => normalizeRecipe(recipe, index, availableIngredientNames))
    .filter((recipe) => recipe.steps.length > 0 && isPracticalRecipe(recipe, availableIngredientNames));

  if (recipes.length === 0) {
    throw new Error("추천할 수 있는 레시피를 받지 못했습니다.");
  }

  return recipes;
}
