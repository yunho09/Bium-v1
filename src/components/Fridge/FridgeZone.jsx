/*
 * 각 보관 구역의 공통 드롭 영역이다.
 * 쇼핑백, 도어, 냉장/냉동/실온 구역을 같은 방식으로 렌더링한다.
 */
import { memo, useMemo } from "react";
import styled from "@emotion/styled";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FoodItem from "./FoodItem";

const DOOR_SLOT_COUNT = 5;

function SortableFoodItem({ item, onClickFood, list, door }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FoodItem
        item={item}
        onClick={() => onClickFood(item)}
        daysLeft={item.daysLeft}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
        list={list}
        door={door}
      />
    </div>
  );
}

const MemoSortableFoodItem = memo(SortableFoodItem);

function FridgeZone({ containerId, icon, title, subtitle, items, onClickFood, compact = false, door = false }) {
  const { isOver, setNodeRef } = useDroppable({ id: containerId });
  const list = containerId === "shoppingBag";
  const displayItems = useMemo(() => (list ? [...items].reverse() : items), [items, list]);
  const sortableIds = useMemo(() => displayItems.map((item) => item.id), [displayItems]);
  const doorPlaceholders = useMemo(
    () => (door ? Array.from({ length: Math.max(DOOR_SLOT_COUNT - items.length, 0) }) : []),
    [door, items.length],
  );

  return (
    <ZoneWrap ref={setNodeRef} $active={isOver} $compact={compact} $door={door}>
      {!compact && (
        <ZoneHeader>
          <ZoneTitle>
            {icon} {title}
          </ZoneTitle>
          <ZoneSubtitle>{subtitle}</ZoneSubtitle>
        </ZoneHeader>
      )}

      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        <ZoneGrid $compact={compact} $list={list} $door={door}>
          {displayItems.map((item) => (
            <MemoSortableFoodItem key={item.id} item={item} onClickFood={onClickFood} list={list} door={door} />
          ))}
          {doorPlaceholders.map((_, index) => (
            <DoorSlot key={`door-slot-${index}`} $active={isOver}>
              빈 칸
            </DoorSlot>
          ))}
          {items.length === 0 && !door && <Empty $compact={compact}>여기로 재료를 끌어다 놓으세요</Empty>}
        </ZoneGrid>
      </SortableContext>
    </ZoneWrap>
  );
}

export default memo(FridgeZone);

const ZoneWrap = styled.section`
  min-height: ${(props) => (props.$compact ? "100%" : "auto")};
  border-radius: ${(props) => (props.$compact ? "14px" : "24px")};
  padding: ${(props) => (props.$compact ? "0" : "16px")};
  border: ${(props) =>
    props.$compact ? "0" : `1px solid ${props.$active ? "var(--text)" : "var(--border)"}`};
  background: ${(props) =>
    props.$active ? "var(--block-lime)" : props.$compact ? "transparent" : "rgba(255, 255, 255, 0.6)"};
  box-shadow: none;
  transition: all 0.2s ease;
`;

const ZoneHeader = styled.header`
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
`;

const ZoneTitle = styled.h3`
  font-size: 22px;
  font-weight: 540;
  color: var(--text);
  letter-spacing: -0.14px;
`;

const ZoneSubtitle = styled.p`
  font-size: 14px;
  font-weight: 330;
  color: var(--text);
`;

const ZoneGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$list
      ? "1fr"
      : props.$door
        ? "1fr"
          : props.$compact
          ? "repeat(5, minmax(76px, 1fr))"
          : "repeat(auto-fill, minmax(94px, 1fr))"};
  grid-template-rows: ${(props) => (props.$door ? `repeat(${DOOR_SLOT_COUNT}, 54px)` : "auto")};
  gap: ${(props) => (props.$door ? "8px" : props.$compact ? "10px" : "10px")};
  min-height: ${(props) => (props.$compact ? (props.$door ? "326px" : "418px") : props.$list ? "auto" : "160px")};
  max-height: ${(props) => (props.$compact && !props.$door ? "418px" : "none")};
  overflow-y: ${(props) => (props.$compact && !props.$door ? "auto" : "visible")};
  padding-right: ${(props) => (props.$compact && !props.$door ? "4px" : "0")};
  align-content: start;

  scrollbar-width: thin;

  @media (max-width: 760px) {
    grid-template-columns: ${(props) => (props.$list || props.$door ? "1fr" : "repeat(auto-fill, minmax(78px, 1fr))")};
    grid-template-rows: ${(props) => (props.$door ? `repeat(${DOOR_SLOT_COUNT}, 56px)` : "auto")};
    min-height: ${(props) => (props.$compact ? (props.$door ? "184px" : "220px") : props.$list ? "auto" : "120px")};
    max-height: ${(props) => (props.$compact && !props.$door ? "220px" : "none")};
  }
`;

const DoorSlot = styled.div`
  height: 54px;
  border-radius: 10px;
  border: 1px dashed ${(props) => (props.$active ? "var(--text)" : "rgba(134, 148, 158, 0.38)")};
  background: ${(props) => (props.$active ? "var(--block-lime)" : "rgba(255, 255, 255, 0.4)")};
  color: rgba(82, 95, 103, 0.62);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;

  @media (max-width: 760px) {
    height: 56px;
  }
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  border-radius: 12px;
  border: 1px dashed var(--border);
  background: ${(props) => (props.$compact ? "rgba(255,255,255,0.72)" : "var(--surface-soft)")};
  color: var(--text);
  font-size: 12px;
  font-weight: 800;
  display: grid;
  place-items: center;
  min-height: ${(props) => (props.$compact ? "140px" : "80px")};
`;
