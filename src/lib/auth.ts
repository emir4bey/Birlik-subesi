import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./prisma";

const ADMIN_ROLE_NAME = "Ordu Yönetimi";

async function checkAdminRole(discordUserId: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!guildId || !botToken) return false;

  try {
    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
      { headers: { Authorization: `Bot ${botToken}` }, cache: "no-store" }
    );
    if (!memberRes.ok) return false;
    const member = await memberRes.json();
    const roleIds: string[] = member.roles ?? [];

    const rolesRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/roles`,
      { headers: { Authorization: `Bot ${botToken}` }, cache: "no-store" }
    );
    if (!rolesRes.ok) return false;
    const roles: { id: string; name: string }[] = await rolesRes.json();
    const adminRole = roles.find((r) => r.name === ADMIN_ROLE_NAME);
    if (!adminRole) return false;

    return roleIds.includes(adminRole.id);
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const discordProfile = profile as {
          id: string;
          username: string;
          avatar: string | null;
        };
        const avatarUrl = discordProfile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png?size=256`
          : null;

        const isAdmin = await checkAdminRole(discordProfile.id);

        const user = await prisma.user.upsert({
          where: { discordId: discordProfile.id },
          update: {
            username: discordProfile.username,
            avatar: avatarUrl,
            isAdmin,
          },
          create: {
            discordId: discordProfile.id,
            username: discordProfile.username,
            avatar: avatarUrl,
            isAdmin,
          },
        });

        token.userId = user.id;
        token.discordId = user.discordId;
        token.username = user.username;
        token.avatar = user.avatar;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.userId as string,
        discordId: token.discordId as string,
        username: token.username as string,
        avatar: token.avatar as string | null,
        isAdmin: token.isAdmin as boolean,
      };
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
