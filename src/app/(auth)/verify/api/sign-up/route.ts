import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";



/*
	if existingUserByEmail Exists then
		if existinguserByEmail.isVerified then
			success : false; (already exists)
		else
			// save the updated user
		End if
	else
		// create a new user with teh provided details
		// Save the new user
	End if
*/
export async function POST(request: Request) {
	await dbConnect();
	try {
		const { username, email, password } = await request.json();

		const existingUserVerifiedByUsername = await UserModel.findOne({
			username,
			isVarified: true,
		});

		if (existingUserVerifiedByUsername) {
			return Response.json(
				{ success: false, message: "Username is already taken" },
				{ status: 400 }
			);
		}

		const existingUserByEmail = await UserModel.findOne({ email });

		const verifyCode = Math.floor(
			Math.random() * (999999 + 1 - 100000) + 100000
		).toString();

		if (existingUserByEmail) {
			if (existingUserByEmail.isVarified) {
				return Response.json(
					{
						success: false,
						message: "User is already registered with this email. Please login",
					},
					{ status: 400 }
				);
			} else {
				const hashPassword = await bcrypt.hash(password, 10);
				existingUserByEmail.password = hashPassword;
				existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

				await existingUserByEmail.save()
			}
		} else {
			const hashPassword = await bcrypt.hash(password, 1);
			const expiryDate = new Date();
			expiryDate.setHours(expiryDate.getHours() + 1);

			const newUser = await new UserModel({
				username,
				email,
				password: hashPassword,
				verifyCode,
				verifyCodeExpiry: expiryDate,
				isVarified: false,
				isAcceptingMessage: true,
				messages: [],
			});
			await newUser.save();
		}

		// send verification email
		const emailResponse = await sendVerificationEmail(
			email,
			username,
			verifyCode
		);

		if (!emailResponse.success) {
			return Response.json(
				{
					success: false,
					message: emailResponse.message,
				},
				{ status: 500 }
			);
		}

		return Response.json(
			{
				success: true,
				message: "User regiseterd successfully. Please verify your email",
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error registering user : ", error);
		return Response.json(
			{
				success: false,
				message: "Error registering the user",
			},
			{
				status: 500,
			}
		);
	}
}
