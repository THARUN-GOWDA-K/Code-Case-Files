const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 responses - clear token and trigger reauth
  if (response.status === 401) {
    clearToken();
    // Dispatch custom event for toast notification
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-401", {
          detail: { message: "Session expired. Please log in again." },
        }),
      );
    }
  }

  return response;
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}
