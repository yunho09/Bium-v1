/*
 * 상단 고정 헤더다.
 * 서비스 브랜드와 주요 화면 이동 메뉴를 제공한다.
 */
import { BookOpen, Bot, Refrigerator } from "lucide-react";
import styled from "@emotion/styled";

const menus = [
  { id: "fridge", label: "내 냉장고", icon: Refrigerator },
  { id: "library", label: "식재료 도감", icon: BookOpen },
  { id: "recipe", label: "AI 레시피", icon: Bot },
];

function AppHeader({ activeMenu, onSelectMenu }) {
  return (
    <Header>
      <Brand>
        <LogoMark>▣</LogoMark>
        <h1>Bium</h1>
      </Brand>

      <Menu>
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <MenuButton
              key={menu.id}
              type="button"
              $active={activeMenu === menu.id}
              onClick={() => onSelectMenu(menu.id)}
            >
              <Icon size={16} />
              {menu.label}
            </MenuButton>
          );
        })}
      </Menu>

      <HeaderSpacer aria-hidden="true" />
    </Header>
  );
}

export default AppHeader;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  height: 56px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  padding: 0 max(32px, calc((100vw - 1280px) / 2));
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr) 170px;
  align-items: center;
  gap: 16px;
  overflow: hidden;

  @media (max-width: 760px) {
    height: 86px;
    padding: 8px 14px;
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.26px;
  }
`;

const LogoMark = styled.span`
  width: 23px;
  height: 23px;
  border-radius: 999px;
  background: var(--text);
  color: var(--surface);
  display: grid;
  place-items: center;
  font-size: 11px;
  line-height: 1;
`;

const Menu = styled.nav`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-width: 0;

  @media (max-width: 760px) {
    justify-content: flex-start;
    overflow-x: auto;
    gap: 16px;
  }
`;

const MenuButton = styled.button`
  height: 100%;
  border: 0;
  border-bottom: 2px solid ${(props) => (props.$active ? "var(--text)" : "transparent")};
  background: transparent;
  color: var(--text);
  font-size: 16px;
  font-weight: ${(props) => (props.$active ? 540 : 330)};
  padding: 0 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  &:hover {
    color: var(--text);
  }

  svg {
    color: currentColor;
  }

  @media (max-width: 760px) {
    height: 42px;
  }
`;

const HeaderSpacer = styled.div`
  @media (max-width: 760px) {
    display: none;
  }
`;
