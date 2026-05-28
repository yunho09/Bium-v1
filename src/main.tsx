/*
 * React 앱의 시작점이다.
 * 전역 스타일을 적용한 뒤 App 컴포넌트를 루트에 렌더링한다.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import GlobalStyle from "./styles/GlobalStyle.jsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyle />
    <App />
  </StrictMode>,
);
