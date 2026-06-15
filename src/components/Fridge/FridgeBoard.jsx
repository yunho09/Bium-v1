/*
 * 냉장고 본체와 양쪽 문을 시각적으로 조립하는 보드다.
 * 선택된 보관 구역에 따라 냉장실, 냉동실, 실온 보관의 분위기를 다르게 보여준다.
 */
import { memo } from "react";
import styled from "@emotion/styled";
import FridgeZone from "./FridgeZone";

function DoorZone({ side, items, onClickFood, onDeleteFood, zoneType }) {
  const title = side === "left" ? "왼쪽 문" : "오른쪽 문";
  const containerId = side === "left" ? "leftDoor" : "rightDoor";

  return (
    <Door $side={side} $zone={zoneType} aria-label={title}>
      <DoorSlotFrame>
        <FridgeZone
          containerId={containerId}
          icon=""
          title={title}
          subtitle=""
          items={items}
          onClickFood={onClickFood}
          onDeleteFood={onDeleteFood}
          compact
          door
          sortable={false}
        />
      </DoorSlotFrame>
    </Door>
  );
}

const MemoDoorZone = memo(DoorZone);

function FridgeBoard({ zone, leftDoorItems, rightDoorItems, onClickFood, onDeleteFood }) {
  return (
    <Stage>
      <FridgeShell $zone={zone.id}>
        <MemoDoorZone
          side="left"
          zoneType={zone.id}
          items={leftDoorItems}
          onClickFood={onClickFood}
          onDeleteFood={onDeleteFood}
        />

        <Cabinet $zone={zone.id}>
          <BackPanel $zone={zone.id} />
          <Shelf $zone={zone.id} $top="150px" />
          <Shelf $zone={zone.id} $top="270px" />
          <Shelf $zone={zone.id} $top="390px" />
          <ShelfArea>
            <FridgeZone
              containerId={zone.id}
              icon={zone.icon}
              title={zone.title}
              subtitle={zone.subtitle}
              items={zone.items}
              onClickFood={onClickFood}
              onDeleteFood={onDeleteFood}
              compact
            />
          </ShelfArea>
          <BottomBins>
            {zone.id !== "fridge" && (
              <>
                <Bin $zone={zone.id} />
                <Bin $zone={zone.id} />
              </>
            )}
          </BottomBins>
        </Cabinet>

        <MemoDoorZone
          side="right"
          zoneType={zone.id}
          items={rightDoorItems}
          onClickFood={onClickFood}
          onDeleteFood={onDeleteFood}
        />
      </FridgeShell>
    </Stage>
  );
}

export default memo(FridgeBoard);

const zoneTheme = {
  fridge: {
    shellShadow: "drop-shadow(0 22px 22px rgba(33, 43, 48, 0.18))",
    frame: "#697780",
    cabinet: "linear-gradient(180deg, #c4ced6 0%, #aebbc5 100%)",
    panelBorder: "rgba(115, 129, 139, 0.4)",
    panel: `
      linear-gradient(
        90deg,
        transparent 32%,
        rgba(113, 127, 138, 0.26) 32% 33%,
        transparent 33% 66%,
        rgba(113, 127, 138, 0.26) 66% 67%,
        transparent 67%
      ),
      linear-gradient(180deg, #bfc9d1 0%, #d7e0e6 100%)
    `,
    shelfBorder: "rgba(130, 145, 155, 0.55)",
    shelf: "linear-gradient(180deg, #eef4f7 0%, #c8d2da 100%)",
    badge: "#eff6f1",
    badgeBorder: "#9fb0a4",
    binBorder: "rgba(105, 119, 128, 0.42)",
    bin: "rgba(255, 255, 255, 0.28)",
    door: "linear-gradient(100deg, #c7d0d7 0%, #f4f7fa 30%, #d9e1e7 100%)",
  },
  freezer: {
    shellShadow: "drop-shadow(0 24px 24px rgba(38, 95, 132, 0.2))",
    frame: "#4f82a0",
    cabinet: "linear-gradient(180deg, #d7edf6 0%, #9fc8dd 100%)",
    panelBorder: "rgba(73, 129, 160, 0.42)",
    panel: `
      radial-gradient(circle at 18% 18%, rgba(255,255,255,0.84) 0 2px, transparent 3px),
      radial-gradient(circle at 70% 36%, rgba(255,255,255,0.72) 0 2px, transparent 3px),
      linear-gradient(180deg, #c9e8f6 0%, #edf9ff 100%)
    `,
    shelfBorder: "rgba(84, 143, 176, 0.58)",
    shelf: "linear-gradient(180deg, #f7fcff 0%, #b4d9ea 100%)",
    badge: "#e8f7ff",
    badgeBorder: "#95bfd5",
    binBorder: "rgba(71, 130, 162, 0.45)",
    bin: "rgba(232, 247, 255, 0.5)",
    door: "linear-gradient(100deg, #b6d7e9 0%, #f4fbff 32%, #c3e1ef 100%)",
  },
  pantry: {
    shellShadow: "drop-shadow(0 22px 22px rgba(111, 82, 43, 0.2))",
    frame: "#9b7a50",
    cabinet: "linear-gradient(180deg, #d9b987 0%, #b58e5c 100%)",
    panelBorder: "rgba(130, 87, 39, 0.38)",
    panel: `
      repeating-linear-gradient(90deg, rgba(137, 91, 42, 0.12) 0 12px, transparent 12px 24px),
      linear-gradient(180deg, #d7b581 0%, #f2dfbd 100%)
    `,
    shelfBorder: "rgba(133, 86, 38, 0.5)",
    shelf: "linear-gradient(180deg, #f3d7a5 0%, #a9783d 100%)",
    badge: "#fff1d8",
    badgeBorder: "#bf9255",
    binBorder: "rgba(120, 78, 35, 0.48)",
    bin: "rgba(255, 236, 196, 0.42)",
    door: "linear-gradient(100deg, #bd9460 0%, #f0d8b1 34%, #c49c69 100%)",
  },
};

function getTheme(zone) {
  return zoneTheme[zone] || zoneTheme.fridge;
}

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
  filter: ${(props) => getTheme(props.$zone).shellShadow};

  @media (max-width: 760px) {
    width: min(560px, 100%);
    min-height: 390px;
    grid-template-columns: 64px minmax(0, 1fr) 64px;
  }
`;

const Door = styled.aside`
  position: relative;
  z-index: 1;
  height: 488px;
  margin-top: 46px;
  border: 6px solid ${(props) => getTheme(props.$zone).frame};
  background: ${(props) => getTheme(props.$zone).door};
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
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(203, 213, 220, 0.82) 100%);
    border: 1px solid rgba(115, 128, 138, 0.42);
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
  border: 8px solid ${(props) => getTheme(props.$zone).frame};
  border-radius: 15px;
  background: ${(props) => getTheme(props.$zone).cabinet};
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
  border: 2px solid ${(props) => getTheme(props.$zone).panelBorder};
  background: ${(props) => getTheme(props.$zone).panel};

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
  border: 1px solid ${(props) => getTheme(props.$zone).shelfBorder};
  background: ${(props) => getTheme(props.$zone).shelf};
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

const Bin = styled.div`
  border-radius: 10px 10px 14px 14px;
  border: 1px solid ${(props) => getTheme(props.$zone).binBorder};
  background: ${(props) => getTheme(props.$zone).bin};
`;
