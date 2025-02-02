import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/user.model";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth"; // coming from types/next-auth.d.ts/
import mongoose from "mongoose";

export async function GET(request: Request) {
	await dbConnect();

	const session = await getServerSession(authOptions);
	const user: User = session?.user as User; // acertion

	if (!session || !session.user) {
		return Response.json(
			{
				success: false,
				message: "Not authenticated",
			},
			{
				status: 401,
			}
		);
	}
	// writing aggregation pipelines
	// here we have to pass mongodb id as aggregation pipeline is core part of mongodb and id returned by mongoose and mongodb id are different.
	const userId = new mongoose.Types.ObjectId(user._id);
	try {
		const user = await UserModel.aggregate([
			{ $match: { _id: userId } },
			{ $unwind: "$messages" },
			{ $sort: { "messages.createdAt": -1 } },
			{ $group: { _id: "$_id", messages: { $push: "$messages" } } },
		]);
		if (!user || user.length === 0) {
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{
					status: 401,
				}
			);
		}
		return Response.json(
			{
				success: true,
				message: user[0].messages,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		console.log("error getting messages in get-messages : ", error);
		return Response.json(
			{
				success: false,
				message: "error getting message ",
			},
			{
				status: 500,
			}
		);
	}
}
