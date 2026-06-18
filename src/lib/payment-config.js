// Demo bank account for WashMate internal payments.
// Replace with real account details when integrating production payment gateway.
export const WASHMATE_BANK = {
  bankName: "MB Bank",
  bankCode: "MB",
  accountNumber: "0123456789",
  accountName: "CONG TY WASHMATE DEMO",
};

const VIET_MAP = [
  [/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a"],
  [/[èéẹẻẽêềếệểễ]/g, "e"],
  [/[ìíịỉĩ]/g, "i"],
  [/[òóọỏõôồốộổỗơờớợởỡ]/g, "o"],
  [/[ùúụủũưừứựửữ]/g, "u"],
  [/[ỳýỵỷỹ]/g, "y"],
  [/đ/g, "d"],
  [/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A"],
  [/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E"],
  [/[ÌÍỊỈĨ]/g, "I"],
  [/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O"],
  [/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U"],
  [/[ỲÝỴỶỸ]/g, "Y"],
  [/Đ/g, "D"],
];

function stripVietnamese(str) {
  let result = str || "";
  for (const [pattern, replacement] of VIET_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Generate a stable bank transfer content string.
 * Output is uppercase, no diacritics, no special chars, max 50 chars.
 * Same inputs always produce the same output.
 */
export function generateTransferContent(bookingCode, customerName = "") {
  // Strip Vietnamese → uppercase → keep A-Z0-9 space → take first 2 words → max 8 chars
  const namePart = stripVietnamese(customerName)
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.slice(0, 4))
    .join("")
    .slice(0, 8) || "CUSTOMER";

  // Keep alphanumeric only, uppercase, last 8 chars
  const codePart = (bookingCode || "")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .slice(-8) || "WASHMATE";

  return `WASHMATE ${namePart} ${codePart}`.slice(0, 50);
}

/** Build the QR code content string for the demo bank transfer QR. */
export function buildQrContent({ bankName, accountNumber, accountName, amount, transferContent }) {
  return [
    `BANK:${bankName}`,
    `ACCOUNT:${accountNumber}`,
    `NAME:${accountName}`,
    `AMOUNT:${amount}`,
    `CONTENT:${transferContent}`,
  ].join("\n");
}
