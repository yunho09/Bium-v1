/*
 * 냉장고 화면의 메인 컨테이너다.
 * 구역 이동, 드래그 앤 드롭, 식재료 수정 모달을 한 곳에서 관리한다.
 */
import { useCallback, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import FridgeBoard from "./FridgeBoard";
import FridgeZone from "./FridgeZone";
import FoodItem from "./FoodItem";
import FoodModal from "./FoodModal";
import { DEFAULT_FOOD_PRESETS } from "../../store/fridgePresets";
import { CONTAINER_IDS, useFridgeStore } from "../../store/useFridgeStore";

const DOOR_CAPACITY = 5;
const doorContainers = ["leftDoor", "rightDoor"];
const zoneOrder = ["fridge", "freezer", "pantry"];
const zoneMeta = {
  fridge: { id: "fridge", icon: "❄️", title: "냉장실", subtitle: "신선 식품을 차갑게 보관" },
  freezer: { id: "freezer", icon: "🧊", title: "냉동실", subtitle: "오래 두고 먹을 재료 보관" },
  pantry: { id: "pantry", icon: "🧺", title: "실온 보관", subtitle: "건조 식재료와 상온 재료" },
};

function FridgePage() {
  const zones = useFridgeStore((state) => state.zones);
  const setZones = useFridgeStore((state) => state.setZones);
  const saveFood = useFridgeStore((state) => state.saveFood);
  const removeFood = useFridgeStore((state) => state.removeFood);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("right");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [draggingFood, setDraggingFood] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const zonesWithDaysLeft = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    return CONTAINER_IDS.reduce((acc, containerId) => {
      acc[containerId] = zones[containerId].map((item) => ({
        ...item,
        daysLeft: Math.round((new Date(item.expiresAt).getTime() - todayTime) / (1000 * 60 * 60 * 24)),
      }));
      return acc;
    }, {});
  }, [zones]);

  const activeZoneId = zoneOrder[activeIndex];
  const activeZone = useMemo(() => {
    const meta = zoneMeta[activeZoneId];
    return {
      ...meta,
      items: zonesWithDaysLeft[activeZoneId],
    };
  }, [activeZoneId, zonesWithDaysLeft]);

  const expiredFoodCount = useMemo(() => {
    return CONTAINER_IDS.reduce(
      (total, containerId) => total + zonesWithDaysLeft[containerId].filter((item) => item.daysLeft < 0).length,
      0,
    );
  }, [zonesWithDaysLeft]);

  const findContainerByItemId = useCallback((itemId, sourceZones) => {
    for (const containerId of CONTAINER_IDS) {
      if (sourceZones[containerId].some((item) => item.id === itemId)) return containerId;
    }
    return null;
  }, []);

  const findFoodById = useCallback((itemId) => {
    for (const containerId of CONTAINER_IDS) {
      const found = zonesWithDaysLeft[containerId].find((item) => item.id === itemId);
      if (found) return found;
    }
    return null;
  }, [zonesWithDaysLeft]);

  const movePage = useCallback((nextDirection) => {
    setDirection(nextDirection);
    setActiveIndex((prev) => {
      if (nextDirection === "left") {
        return prev === 0 ? zoneOrder.length - 1 : prev - 1;
      }
      return prev === zoneOrder.length - 1 ? 0 : prev + 1;
    });
  }, []);

  const handleDragStart = useCallback(({ active }) => {
    setDraggingFood(findFoodById(String(active.id)));
  }, [findFoodById]);

  const handleDragCancel = useCallback(() => {
    setDraggingFood(null);
  }, []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setDraggingFood(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setZones((prev) => {
      // 같은 구역이면 순서만 바꾸고, 다른 구역이면 항목을 이동한다.
      const fromContainer = findContainerByItemId(activeId, prev);
      const overContainer = CONTAINER_IDS.includes(overId) ? overId : findContainerByItemId(overId, prev);

      if (!fromContainer || !overContainer) return prev;

      // 문칸은 슬롯 수가 제한되어 있으므로 초과 배치를 막는다.
      if (
        fromContainer !== overContainer &&
        doorContainers.includes(overContainer) &&
        prev[overContainer].length >= DOOR_CAPACITY
      ) {
        return prev;
      }

      if (fromContainer === overContainer) {
        const oldIndex = prev[fromContainer].findIndex((item) => item.id === activeId);
        const newIndex = prev[fromContainer].findIndex((item) => item.id === overId);

        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;

        return {
          ...prev,
          [fromContainer]: arrayMove(prev[fromContainer], oldIndex, newIndex),
        };
      }

      const movingItem = prev[fromContainer].find((item) => item.id === activeId);
      if (!movingItem) return prev;

      const sourceList = prev[fromContainer].filter((item) => item.id !== activeId);
      const targetList = [...prev[overContainer]];
      const overIndex = targetList.findIndex((item) => item.id === overId);
      const insertIndex = overIndex >= 0 ? overIndex : targetList.length;

      targetList.splice(insertIndex, 0, { ...movingItem, zoneKey: overContainer });

      return {
        ...prev,
        [fromContainer]: sourceList,
        [overContainer]: targetList,
      };
    });
  }, [findContainerByItemId, setZones]);

  const handleSaveFood = useCallback((foodInput) => {
    saveFood(foodInput);
    setEditingFood(null);
  }, [saveFood]);

  const handleMoveToShoppingBag = useCallback((food) => {
    saveFood({
      ...food,
      zoneKey: "shoppingBag",
    });
    setEditingFood(null);
  }, [saveFood]);

  const handleDeleteFood = useCallback((foodId) => {
    removeFood(foodId);
    setEditingFood(null);
  }, [removeFood]);

  const getAutoZoneForFood = useCallback((food) => {
    const preset = DEFAULT_FOOD_PRESETS.find((item) => item.name === food.name);
    const daysLeft = Math.round(
      (new Date(food.expiresAt).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
    );

    if (preset?.category === "meat" || preset?.category === "dairy") {
      return "fridge";
    }

    if (preset?.category === "vegetable" || preset?.category === "fruit") {
      return daysLeft <= 7 ? "fridge" : "pantry";
    }

    if (preset?.category === "etc") {
      return daysLeft > 20 ? "freezer" : "pantry";
    }

    if (daysLeft <= 5) return "fridge";
    if (daysLeft > 20) return "freezer";
    return "pantry";
  }, []);

  const handleAutoPlaceShoppingBag = useCallback(() => {
    setZones((prev) => {
      if (prev.shoppingBag.length === 0) return prev;

      const nextZones = {
        ...prev,
        shoppingBag: [],
      };

      prev.shoppingBag.forEach((food) => {
        const targetZone = getAutoZoneForFood(food);
        nextZones[targetZone] = [...nextZones[targetZone], { ...food, zoneKey: targetZone }];
      });

      return nextZones;
    });
  }, [getAutoZoneForFood, setZones]);

  const handleRemoveExpiredFoods = useCallback(() => {
    if (expiredFoodCount === 0) return;
    if (!window.confirm(`유통기한이 지난 음식 ${expiredFoodCount}개를 삭제할까요?`)) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    setZones((prev) =>
      CONTAINER_IDS.reduce((acc, containerId) => {
        acc[containerId] = prev[containerId].filter((item) => {
          const expiresAt = new Date(item.expiresAt);
          expiresAt.setHours(0, 0, 0, 0);
          return expiresAt.getTime() >= todayTime;
        });
        return acc;
      }, {}),
    );
    setEditingFood(null);
  }, [expiredFoodCount, setZones]);

  const handleToggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingFood(null);
  }, []);

  return (
    <Wrapper>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <FridgeLayout $drawerOpen={drawerOpen}>
          <MainArea>
            <Pager>
              <ArrowButton type="button" aria-label="이전" onClick={() => movePage("left")}>
                <ChevronLeft size={28} />
              </ArrowButton>
              <ZoneTitle $zone={activeZoneId}>
                <strong>{activeZone.title}</strong>
              </ZoneTitle>
              <ArrowButton type="button" aria-label="다음" onClick={() => movePage("right")}>
                <ChevronRight size={28} />
              </ArrowButton>
            </Pager>

            <SlidingStage key={activeZoneId} $direction={direction}>
              <FridgeBoard
                zone={activeZone}
                leftDoorItems={zonesWithDaysLeft.leftDoor}
                rightDoorItems={zonesWithDaysLeft.rightDoor}
                onClickFood={setEditingFood}
              />
            </SlidingStage>

            <DrawerTrigger type="button" onClick={handleToggleDrawer}>
              방금 장본 음식 넣기
            </DrawerTrigger>

            <ExpiredDeleteButton type="button" onClick={handleRemoveExpiredFoods} disabled={expiredFoodCount === 0}>
              유통기한 지난 음식 삭제
              <span>{expiredFoodCount}</span>
            </ExpiredDeleteButton>
          </MainArea>

          {drawerOpen && (
            <ShoppingPanel>
              <DrawerHeader>
                <h3>방금 장본 음식</h3>
                <DrawerActions>
                  <AutoPlaceButton type="button" onClick={handleAutoPlaceShoppingBag}>
                    자동 배치
                  </AutoPlaceButton>
                  <DrawerClose type="button" aria-label="장본 음식 패널 닫기" onClick={handleCloseDrawer}>
                    <X size={22} />
                  </DrawerClose>
                </DrawerActions>
              </DrawerHeader>
              <FridgeZone
                containerId="shoppingBag"
                icon="🛍️"
                title="장본 음식"
                subtitle="냉장고로 드래그해 배치하세요"
                items={zonesWithDaysLeft.shoppingBag}
                onClickFood={setEditingFood}
                sortable={false}
              />
            </ShoppingPanel>
          )}
        </FridgeLayout>

        <DragOverlay dropAnimation={{ duration: 180 }}>
          {draggingFood ? (
            <OverlayCard>
              <FoodItem item={draggingFood} daysLeft={draggingFood.daysLeft} preview />
            </OverlayCard>
          ) : null}
        </DragOverlay>
      </DndContext>

      <FoodModal
        open={Boolean(editingFood)}
        initialValue={editingFood}
        onClose={handleCloseModal}
        onSave={handleSaveFood}
        onDelete={handleDeleteFood}
        onMoveToShoppingBag={handleMoveToShoppingBag}
      />
    </Wrapper>
  );
}

