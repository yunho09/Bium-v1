/*
 * 앱의 최상위 레이아웃을 담당한다.
 * 상단 헤더의 메뉴 선택에 따라 냉장고, 도감, 레시피 화면을 전환한다.
 */
import { useState } from "react";
import styled from "@emotion/styled";
import AppHeader from "./components/Layout/AppHeader";
import FridgePage from "./components/Fridge/FridgePage";
import RecipePage from "./components/Recipe/RecipePage";
import FoodLibraryPage from "./components/Library/FoodLibraryPage";

function App() {
  const [activeMenu, setActiveMenu] = useState("fridge");

  return (
    <Shell>
      <AppHeader activeMenu={activeMenu} onSelectMenu={setActiveMenu} />
      <Content>
        {activeMenu === "fridge" && <FridgePage />}
        {activeMenu === "library" && <FoodLibraryPage />}
        {activeMenu === "recipe" && <RecipePage />}
      </Content>
    </Shell>
  );
}

export default App;

const Shell = styled.main`
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  background: var(--bg);
`;

const Content = styled.section`
  align-self: start;
  width: min(1280px, calc(100% - 64px));
  margin: 0 auto;
  padding: 48px 0 72px;

  @media (max-width: 900px) {
    width: min(100% - 24px, 1120px);
    padding: 28px 0 48px;
  }
`;
