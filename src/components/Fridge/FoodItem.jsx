/*
 * 냉장고 안에서 보이는 식재료 카드다.
 * 유통기한 상태에 따라 배지와 시각 효과를 달리 보여준다.
 */
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

function getDaysLeft(expiresAt) {
  const today = new Date();
  const target = new Date(expiresAt);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function FoodItem({ item, onClick, dragAttributes, dragListeners, isDragging, list = false, door = false, preview = false }) {
  const daysLeft = getDaysLeft(item.expiresAt);
  const isExpired = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;
  const isSafe = daysLeft >= 7;
  // 상태 배지는 사용자가 재료의 신선도를 빠르게 판단하게 해준다.
  const badgeText = isExpired ? `만료 ${Math.abs(daysLeft)}일` : `D-${daysLeft}`;

  return (
    <ItemCard
      type="button"
      onClick={onClick}
      $expired={isExpired}
      $dragging={isDragging}
      $list={list}
      $door={door}
      $preview={preview}
      {...dragAttributes}
      {...dragListeners}
    >
      <Badge $expired={isExpired} $urgent={isUrgent} $safe={isSafe} $door={door}>
        {badgeText}
      </Badge>
      <IconEmoji $expired={isExpired} $list={list} $door={door}>
        {item.icon || "🥕"}
      </IconEmoji>
      <Name $list={list} $door={door}>{item.name}</Name>
      <Sweat $urgent={isUrgent && !isExpired} />
    </ItemCard>
  );
}

export default FoodItem;

const sweatDrop = keyframes`
  0% { transform: translateY(-4px); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(12px); opacity: 0; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-1px) rotate(-2deg); }
  50% { transform: translateX(1px) rotate(2deg); }
  75% { transform: translateX(-1px) rotate(-2deg); }
`;

const ItemCard = styled.button`
  position: relative;
  width: 100%;
  aspect-ratio: ${(props) => (props.$list || props.$door ? "auto" : "1 / 0.86")};
  min-height: ${(props) => (props.$list ? "44px" : props.$door ? "52px" : "64px")};
  border: 1px solid ${(props) => (props.$expired ? "#cfd3d0" : "#dfe7df")};
  border-radius: 10px;
  background: ${(props) => (props.$expired ? "#eff1ef" : "#ffffff")};
  box-shadow: ${(props) =>
    props.$preview
      ? "0 18px 34px rgba(31, 40, 34, 0.28)"
      : props.$dragging
        ? "0 4px 10px rgba(31, 40, 34, 0.08)"
        : "0 4px 10px rgba(31, 40, 34, 0.1)"};
  padding: ${(props) => (props.$list ? "7px 8px 7px 42px" : props.$door ? "5px 6px" : "10px 6px 8px")};
  display: grid;
  grid-template-columns: ${(props) => (props.$list ? "28px 1fr" : props.$door ? "24px 1fr" : "1fr")};
  grid-template-rows: ${(props) => (props.$list || props.$door ? "1fr" : "1fr auto")};
  place-items: ${(props) => (props.$list || props.$door ? "center start" : "center")};
  gap: 3px;
  cursor: grab;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    box-shadow 0.18s ease;
  transform: ${(props) => (props.$preview ? "scale(1.04)" : "scale(1)")};
  opacity: ${(props) => (props.$dragging ? 0.35 : 1)};
  pointer-events: ${(props) => (props.$preview ? "none" : "auto")};

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: ${(props) => (props.$preview ? "scale(1.04)" : "translateY(-2px)")};
  }
`;

const IconEmoji = styled.span`
  font-size: ${(props) => (props.$list ? "23px" : props.$door ? "21px" : "28px")};
  line-height: 1;
  filter: ${(props) => (props.$expired ? "grayscale(1)" : "none")};
  animation: ${(props) => (props.$expired ? shake : "none")} 0.8s infinite;
`;

const Name = styled.strong`
  width: 100%;
  color: #171a17;
  font-size: ${(props) => (props.$door ? "11px" : "12px")};
  font-weight: 900;
  line-height: 1.1;
  text-align: ${(props) => (props.$list || props.$door ? "left" : "center")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span`
  position: absolute;
  top: ${(props) => (props.$door ? "4px" : "5px")};
  right: ${(props) => (props.$door ? "4px" : "5px")};
  border-radius: 999px;
  padding: ${(props) => (props.$door ? "1px 5px" : "2px 6px")};
  font-size: ${(props) => (props.$door ? "9px" : "10px")};
  font-weight: 900;
  line-height: 1.2;
  color: #fff;
  background: ${(props) => {
    if (props.$expired) return "#6b7280";
    if (props.$urgent) return "#3f91d8";
    if (props.$safe) return "#45bd75";
    return "#66a8dd";
  }};
`;

const Sweat = styled.span`
  position: absolute;
  right: 7px;
  top: 27px;
  width: 8px;
  height: 12px;
  border-radius: 60% 60% 70% 70%;
  background: #48b7e8;
  opacity: ${(props) => (props.$urgent ? 1 : 0)};
  animation: ${(props) => (props.$urgent ? sweatDrop : "none")} 0.9s infinite;
`;
