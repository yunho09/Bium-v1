import { ArrowLeft, ChefHat, Clock3, Flame, Sparkles, Users } from "lucide-react";
import styled from "@emotion/styled";

function RecipeDetailPage({ recipe, onBack }) {
  const requiredIngredients = recipe.detailIngredients.filter((ingredient) => ingredient.required);
  const optionalIngredients = recipe.detailIngredients.filter((ingredient) => !ingredient.required);

  return (
    <DetailWrap>
      <BackButton type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        레시피 목록
      </BackButton>

      <Hero>
        <HeroCopy>
          <Badge>
            <Sparkles size={16} />
            AI 추천 레시피
          </Badge>
          <h1>{recipe.name}</h1>
          <p>{recipe.summary}</p>
          <MetaGrid>
            <MetaItem>
              <Clock3 size={18} />
              <span>{recipe.time}</span>
            </MetaItem>
            <MetaItem>
              <ChefHat size={18} />
              <span>난이도 {recipe.level}</span>
            </MetaItem>
            <MetaItem>
              <Users size={18} />
              <span>{recipe.servings}</span>
            </MetaItem>
            <MetaItem>
              <Flame size={18} />
              <span>{recipe.calories}</span>
            </MetaItem>
          </MetaGrid>
        </HeroCopy>
        <HeroVisual $cover={recipe.cover}>
          <FoodEmoji>{recipe.emoji}</FoodEmoji>
        </HeroVisual>
      </Hero>

      <DetailGrid>
        <MainColumn>
          <Section>
            <SectionTitle>조리 순서</SectionTitle>
            <StepList>
              {recipe.steps.map((step, index) => (
                <li key={`${recipe.id}-step-${step}`}>
                  <StepNumber>{index + 1}</StepNumber>
                  <span>{step}</span>
                </li>
              ))}
            </StepList>
          </Section>

          <Section>
            <SectionTitle>AI 활용 팁</SectionTitle>
            <TipList>
              {recipe.tips.map((tip) => (
                <li key={`${recipe.id}-tip-${tip}`}>{tip}</li>
              ))}
            </TipList>
          </Section>
        </MainColumn>

        <SideColumn>
          <Panel>
            <SectionTitle>필수 재료</SectionTitle>
            <IngredientList>
              {requiredIngredients.map((ingredient) => (
                <li key={`${recipe.id}-${ingredient.name}`}>
                  <strong>{ingredient.name}</strong>
                  <span>{ingredient.amount}</span>
                  <em>{ingredient.status}</em>
                </li>
              ))}
            </IngredientList>
          </Panel>

          {optionalIngredients.length > 0 && (
            <Panel>
              <SectionTitle>있으면 좋은 재료</SectionTitle>
              <IngredientList>
                {optionalIngredients.map((ingredient) => (
                  <li key={`${recipe.id}-${ingredient.name}`}>
                    <strong>{ingredient.name}</strong>
                    <span>{ingredient.amount}</span>
                    <em>{ingredient.status}</em>
                  </li>
                ))}
              </IngredientList>
            </Panel>
          )}

          <Panel>
            <SectionTitle>냉장고 매칭</SectionTitle>
            <MatchList>
              {recipe.fridgeMatches.map((item) => (
                <li key={`${recipe.id}-match-${item}`}>{item}</li>
              ))}
            </MatchList>
          </Panel>

          <Panel>
            <SectionTitle>영양 정보</SectionTitle>
            <NutritionGrid>
              {recipe.nutrition.map((item) => (
                <NutritionItem key={`${recipe.id}-${item.label}`}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </NutritionItem>
              ))}
            </NutritionGrid>
          </Panel>
        </SideColumn>
      </DetailGrid>
    </DetailWrap>
  );
}

export default RecipeDetailPage;

const DetailWrap = styled.section`
  display: grid;
  gap: 28px;
`;

