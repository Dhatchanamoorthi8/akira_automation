/**
 * Converts a numeric amount into Indian Currency Words (e.g. "Ten Thousand Five Hundred Rupees Only")
 * Follows the Indian numbering system: Crores, Lakhs, Thousands, Hundreds.
 */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertLessThanOneThousand(n: number): string {
  let rem = n;
  let s = "";

  if (rem >= 100) {
    s += ONES[Math.floor(rem / 100)] + " Hundred";
    rem %= 100;
    if (rem > 0) s += " ";
  }

  if (rem >= 20) {
    s += TENS[Math.floor(rem / 10)];
    rem %= 10;
    if (rem > 0) s += " " + ONES[rem];
  } else if (rem > 0) {
    s += ONES[rem];
  }

  return s;
}

export function numberToWordsINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Zero Rupees Only";

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  let words = "";

  // Split into Indian groupings:
  // Crores (>= 1,00,00,000)
  const crores = Math.floor(rupees / 10000000);
  let remainder = rupees % 10000000;

  // Lakhs (>= 1,00,000)
  const lakhs = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  // Thousands (>= 1,000)
  const thousands = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  // Hundreds & Remaining (< 1,000)
  const hundreds = remainder;

  if (crores > 0) {
    words += convertLessThanOneThousand(crores) + " Crore ";
  }
  if (lakhs > 0) {
    words += convertLessThanOneThousand(lakhs) + " Lakh ";
  }
  if (thousands > 0) {
    words += convertLessThanOneThousand(thousands) + " Thousand ";
  }
  if (hundreds > 0) {
    words += convertLessThanOneThousand(hundreds) + " ";
  }

  words = words.trim();

  let result = words ? `${words} Rupees` : "";

  if (paise > 0) {
    const paiseWords = convertLessThanOneThousand(paise);
    result = result ? `${result} and ${paiseWords} Paise` : `${paiseWords} Paise`;
  }

  result = `${isNegative ? "Minus " : ""}${result} Only`;
  return result;
}
