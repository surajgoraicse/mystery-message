import { z } from "zod";

export const usernameValidation = z
	.string()
	.min(4, "username must be atleat 4 character")
	.max(20, "Username must be no more than 20 character")
	.regex(/^[a-zA-Z0-9\s]*$/, "Username must not conatin special charater");

export const signUpSchema = z.object({
	username: usernameValidation,
	email: z.string().email({ message: "Invalid Email Address" }),
	password: z
		.string()
		.min(6, { message: "password must be atleast 6 Characters" }),
});
