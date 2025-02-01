import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

export async function POST(request: Request) {
	await dbConnect();
    try {
        const { username, code } = await request.json()
        
        // in case of accepting data from url it is recommanded to decode it before using it as sometimes is encoded for example spaces are replaced by %20 etc
        // here it is not required as we are taking data from body
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username : decodedUsername})
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "user not found",
                },
                { status: 401 }
            );
        }
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVarified = true
            await user.save()

            return Response.json({
                success: true,
                message: "Account verified successfully"
            }, {status : 200})
        }
        else if(!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code is expired, Please signup again."
            }, {status : 402})
        }
        else if(!isCodeValid) {
            return Response.json({
                success: false,
                message: "Verification code is incorrect"
            }, {status : 401})
        }



	} catch (error) {
		console.error("Error checking username ", error);
		return Response.json(
			{
				success: false,
				message: "Error verifying user",
			},
			{ status: 500 }
		);
	}
}
