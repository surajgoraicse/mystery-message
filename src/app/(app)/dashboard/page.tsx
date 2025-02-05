// TODO: this is incomplete
"use client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/models/user.model";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function page() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSwitchLoading, setIsSwitchLoading] = useState(false);

	const { toast } = useToast();

	const handleDeleteMessage = (messageId: string) => {
		setMessages(messages.filter((message) => message._id !== messageId));
	};

	const { data: session } = useSession(); // from docs

	const form = useForm({
		resolver: zodResolver(acceptMessageSchema),
	}); 

	// TODO: will use watch method of react hook forms 
	const { register, watch, setValue } = form;

	const acceptMessages = watch("acceptMessages");

	const fetchAcceptMessage = useCallback(async () => {
		setIsSwitchLoading(true);
		try {
      const response = await axios.get<ApiResponse>("/api/accept-messages")
      setValue("acceptMessages" , response.data.isAcceptingMessage)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description:  "Failed to fetch message settings",
        variant : "destructive"
      })
    }
    finally {
      setIsSwitchLoading(false)
    }
	}, [setValue]);

  const fetchMessages = useCallback(async (refresh : boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response = await axios.get<ApiResponse>("/api/get/get-messages")
      setMessages(response.data.messages || [])
      if (refresh) {
        toast({
          title: "Refresh Messages",
          description: "Showing Latest Messages"
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description:  "Failed to fetch message settings",
        variant : "destructive"
      })
    }
    finally {
      setIsSwitchLoading(false)
      setIsLoading(false)
    }
  },[setIsLoading, setMessages])


  useEffect(() => {
    if(!session || !session.user) return 
  }, [session, setValue, fetchAcceptMessage, fetchMessages])

	return <div>Dashboard</div>;
}

export default page;
