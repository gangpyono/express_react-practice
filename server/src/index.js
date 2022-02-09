// express 앱을 띄우기위한 기능들 정의
import express from "express";
import { ApolloServer } from "apollo-server-express";
import resolvers from "./resolvers/index.js";
import schema from "./schema/index.js";
import { readDB } from "./dbController.js";

//rest api 서버는 사용자가 요청한 route에 따라 그에 대응하는 res를 응답값으로 보내주는 형태.
//graphql 서버는 graphql이라는 하나의 path로 요청값을받아 판단후 res로 응답한다. (route가 없다.) "/graphql"

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    db: {
      // resolvers에 의해 읽혀질 DB
      messages: readDB("messages"),
      users: readDB("users"),
    },
  },
});

const app = express();
await server.start();
server.applyMiddleware({
  app,
  path: "/graphql",
  cors: {
    //localhost:8000/graphql 에 접속하면 play ground에 접속할 수 있다.
    // graphql play ground 접속을 위해 추가.
    origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    credentials: true,
  },
});

await app.listen({ port: 8000 });
console.log("server listening on 8000...");
