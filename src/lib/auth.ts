import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const cleanEmail = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: cleanEmail }
        });

        if (!user) {
          const userCount = await prisma.user.count();
          if (userCount === 0 && cleanEmail === "superadmin@nexus.com" && credentials.password === "Superadmin123") {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const newUser = await prisma.user.create({
              data: {
                email: "superadmin@nexus.com",
                name: "Super Admin",
                globalRole: "SUPER_ADMIN",
                password: hashedPassword
              }
            });
            return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.globalRole };
          }
          return null;
        }

        const isPasswordValid = user.password ? await bcrypt.compare(credentials.password, user.password) : false;
        
        if (isPasswordValid) {
           return { id: user.id, email: user.email, name: user.name, role: user.globalRole || "ADMIN" };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "ADMIN";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role || "ADMIN";
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};
