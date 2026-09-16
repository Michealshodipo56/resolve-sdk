/**
 * Human ↔ contract amount helpers for SEP-41 / Soroban i128 token amounts.
 */

const DEFAULT_DECIMALS = 7;

function assertDecimals(decimals: number): void {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 38) {
    throw new RangeError(`decimals must be an integer in [0, 38], got ${decimals}`);
  }
}

function scaleFactor(decimals: number): bigint {
  return 10n ** BigInt(decimals);
}

/**
 * Convert a human-readable decimal amount into contract i128 units.
 * Pass a `bigint` only when it already represents whole human units (not stroops).
 * Prefer string input for fractional amounts.
 *
 * @example toContractAmount("1.5", 7) → 15000000n
 */
export function toContractAmount(
  amount: string | number | bigint,
  decimals: number = DEFAULT_DECIMALS,
): bigint {
  assertDecimals(decimals);

  if (typeof amount === "bigint") {
    return amount * scaleFactor(decimals);
  }

  if (typeof amount === "number") {
    if (!Number.isFinite(amount)) {
      throw new RangeError("amount must be a finite number");
    }
    return toContractAmount(String(amount), decimals);
  }

  const trimmed = amount.trim();
  if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new RangeError(`invalid amount: ${amount}`);
  }

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [wholePart = "0", fracPart = ""] = unsigned.split(".");

  if (fracPart.length > decimals) {
    throw new RangeError(
      `amount has more than ${decimals} fractional digits: ${amount}`,
    );
  }

  const fracPadded = fracPart.padEnd(decimals, "0");
  const raw = BigInt(wholePart) * scaleFactor(decimals) + BigInt(fracPadded || "0");
  return negative ? -raw : raw;
}

/**
 * Convert contract i128 units into a human-readable decimal string (no float).
 *
 * @example fromContractAmount(15000000n, 7) → "1.5"
 */
export function fromContractAmount(
  amount: bigint | number | string,
  decimals: number = DEFAULT_DECIMALS,
): string {
  assertDecimals(decimals);

  const value =
    typeof amount === "bigint"
      ? amount
      : typeof amount === "number"
        ? BigInt(Math.trunc(amount))
        : BigInt(amount);

  const negative = value < 0n;
  const abs = negative ? -value : value;
  const factor = scaleFactor(decimals);
  const whole = abs / factor;
  const frac = abs % factor;

  if (decimals === 0) {
    return `${negative ? "-" : ""}${whole.toString()}`;
  }

  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  const body = fracStr.length > 0 ? `${whole.toString()}.${fracStr}` : whole.toString();
  return negative ? `-${body}` : body;
}
