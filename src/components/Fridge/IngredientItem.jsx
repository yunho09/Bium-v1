/*
 * 냉장고 안에서 보이는 식재료 카드다.
 * 유통기한 상태에 따라 배지와 시각 효과를 달리 보여준다.
 */
import { memo } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Trash2 } from "lucide-react";

function getDaysLeft(expiresAt) {
  const today = new Date();
  const target = new Date(expiresAt);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getFreshness(daysLeft) {
  if (daysLeft < 0) return "expired";
  if (daysLeft === 0) return "today";
  if (daysLeft <= 3) return "urgent";
  if (daysLeft <= 6) return "soon";
  return "safe";
}

function IngredientItem({
  item,
  onClick,
  onDelete,
  dragAttributes,
  dragListeners,
  isDragging,
  list = false,
  door = false,
  preview = false,
  daysLeft = getDaysLeft(item.expiresAt),
}) {
  const isExpired = daysLeft < 0;
  const freshness = getFreshness(daysLeft);
  const badgeText = isExpired ? `만료 ${Math.abs(daysLeft)}일` : daysLeft === 0 ? "오늘" : `D-${daysLeft}`;
  const isWarning = freshness === "today" || freshness === "urgent";
  const showDeleteButton = Boolean(onDelete) && !list && !preview;

  const deleteFood = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm(`${item.name}을(를) 삭제할까요?`)) return;
    onDelete?.(item.id);
  };

  const stopDeleteDrag = (event) => {
    event.stopPropagation();
  };

  return (
    <ItemCard
      type="button"
      onClick={onClick}
      $freshness={freshness}
      $dragging={isDragging}
      $list={list}
      $door={door}
      $preview={preview}
      {...dragAttributes}
      {...dragListeners}
    >
      {showDeleteButton && (
        <DeleteButton
          type="button"
          aria-label={`${item.name} 삭제`}
          $door={door}
          onClick={deleteFood}
          onPointerDown={stopDeleteDrag}
          onMouseDown={stopDeleteDrag}
        >
          <Trash2 size={12} strokeWidth={2.4} />
        </DeleteButton>
      )}
      <Badge $freshness={freshness} $door={door}>
        {badgeText}
      </Badge>
      <IconEmoji $freshness={freshness} $list={list} $door={door}>
        {item.icon || "🥕"}
      </IconEmoji>
      <Name $list={list} $door={door}>{item.name}</Name>
      <Sweat $active={isWarning} />
    </ItemCard>
  );
}

export default memo(IngredientItem);

const sweatDrop = keyframes`
  0% { transform: translateY(-4px); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(12px); opacity: 0; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0) rotate(0deg); }
  20% { transform: translateX(-3px) rotate(-7deg); }
  40% { transform: translateX(3px) rotate(7deg); }
  60% { transform: translateX(-2px) rotate(-5deg); }
  80% { transform: translateX(2px) rotate(5deg); }
`;

const dangerPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.16); }
`;

const urgentWiggle = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  30% { transform: rotate(-14deg) scale(1.18); }
  65% { transform: rotate(14deg) scale(1.18); }
`;

const soonBounce = keyframes`
  0%, 100% { transform: translateY(0); }
  45% { transform: translateY(-1px) scale(1.08); }
`;

