/*
 * 추천된 레시피 한 장을 표현하는 카드다.
 * 대표 이미지, 조리 시간, 난이도, 사용 재료를 함께 보여준다.
 */
import { Clock3, ChevronRight } from "lucide-react";
import styled from "@emotion/styled";

function RecipeCard({ recipe, onSelect }) {
  const tone = {
    "recipe-a": "var(--block-cream)",
    "recipe-b": "var(--block-mint)",
    "recipe-c": "var(--block-coral)",
    "recipe-d": "var(--block-pink)",
  }[recipe.id] || "var(--surface-soft)";

  return (
    <Card type="button" onClick={() => onSelect?.(recipe)} aria-label={`${recipe.name} 상세 보기`}>
      <Cover $tone={tone}>
        <FoodEmoji>{recipe.emoji}</FoodEmoji>
      </Cover>
      <Body>
        <NameRow>
          <Name>{recipe.name}</Name>
          <ChevronRight size={18} />
        </NameRow>
        <Meta>
          <Pill>
            <Clock3 size={14} /> 조리 시간 {recipe.time}
          </Pill>
          <Divider />
          <Pill>난이도 {recipe.level}</Pill>
        </Meta>
        <IngredientLine>
          사용{" "}
          {recipe.ingredients.map((ingredient) => (
            <Ingredient key={`${recipe.id}-${ingredient}`}>{ingredient}</Ingredient>
          ))}
        </IngredientLine>
      </Body>
    </Card>
  );
}

export default RecipeCard;

const Card = styled.button`
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  overflow: hidden;
  box-shadow: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: var(--text);
  }
`;

const Cover = styled.div`
  height: 205px;
  background: ${(props) => props.$tone};
  display: grid;
  place-items: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 18px 22px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.45);
  }
`;

const FoodEmoji = styled.span`
  position: relative;
  z-index: 1;
  font-size: 88px;
  filter: drop-shadow(0 12px 14px rgba(51, 42, 32, 0.18));
`;

const Body = styled.div`
  padding: 20px;
  display: grid;
  gap: 12px;
`;

const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 22px;
  align-items: center;
  gap: 8px;

  svg {
    justify-self: end;
    color: var(--text);
  }
`;

const Name = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text);
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 480;
`;

const Divider = styled.span`
  width: 1px;
  height: 14px;
  background: var(--border);
`;

const IngredientLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--text);
  font-size: 14px;
  font-weight: 330;
`;

const Ingredient = styled.span`
  color: var(--text);
  font-weight: 700;
`;
