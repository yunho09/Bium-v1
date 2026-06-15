/*
 * 냉장고 재료를 바탕으로 레시피를 추천하는 화면이다.
 * 임박 재료 우선순위와 추천 카드 로딩 상태를 함께 관리한다.
 */
import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import RecipeCard from "./RecipeCard";
import RecipeDetailPage from "./RecipeDetailPage";
import SkeletonCard from "./SkeletonCard";
import { generateRecipes } from "../../api/generateRecipes";
import { useFridgeStore } from "../../store/useFridgeStore";
import { useRecipeStore } from "../../store/useRecipeStore";

function getDaysLeft(expiresAt) {
  const today = new Date();
  const target = new Date(expiresAt);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function RecipePage() {
  const zones = useFridgeStore((state) => state.zones);
  const recipes = useRecipeStore((state) => state.recipes);
  const errorMessage = useRecipeStore((state) => state.errorMessage);
  const setRecipes = useRecipeStore((state) => state.setRecipes);
  const setErrorMessage = useRecipeStore((state) => state.setErrorMessage);
  const [loading, setLoading] = useState(false);
  const [prioritizeUrgent, setPrioritizeUrgent] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const skeletonCount = useMemo(() => Array.from({ length: 4 }), []);
  const fridgeItems = useMemo(() => {
    return Object.entries(zones)
      .flatMap(([zoneKey, items]) => items.map((item) => ({ ...item, zoneKey, daysLeft: getDaysLeft(item.expiresAt) })))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [zones]);

  const urgentItems = useMemo(() => {
    return fridgeItems
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 5)
      .slice(0, 5);
  }, [fridgeItems]);

  const recipeIngredients = useMemo(() => {
    return fridgeItems.filter((item) => item.daysLeft >= 0);
  }, [fridgeItems]);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");
    setRecipes([]);
    setSelectedRecipe(null);

    try {
      const nextRecipes = await generateRecipes({
        ingredients: recipeIngredients,
        prioritizeUrgent,
      });
      setRecipes(nextRecipes);
    } catch (error) {
      setErrorMessage(error.message || "AI 추천을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (selectedRecipe) {
    return <RecipeDetailPage recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
  }

  return (
    <Wrapper>
      <Header>
        <Title>AI 맞춤 레시피 추천: 냉장고 재료 활용</Title>
        <ToggleWrap>
          <HiddenInput
            type="checkbox"
            checked={prioritizeUrgent}
            onChange={(e) => setPrioritizeUrgent(e.target.checked)}
          />
          <ToggleTrack $on={prioritizeUrgent} />
          <ToggleText>임박 재료 우선 사용</ToggleText>
        </ToggleWrap>
      </Header>

      <ContentGrid>
        <RecipeGrid>
          {loading && skeletonCount.map((_, index) => <SkeletonCard key={`s-${index}`} />)}
          {!loading && errorMessage && (
            <StatusBox role="alert">
              <strong>AI 추천을 불러오지 못했어요.</strong>
              <p>{errorMessage}</p>
            </StatusBox>
          )}
          {!loading && !errorMessage && recipes.length === 0 && (
            <StatusBox>
              <strong>아직 생성된 레시피가 없어요.</strong>
              <p>냉장고 재료를 바탕으로 Gemini AI가 바로 만들 수 있는 레시피를 추천합니다.</p>
            </StatusBox>
          )}
          {!loading && !errorMessage &&
            recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} onSelect={setSelectedRecipe} />)}
        </RecipeGrid>

        <UrgentBox>
          <h2>내 냉장고 임박 재료</h2>
          <UrgentList>
            {urgentItems.map((item) => (
              <li key={item.id}>
                <span>{item.icon}</span>
                <strong>{item.name}</strong>
                <em>D-{item.daysLeft}</em>
              </li>
            ))}
            {urgentItems.length === 0 && <Empty>임박 재료가 없습니다</Empty>}
          </UrgentList>
          <GenerateButton type="button" onClick={handleGenerate} disabled={loading}>
            {loading ? "추천 생성 중" : "AI 추천 생성"}
          </GenerateButton>
        </UrgentBox>
      </ContentGrid>
    </Wrapper>
  );
}

export default RecipePage;

const Wrapper = styled.section`
  display: grid;
  gap: 24px;
`;

const Header = styled.header`
  display: grid;
  justify-items: start;
  gap: 14px;
  border-radius: 16px;
  background: var(--block-lilac);
  padding: 24px 28px;

  @media (max-width: 760px) {
    border-radius: 0;
    margin-inline: -12px;
    padding: 22px 20px;
  }
`;

const Title = styled.h1`
  max-width: 840px;
  font-size: clamp(26px, 4vw, 38px);
  line-height: 1.16;
  font-weight: 480;
  letter-spacing: -0.26px;
  color: var(--text);
`;

const ToggleWrap = styled.label`
  min-height: 44px;
  border: 0;
  border-radius: 50px;
  background: var(--surface);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 16px 6px 6px;
  cursor: pointer;
  user-select: none;
`;

const ToggleText = styled.span`
  font-size: 16px;
  font-weight: 480;
  color: var(--text);
`;

const ToggleTrack = styled.span`
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: ${(props) => (props.$on ? "var(--text)" : "var(--border)")};
  position: relative;
  transition: background 0.24s ease;

  &::after {
    content: "";
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    position: absolute;
    top: 3px;
    left: ${(props) => (props.$on ? "21px" : "3px")};
    transition: left 0.24s ease;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  align-items: start;
  gap: 28px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 22px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const StatusBox = styled.div`
  min-height: 220px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  padding: 28px;
  display: grid;
  align-content: center;
  gap: 10px;
  grid-column: 1 / -1;
  color: var(--text);

  strong {
    font-size: 24px;
    font-weight: 700;
  }

  p {
    max-width: 540px;
    font-size: 15px;
    line-height: 1.55;
    color: var(--text);
  }
`;

const UrgentBox = styled.aside`
  border-radius: 24px;
  border: 0;
  background: var(--block-lime);
  box-shadow: none;
  padding: 24px;
  display: grid;
  gap: 18px;

  h2 {
    font-size: 24px;
    font-weight: 540;
    letter-spacing: -0.26px;
    color: var(--text);
  }
`;

const UrgentList = styled.ul`
  display: grid;
  gap: 0;
  list-style: none;

  li {
    min-height: 44px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    display: grid;
    grid-template-columns: 24px 1fr auto;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text);
  }

  strong {
    font-weight: 800;
  }

  em {
    color: var(--text);
    font-style: normal;
    font-weight: 900;
  }
`;

const Empty = styled.p`
  color: var(--text-muted);
  font-size: 14px;
`;

const GenerateButton = styled.button`
  border: 0;
  border-radius: 50px;
  background: var(--text);
  color: var(--surface);
  padding: 12px 18px;
  font-size: 16px;
  font-weight: 480;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.62;
  }
`;