const safeFloat = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(0px) rotate(5deg); }
`;

const badgeBlink = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;

const cardBorderByFreshness = {
  expired: "#cfd3d0",
  today: "#f1a7a7",
  urgent: "#f1a7a7",
  soon: "#e6c46d",
  safe: "#b8dcc4",
};

const cardBackgroundByFreshness = {
  expired: "#eff1ef",
  today: "#fff6f4",
  urgent: "#fff6f4",
  soon: "#fffaf0",
  safe: "#f7fff8",
};

const badgeBackgroundByFreshness = {
  expired: "#6b7280",
  today: "#ef4444",
  urgent: "#ef4444",
  soon: "#d9951e",
  safe: "#45bd75",
};

const getIconKeyframes = (freshness) => {
  if (freshness === "expired") return shake;
  if (freshness === "today" || freshness === "urgent") return urgentWiggle;
  if (freshness === "soon") return soonBounce;
  return safeFloat;
};

const getIconAnimationDuration = (freshness) => {
  if (freshness === "expired") return "0.58s";
  if (freshness === "today") return "0.5s";
  if (freshness === "urgent") return "0.8s";
  if (freshness === "soon") return "1.05s";
  return "2.15s";
};

const ItemCard = styled.button`
  position: relative;
  width: 100%;
  aspect-ratio: ${(props) => (props.$list || props.$door ? "auto" : "1 / 0.86")};
  min-height: ${(props) => (props.$list ? "44px" : props.$door ? "52px" : "64px")};
  border: 1px solid ${(props) => cardBorderByFreshness[props.$freshness] || "#dfe7df"};
  border-radius: 10px;
  background: ${(props) => cardBackgroundByFreshness[props.$freshness] || "#ffffff"};
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
  touch-action: none;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    box-shadow 0.18s ease;
  transform: ${(props) => (props.$preview ? "scale(1.04)" : "scale(1)")};
  opacity: ${(props) => (props.$dragging ? 0.35 : 1)};
  pointer-events: ${(props) => (props.$preview ? "none" : "auto")};
  animation: ${(props) =>
    props.$freshness === "today" || props.$freshness === "urgent" ? dangerPulse : "none"} 1.35s infinite;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: ${(props) => (props.$preview ? "scale(1.04)" : "translateY(-2px)")};
  }
`;

const IconEmoji = styled.span`
  display: inline-block;
  font-size: ${(props) => (props.$list ? "23px" : props.$door ? "21px" : "28px")};
  line-height: 1;
  filter: ${(props) => (props.$freshness === "expired" ? "grayscale(1)" : "none")};
  transform-origin: center;
  will-change: transform;
  animation-name: ${(props) => getIconKeyframes(props.$freshness)};
  animation-duration: ${(props) => getIconAnimationDuration(props.$freshness)};
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  top: ${(props) => (props.$door ? "4px" : "5px")};
  right: ${(props) => (props.$door ? "4px" : "5px")};
  border-radius: 999px;
  padding: ${(props) => (props.$door ? "1px 5px" : "2px 6px")};
  font-size: ${(props) => (props.$door ? "9px" : "10px")};
  font-weight: 900;
  line-height: 1.2;
  color: #fff;
  background: ${(props) => badgeBackgroundByFreshness[props.$freshness] || "#66a8dd"};
  transform-origin: center;
  animation: ${(props) =>
    props.$freshness === "today" || props.$freshness === "urgent" || props.$freshness === "soon"
      ? badgeBlink
      : "none"} 0.8s infinite;
`;

const DeleteButton = styled.button`
  position: absolute;
  left: ${(props) => (props.$door ? "auto" : "5px")};
  top: ${(props) => (props.$door ? "auto" : "5px")};
  right: ${(props) => (props.$door ? "5px" : "auto")};
  bottom: ${(props) => (props.$door ? "5px" : "auto")};
  z-index: 2;
  width: ${(props) => (props.$door ? "20px" : "22px")};
  height: ${(props) => (props.$door ? "20px" : "22px")};
  border: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  padding: 0;
  line-height: 0;
  color: #7f1d1d;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 2px 7px rgba(31, 40, 34, 0.16);
  cursor: pointer;
  touch-action: manipulation;
  opacity: 0.92;
  transition:
    transform 0.16s ease,
    background 0.16s ease,
    opacity 0.16s ease;

  &:hover {
    opacity: 1;
    background: #fee2e2;
    transform: scale(1.08);
  }

  svg {
    display: block;
  }
`;

const Sweat = styled.span`
  position: absolute;
  right: 7px;
  top: 27px;
  width: 8px;
  height: 12px;
  border-radius: 60% 60% 70% 70%;
  background: #ef4444;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  animation: ${(props) => (props.$active ? sweatDrop : "none")} 0.9s infinite;
`;
