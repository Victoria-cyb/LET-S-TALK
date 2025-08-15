import prisma from '../../config/db';
import { AuthContext } from '../../middleware/auth';

export const commentResolvers = {
  Query: {
    comments: async (_: any, { postId }: { postId: string }) => {
      return prisma.comment.findMany({
        where: { postId: parseInt(postId) },
        include: { user: true, post: true },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    createComment: async (_: any, { postId, text }: { postId: string; text: string }, context: AuthContext) => {
      if (!context.userId) throw new Error('Unauthorized');
      return prisma.comment.create({
        data: { text, postId: parseInt(postId), userId: context.userId },
        include: { user: true, post: true },
      });
    },
  },
};