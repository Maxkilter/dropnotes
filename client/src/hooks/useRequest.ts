import { useCallback, useContext, useState } from "react";
import { StoreContext } from "../appStore";

export const useRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const { logOut } = useContext(StoreContext);

  const request = useCallback(
    async (url, method, body, headers = {}) => {
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
          if (response.status === 401) logOut();

          setError(data.message);
          throw new Error(data.message);
        }

        setIsLoading(false);

        return data;
      } catch (e) {
        setIsLoading(false);
        setError(e.message);
        throw e.message;
      }
    },
    [logOut]
  );

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, request, clearError };
};
