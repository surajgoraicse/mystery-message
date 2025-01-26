import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
	content: string;
	createAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
	content: {
		type: String,
		required: true,
	},
	createAt: {
		type: Date,
		required: true,
		default: Date.now(),
	},
});

export interface User extends Document {
	username: string;
	email: String;
	password: String;
	verifyCode: String;
	verifyCodeExpiry: Date;
	isVarified: boolean;
	isAcceptingMessage: boolean;
	messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
	username: {
		type: String,
		required: [true, "Username is required"],
		trim: true,
		unique: true,
	},
	email: {
		type: String,
		required: [true, "email is required"],
		trim: true,
		unique: true,
		match: [/^[^s@]+@[^s@]+.[^s@]+$/, "Invalid email"],
	},
	password: {
		type: String,
		required: [true, "password is required"],
		trim: true,
	},
	isVarified: {
		type: Boolean,
		default: false,
	},
	verifyCode: {
		type: String,
		required: [true, "Verify code is required"],
	},
	verifyCodeExpiry: {
		type: Date,
		default: Date.now(),
	},
	isAcceptingMessage: {
		type: Boolean,
		default: true,
	},
	messages: [MessageSchema],
});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User" , UserSchema)
// TODO:  introduce a new way to export model..

export default UserModel