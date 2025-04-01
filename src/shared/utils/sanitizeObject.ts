import xss from "xss";

/**
 * Sanitizes an object by applying XSS protection to all string values recursively
 * @param obj The object to sanitize
 * @returns A new sanitized object with the same structure
 */
export const sanitizeObject = <T>(obj: T): T => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  return Object.keys(obj as object).reduce(
    (acc, key) => {
      const value = (obj as any)[key];
      if (typeof value === "string") {
        (acc as any)[key] = xss(value);
      } else if (typeof value === "object" && value !== null) {
        (acc as any)[key] = sanitizeObject(value);
      } else {
        (acc as any)[key] = value;
      }
      return acc;
    },
    Array.isArray(obj) ? [] : {}
  ) as T;
};
