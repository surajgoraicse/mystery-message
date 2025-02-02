"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceValue, useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// will use usehooks-ts for debouncing to check if the username exists in db.
function page() {
	const [username, setUsername] = useState("");
	const [usernameMessage, setUsernameMessage] = useState("");
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const router = useRouter();
	const debounced = useDebounceCallback(setUsername, 300);

	// zod implementation
	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		const checkUsernameUnique = async () => {
			if (username) {
				setIsCheckingUsername(true);
				setUsernameMessage("");
				try {
					const res = await axios.get(
						`/api/check-username-unique/?username=${username}`
					);
					console.log("axios response : ", res);
					setUsernameMessage(res.data.message);
				} catch (error) {
					const axiosError = error as AxiosError<ApiResponse>; // our custom error type
					setUsernameMessage(
						axiosError.response?.data.message ?? "Error checking username"
					);
				} finally {
					setIsCheckingUsername(false);
				}
			}
		};
		checkUsernameUnique();
	}, [username]);

	const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
		setIsSubmitting(true);
		console.log("printing data in onSubit fn : ", data);
		try {
			const res = await axios.post<ApiResponse>("/api/sign-up", data);
			toast({
				title: "Success",
				description: res.data?.message,
			});
			router.replace(`/verify/${username}`);
			setIsSubmitting(false);
		} catch (error) {
			setIsSubmitting(false);
			console.error("Error in signup of user : ", error);
			const axiosError = error as AxiosError<ApiResponse>; // our custom error type
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
						Join Mystery Message
					</h1>
					<p className="mb-4">Sign up to start your anonymous adventure</p>
				</div>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							name="username"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input
											placeholder="username"
											{...field}
											onChange={(e) => {
												field.onChange(e); // passing values
												debounced(e.target.value); // updating our value and it depends on use case
											}}
										/>
									</FormControl>
									{isCheckingUsername && <Loader2 className="animate-spin" />}
									<p
										className={`text-sm ${usernameMessage === "Username is unique" ? "text-green-500" : "text-red-500"}`}
									>
										{usernameMessage}
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="email"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="password"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
								</>
							) : (
								"Signup"
							)}
						</Button>
					</form>
				</Form>
				<div className="text-center" mt-4>
					<p>
						Already a member?{" "}
						<Link
							className="text-blue-600 hover:text-blue-800"
							href={"/sign-in"}
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default page;
