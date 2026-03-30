import { z } from "zod";

export const SUPPORT_SECTION_ID = "support";

export const SUPPORT_COMMENT_MAX = 1500;
export const SUPPORT_COMMENT_MIN = 10;

export const SUPPORT_PROBLEM_TYPE_IDS = [
    "connection",
    "account",
    "performance",
    "billing",
    "bug",
    "staff",
    "sync",
    "notification",
    "chat",
    "other",
] as const;

export type SupportProblemTypeId = (typeof SUPPORT_PROBLEM_TYPE_IDS)[number];

function isProblemTypeId(v: string): v is SupportProblemTypeId {
    return (SUPPORT_PROBLEM_TYPE_IDS as readonly string[]).includes(v);
}

type SupportTranslate = (
    key: string,
    values?: Record<string, string | number>,
) => string;

export function createSupportFormSchema(t: SupportTranslate) {
    return z.object({
        email: z.string().email({ message: t("validation.email") }),
        problemType: z
            .string()
            .min(1, { message: t("validation.problemType") })
            .refine(isProblemTypeId, { message: t("validation.problemType") }),
        comment: z
            .string()
            .min(SUPPORT_COMMENT_MIN, {
                message: t("validation.commentMin", { min: SUPPORT_COMMENT_MIN }),
            })
            .max(SUPPORT_COMMENT_MAX, {
                message: t("validation.commentMax", { max: SUPPORT_COMMENT_MAX }),
            }),
    });
}

export type SupportFormValues = z.infer<ReturnType<typeof createSupportFormSchema>>;
