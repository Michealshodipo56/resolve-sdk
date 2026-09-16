/**
 * Contract error codes (1–18) and normalization helpers.
 */

/** Stable string identifiers for Resolve contract errors. */
export enum ResolveErrorCode {
  MARKET_NOT_FOUND = "MARKET_NOT_FOUND",
  MARKET_CLOSED = "MARKET_CLOSED",
  MARKET_NOT_RESOLVED = "MARKET_NOT_RESOLVED",
  INVALID_OUTCOME = "INVALID_OUTCOME",
  UNAUTHORIZED_RESOLVER = "UNAUTHORIZED_RESOLVER",
  ALREADY_RESOLVED = "ALREADY_RESOLVED",
  ALREADY_CLAIMED = "ALREADY_CLAIMED",
  NOT_WINNER = "NOT_WINNER",
  NOT_REFUNDABLE = "NOT_REFUNDABLE",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  DEADLINE_NOT_REACHED = "DEADLINE_NOT_REACHED",
  RESOLUTION_TIMEOUT_NOT_REACHED = "RESOLUTION_TIMEOUT_NOT_REACHED",
  INVALID_SIDE = "INVALID_SIDE",
  INVALID_MARKET_CONFIG = "INVALID_MARKET_CONFIG",
  INVALID_QUESTION = "INVALID_QUESTION",
  OVERFLOW = "OVERFLOW",
  NO_POSITION = "NO_POSITION",
  MARKET_STILL_OPEN = "MARKET_STILL_OPEN",
}

/** Numeric contract error values matching `Error` in the Soroban contract. */
export const RESOLVE_ERROR_NUMBERS: Record<ResolveErrorCode, number> = {
  [ResolveErrorCode.MARKET_NOT_FOUND]: 1,
  [ResolveErrorCode.MARKET_CLOSED]: 2,
  [ResolveErrorCode.MARKET_NOT_RESOLVED]: 3,
  [ResolveErrorCode.INVALID_OUTCOME]: 4,
  [ResolveErrorCode.UNAUTHORIZED_RESOLVER]: 5,
  [ResolveErrorCode.ALREADY_RESOLVED]: 6,
  [ResolveErrorCode.ALREADY_CLAIMED]: 7,
  [ResolveErrorCode.NOT_WINNER]: 8,
  [ResolveErrorCode.NOT_REFUNDABLE]: 9,
  [ResolveErrorCode.INVALID_AMOUNT]: 10,
  [ResolveErrorCode.DEADLINE_NOT_REACHED]: 11,
  [ResolveErrorCode.RESOLUTION_TIMEOUT_NOT_REACHED]: 12,
  [ResolveErrorCode.INVALID_SIDE]: 13,
  [ResolveErrorCode.INVALID_MARKET_CONFIG]: 14,
  [ResolveErrorCode.INVALID_QUESTION]: 15,
  [ResolveErrorCode.OVERFLOW]: 16,
  [ResolveErrorCode.NO_POSITION]: 17,
  [ResolveErrorCode.MARKET_STILL_OPEN]: 18,
};

const NUMBER_TO_CODE: Record<number, ResolveErrorCode> = Object.fromEntries(
  Object.entries(RESOLVE_ERROR_NUMBERS).map(([code, num]) => [
    num,
    code as ResolveErrorCode,
  ]),
) as Record<number, ResolveErrorCode>;

const CODE_MESSAGES: Record<ResolveErrorCode, string> = {
  [ResolveErrorCode.MARKET_NOT_FOUND]: "Market ID was not found in storage",
  [ResolveErrorCode.MARKET_CLOSED]:
    "Market is not open for staking (past deadline or already settled)",
  [ResolveErrorCode.MARKET_NOT_RESOLVED]:
    "Market has not been resolved or invalidated yet",
  [ResolveErrorCode.INVALID_OUTCOME]:
    "Outcome value is not a recognized enum variant",
  [ResolveErrorCode.UNAUTHORIZED_RESOLVER]:
    "Caller is not the designated resolver for this market",
  [ResolveErrorCode.ALREADY_RESOLVED]:
    "Market has already been resolved or invalidated",
  [ResolveErrorCode.ALREADY_CLAIMED]:
    "Position has already been claimed or refunded",
  [ResolveErrorCode.NOT_WINNER]:
    "Caller has no winning stake for the resolved outcome",
  [ResolveErrorCode.NOT_REFUNDABLE]:
    "Position is not eligible for a refund",
  [ResolveErrorCode.INVALID_AMOUNT]: "Amount must be strictly positive",
  [ResolveErrorCode.DEADLINE_NOT_REACHED]:
    "Close time has not been reached yet",
  [ResolveErrorCode.RESOLUTION_TIMEOUT_NOT_REACHED]:
    "Resolution timeout has not elapsed; invalidation is not yet allowed",
  [ResolveErrorCode.INVALID_SIDE]: "Side must be Yes or No",
  [ResolveErrorCode.INVALID_MARKET_CONFIG]:
    "Market configuration is logically invalid",
  [ResolveErrorCode.INVALID_QUESTION]:
    "Question string is empty or exceeds the maximum length",
  [ResolveErrorCode.OVERFLOW]:
    "Arithmetic overflow during payout or pool accounting",
  [ResolveErrorCode.NO_POSITION]:
    "No position exists for this user on this market",
  [ResolveErrorCode.MARKET_STILL_OPEN]:
    "Market still has an open staking window; resolution is not allowed yet",
};

