import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      username: string;
      avatar: string | null;
      isAdmin: boolean;
    };
  }
}
