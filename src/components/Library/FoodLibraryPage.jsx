/*
 * 식재료 프리셋을 관리하는 도감 화면이다.
 * 검색, 카테고리 필터, 유통기한 수정, 쇼핑백 추가 기능을 제공한다.
 */
import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { Plus, Search, Settings, ShoppingBag, Trash2 } from "lucide-react";
import { useFridgeStore } from "../../store/useFridgeStore";

const categories = [
  { id: "all", label: "전체" },
  { id: "vegetable", label: "채소" },
  { id: "meat", label: "육류" },
  { id: "dairy", label: "유제품" },
  { id: "fruit", label: "과일" },
  { id: "etc", label: "기타" },
];

function FoodLibraryPage() {
  const zones = useFridgeStore((state) => state.zones);
  const presets = useFridgeStore((state) => state.presets);
  const updatePresetShelfLife = useFridgeStore((state) => state.updatePresetShelfLife);
  const addPresetToShoppingBag = useFridgeStore((state) => state.addPresetToShoppingBag);
  const addCustomPreset = useFridgeStore((state) => state.addCustomPreset);
  const removeFood = useFridgeStore((state) => state.removeFood);

  const [editingPresetId, setEditingPresetId] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === editingPresetId),
    [editingPresetId, presets],
  );

  const filteredPresets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return presets.filter((preset) => {
      const matchesCategory = category === "all" || (preset.category || "etc") === category;
      const matchesQuery = !normalized || preset.name.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, presets, query]);

  const [editDays, setEditDays] = useState(selectedPreset?.shelfLifeDays || 7);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🥕");
  const [newDays, setNewDays] = useState(7);
  const [newCategory, setNewCategory] = useState("vegetable");

  const openEditor = (preset) => {
    setEditingPresetId(preset.id);
    setEditDays(preset.shelfLifeDays);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingPresetId("");
  };

  const saveDays = (event) => {
    event.preventDefault();
    if (!selectedPreset) return;
    // 선택한 프리셋의 기본 보관 기간만 갱신한다.
    updatePresetShelfLife(selectedPreset.id, Number(editDays));
    closeEditor();
  };

  const createPreset = (event) => {
    event.preventDefault();
    if (!newName.trim()) return;

    // 도감에서 만든 프리셋은 즉시 목록에 반영하고 선택 상태를 옮긴다.
    addCustomPreset({
      name: newName.trim(),
      icon: newIcon || "🥕",
      shelfLifeDays: Number(newDays),
      category: newCategory,
    });

    setCreatorOpen(false);
    setNewName("");
    setNewIcon("🥕");
    setNewDays(7);
    setNewCategory("vegetable");
  };

  return (
    <Wrapper>
      <Toolbar>
        <SearchBox>
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="검색" />
        </SearchBox>

        <CategoryTabs aria-label="식재료 카테고리">
          {categories.map((item) => (
            <CategoryButton
              key={item.id}
              type="button"
              $active={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </CategoryButton>
          ))}
        </CategoryTabs>
      </Toolbar>

      <LibraryLayout>
        <MainColumn>
          <Grid>
            {filteredPresets.map((preset) => (
              <Card key={preset.id} $active={editorOpen && selectedPreset?.id === preset.id}>
                <CardTop>
                  <Icon>{preset.icon}</Icon>
                  <SettingsButton
                    type="button"
                    aria-label={`${preset.name} 유통기한 설정`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditor(preset);
                    }}
                  >
                    <Settings size={16} />
                  </SettingsButton>
                </CardTop>
                <Name>{preset.name}</Name>
                <AddToBag
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    addPresetToShoppingBag(preset.id);
                  }}
                >
                  <Plus size={16} /> 쇼핑백에 추가
                </AddToBag>
              </Card>
            ))}
          </Grid>

          <AddButton type="button" onClick={() => setCreatorOpen(true)}>
            새 식재료 추가
          </AddButton>
        </MainColumn>

        <ShoppingBagPanel>
          <BagHeader>
            <BagTitle>
              <ShoppingBag size={18} />
              쇼핑백
            </BagTitle>
            <BagCount>{zones.shoppingBag.length}</BagCount>
          </BagHeader>

          {zones.shoppingBag.length === 0 ? (
            <BagEmpty>아직 담긴 식재료가 없어요</BagEmpty>
          ) : (
            <BagList>
              {[...zones.shoppingBag].reverse().map((item) => (
                <BagItem key={item.id}>
                  <span>{item.icon}</span>
                  <strong>{item.name}</strong>
                  <BagDate>{item.expiresAt}</BagDate>
                  <BagRemoveButton
                    type="button"
                    aria-label={`${item.name} 쇼핑백에서 삭제`}
                    onClick={() => removeFood(item.id)}
                  >
                    <Trash2 size={14} />
                  </BagRemoveButton>
                </BagItem>
              ))}
            </BagList>
          )}
        </ShoppingBagPanel>
      </LibraryLayout>

      {editorOpen && selectedPreset && (
        <ModalBackdrop>
          <ModalCard>
            <h3>{selectedPreset.name} 기본 유통기한 수정</h3>
            <Form onSubmit={saveDays}>
              <Label>
                기본 유통기한(일)
                <Input type="number" min={1} value={editDays} onChange={(e) => setEditDays(e.target.value)} />
              </Label>
              <Actions>
                <Button type="button" onClick={closeEditor}>
                  닫기
                </Button>
                <Button type="submit" $primary>
                  저장
                </Button>
              </Actions>
            </Form>
          </ModalCard>
        </ModalBackdrop>
      )}

      {creatorOpen && (
        <ModalBackdrop>
          <ModalCard>
            <h3>나만의 식재료 추가</h3>
            <Form onSubmit={createPreset}>
              <Label>
                이름
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </Label>
              <Label>
                아이콘
                <Input value={newIcon} onChange={(e) => setNewIcon(e.target.value)} maxLength={2} />
              </Label>
              <Label>
                카테고리
                <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  {categories
                    .filter((item) => item.id !== "all")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                </Select>
              </Label>
              <Label>
                기본 유통기한(일)
                <Input type="number" min={1} value={newDays} onChange={(e) => setNewDays(e.target.value)} />
              </Label>
              <Actions>
                <Button type="button" onClick={() => setCreatorOpen(false)}>
                  닫기
                </Button>
                <Button type="submit" $primary>
                  <ShoppingBag size={15} /> 추가
                </Button>
              </Actions>
            </Form>
          </ModalCard>
        </ModalBackdrop>
      )}
    </Wrapper>
  );
}