/** Typed error thrown / returned when a Resolve contract error is recognized. */
export class ResolveError extends Error {
  readonly code: ResolveErrorCode;
  readonly contractCode: number;

  constructor(code: ResolveErrorCode, message?: string) {
    const contractCode = RESOLVE_ERROR_NUMBERS[code];
    super(message ?? CODE_MESSAGES[code]);
    this.name = "ResolveError";
    this.code = code;
    this.contractCode = contractCode;
  }

  static fromContractCode(contractCode: number): ResolveError | null {
    const code = NUMBER_TO_CODE[contractCode];
    if (!code) return null;
    return new ResolveError(code);
  }
}

/**
 * Map a contract error number (1–18) to a stable `ResolveErrorCode`.
 * Returns `null` for unknown codes.
 */
export function resolveErrorCodeFromNumber(
  contractCode: number,
): ResolveErrorCode | null {
  return NUMBER_TO_CODE[contractCode] ?? null;
}

/**
 * Normalize arbitrary RPC / SDK / wallet errors into a `ResolveError` when
 * a known Resolve contract error code (1–18) can be extracted.
 */
export function parseResolveError(err: unknown): ResolveError | null {
  if (err instanceof ResolveError) {
    return err;
  }

  if (typeof err === "number" && Number.isInteger(err)) {
    return ResolveError.fromContractCode(err);
  }

  if (typeof err === "bigint") {
    return ResolveError.fromContractCode(Number(err));
  }

  if (typeof err === "string") {
    return parseFromString(err);
  }

  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;

    for (const key of ["contractCode", "errorCode", "code", "value"] as const) {
      const n = toInt(obj[key]);
      if (n !== null) {
        const parsed = ResolveError.fromContractCode(n);
        if (parsed) return parsed;
      }
    }

    if ("error" in obj) {
      const nested = parseResolveError(obj.error);
      if (nested) return nested;
    }

    if ("result" in obj) {
      const nested = parseResolveError(obj.result);
      if (nested) return nested;
    }

    if (typeof obj.message === "string") {
      const fromMessage = parseFromString(obj.message);
      if (fromMessage) return fromMessage;
    }

    try {
      const json = JSON.stringify(obj);
      const fromJson = parseFromString(json);
      if (fromJson) return fromJson;
    } catch {
      // ignore circular structures
    }
  }

  return null;
}

function toInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}

function parseFromString(text: string): ResolveError | null {
  const upper = text.toUpperCase();
  for (const code of Object.values(ResolveErrorCode)) {
    if (upper.includes(code)) {
      return new ResolveError(code);
    }
  }

  // Common patterns from simulation / host errors
  const patterns = [
    /Error\(Contract,\s*#(\d+)\)/i,
    /ContractError\((\d+)\)/i,
    /contract error[:\s#]*(\d+)/i,
    /"code"\s*:\s*(\d+)/i,
    /\berror[_\s-]?code["\s:=]+(\d+)/i,
    /#(\d{1,2})\b/,
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const n = Number(m[1]);
      const parsed = ResolveError.fromContractCode(n);
      if (parsed) return parsed;
    }
  }

  return null;
}

/** AssembledTransaction `errorTypes` map keyed by contract error value. */
export function resolveErrorTypes(): Record<
  number,
  { message: string }
> {
  const out: Record<number, { message: string }> = {};
  for (const [code, num] of Object.entries(RESOLVE_ERROR_NUMBERS)) {
    out[num] = { message: CODE_MESSAGES[code as ResolveErrorCode] };
  }
  return out;
}
