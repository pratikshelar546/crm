/** Normalize Express `req.query` values (string | string[] | undefined) to a single string. */
export const firstQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
};
