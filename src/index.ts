import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { userResolvers } from './graphql/resolvers/user';
import { postResolvers } from './graphql/resolvers/post';
import { commentResolvers } from './graphql/resolvers/comment';
import { authMiddleware, AuthContext } from './middleware/auth';

dotenv.config();

const typeDefs = [
  readFileSync(join(__dirname, 'graphql/schema/user.graphql'), 'utf-8'),
  readFileSync(join(__dirname, 'graphql/schema/post.graphql'), 'utf-8'),
  readFileSync(join(__dirname, 'graphql/schema/comment.graphql'), 'utf-8'),
];

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
  },
};

const server = new ApolloServer<AuthContext>({
  typeDefs,
  resolvers,
});

async function start() {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
         const body = (req as any).body; // cast to any to bypass TS complaining
      const operationName = body?.operationName;
      
      const publicOperations = ["Signup", "Login"];

      if (publicOperations.includes(operationName)) {
        return {}; // no auth required
    }
       return authMiddleware(req.headers.authorization)
},
    listen: { port: parseInt(process.env.PORT || '4000') },
  });
  console.log(`🚀 Server ready at ${url}`);
}

start();