import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserHighestRole } from "./moodle";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter username and password");
        }

        try {
          // Authenticate with Moodle
          const response = await fetch(
            `${process.env.MOODLE_URL}/login/token.php?service=moodle_mobile_app`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                username: credentials.username,
                password: credentials.password,
                service: "moodle_mobile_app",
              }),
            }
          );

          const data = await response.json();

          if (data.token) {
            // Get user info with the token
            const userResponse = await fetch(
              `${process.env.MOODLE_URL}/webservice/rest/server.php?` +
                new URLSearchParams({
                  wstoken: data.token,
                  wsfunction: "core_webservice_get_site_info",
                  moodlewsrestformat: "json",
                })
            );

            const userData = await userResponse.json();

            if (userData.userid) {
              // Hardcoded admin check - if username is "admin", assign admin role
              let userRole: 'admin' | 'teacher' | 'student';
              
              if (credentials.username.toLowerCase() === 'admin') {
                console.log('🔐 Hardcoded admin login detected');
                userRole = 'admin';
              } else {
                // Fetch user's highest role from Moodle for other users
                userRole = await getUserHighestRole(userData.userid, data.token);
              }
              
              return {
                id: userData.userid.toString(),
                name: userData.fullname,
                email: userData.username,
                image: userData.userpictureurl,
                token: data.token,
                role: userRole,
              };
            }
          }

          throw new Error("Invalid credentials");
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Authentication failed. Please check your credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.token = token.token as string;
        session.user.role = token.role as 'admin' | 'teacher' | 'student';
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};
