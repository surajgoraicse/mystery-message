"use client"; // TODO: fix this page
import { Button } from "@/components/ui/button";
import {
    Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signUpSchema } from "@/schemas/signUpSchema";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import {  useForm } from "react-hook-form";
import * as z from "zod";

function VerifyAccount() {
	const router = useRouter();
	const params = useParams<{ username: string }>();
	const { toast } = useToast();

	// zod implementation
	const form = useForm<z.infer<typeof verifySchema>>({
		resolver: zodResolver(signUpSchema),
	});

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        console.log("submit");
		try {
			const res = await axios.post(`/api/verify-code`, {
				username: params.username,
				code: data.code,
			});
			toast({
				title: "Success",
				description: res.data.message,
			});
			router.replace("sign-in");
		} catch (error) {
			console.error("Error verifying OTP ", error);
			const axiosError = error as AxiosError<ApiResponse>;
			let errorMessage = axiosError.response?.data.message;
			toast({
				title: "Signup failed",
				description: errorMessage,
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
				<div className="text-center">
					<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
						Verify Your Account
					</h1>
					<p className="mb-4">Enter the verification code </p>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							name="code"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Verification Code</FormLabel>
									<FormControl>
										<Input type="number" placeholder="code" {...field} />
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}

export default VerifyAccount;
