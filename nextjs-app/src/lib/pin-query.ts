import { z } from "zod";
import { PROVINCES } from "./enums";
import { FAMILIES } from "./vocab";
import { SLIDER_END_MONTH, SLIDER_START_MONTH } from "./filter";

const families = Object.keys(FAMILIES) as [keyof typeof FAMILIES, ...(keyof typeof FAMILIES)[]];
const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must look like YYYY-MM")
  .refine((month) => month >= SLIDER_START_MONTH && month <= SLIDER_END_MONTH, {
    message: `month must be between ${SLIDER_START_MONTH} and ${SLIDER_END_MONTH}`,
  });

const querySchema = z.object({
  month: monthSchema.optional(),
  mode: z.enum(["range", "cumulative"]).default("range"),
  families: z.array(z.enum(families)),
  provinces: z.array(z.enum(PROVINCES)),
  today: z.boolean(),
});

export type ParsedPinQuery = z.infer<typeof querySchema>;

function listParam(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function todayParam(params: URLSearchParams): boolean | string {
  const raw = params.get("today");
  if (raw === null || raw === "" || raw === "0" || raw === "false") return false;
  if (raw === "1" || raw === "true") return true;
  return raw;
}

export function parsePinQuery(params: URLSearchParams) {
  const rawMode = params.get("mode");
  const legacyAllMode = rawMode === "all";
  return querySchema.safeParse({
    month: legacyAllMode ? undefined : params.get("month") || undefined,
    mode: legacyAllMode ? "cumulative" : rawMode || undefined,
    families: listParam(params, "family"),
    provinces: listParam(params, "province"),
    today: todayParam(params),
  });
}
