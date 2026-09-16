import { describe, expect, it } from "vitest";

import {
  fromContractAmount,
  toContractAmount,
} from "../src/amounts.js";

describe("toContractAmount", () => {
  it("converts whole units with default 7 decimals", () => {
    expect(toContractAmount("1")).toBe(10_000_000n);
    expect(toContractAmount(1)).toBe(10_000_000n);
  });

  it("converts fractional amounts without floating point drift", () => {
    expect(toContractAmount("1.5", 7)).toBe(15_000_000n);
    expect(toContractAmount("0.0000001", 7)).toBe(1n);
    expect(toContractAmount("123.4567890", 7)).toBe(1_234_567_890n);
  });

  it("supports custom decimals", () => {
    expect(toContractAmount("1.23", 2)).toBe(123n);
    expect(toContractAmount("1", 0)).toBe(1n);
  });

  it("supports negative amounts", () => {
    expect(toContractAmount("-2.5", 7)).toBe(-25_000_000n);
  });

  it("treats bigint as already-human whole units scaled by decimals", () => {
    expect(toContractAmount(2n, 7)).toBe(20_000_000n);
  });

  it("rejects excess fractional digits", () => {
    expect(() => toContractAmount("1.12345678", 7)).toThrow(/fractional/);
  });

  it("rejects invalid input", () => {
    expect(() => toContractAmount("abc")).toThrow(/invalid amount/);
    expect(() => toContractAmount(Number.NaN)).toThrow();
  });
});

describe("fromContractAmount", () => {
  it("formats contract units as decimal strings", () => {
    expect(fromContractAmount(15_000_000n, 7)).toBe("1.5");
    expect(fromContractAmount(1n, 7)).toBe("0.0000001");
    expect(fromContractAmount(10_000_000n, 7)).toBe("1");
  });

  it("trims trailing fractional zeros", () => {
    expect(fromContractAmount(12_000_000n, 7)).toBe("1.2");
  });

  it("handles negatives and zero decimals", () => {
    expect(fromContractAmount(-25_000_000n, 7)).toBe("-2.5");
    expect(fromContractAmount(42n, 0)).toBe("42");
  });

  it("round-trips with toContractAmount", () => {
    const human = "9876543.2109876";
    const contract = toContractAmount(human, 7);
    expect(fromContractAmount(contract, 7)).toBe(human);
  });
});
