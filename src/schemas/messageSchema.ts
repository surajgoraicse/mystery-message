import { z } from "zod";

export const messageSchema = z.object({
	content: z
		.string()
		.min(5, { message: "content must be at least 5 charaters" })
		.max(300, {
			message: "content must be no longer than 300 characters",
		}),
});
