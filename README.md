# Bium

Bium은 1인 가구와 기숙사생을 위한 냉장고 관리 웹 앱입니다. 식재료를 2D 냉장고에 드래그 앤 드롭으로 정리하고, 유통기한이 임박한 재료를 시각적으로 확인한 뒤, 냉장고에 있는 재료를 바탕으로 Gemini AI 레시피를 생성합니다.

## 주요 기능

- 2D 가상 냉장고 기반 식재료 관리
- dnd-kit을 활용한 드래그 앤 드롭 이동
- Zustand 기반 전역 상태 관리
- localStorage를 통한 냉장고와 AI 레시피 결과 저장
- 유통기한 D-Day 계산 및 임박 재료 시각화
- Gemini API 기반 맞춤형 레시피 추천
- AI 응답 실패 시 에러 안내 표시

## 기술 스택

- React
- Vite
- Zustand
- dnd-kit
- Emotion
- Gemini API

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 실행되면 브라우저에서 안내되는 로컬 주소로 접속합니다.

## Gemini API 키 설정

AI 레시피 추천을 사용하려면 프로젝트 루트에 `.env.local` 파일을 만들고 Gemini API 키를 넣어야 합니다.

```env
VITE_GEMINI_API_KEY=발급받은_Gemini_API_KEY
VITE_GEMINI_MODEL=gemini-2.5-flash-lite
```

`.env.local`을 만든 뒤에는 개발 서버를 다시 실행해야 Vite가 환경변수를 읽습니다.

```bash
npm run dev
```

`.env.local`은 Git에 올리지 않습니다. API 키 예시는 `.env.example` 파일에서 확인할 수 있습니다.

## 빌드 및 검사

```bash
npm run lint
npm run build
```

## 프로젝트 구조

```txt
src/
  api/
    generateRecipes.js
  components/
    Fridge/
    Library/
    Recipe/
  store/
    fridgePresets.js
    useFridgeStore.js
    useRecipeStore.js
  styles/
    GlobalStyle.jsx
```

## AI 레시피 추천 흐름

1. 냉장고에 저장된 식재료와 유통기한을 불러옵니다.
2. 각 재료의 D-Day를 계산합니다.
3. 임박 재료 우선 여부를 프롬프트에 반영합니다.
4. Gemini API에 JSON 형식의 레시피 생성을 요청합니다.
5. 응답받은 레시피를 카드와 상세 화면에 렌더링합니다.
6. 실패하면 목데이터로 대체하지 않고 에러 메시지를 보여줍니다.
