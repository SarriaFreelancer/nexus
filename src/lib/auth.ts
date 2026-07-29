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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // Si es el superadmin y no existe, podemos loguearlo temporalmente
          // o requerir que el seeder lo haya creado. Lo mejor es requerir que exista,
          // pero para asegurar acceso inicial, podemos validar un bypass de superadmin si no hay usuarios.
          const userCount = await prisma.user.count();
          if (userCount === 0 && credentials.email === "superadmin@nexus.com" && credentials.password === "Superadmin123") {
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
           return { id: user.id, email: user.email, name: user.name, role: user.globalRole };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
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
