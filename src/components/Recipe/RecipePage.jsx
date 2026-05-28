/*
 * 냉장고 재료를 바탕으로 레시피를 추천하는 화면이다.
 * 임박 재료 우선순위와 추천 카드 로딩 상태를 함께 관리한다.
 */
import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import RecipeCard from "./RecipeCard";
import SkeletonCard from "./SkeletonCard";
import { useFridgeStore } from "../../store/useFridgeStore";

const recipeMockData = [
  {
    id: "recipe-a",
    name: "두부 달걀 볶음밥",
    time: "12분",
    level: "중",
    emoji: "🍳",
    cover:
      "linear-gradient(135deg, rgba(247,224,180,0.72) 0%, rgba(255,255,255,0.35) 45%, rgba(210,174,111,0.72) 100%), #efe7da",
    ingredients: ["🥚 계란(D-2),", "🧊 두부(D-3)"],
  },
  {
    id: "recipe-b",
    name: "치킨 브로콜리 샐러드",
    time: "16분",
    level: "중",
    emoji: "🥗",
    cover:
      "linear-gradient(135deg, rgba(184,219,157,0.72) 0%, rgba(255,255,255,0.38) 42%, rgba(102,158,96,0.66) 100%), #e4eadc",
    ingredients: ["🍗 닭가슴살,", "🥬 시금치"],
  },
  {
    id: "recipe-c",
    name: "토마토 두부 스튜",
    time: "18분",
    level: "하",
    emoji: "🍲",
    cover:
      "linear-gradient(135deg, rgba(234,126,92,0.68) 0%, rgba(255,255,255,0.34) 45%, rgba(176,68,52,0.6) 100%), #f1ded7",
    ingredients: ["🍅 토마토,", "🧊 두부"],
  },
  {
    id: "recipe-d",
    name: "양파 감자 버터구이",
    time: "20분",
    level: "하",
    emoji: "🥔",
    cover:
      "linear-gradient(135deg, rgba(244,211,142,0.75) 0%, rgba(255,255,255,0.36) 48%, rgba(213,162,73,0.64) 100%), #eee2c8",
    ingredients: ["🧅 양파,", "🥔 감자"],
  },
];

function getDaysLeft(expiresAt) {
  const today = new Date();
  const target = new Date(expiresAt);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function RecipePage() {
  const zones = useFridgeStore((state) => state.zones);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState(recipeMockData);
  const [prioritizeUrgent, setPrioritizeUrgent] = useState(true);

  const skeletonCount = useMemo(() => Array.from({ length: 4 }), []);
  const urgentItems = useMemo(() => {
    return Object.values(zones)
      .flat()
      .map((item) => ({ ...item, daysLeft: getDaysLeft(item.expiresAt) }))
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 5)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [zones]);

  const handleGenerate = () => {
    // 예시 데이터로 추천 목록을 다시 그리되, 임박 재료 우선 여부에 따라 순서를 바꾼다.
    setLoading(true);
    setRecipes([]);

    setTimeout(() => {
      const list = prioritizeUrgent
        ? [recipeMockData[0], recipeMockData[1], recipeMockData[2], recipeMockData[3]]
        : recipeMockData;
      setRecipes(list);
      setLoading(false);
    }, 900);
  };

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
          {!loading && recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
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
          <GenerateButton type="button" onClick={handleGenerate}>
            추천 다시 생성
          </GenerateButton>
        </UrgentBox>
      </ContentGrid>
    </Wrapper>
  );
}

export default RecipePage;

const Wrapper = styled.section`
  display: grid;
  gap: 32px;
`;

const Header = styled.header`
  display: grid;
  justify-items: start;
  gap: 24px;
  border-radius: 24px;
  background: var(--block-lilac);
  padding: 48px;

  @media (max-width: 760px) {
    border-radius: 0;
    margin-inline: -12px;
    padding: 32px 24px;
  }
`;

const Title = styled.h1`
  max-width: 840px;
  font-size: clamp(40px, 7vw, 72px);
  line-height: 1.04;
  font-weight: 340;
  letter-spacing: -0.96px;
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
`;
