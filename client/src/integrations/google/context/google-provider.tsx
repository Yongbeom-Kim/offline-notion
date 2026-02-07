import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { createContext, useState } from "react";

export const GoogleContext = createContext<{
	accessToken: string | null;
	isLoading: boolean;
	error: Error | null;
	login: ReturnType<typeof useGoogleLogin>;
} | null>(null);

export const GoogleProvider = ({ children }: { children: React.ReactNode }) => {
	// TODO: env file
	return (
		<GoogleOAuthProvider clientId="576582721985-59dn3si3gs7ga8jeqhblvhh85ab76l8k.apps.googleusercontent.com">
			<GoogleProviderInner>{children}</GoogleProviderInner>
		</GoogleOAuthProvider>
	);
};

const GoogleProviderInner = ({ children }: { children: React.ReactNode }) => {
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	console.log(accessToken);

	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			console.log("Google Login Success:", tokenResponse);
			setAccessToken(tokenResponse.access_token);
			setLoading(true);
			setError(null);
		},
		onError: (error) => {
			console.error("Google Login Failed:", error);
			setLoading(false);
			setError(
				error instanceof Error
					? error
					: new Error("Google login failed. Please try again."),
			);
		},
		scope: "https://www.googleapis.com/auth/drive.file",
	});

	return (
		<GoogleContext.Provider value={{ accessToken, isLoading, error, login }}>
			{children}
		</GoogleContext.Provider>
	);
};
