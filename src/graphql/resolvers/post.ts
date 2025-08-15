import prisma from '../../config/db';
import { AuthContext } from '../../middleware/auth';

export const postResolvers = {
  Query: {
    posts: async (_: any, { limit = 10, offset = 0 }: { limit: number; offset: number }) => {
      return prisma.post.findMany({
        skip: offset,
        take: limit,
        include: { author: true, comments: true },
        orderBy: { createdAt: 'desc' },
      });
    },
    post: async (_: any, { id }: { id: string }) => {
      return prisma.post.findUnique({
        where: { id: parseInt(id) },
        include: { author: true, comments: true },
      });
    },
  },
  Mutation: {
    createPost: async (_: any, { title, content }: { title: string; content: string }, context: AuthContext) => {
      if (!context.userId) throw new Error('Unauthorized');
      return prisma.post.create({
        data: { title, content, authorId: context.userId },
        include: { author: true },
      });
    },
    updatePost: async (_: any, { id, title, content }: { id: string; title?: string; content?: string }, context: AuthContext) => {
      if (!context.userId) throw new Error('Unauthorized');
      const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
      if (post?.authorId !== context.userId) throw new Error('Forbidden');
      return prisma.post.update({
        where: { id: parseInt(id) },
        data: { title: title || post.title, content: content || post.content },
        include: { author: true },
      });
    },
    deletePost: async (_: any, { id }: { id: string }, context: AuthContext) => {
      if (!context.userId) throw new Error('Unauthorized');
      const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
      if (post?.authorId !== context.userId) throw new Error('Forbidden');
      await prisma.post.delete({ where: { id: parseInt(id) } });
      return true;
    },
  },
};