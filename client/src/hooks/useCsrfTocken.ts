// @ts-nocheck
import { useRequest } from "./useRequest";

export const useCsrfToken = () => {
  const { request } = useRequest();

  const fetchCsrfToken = async () => {
    try {
      const { csrfToken } = await request("/csrf-token", "GET", null, {});
      if (csrfToken) {
        sessionStorage.setItem("csrfToken", csrfToken);
      }
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
    }
  };

  //@ts-ignore
  const handleRequestWithCsrf = async (url, method, body) => {
    const csrfToken = sessionStorage.getItem("csrfToken");
    try {
      return await request(url, method, body, {
        headers: {
          "X-Csrf-Token": csrfToken,
        },
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Token expired; fetch a new one and retry
        await fetchCsrfToken();
        return await request(url, method, body, {
          headers: {
            "X-Csrf-Token": sessionStorage.getItem("csrfToken"),
          },
        });
      }
      throw error; // Rethrow if not related to CSRF
    }
  };

  return { fetchCsrfToken };
};
