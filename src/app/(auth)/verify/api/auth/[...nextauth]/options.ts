import { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: "creadentials",
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(creadentials: any): Promise<any> {
				await dbConnect();
				try {
					const user = await UserModel.findOne({
						$or: [
							{
								email: creadentials.identifier.email,
							},
							{
								username: creadentials.identifier.username,
							},
						],
					});
					if (!user) {
						throw new Error("No user found with this email");
					}
					if (!user.isVarified) {
						throw new Error("Please verify your account before login");
					}

					// password is accessed using credentials.password instead of credentials.identifier.password
					const isPasswordCorrect = await bcrypt.compare(
						creadentials.password,
						user.password as string
					);
					if (isPasswordCorrect) {
						return user;
					} else {
						throw new Error("Incorrect password");
					}
				} catch (error: any) {
					throw new Error(error);
				}
			},
		}),
	],
	pages: {
		signIn: "/sign-in",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token._id = user._id?.toString();
				// define types
				token.isVerified = user.isVerified;
				token.isAcceptingMessages = user.isAcceptingMessages;
				token.username = user.username;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user._id = token._id;
				session.user.isVerified = token.isVerified;
				session.user.isAcceptingMessages = token.isAcceptingMessages;
				session.user.username = token.username;
			}
			return session;
		},
	},
};
