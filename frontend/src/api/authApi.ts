export interface AuthUser {
  username: string;
  fullName: string;
}

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.message ?? "Đăng nhập thất bại.";
  } catch {
    return "Đăng nhập thất bại.";
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Không kiểm tra được phiên đăng nhập.");
  return response.json();
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok && response.status !== 401) throw new Error("Đăng xuất thất bại.");
}
