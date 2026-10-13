import { expect, test } from "vitest";
import { paginateColumn } from "../../src/utils/paginateColumn";

test("pagination packs blocks and keeps continuous ranges", () => {
  expect(paginateColumn([{ top: 10, bottom: 40 }, { top: 50, bottom: 90 }, { top: 110, bottom: 150 }], 100, 200, 5))
    .toStrictEqual([{ start: 0, end: 100 }, { start: 100, end: 155 }]);
  expect(paginateColumn([], 100, 200, 5)).toStrictEqual([]);
  expect(() => paginateColumn([], 0, 200, 5)).toThrow();
});

test("pagination preserves oversized, overlapping, and more than 4000 blocks", () => {
  expect(paginateColumn([{ top: 0, bottom: 200 }, { top: 50, bottom: 100 }], 100, 220, 5)).toStrictEqual([{ start: 0, end: 205 }]);
  const blocks = Array.from({ length: 4001 }, (_, index) => ({ top: index * 100, bottom: index * 100 + 80 }));
  const ranges = paginateColumn(blocks, 90, 400100, 5);
  expect(ranges).toHaveLength(4001);
  expect(ranges.at(-1)?.end).toBe(400085);
  expect(ranges.every((range, index) => index === 0 || range.start === ranges[index - 1].end)).toBe(true);
});
