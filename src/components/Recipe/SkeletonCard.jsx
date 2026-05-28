/*
 * 레시피 로딩 중 표시하는 스켈레톤 카드다.
 * 실제 카드와 비슷한 형태로 기다리는 상태를 자연스럽게 보여준다.
 */
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

function SkeletonCard() {
  return (
    <Wrapper aria-hidden="true">
      <Bar $height="205px" $mb="15px" />
      <Bar $width="68%" />
      <Bar $width="44%" />
      <Bar $width="78%" $mb="0" />
    </Wrapper>
  );
}

export default SkeletonCard;

const shimmer = keyframes`
  0% { background-position: -220px 0; }
  100% { background-position: 220px 0; }
`;

const Wrapper = styled.article`
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 0 0 17px;
  overflow: hidden;
  box-shadow: none;
`;

const Bar = styled.div`
  height: ${(props) => props.$height || "14px"};
  width: ${(props) => props.$width || "100%"};
  border-radius: ${(props) => (props.$height ? "0" : "10px")};
  margin: ${(props) => (props.$height ? `0 0 ${props.$mb || "10px"}` : `0 16px ${props.$mb || "10px"}`)};
  background: linear-gradient(90deg, #eeeeee 25%, #f7f7f5 50%, #eeeeee 75%);
  background-size: 220px 100%;
  animation: ${shimmer} 1.4s infinite;
`;
