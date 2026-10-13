import { expect, test } from "vitest";
import { useConfirm } from "../../src/ui-state/useConfirm";

test("superseded confirmations settle and optional state does not leak", async () => {
  const request = { title: "Delete?", confirmLabel: "Delete", cancelLabel: "Cancel" };
  const first = useConfirm.getState().ask({ ...request, danger: true, message: "old" });
  const second = useConfirm.getState().ask(request);
  expect(await first).toBe(false);
  expect(useConfirm.getState().danger).toBe(false);
  expect(useConfirm.getState().message).toBeUndefined();
  useConfirm.getState().resolve(false);
  expect(await second).toBe(false);
  expect(useConfirm.getState().open).toBe(false);
});
