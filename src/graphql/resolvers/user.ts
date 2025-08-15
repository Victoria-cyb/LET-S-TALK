import prisma from '../../config/db';
import { signup, login } from '../../services/auth';
import { AuthContext } from '../../middleware/auth';

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: AuthContext) => {
      if (!context.userId) throw new Error('Unauthorized');
      return prisma.user.findUnique({
        where: { id: context.userId },
        include: { posts: true, comments: true },
      });
    },
  },
  Mutation: {
    signup: async (_: any, { email, password, name }: { email: string; password: string; name: string }) => {
      return signup(email, password, name);
    },
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      return login(email, password);
    },
  },
};