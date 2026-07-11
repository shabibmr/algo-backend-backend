import { Prisma } from '@prisma/client';

export type DecimalLike = string | number | Prisma.Decimal;

/**
 * Converts a value to Prisma.Decimal safely
 */
export function toDecimal(val: DecimalLike): Prisma.Decimal {
  if (val instanceof Prisma.Decimal) {
    return val;
  }
  return new Prisma.Decimal(val);
}

/**
 * Adds two decimal numbers
 */
export function add(a: DecimalLike, b: DecimalLike): Prisma.Decimal {
  return toDecimal(a).add(toDecimal(b));
}

/**
 * Subtracts b from a (a - b)
 */
export function sub(a: DecimalLike, b: DecimalLike): Prisma.Decimal {
  return toDecimal(a).sub(toDecimal(b));
}

/**
 * Multiplies two decimal numbers
 */
export function mul(a: DecimalLike, b: DecimalLike): Prisma.Decimal {
  return toDecimal(a).mul(toDecimal(b));
}

/**
 * Divides a by b (a / b)
 */
export function div(a: DecimalLike, b: DecimalLike): Prisma.Decimal {
  const decB = toDecimal(b);
  if (decB.isZero()) {
    throw new Error('Division by zero in Decimal calculation');
  }
  return toDecimal(a).div(decB);
}

/**
 * Rounds a decimal to specified decimal places
 */
export function round(val: DecimalLike, places = 2): Prisma.Decimal {
  return toDecimal(val).toDecimalPlaces(places);
}

/**
 * Checks if two decimals are equal
 */
export function isEqual(a: DecimalLike, b: DecimalLike): boolean {
  return toDecimal(a).equals(toDecimal(b));
}

/**
 * Checks if a decimal is zero
 */
export function isZero(val: DecimalLike): boolean {
  return toDecimal(val).isZero();
}

/**
 * Sums an array of DecimalLikes
 */
export function sum(arr: DecimalLike[]): Prisma.Decimal {
  return arr.reduce((acc: Prisma.Decimal, cur) => acc.add(toDecimal(cur)), new Prisma.Decimal(0));
}
