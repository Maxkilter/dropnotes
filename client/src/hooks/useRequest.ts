import { useCallback, useState } from "react";

const errorMessage = "Something went wrong, please try more or try later :-(";

export const useRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const request = useCallback(
    async (url, method = "GET", body, headers = {}) => {
      setIsLoading(true);

      let formattedBody;

      try {
        if (body) {
          formattedBody = JSON.stringify(body);
          headers["Content-type"] = "application/json";
        }
        const response = await fetch(url, {
          method,
          body: formattedBody,
          headers,
        });
        const data = await response.json();

        if (!response.ok) {
          setError(errorMessage);
          throw new Error(data.message);
        }

        setIsLoading(false);

        return data;
      } catch (e) {
        setIsLoading(false);
        setError(errorMessage);
        throw e.message;
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, request, clearError };
};
