import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/models/user.model";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth"; // coming from types/next-auth.d.ts/

export async function DELETE(
	request: Request,
	{ params }: { params: { messageid: string } }
) {
	await dbConnect();
	const messageId = params.messageid;

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
	try {
		const updateResult = await UserModel.updateOne(
			{ _id: user._id },
			{ $pull: { messages: { _id: messageId } } }
		);
		if (updateResult.modifiedCount == 0) {
			return Response.json(
				{
					success: false,
					message: "Message not found or already  deleted",
				},
				{
					status: 404,
				}
			);
		}
		return Response.json(
			{
				success: true,
				message: "Message deleted successfully",
			},
			{
				status: 200,
			}
		);

	} catch (error) {
		console.log("error deleting a message : ", error);
		return Response.json(

			{
				success: false,
				message: "Error deleting Message",
			},
			{
				status: 500,
			}
		);

	}
}
