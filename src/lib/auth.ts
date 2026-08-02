import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    }),
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
            try {
              await prisma.auditLog.create({
                data: {
                  userId: newUser.id,
                  action: "LOGIN_SUCCESS",
                  entity: "AUTH",
                  details: { email: newUser.email, name: newUser.name, firstSetup: true }
                }
              });
            } catch (e) {}
            return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.globalRole, avatarUrl: newUser.avatarUrl, preferences: newUser.preferences };
          }

          try {
            const firstUser = await prisma.user.findFirst();
            if (firstUser) {
              await prisma.auditLog.create({
                data: {
                  userId: firstUser.id,
                  action: "LOGIN_FAILED",
                  entity: "AUTH",
                  details: { email: cleanEmail, reason: "Usuario no encontrado" }
                }
              });
            }
          } catch (e) {}
          return null;
        }

        const isPasswordValid = user.password ? await bcrypt.compare(credentials.password, user.password) : false;
        
        if (isPasswordValid) {
          try {
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                action: "LOGIN_SUCCESS",
                entity: "AUTH",
                details: { email: user.email, name: user.name }
              }
            });
          } catch (e) {}
          return { id: user.id, email: user.email, name: user.name, role: user.globalRole || "ADMIN", avatarUrl: user.avatarUrl, preferences: user.preferences };
        } else {
          try {
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                action: "LOGIN_FAILED",
                entity: "AUTH",
                details: { email: user.email, reason: "Contraseña incorrecta" }
              }
            });
          } catch (e) {}
        }

        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "Usuario de Google",
              avatarUrl: user.image,
              globalRole: "USER",
            }
          });
          user.id = newUser.id;
          (user as any).role = newUser.globalRole;
          (user as any).preferences = newUser.preferences;
          
          try {
            await prisma.auditLog.create({
              data: {
                userId: newUser.id,
                action: "LOGIN_SUCCESS",
                entity: "AUTH",
                details: { email: newUser.email, provider: "google", registration: true }
              }
            });
          } catch (e) {}
        } else {
          user.id = existingUser.id;
          (user as any).role = existingUser.globalRole;
          (user as any).preferences = existingUser.preferences;
          
          if (!existingUser.avatarUrl && user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { avatarUrl: user.image }
            });
          }

          try {
            await prisma.auditLog.create({
              data: {
                userId: existingUser.id,
                action: "LOGIN_SUCCESS",
                entity: "AUTH",
                details: { email: existingUser.email, provider: "google" }
              }
            });
          } catch (e) {}
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role || "ADMIN";
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = (user as any).avatarUrl;
        token.preferences = (user as any).preferences;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.picture) token.picture = session.picture;
        if (session.preferences !== undefined) token.preferences = session.preferences;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role || "ADMIN";
        (session.user as any).id = token.id;
        (session.user as any).preferences = token.preferences || {};
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture as string;
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
