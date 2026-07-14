export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
};

export type AdminProfile = {
  id: string;
  full_name: string | null;
  role: "admin";
  is_active: boolean;
};

