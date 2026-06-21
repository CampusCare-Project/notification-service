export type UserRole = "STUDENT" | "STAFF" | "TECHNICIAN" | "ADMIN";

export type Actor = {
  id: string;
  role: UserRole;
};

export type AppVariables = {
  actor: Actor;
};
