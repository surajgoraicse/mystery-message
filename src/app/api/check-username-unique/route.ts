import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
	username: usernameValidation,
});

export async function GET(request: Request) {
	await dbConnect();

	try {
		// getting username from url (query)
		const { searchParams } = new URL(request.url);
		const queryParam = {
			username: searchParams.get("username"),
		};
		// validation using zod , here i am passing an object
        const result = UsernameQuerySchema.safeParse(queryParam);
		console.log("result: ",result); // TODO:
		if (!result.success) {
			const usernameErrors = result.error.format().username?._errors || [];
			return Response.json(
				{
					success: false,
					message:
						usernameErrors?.length > 0
							? usernameErrors.join(", ")
							: "Invalid query parameters",
				},
				{ status: 400 }
			);
		}

        const { username } = result.data;
        const existingVerifiedUser  = await UserModel.findOne({username : username, isVarified : true})
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            },{status : 400})
        }
        return Response.json({
            success: true,
            message : "Username is unique"
        }, {status : 200})


	} catch (error) {
		console.error("Error checking username ", error);
		return Response.json(
			{
				success: false,
				message: "Error checking username",
			},
			{ status: 500 }
		);
	}
}
