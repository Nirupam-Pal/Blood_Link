import { headers } from "next/headers";
import { API_ROUTES } from "./api-routes";
import { resolve } from "dns";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiClient<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { requiresAuth = true, headers, ...customConfig } = options;

  const getHeaders = () => {
    const defaultHeaders: Record<string, string> = {
      "Content-type": "application/json",
      ...((headers as Record<string, string>) || {}),
    };

    if (requiresAuth && typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
    }
    return defaultHeaders;
  };

  let response = await fetch(url, {
    ...customConfig,
    headers: getHeaders(),
  });

  if (
    response.status === 401 &&
    requiresAuth &&
    typeof window !== "undefined"
  ) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      handleForceLogout();
      throw new Error("Session expired. Please sign in again.");
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          return fetch(url, {
            ...customConfig,
            headers: {
              ...getHeaders(),
              Authorization: `Bearer ${newToken}`,
            },
          }).then((res) => res.json() as Promise<T>);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
        const refreshRes = await fetch(API_ROUTES.AUTH.REFRESH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if(!refreshRes.ok) {
            throw new Error('Refresh Failed');
        }

        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.accessToken;
        const newRefreshToken = refreshData.refreshToken || refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        document.cookie = `accessToken=${newAccessToken}; path=/; max-age=86400; SameSite=Lax`;

        processQueue(null, newAccessToken);

        // retry original request
        response = await fetch(url, {
            ...customConfig,
            headers: {
                ...getHeaders(),
                Authorization: `Bearer ${newAccessToken}`,
            },
        });
    } catch (refreshErr) {
        processQueue(refreshErr, null);
        handleForceLogout();
        throw new Error('Session expired. Please sign in again.');
    } finally {
        isRefreshing = false;
    }
  }

  const contentType = response.headers.get('content-type');
  const isJsom = contentType && contentType.includes('application/json');
  const data = isJsom ? await response.json() : null;

  if(!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

function handleForceLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}
