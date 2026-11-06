import assert from "node:assert/strict";
import { mock, test } from "node:test";
import useModalStore from "./modalStore";

const m = (title: string) => ({ type: "alert" as const, title });
const reset = () => useModalStore.getState().clearModalQueue();

test("modal đầu hiện ngay, modal sau xếp hàng", () => {
  reset();
  const s = useModalStore.getState();
  s.addModal(m("a"));
  s.addModal(m("b"));
  s.addModal(m("c"));
  const st = useModalStore.getState();
  assert.equal(st.currentModal?.title, "a");
  assert.deepEqual(st.modalQueue.map((x) => x.title), ["b", "c"]);
});

test("đóng modal: hiện modal kế tiếp sau độ trễ animation, theo đúng thứ tự", () => {
  reset();
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const s = useModalStore.getState();
    s.addModal(m("a"));
    s.addModal(m("b"));
    s.addModal(m("c"));
    s.closeCurrentModal();
    assert.equal(useModalStore.getState().currentModal, null); // đang chạy animation đóng
    mock.timers.tick(500);
    assert.equal(useModalStore.getState().currentModal?.title, "b");
    useModalStore.getState().closeCurrentModal();
    mock.timers.tick(500);
    assert.equal(useModalStore.getState().currentModal?.title, "c");
    useModalStore.getState().closeCurrentModal();
    mock.timers.tick(500);
    assert.equal(useModalStore.getState().currentModal, null);
    assert.equal(useModalStore.getState().modalQueue.length, 0);
  } finally {
    mock.timers.reset();
  }
});

test("modal thêm vào lúc đang đóng không bị mất", () => {
  reset();
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const s = useModalStore.getState();
    s.addModal(m("a"));
    s.addModal(m("b"));
    s.closeCurrentModal();
    useModalStore.getState().addModal(m("c")); // currentModal đang null → hiện luôn, b đợi
    mock.timers.tick(500);
    const st = useModalStore.getState();
    const seen = [st.currentModal?.title, ...st.modalQueue.map((x) => x.title)].sort();
    assert.deepEqual(seen, ["b", "c"]);
  } finally {
    mock.timers.reset();
  }
});

test("clearModalQueue bỏ cả hàng đợi", () => {
  reset();
  const s = useModalStore.getState();
  s.addModal(m("a"));
  s.addModal(m("b"));
  s.clearModalQueue();
  assert.equal(useModalStore.getState().currentModal, null);
  assert.equal(useModalStore.getState().modalQueue.length, 0);
});
