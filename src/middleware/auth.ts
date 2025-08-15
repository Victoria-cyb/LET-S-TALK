import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import prisma from '../config/db';

export interface AuthContext {
  userId?: number;
}

export async function authMiddleware(token: string | undefined): Promise<AuthContext> {
     console.log("Auth middleware started. Token:", token);

  if (!token) {
       console.log("No token, skipping auth");
    return {}; // No token provided, no user authenticated
  }
  try {
      console.log("Verifying token...");
    const payload = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET!) as { userId: number };
      console.log("Token valid, fetching user from DB...");


    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      console.log("User found:", user);

      
    if (!user) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHORIZED' } });
    }
    return { userId: payload.userId };
  } catch (error) {
    throw new GraphQLError('Invalid token', { extensions: { code: 'UNAUTHORIZED' } });
  }
}