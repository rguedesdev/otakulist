import { z } from "zod";

import { PUBLICATION_LIST_STATUSES } from "../../models/publication-list-entry.js";

const publicationTargetSchema = z.object({
  medium: z.enum(["MANGA", "LIGHT_NOVEL"]),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const getPublicationListEntrySchema = publicationTargetSchema;

export const savePublicationListEntrySchema = publicationTargetSchema.extend({
  input: z.object({
    status: z.enum(PUBLICATION_LIST_STATUSES),
    readChapters: z.number().int().nonnegative(),
  }),
});

export const removePublicationListEntrySchema = publicationTargetSchema;
