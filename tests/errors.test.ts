import { describe, expect, it } from "vitest";

import {
  parseResolveError,
  ResolveError,
  ResolveErrorCode,
  RESOLVE_ERROR_NUMBERS,
  resolveErrorCodeFromNumber,
  resolveErrorTypes,
} from "../src/errors.js";

describe("ResolveErrorCode mapping", () => {
  it("maps contract codes 1–18 exactly", () => {
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.MARKET_NOT_FOUND]).toBe(1);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.MARKET_CLOSED]).toBe(2);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.MARKET_NOT_RESOLVED]).toBe(3);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.INVALID_OUTCOME]).toBe(4);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.UNAUTHORIZED_RESOLVER]).toBe(5);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.ALREADY_RESOLVED]).toBe(6);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.ALREADY_CLAIMED]).toBe(7);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.NOT_WINNER]).toBe(8);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.NOT_REFUNDABLE]).toBe(9);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.INVALID_AMOUNT]).toBe(10);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.DEADLINE_NOT_REACHED]).toBe(11);
    expect(
      RESOLVE_ERROR_NUMBERS[ResolveErrorCode.RESOLUTION_TIMEOUT_NOT_REACHED],
    ).toBe(12);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.INVALID_SIDE]).toBe(13);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.INVALID_MARKET_CONFIG]).toBe(
      14,
    );
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.INVALID_QUESTION]).toBe(15);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.OVERFLOW]).toBe(16);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.NO_POSITION]).toBe(17);
    expect(RESOLVE_ERROR_NUMBERS[ResolveErrorCode.MARKET_STILL_OPEN]).toBe(18);
  });

  it("resolves numbers back to codes", () => {
    expect(resolveErrorCodeFromNumber(1)).toBe(
      ResolveErrorCode.MARKET_NOT_FOUND,
    );
    expect(resolveErrorCodeFromNumber(18)).toBe(
      ResolveErrorCode.MARKET_STILL_OPEN,
    );
    expect(resolveErrorCodeFromNumber(99)).toBeNull();
  });

  it("builds AssembledTransaction errorTypes for all codes", () => {
    const types = resolveErrorTypes();
    expect(Object.keys(types)).toHaveLength(18);
    expect(types[1]?.message).toMatch(/not found/i);
  });
});

describe("parseResolveError", () => {
  it("passes through ResolveError instances", () => {
    const err = new ResolveError(ResolveErrorCode.ALREADY_CLAIMED);
    expect(parseResolveError(err)).toBe(err);
  });

  it("parses numeric codes", () => {
    const err = parseResolveError(10);
    expect(err?.code).toBe(ResolveErrorCode.INVALID_AMOUNT);
    expect(err?.contractCode).toBe(10);
  });

  it("parses Error(Contract, #N) host strings", () => {
    const err = parseResolveError(
      new Error("HostError: Error(Contract, #6)"),
    );
    expect(err?.code).toBe(ResolveErrorCode.ALREADY_RESOLVED);
  });

  it("parses named codes embedded in messages", () => {
    const err = parseResolveError("transaction failed: MARKET_STILL_OPEN");
    expect(err?.code).toBe(ResolveErrorCode.MARKET_STILL_OPEN);
  });

  it("parses nested simulation-style objects", () => {
    const err = parseResolveError({
      result: { error: { code: 17 } },
    });
    expect(err?.code).toBe(ResolveErrorCode.NO_POSITION);
  });

  it("returns null for unknown errors", () => {
    expect(parseResolveError(new Error("network timeout"))).toBeNull();
    expect(parseResolveError({ code: 999 })).toBeNull();
  });
});
