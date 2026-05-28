/*
 * 식재료를 추가하거나 수정하는 모달이다.
 * 프리셋 선택, 직접 입력, 커스텀 프리셋 추가를 모두 지원한다.
 */
import { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { getDateAfter } from "../../store/useFridgeStore";

const iconCandidates = ["🥚", "🥛", "🍞", "🧈", "🥬", "🍌", "🧅", "🥔", "🥟", "🍤", "🍎", "🍗"];

const zoneOptions = [
  { key: "shoppingBag", label: "쇼핑백" },
  { key: "leftDoor", label: "왼쪽 문" },
  { key: "rightDoor", label: "오른쪽 문" },
  { key: "pantry", label: "실온" },
  { key: "fridge", label: "냉장" },
  { key: "freezer", label: "냉동" },
];

function formatToday() {
  return new Date().toISOString().slice(0, 10);
}

function FoodModal({ open, mode, initialValue, presets, onAddPreset, onClose, onSave }) {
  const [presetQuery, setPresetQuery] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🥕");
  const [zoneKey, setZoneKey] = useState("shoppingBag");
  const [expiresAt, setExpiresAt] = useState(formatToday());

  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("🥕");
  const [customDays, setCustomDays] = useState(7);

  const filteredPresets = useMemo(() => {
    const query = presetQuery.trim().toLowerCase();
    if (!query) return presets;
    return presets.filter((preset) => preset.name.toLowerCase().includes(query));
  }, [presetQuery, presets]);

  useEffect(() => {
    // 모달이 열릴 때마다 입력값을 현재 편집 대상에 맞게 다시 맞춘다.
    if (!open) return;

    setPresetQuery("");
    setSelectedPresetId("");

    if (initialValue) {
      setName(initialValue.name || "");
      setIcon(initialValue.icon || "🥕");
      setZoneKey(initialValue.zoneKey || "shoppingBag");
      setExpiresAt(initialValue.expiresAt || formatToday());
      return;
    }

    setName("");
    setIcon("🥕");
    setZoneKey("shoppingBag");
    setExpiresAt(formatToday());
  }, [open, initialValue]);

  if (!open) return null;

  const applyPreset = (preset) => {
    // 프리셋을 고르면 이름과 유통기한이 자동으로 채워진다.
    setSelectedPresetId(preset.id);
    setName(preset.name);
    setIcon(preset.icon);
    setExpiresAt(getDateAfter(preset.shelfLifeDays));
  };

  const handleAddCustomPreset = () => {
    if (!customName.trim() || Number(customDays) <= 0) return;

    // 사용자가 만든 프리셋은 스토어에 추가한 뒤 바로 선택 상태로 연결한다.
    const created = onAddPreset({
      name: customName.trim(),
      icon: customIcon || "🥕",
      shelfLifeDays: Number(customDays),
    });

    applyPreset(created);
    setCustomName("");
    setCustomIcon("🥕");
    setCustomDays(7);
  };

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    // 편집 모드에서는 기존 항목을 유지하고 값만 갱신한다.
    onSave({
      id: initialValue?.id,
      name: name.trim(),
      icon,
      zoneKey,
      expiresAt,
    });
  };

  return (
    <Backdrop role="presentation" onClick={onClose}>
      <ModalCard role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <Heading>{mode === "edit" ? "식재료 수정" : "식재료 빠른 등록"}</Heading>
        <SubText>프리셋을 고르면 유통기한이 자동 계산되고, 필요하면 직접 수정할 수 있어요.</SubText>

        <Form onSubmit={submit}>
          <PresetBox>
            <Label>
              프리셋 검색
              <Field
                value={presetQuery}
                onChange={(event) => setPresetQuery(event.target.value)}
                placeholder="예: 계란, 우유"
              />
            </Label>

            <PresetList>
              {filteredPresets.map((preset) => (
                <PresetButton
                  key={preset.id}
                  type="button"
                  $active={selectedPresetId === preset.id}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.icon} {preset.name} ({preset.shelfLifeDays}일)
                </PresetButton>
              ))}
            </PresetList>
          </PresetBox>

          <Row>
            <Label>
              식재료 이름
              <Field
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="예: 닭가슴살"
                maxLength={30}
                required
              />
            </Label>

            <Label>
              보관 구역
              <Select value={zoneKey} onChange={(event) => setZoneKey(event.target.value)}>
                {zoneOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Label>
          </Row>

          <Label>
            유통기한 (자동 입력 후 수정 가능)
            <Field type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} required />
          </Label>

          <Label>
            아이콘 선택
            <IconPicker>
              {iconCandidates.map((candidate) => (
                <IconButton
                  key={candidate}
                  type="button"
                  $active={icon === candidate}
                  onClick={() => setIcon(candidate)}
                >
                  {candidate}
                </IconButton>
              ))}
            </IconPicker>
          </Label>

          <Divider />

          <Row>
            <Label>
              나만의 재료 이름
              <Field
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="예: 그릭요거트"
              />
            </Label>

            <Label>
              기본 유통기한(일)
              <Field type="number" min={1} value={customDays} onChange={(event) => setCustomDays(event.target.value)} />
            </Label>
          </Row>

          <Row>
            <Label>
              커스텀 아이콘
              <Field
                value={customIcon}
                onChange={(event) => setCustomIcon(event.target.value || "🥕")}
                placeholder="예: 🥣"
                maxLength={2}
              />
            </Label>

            <div style={{ display: "flex", alignItems: "end" }}>
              <Button type="button" onClick={handleAddCustomPreset} style={{ width: "100%" }}>
                나만의 재료 프리셋 추가
              </Button>
            </div>
          </Row>

          <Actions>
            <Button type="button" onClick={onClose}>
              취소
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
  width: min(560px, 100%);
  max-height: min(88vh, 860px);
  overflow: auto;
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
  font-size: 26px;
  font-weight: 540;
  letter-spacing: -0.26px;
  color: var(--text);
`;

const SubText = styled.p`
  margin-top: 6px;
  font-size: 16px;
  font-weight: 330;
  color: var(--text);
`;

const Form = styled.form`
  margin-top: 16px;
  display: grid;
  gap: 12px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: grid;
  gap: 6px;
  font-size: 14px;
  font-weight: 540;
  color: var(--text);
`;

const Field = styled.input`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 16px;
  background: var(--surface);

  &:focus {
    border-color: var(--text);
    outline: none;
  }
`;

const Select = styled.select`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 16px;
  background: var(--surface);

  &:focus {
    border-color: var(--text);
    outline: none;
  }
`;

const PresetBox = styled.div`
  border: 0;
  border-radius: 24px;
  background: var(--block-cream);
  padding: 16px;
  display: grid;
  gap: 10px;
`;

const PresetList = styled.div`
  max-height: 150px;
  overflow: auto;
  display: grid;
  gap: 6px;
`;

const PresetButton = styled.button`
  border: 1px solid ${(props) => (props.$active ? "var(--text)" : "var(--border)")};
  background: ${(props) => (props.$active ? "var(--text)" : "var(--surface)")};
  color: ${(props) => (props.$active ? "var(--surface)" : "var(--text)")};
  border-radius: 50px;
  padding: 8px 12px;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 480;
`;

const IconPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const IconButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid ${(props) => (props.$active ? "var(--text)" : "var(--border)")};
  background: ${(props) => (props.$active ? "var(--block-lime)" : "var(--surface)")};
  cursor: pointer;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border);
  margin: 4px 0;
`;

const Actions = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  border: 0;
  background: ${(props) => (props.$primary ? "var(--text)" : "var(--surface-soft)")};
  color: ${(props) => (props.$primary ? "var(--surface)" : "var(--text)")};
  font-weight: 480;
  border-radius: 50px;
  padding: 10px 18px;
  cursor: pointer;
`;
