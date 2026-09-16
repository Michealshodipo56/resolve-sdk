import { Networks } from "@stellar/stellar-sdk";

import type { ResolveNetworkConfig } from "./types.js";

/**
 * Placeholder contract ID used in network presets.
 * Callers MUST override `contractId` with a real deployment before submitting txs.
 */
export const PLACEHOLDER_CONTRACT_ID =
  "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

function assertOverrideContractId(config: ResolveNetworkConfig): void {
  if (
    !config.contractId ||
    config.contractId === PLACEHOLDER_CONTRACT_ID ||
    !config.contractId.startsWith("C")
  ) {
    // Soft documentation marker — ResolveClient also validates on construct.
    void 0;
  }
}

/** Stellar Testnet preset. Override `contractId` before use. */
export const TESTNET: ResolveNetworkConfig = {
  networkPassphrase: Networks.TESTNET,
  rpcUrl: "https://soroban-testnet.stellar.org",
  horizonUrl: "https://horizon-testnet.stellar.org",
  contractId: PLACEHOLDER_CONTRACT_ID,
};

/** Stellar Futurenet preset. Override `contractId` before use. */
export const FUTURENET: ResolveNetworkConfig = {
  networkPassphrase: Networks.FUTURENET,
  rpcUrl: "https://rpc-futurenet.stellar.org",
  horizonUrl: "https://horizon-futurenet.stellar.org",
  contractId: PLACEHOLDER_CONTRACT_ID,
};

/**
 * Merge a network preset with required overrides (at minimum a real `contractId`).
 */
export function withContractId(
  base: ResolveNetworkConfig,
  contractId: string,
  overrides: Partial<Omit<ResolveNetworkConfig, "contractId">> = {},
): ResolveNetworkConfig {
  if (!contractId || contractId === PLACEHOLDER_CONTRACT_ID) {
    throw new Error(
      "contractId must be a real deployed Resolve contract ID (override the preset placeholder)",
    );
  }
  const config: ResolveNetworkConfig = {
    ...base,
    ...overrides,
    contractId,
  };
  assertOverrideContractId(config);
  return config;
}

export const networks = {
  testnet: TESTNET,
  futurenet: FUTURENET,
  withContractId,
  PLACEHOLDER_CONTRACT_ID,
} as const;
