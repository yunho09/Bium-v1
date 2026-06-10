/*
 * 식재료를 수정하는 모달이다.
 * 냉장고 안의 재료는 이름, 유통기한, 아이콘과 이동/삭제를 지원하고,
 * 쇼핑백 재료는 유통기한만 수정한다.
 */
import { useEffect, useState } from "react";
import styled from "@emotion/styled";

function formatToday() {
  return new Date().toISOString().slice(0, 10);
}

function FoodModal({ open, initialValue, onClose, onSave, onDelete, onMoveToShoppingBag }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🥕");
  const [expiresAt, setExpiresAt] = useState(formatToday());

  const isShoppingBagFood = initialValue?.zoneKey === "shoppingBag";

  useEffect(() => {
    if (!open || !initialValue) return;

    setName(initialValue.name || "");
    setIcon(initialValue.icon || "🥕");
    setExpiresAt(initialValue.expiresAt || formatToday());
  }, [open, initialValue]);

  if (!open || !initialValue) return null;

  const submit = (event) => {
    event.preventDefault();
    if (!expiresAt || (!isShoppingBagFood && !name.trim())) return;

    onSave({
      id: initialValue.id,
      name: isShoppingBagFood ? initialValue.name : name.trim(),
      icon: isShoppingBagFood ? initialValue.icon : icon || "🥕",
      zoneKey: initialValue.zoneKey,
      expiresAt,
    });
  };

  const deleteFood = () => {
    if (!window.confirm(`${initialValue.name}을(를) 삭제할까요?`)) return;
    onDelete(initialValue.id);
  };

  return (
    <Backdrop role="presentation" onClick={onClose}>
      <ModalCard role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <Heading>{isShoppingBagFood ? `${initialValue.name} 유통기한 수정` : "식재료 수정"}</Heading>

        <Form onSubmit={submit}>
          {!isShoppingBagFood && (
            <>
              <Label>
                이름
                <Field
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="예: 닭가슴살"
                  maxLength={30}
                  required
                />
              </Label>

              <Label>
                아이콘
                <Field
                  value={icon}
                  onChange={(event) => setIcon(event.target.value)}
                  placeholder="예: 🥕"
                  maxLength={2}
                />
              </Label>
            </>
          )}

          <Label>
            유통기한
            <Field type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} required />
          </Label>

          {!isShoppingBagFood && (
            <UtilityActions>
              <Button type="button" onClick={() => onMoveToShoppingBag(initialValue)}>
                장본 음식으로 이동
              </Button>
              <Button type="button" $danger onClick={deleteFood}>
                삭제
              </Button>
            </UtilityActions>
          )}

          <Actions>
            <Button type="button" onClick={onClose}>
              닫기
            </Button>
            <Button type="submit" $primary>
              저장
            </Button>
          </Actions>
        </Form>
      </ModalCard>
    </Backdrop>
  );
}

export default FoodModal;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  padding: 16px;
`;

const ModalCard = styled.div`
  width: min(460px, 100%);
  background: var(--surface);
  border-radius: 24px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  padding: 24px;
  animation: popIn 0.24s ease;

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const Heading = styled.h3`
  font-size: 24px;
  font-weight: 540;
  letter-spacing: -0.26px;
  color: var(--text);
`;

const Form = styled.form`
  margin-top: 14px;
  display: grid;
  gap: 11px;
`;

const Label = styled.label`
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 540;
  color: var(--text);
`;

const Field = styled.input`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 16px;
  background: var(--surface);
  outline-color: var(--text);
`;

const UtilityActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

const Actions = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  border: 0;
  background: ${(props) => {
    if (props.$danger) return "#f1e4e1";
    if (props.$primary) return "var(--text)";
    return "var(--surface-soft)";
  }};
  color: ${(props) => (props.$primary ? "var(--surface)" : "var(--text)")};
  font-weight: 480;
  border-radius: 50px;
  padding: 10px 18px;
  cursor: pointer;
`;
