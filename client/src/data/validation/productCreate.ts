import type { FileWithPath } from "@mantine/dropzone";
import { z } from "zod";

export const productFormSchema = z.object({
  images: z
    .array(
      z
        .custom<FileWithPath>()
        .refine((file) =>
          ["image/png", "image/jpeg", "image/jpg"].includes(file.type)
        ),
      { message: "Invalid image file type" }
    )
    .max(4),
  imageLink: z.string().optional(),
  name: z.string().nonempty("Cannot be blank"),
  category: z.string().nonempty("Cannot be blank"),
  brand: z.string().nullable(),
  description: z.string(),
  price: z.number().positive("Price must be greater than 0"),
  quantity: z.number().positive("Quantity must be greater than 0"),
});

export type ProudctForm = z.infer<typeof productFormSchema>;
