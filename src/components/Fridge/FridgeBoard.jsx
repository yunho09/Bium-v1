/*
 * 냉장고 본체와 양쪽 도어를 시각적으로 조립하는 보드다.
 * 현재 선택된 구역과 문 슬롯의 식재료를 한 화면에 배치한다.
 */
import styled from "@emotion/styled";
import FridgeZone from "./FridgeZone";

function DoorZone({ side, items, onClickFood }) {
  const title = side === "left" ? "왼쪽 문" : "오른쪽 문";
  const containerId = side === "left" ? "leftDoor" : "rightDoor";

  return (
    <Door $side={side} aria-label={title}>
      <DoorSlotFrame>
        <FridgeZone
          containerId={containerId}
          icon=""
          title={title}
          subtitle=""
          items={items}
          onClickFood={onClickFood}
          compact
          door
        />
      </DoorSlotFrame>
    </Door>
  );
}

function FridgeBoard({ zone, leftDoorItems, rightDoorItems, onClickFood }) {
  return (
    <Stage>
      <FridgeShell>
        <DoorZone side="left" items={leftDoorItems} onClickFood={onClickFood} />

        <Cabinet>
          <BackPanel />
          <Shelf $top="150px" />
          <Shelf $top="270px" />
          <Shelf $top="390px" />
          <ShelfArea>
            <FridgeZone
              containerId={zone.id}
              icon={zone.icon}
              title={zone.title}
              subtitle={zone.subtitle}
              items={zone.items}
              onClickFood={onClickFood}
              compact
            />
          </ShelfArea>
          <BottomBins>
          </BottomBins>
        </Cabinet>

        <DoorZone side="right" items={rightDoorItems} onClickFood={onClickFood} />
      </FridgeShell>
    </Stage>
  );
}

export default FridgeBoard;

const Stage = styled.section`
  width: 100%;
  display: grid;
  place-items: center;
`;

const FridgeShell = styled.section`
  position: relative;
  width: min(940px, 100%);
  min-height: 578px;
  display: grid;
  grid-template-columns: minmax(132px, 0.28fr) minmax(360px, 1fr) minmax(132px, 0.28fr);
  align-items: start;
  filter: drop-shadow(0 22px 22px rgba(33, 43, 48, 0.18));

  @media (max-width: 760px) {
    width: min(560px, 100%);
    min-height: 390px;
    grid-template-columns: 82px minmax(240px, 1fr) 82px;
  }
`;

const Door = styled.aside`
  position: relative;
  z-index: 1;
  height: 488px;
  margin-top: 46px;
  border: 6px solid #6f7d87;
  background: linear-gradient(100deg, #c7d0d7 0%, #f4f7fa 30%, #d9e1e7 100%);
  border-radius: ${(props) => (props.$side === "left" ? "17px 7px 7px 17px" : "7px 17px 17px 7px")};
  box-shadow:
    inset 0 0 0 8px rgba(255, 255, 255, 0.42),
    inset ${(props) => (props.$side === "left" ? "-16px" : "16px")} 0 18px rgba(87, 101, 111, 0.15);
  padding: 68px 20px 22px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 18px;
    right: 18px;
    height: 9px;
    border-radius: 5px;
    background: linear-gradient(180deg, #eef2f5 0%, #cbd5dc 100%);
    border: 1px solid #b5c0c8;
    box-shadow: 0 5px 8px rgba(82, 96, 105, 0.12);
  }

  &::before {
    top: 42px;
  }

  &::after {
    bottom: 18px;
  }

  @media (max-width: 760px) {
    height: 300px;
    margin-top: 34px;
    border-width: 5px;
    padding: 48px 8px 14px;

    &::before,
    &::after {
      left: 8px;
      right: 8px;
    }

    &::before {
      top: 34px;
    }

    &::after {
      bottom: 14px;
    }
  }
`;

const DoorSlotFrame = styled.div`
  height: 326px;

  @media (max-width: 760px) {
    height: 184px;
  }
`;

const Cabinet = styled.section`
  position: relative;
  z-index: 2;
  height: 540px;
  border: 8px solid #697780;
  border-radius: 15px;
  background: linear-gradient(180deg, #c4ced6 0%, #aebbc5 100%);
  box-shadow:
    inset 0 0 0 9px rgba(255, 255, 255, 0.24),
    inset 0 -12px 18px rgba(65, 78, 88, 0.16);
  padding: 34px 24px 88px;

  @media (max-width: 760px) {
    height: 360px;
    border-width: 7px;
    padding: 24px 14px 64px;
  }
`;

const BackPanel = styled.div`
  position: absolute;
  inset: 32px 38px 90px;
  border-radius: 10px;
  border: 2px solid rgba(115, 129, 139, 0.4);
  background:
    linear-gradient(
      90deg,
      transparent 32%,
      rgba(113, 127, 138, 0.26) 32% 33%,
      transparent 33% 66%,
      rgba(113, 127, 138, 0.26) 66% 67%,
      transparent 67%
    ),
    linear-gradient(180deg, #bfc9d1 0%, #d7e0e6 100%);

  @media (max-width: 760px) {
    inset: 24px 24px 68px;
  }
`;

const Shelf = styled.div`
  position: absolute;
  left: 24px;
  right: 24px;
  top: ${(props) => props.$top};
  height: 12px;
  border-radius: 4px;
  border: 1px solid rgba(130, 145, 155, 0.55);
  background: linear-gradient(180deg, #eef4f7 0%, #c8d2da 100%);
  box-shadow: 0 5px 0 rgba(255, 255, 255, 0.35);

  @media (max-width: 760px) {
    left: 18px;
    right: 18px;
    top: calc(${(props) => props.$top} * 0.82);
    height: 10px;
  }
`;

const ShelfArea = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
`;

const BottomBins = styled.div`
  position: absolute;
  left: 32px;
  right: 32px;
  bottom: 16px;
  height: 78px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 760px) {
    left: 20px;
    right: 20px;
    height: 54px;
  }
`;
