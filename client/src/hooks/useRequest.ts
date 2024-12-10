import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../appStore";

export const useRequest = () => {
  const { setNotification } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const navigate = useNavigate();
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (error) {
      setNotification({
        isOpen: true,
        message: error,
        severity: "error",
      });
      clearError();
    }
  }, [error, clearError, setNotification]);

  const fetchCsrfToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/csrf-token", {
        method: "GET",
        credentials: "include",
      });
      const { csrfToken } = await response.json();
      sessionStorage.setItem("csrfToken", csrfToken);
      return csrfToken;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      setError("Something went wrong, please try again later. 🤔");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const request = useCallback(
    async (
      url: string,
      {
        method = "GET",
        body,
        headers = {
          "Content-Type": "application/json",
          "X-Csrf-Token": sessionStorage.getItem("csrfToken"),
        },
        options = { credentials: "include" },
      }: { method?: string; body?: any; headers?: {}; options?: {} } = {}
    ) => {
      setIsLoading(true);

      let retryAttempt = false;

      try {
        const makeRequest: (
          csrfTokenOverride?: string
        ) => Promise<any> = async (csrfTokenOverride?: string) => {
          const response = await fetch(url, {
            method,
            body,
            headers: csrfTokenOverride
              ? { ...headers, "X-Csrf-Token": csrfTokenOverride }
              : headers,
            ...options,
          });

          const responseData = await response.json();

          if (!response.ok) {
            if (response.status === 401) {
              navigate("/sign-up");
            }
            if (response.status === 403 && !retryAttempt) {
              retryAttempt = true;
              const newCsrfToken = await fetchCsrfToken();
              if (newCsrfToken) {
                return makeRequest(newCsrfToken);
              }
            }
            console.error(responseData);
            return setError(
              responseData?.message || "An unknown error occurred."
            );
          }
          retryAttempt = false;
          return responseData;
        };
        return await makeRequest();
      } catch (e) {
        if (e instanceof Error) {
          console.error("Request error:", e);
          setError("Something went wrong, please try again later. 🤔");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, fetchCsrfToken]
  );

  return { isLoading, error, request, clearError, fetchCsrfToken };
};
