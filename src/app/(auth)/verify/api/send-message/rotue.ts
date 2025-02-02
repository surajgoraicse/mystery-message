import UserModel from "@/models/user.model";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/models/user.model";

export async function POST(request: Request) {
	await dbConnect();

	const { username, content } = await request.json();
	try {
		const user = await UserModel.findOne({ username });
		if (!user) {
			Response.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 404 }
			);
		}
		// if user found then check if the user is accepting messages
		if (!user?.isAcceptingMessage) {
			Response.json(
				{
					success: false,
					message: "User is not accepting messages",
				},
				{ status: 403 }
			);
		}

		// const newMessage : Message= { content, createAt: new Date() } // this is not working
		const newMessage = { content, createAt: new Date() };
		user?.messages.push(newMessage as Message);
		await user?.save();

		return Response.json(
			{
				success: true,
				message: "Message send successfully",
			},
			{ status: 200 }
		);
    } catch (err) {
        console.log("Server error sending message in send-message : ",err);
        return Response.json(
			{
				success: false,

				message: "Message creation failes due server issue",
			},
			{ status: 500 }
		);
    }
}
