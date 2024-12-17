"use server";

import { env } from "@/env";
type EmilyLimits = {
  pegCap: null | number;
  perDepositCap: null | number;
  perWithdrawalCap: null | number;
  accountCaps: AccountCaps;
  perDepositMinimum: null | number;
};

type AccountCaps = {};

export default async function getEmilyLimits() {
  const res = await fetch(`${env.EMILY_URL}/limits`);
  const json = (await res.json()) as EmilyLimits;
  // exclude account caps
  return {
    // if null, it means unlimited
    pegCap: json.pegCap || Infinity,
    perDepositCap: json.perDepositCap || Infinity,
    perWithdrawalCap: json.perWithdrawalCap || Infinity,
    perDepositMinimum: json.perDepositMinimum || 0,
  };
}
