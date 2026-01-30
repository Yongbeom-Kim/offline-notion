import { useContext } from "react";
import { GoogleContext } from "./google-provider";

export const useGoogleProvider = () => {
	const result = useContext(GoogleContext);
	if (result === null) {
		throw new Error("useGoogleProvider must be used within a GoogleProvider");
	}
	return result;
};
