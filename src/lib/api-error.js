// Chuyển lỗi từ tầng API thành thông báo tiếng Việt THÂN THIỆN cho người dùng.
// Nguyên tắc: KHÔNG bao giờ để lộ chuỗi kỹ thuật (500, Internal server error, exception, SQL...)
// ra UI. Nếu message của máy chủ có dấu hiệu kỹ thuật/không thân thiện → dùng fallback.

const TECHNICAL_PATTERNS = [
  /internal server error/i,
  /\b5\d{2}\b/,
  /\b4\d{2}\b/,
  /exception/i,
  /stack/i,
  /\bsql\b/i,
  /constraint/i,
  /null/i,
  /runtime/i,
  /nullpointer/i,
  /undefined/i,
  /timeout/i,
  /econnaborted/i,
  /error:/i,
  /\bat [\w.$]+\(/,
];

function looksTechnical(message) {
  if (!message || typeof message !== "string") return true;
  const trimmed = message.trim();
  if (!trimmed) return true;
  // Chuỗi có ký tự tiếng Việt thường là message do BE soạn cho người dùng → giữ lại.
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(trimmed);
  if (hasVietnamese) return false;
  return TECHNICAL_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * Trả về thông báo an toàn để hiển thị.
 * - Lỗi 5xx hoặc message kỹ thuật → dùng fallback.
 * - Message tiếng Việt do BE soạn → hiển thị nguyên văn.
 */
export function friendlyError(err, fallback = "Đã có lỗi xảy ra. Vui lòng thử lại sau.") {
  const status = err?.status;
  const message = err?.message;
  if (status >= 500) return fallback;
  if (looksTechnical(message)) return fallback;
  return message;
}