export default FridgePage;

const slideFromLeft = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideFromRight = keyframes`
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Wrapper = styled.section`
  min-height: calc(100vh - 118px);
`;

const FridgeLayout = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${(props) => (props.$drawerOpen ? "minmax(0, 940px) minmax(280px, 320px)" : "minmax(0, 980px)")};
  justify-content: center;
  align-items: start;
  gap: 24px;

  @media (max-width: 1220px) {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
  }
`;

const MainArea = styled.div`
  width: min(980px, 100%);
  display: grid;
  justify-items: center;
  gap: 8px;
`;

const Pager = styled.div`
  display: grid;
  grid-template-columns: 48px minmax(220px, auto) 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

const ArrowButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 0;
  background: var(--surface-soft);
  display: grid;
  place-items: center;
  color: var(--text);
  cursor: pointer;
`;

const ZoneTitle = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text);

  strong {
    min-width: 110px;
    min-height: 34px;
    border-radius: 999px;
    border: ${(props) => {
      if (props.$zone === "fridge") return "1px solid #9fb0a4";
      if (props.$zone === "freezer") return "1px solid #95bfd5";
      if (props.$zone === "pantry") return "1px solid #bf9255";
      return "1px solid var(--border)";
    }};
    background: ${(props) => {
      if (props.$zone === "fridge") return "#eff6f1";
      if (props.$zone === "freezer") return "#e8f7ff";
      if (props.$zone === "pantry") return "#fff1d8";
      return "var(--surface)";
    }};
    display: inline-grid;
    place-items: center;
    padding: 0 16px;
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 540;
    letter-spacing: -0.26px;
  }
