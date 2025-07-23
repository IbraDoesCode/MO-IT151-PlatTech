import { z } from "zod";

export const productSearchSchema = z.object({
  page: z.number().catch(1),
  name: z.string().optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  brand: z.union([z.string(), z.array(z.string())]).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  rating: z.number().positive().max(5).optional(),
});

export type ProductSearch = z.infer<typeof productSearchSchema>;