export default FoodLibraryPage;

const Wrapper = styled.section`
  display: grid;
  align-content: start;
  gap: 24px;
`;

const Toolbar = styled.div`
  display: grid;
  gap: 16px;
  width: min(720px, 100%);
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  padding: 32px;

  @media (max-width: 760px) {
    border-radius: 0;
    margin-inline: -12px;
    padding: 24px;
  }
`;

const SearchBox = styled.label`
  min-height: 48px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  color: var(--text);

  input {
    border: 0;
    outline: 0;
    width: 100%;
    background: transparent;
    color: var(--text);
    font-size: 18px;
    font-weight: 320;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button`
  border: 0;
  border-radius: 50px;
  background: ${(props) => (props.$active ? "var(--text)" : "var(--surface)")};
  color: ${(props) => (props.$active ? "var(--surface)" : "var(--text)")};
  padding: 8px 18px 10px;
  font-size: 16px;
  font-weight: 480;
  cursor: pointer;
`;

const LibraryLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: start;
  gap: 24px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  display: grid;
  gap: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const ShoppingBagPanel = styled.aside`
  position: sticky;
  top: 80px;
  border-radius: 24px;
  background: var(--block-cream);
  padding: 22px;
  display: grid;
  gap: 16px;

  @media (max-width: 980px) {
    position: static;
  }
`;

const BagHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const BagTitle = styled.h3`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-size: 22px;
  font-weight: 540;
  letter-spacing: -0.14px;
`;

const BagCount = styled.span`
  min-width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--text);
  color: var(--surface);
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 480;
`;

const BagList = styled.ul`
  list-style: none;
  display: grid;
  gap: 8px;
  max-height: 420px;
  overflow: auto;
  padding-right: 2px;
`;

const BagItem = styled.li`
  min-height: 46px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 32px;
  align-items: center;
  column-gap: 8px;
  padding: 8px 10px;

  strong {
    min-width: 0;
    color: var(--text);
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const BagDate = styled.em`
  grid-column: 2;
  color: var(--text);
  font-size: 12px;
  font-style: normal;
  font-weight: 330;
`;

const BagRemoveButton = styled.button`
  grid-column: 3;
  grid-row: 1 / span 2;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text);
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover {
    background: var(--block-lilac);
  }
`;

const BagEmpty = styled.p`
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.62);
  padding: 18px;
  color: var(--text);
  font-size: 14px;
  font-weight: 330;
`;

const Card = styled.article`
  min-height: 156px;
  border: 1px solid ${(props) => (props.$active ? "var(--text)" : "var(--border)")};
  background: ${(props) => (props.$active ? "var(--block-mint)" : "var(--surface-soft)")};
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  display: grid;
  gap: 5px;
  box-shadow: none;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--text);
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Icon = styled.span`
  font-size: 28px;
  line-height: 1;
`;

const SettingsButton = styled.button`
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: var(--surface);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--text);

  &:hover {
    background: var(--block-lilac);
  }
`;

const Name = styled.strong`
  color: var(--text);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.14px;
`;

const AddToBag = styled.button`
  align-self: end;
  min-height: 36px;
  border: 0;
  border-radius: 50px;
  background: var(--text);
  color: var(--surface);
  font-size: 13px;
  font-weight: 480;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;

const AddButton = styled.button`
  justify-self: center;
  border: 0;
  background: var(--text);
  color: var(--surface);
  border-radius: 50px;
  padding: 10px 24px;
  font-size: 18px;
  font-weight: 480;
  cursor: pointer;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
`;

const ModalCard = styled.div`
  width: min(460px, 100%);
  border-radius: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  padding: 24px;

  h3 {
    color: var(--text);
    font-size: 24px;
    font-weight: 540;
    letter-spacing: -0.26px;
  }
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

const Input = styled.input`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  outline-color: var(--text);
`;

const Select = styled.select`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  outline-color: var(--text);
  background: var(--surface);
`;

const Actions = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  border: 0;
  border-radius: 50px;
  padding: 10px 18px;
  font-weight: 480;
  cursor: pointer;
  background: ${(props) => (props.$primary ? "var(--text)" : "var(--surface-soft)")};
  color: ${(props) => (props.$primary ? "var(--surface)" : "var(--text)")};
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;