`;

const SlidingStage = styled.div`
  width: 100%;
  display: grid;
  place-items: center;
  animation: ${(props) => (props.$direction === "left" ? slideFromLeft : slideFromRight)} 0.26s ease;
`;

const DrawerTrigger = styled.button`
  width: min(260px, 80%);
  border: 0;
  background: var(--text);
  color: var(--surface);
  border-radius: 50px;
  padding: 12px 22px;
  font-size: 16px;
  font-weight: 480;
  cursor: pointer;
  transform: translateY(-12px);
`;

const ExpiredDeleteButton = styled.button`
  min-height: 40px;
  border: 0;
  background: #f1e4e1;
  color: var(--text);
  border-radius: 50px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transform: translateY(-10px);

  span {
    min-width: 24px;
    height: 24px;
    border-radius: 999px;
    background: var(--surface);
    display: grid;
    place-items: center;
    font-size: 12px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
`;

const ShoppingPanel = styled.aside`
  position: sticky;
  top: 132px;
  z-index: 5;
  width: min(320px, 100%);
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--block-cream);
  box-shadow: none;
  padding: 20px;
  max-height: calc(100vh - 164px);
  overflow: auto;

  @media (max-width: 1220px) {
    position: static;
    width: min(420px, 100%);
    margin-top: 12px;
    max-height: 390px;
  }
`;

const DrawerHeader = styled.div`
  position: sticky;
  top: -16px;
  z-index: 2;
  background: var(--block-cream);
  padding: 0 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 20px;
    font-weight: 540;
    letter-spacing: -0.14px;
    color: var(--text);
    white-space: nowrap;
  }
`;

const DrawerActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const AutoPlaceButton = styled.button`
  border: 0;
  background: var(--text);
  color: var(--surface);
  min-height: 36px;
  border-radius: 50px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 480;
  white-space: nowrap;
  cursor: pointer;
`;

const DrawerClose = styled.button`
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.52);
  display: grid;
  place-items: center;
  cursor: pointer;
`;

const OverlayCard = styled.div`
  width: 92px;
`;
