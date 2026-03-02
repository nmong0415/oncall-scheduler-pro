import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      dbId: string;
      role: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    dbId?: string;
    role?: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbId?: string;
    role?: string;
    isAdmin?: boolean;
  }
}