const BackButton = styled.button`
  width: fit-content;
  min-height: 42px;
  border: 1px solid var(--border);
  border-radius: 50px;
  background: var(--surface);
  color: var(--text);
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
`;

const Hero = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  gap: 28px;
  align-items: stretch;
  border-radius: 8px;
  background: var(--block-lilac);
  overflow: hidden;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCopy = styled.div`
  padding: 44px;
  display: grid;
  align-content: center;
  gap: 22px;

  h1 {
    font-size: clamp(36px, 6vw, 68px);
    line-height: 1.04;
    font-weight: 340;
    letter-spacing: 0;
    color: var(--text);
  }

  p {
    max-width: 680px;
    color: var(--text);
    font-size: 18px;
    line-height: 1.55;
    font-weight: 330;
  }

  @media (max-width: 760px) {
    padding: 32px 24px;
  }
`;

const Badge = styled.span`
  width: fit-content;
  min-height: 34px;
  border-radius: 50px;
  background: var(--surface);
  color: var(--text);
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 700;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MetaItem = styled.div`
  min-height: 54px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.58);
  color: var(--text);
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
`;

const HeroVisual = styled.div`
  min-height: 330px;
  background: ${(props) => props.$cover};
  display: grid;
  place-items: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    width: min(72%, 280px);
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.45);
  }
`;

const FoodEmoji = styled.span`
  position: relative;
  z-index: 1;
  font-size: clamp(96px, 15vw, 150px);
  filter: drop-shadow(0 18px 18px rgba(51, 42, 32, 0.2));
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: start;
  gap: 28px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  display: grid;
  gap: 22px;
`;

const SideColumn = styled.aside`
  display: grid;
  gap: 16px;
`;

const Section = styled.section`
  display: grid;
  gap: 18px;
`;

const Panel = styled.section`
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  padding: 22px;
  display: grid;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 540;
  letter-spacing: 0;
  color: var(--text);
`;

const StepList = styled.ol`
  list-style: none;
  display: grid;
  gap: 12px;

  li {
    min-height: 72px;
    border-radius: 8px;
    background: var(--surface-soft);
    padding: 18px;
    display: grid;
    grid-template-columns: 36px 1fr;
    align-items: center;
    gap: 14px;
    color: var(--text);
    font-size: 16px;
    line-height: 1.55;
  }
`;

const StepNumber = styled.strong`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--text);
  color: var(--surface);
  display: grid;
  place-items: center;
  font-size: 15px;
`;

const TipList = styled.ul`
  list-style: none;
  display: grid;
  gap: 10px;

  li {
    border-left: 4px solid var(--text);
    background: var(--block-cream);
    border-radius: 0 8px 8px 0;
    padding: 16px 18px;
    color: var(--text);
    font-size: 15px;
    line-height: 1.5;
  }
`;

const IngredientList = styled.ul`
  list-style: none;
  display: grid;
  gap: 0;

  li {
    min-height: 48px;
    border-bottom: 1px solid var(--border-soft);
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 4px 12px;
  }

  li:last-of-type {
    border-bottom: 0;
  }

  strong {
    color: var(--text);
    font-size: 15px;
  }

  span {
    color: var(--text);
    font-size: 14px;
    font-weight: 700;
  }

  em {
    grid-column: 1 / -1;
    color: var(--text);
    font-size: 12px;
    font-style: normal;
    font-weight: 330;
  }
`;

const MatchList = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  li {
    border-radius: 50px;
    background: var(--block-lime);
    padding: 8px 12px;
    color: var(--text);
    font-size: 14px;
    font-weight: 700;
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const NutritionItem = styled.div`
  min-height: 72px;
  border-radius: 8px;
  background: var(--surface-soft);
  display: grid;
  place-items: center;
  gap: 3px;
  padding: 10px;
  text-align: center;

  span {
    font-size: 12px;
    color: var(--text);
  }

  strong {
    font-size: 16px;
    color: var(--text);
  }
`;
