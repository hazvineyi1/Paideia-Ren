// Pricing + method catalogue for the Coach's African mobile-money billing.
//
// Amounts are in MAJOR currency units (e.g. 19 = $19.00, 349 = R349.00) and are
// intentionally easy to tune: edit the `price` blocks below to change what each
// country pays. Local-currency amounts are first-pass estimates - adjust them to
// your real localized pricing before going live.

export type CountryCode = "ZW" | "ZA" | "ZM" | "BW";

export type PaymentMethod =
  | "ecocash"
  | "onemoney"
  | "orange_money"
  | "mtn_momo"
  | "airtel_money"
  | "zamtel"
  | "card";

export type BillingInterval = "month" | "year";

export interface MethodInfo {
  id: PaymentMethod;
  label: string;
  kind: "mobile_money" | "card";
  requiresPhone: boolean;
  note?: string;
}

export const METHODS: Record<PaymentMethod, MethodInfo> = {
  ecocash: { id: "ecocash", label: "EcoCash", kind: "mobile_money", requiresPhone: true },
  onemoney: { id: "onemoney", label: "OneMoney", kind: "mobile_money", requiresPhone: true },
  orange_money: {
    id: "orange_money",
    label: "Orange Money",
    kind: "mobile_money",
    requiresPhone: true,
    note: "Orange Money Botswana has limited gateway support; it may route to card if unavailable.",
  },
  mtn_momo: { id: "mtn_momo", label: "MTN MoMo", kind: "mobile_money", requiresPhone: true },
  airtel_money: { id: "airtel_money", label: "Airtel Money", kind: "mobile_money", requiresPhone: true },
  zamtel: { id: "zamtel", label: "Zamtel Kwacha", kind: "mobile_money", requiresPhone: true },
  card: { id: "card", label: "Debit / Credit card", kind: "card", requiresPhone: false },
};

export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  methods: PaymentMethod[];
  price: Record<BillingInterval, number>;
}

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  ZW: {
    code: "ZW",
    name: "Zimbabwe",
    flag: "\u{1F1FF}\u{1F1FC}",
    currency: "USD",
    methods: ["ecocash", "onemoney", "card"],
    price: { month: 19, year: 149 },
  },
  ZA: {
    code: "ZA",
    name: "South Africa",
    flag: "\u{1F1FF}\u{1F1E6}",
    currency: "ZAR",
    methods: ["card"],
    price: { month: 349, year: 2799 },
  },
  ZM: {
    code: "ZM",
    name: "Zambia",
    flag: "\u{1F1FF}\u{1F1F2}",
    currency: "ZMW",
    methods: ["mtn_momo", "airtel_money", "zamtel", "card"],
    price: { month: 499, year: 3999 },
  },
  BW: {
    code: "BW",
    name: "Botswana",
    flag: "\u{1F1E7}\u{1F1FC}",
    currency: "BWP",
    methods: ["orange_money", "card"],
    price: { month: 259, year: 2099 },
  },
};

export const PRO_FEATURES: string[] = [
  "Unlimited concepts and materials",
  "All four coach personalities",
  "Weekly retrospectives",
  "Web-search-backed answers",
  "Concept visuals",
  "Priority generation queue",
];

export function isCountryCode(v: unknown): v is CountryCode {
  return typeof v === "string" && v in COUNTRIES;
}

export function isMethod(v: unknown): v is PaymentMethod {
  return typeof v === "string" && v in METHODS;
}

export function isInterval(v: unknown): v is BillingInterval {
  return v === "month" || v === "year";
}

export function toMinor(major: number): number {
  return Math.round(major * 100);
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

export function formatAmount(currency: string, major: number): string {
  return `${currency} ${major.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
