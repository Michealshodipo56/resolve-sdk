import { describe, expect, it } from "vitest";

import { ResolveClient, mapMarket } from "../src/client.js";
import { MarketStatus, Outcome, Side } from "../src/types.js";
import { ResolveErrorCode, parseResolveError } from "../src/errors.js";

const FAKE_CONTRACT =
  "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFCT4";

describe("ResolveClient method surface", () => {
  it("exposes all required write and read methods", () => {
    const client = new ResolveClient({
      networkPassphrase: "Test SDF Network ; September 2015",
      rpcUrl: "https://soroban-testnet.stellar.org",
      contractId: FAKE_CONTRACT,
      publicKey: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    });

    for (const method of [
      "createMarket",
      "stake",
      "stakeYes",
      "stakeNo",
      "resolveMarket",
      "invalidateMarket",
      "claim",
      "getMarket",
      "getPosition",
      "getClaimable",
      "getNextMarketId",
    ] as const) {
      expect(typeof client[method]).toBe("function");
    }
  });
});

describe("mapMarket does not invent balances", () => {
  it("requires pool fields from RPC payload", () => {
    expect(() =>
      mapMarket({
        id: 1n,
        creator: "G1",
        resolver: "G2",
        question: "Q",
        description: "",
        token: "CT",
        created_at: 1n,
        close_at: 2n,
        resolution_timeout: 3600n,
        // yes_pool / no_pool intentionally omitted
        status: "Open",
        outcome: null,
        finalized_at: null,
      }),
    ).toThrow();
  });

  it("preserves exact pool values from payload", () => {
    const market = mapMarket({
      id: 1n,
      creator: "G1",
      resolver: "G2",
      question: "Q",
      description: "",
      token: "CT",
      created_at: 1n,
      close_at: 2n,
      resolution_timeout: 3600n,
      yes_pool: 777n,
      no_pool: 333n,
      status: "Resolved",
      outcome: "Yes",
      finalized_at: 9n,
    });
    expect(market.yesPool).toBe(777n);
    expect(market.noPool).toBe(333n);
    expect(market.status).toBe(MarketStatus.Resolved);
    expect(market.outcome).toBe(Outcome.Yes);
  });
});

describe("parseResolveError with client-shaped failures", () => {
  it("normalizes simulated contract failures", () => {
    const err = parseResolveError({
      message: "Uncaught Error(Contract, #2)",
      code: "SimulateError",
    });
    expect(err?.code).toBe(ResolveErrorCode.MARKET_CLOSED);
  });
});

describe("Side discriminant values", () => {
  it("matches the on-chain u32 enum", () => {
    expect(Side.Yes).toBe(0);
    expect(Side.No).toBe(1);
    expect(Outcome.Invalid).toBe(2);
  });
});
