import { gql } from "apollo-server-express";

//gql : graphql 의 약자.
//``안의 내용을 graphql로 인식.
// !: 필수로 포함시켜야함.
//정수형 자리수의 제한으로 Float로 설정.

// query  : get
// mutation : post
const messageSchema = gql`
  type Message {
    id: ID!
    text: String!
    userId: ID!
    timestamp: Float #13자리 숫자
  }
  extend type Query {
    messages: [Message!]! # getMessages 
    message(id: ID!): Message! # getMessage
  }
  extend type Mutation {  Mutation : 변화를 이르키다.
    createMessage(text: String!, userId: ID!): Message!
    updateMessage(id: ID!, text: String!, userId: ID!): Message!
    deleteMessage(id: ID!, userId: ID!): ID!
  }
`;

export default messageSchema;

// 데이터주고받는 틀 설정.
