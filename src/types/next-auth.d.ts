import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    token?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      token?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    token?: string;
  }
}
