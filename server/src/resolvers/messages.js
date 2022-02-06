import { v4 } from "uuid"; //유니크 아이디 만들기
import { writeDB } from "../dbController.js";
//graphql에선 루트폴더 index.js에서의 contenxt에서 불러오기떄문에 readDB는 필요없다.

/*
parent : parent 객체, 거의 사용x
args : Query에 필요한 필드에 제공되는 인수(parameter)
contenxt : 로그인한 사용자, DB Access 등의 중요한 정보들 
*/
const setMsgs = (data) => writeDB("messages", data);
const messageResolver = {
  Query: {
    messages: (parent, args, { db }) => {
      return db.messages;
    }, //  resolver 정의.
    message: (parent, { id = "" }, { db }) => {
      return db.messages.find((msg) => msg.id === id);
    },
  },
  Mutation: {
    createMessage: (parent, { text, userId }, { db }) => {
      // rest API와는 달리 body에서 왔는지, params로왔는지,query로 왔는지 상관없이 args로 전부 받는다.
      const newMsg = {
        // 임의 id 생성
        id: v4(),
        text,
        userId,
        timestamp: Date.now(),
      };
      db.messages.unshift(newMsg);
      setMsgs(db.messages); // DB에 등록
      return newMsg;
    },

    updateMessage: (parent, { id, text, userId }, { db }) => {
      const targetIndex = db.messages.findIndex((msg) => msg.id === id);
      if (targetIndex < 0) throw Error("메시지가 없습니다.");
      if (db.messages[targetIndex].userId !== userId)
        throw Error("사용자가 다릅니다.");

      const newMsg = { ...db.messages[targetIndex], text };
      db.messages.splice(targetIndex, 1, newMsg); // DB에 저장될 새로운 messages.
      setMsgs(db.messages); // DB에 등록
      return newMsg; // 변경된 message를 클라이언트에게 보내준다.
    },
    deleteMessage: (parent, { id, userId }, { db }) => {
      const targetIndex = db.messages.findIndex((msg) => msg.id === id);
      if (targetIndex < 0) throw "메시지가 없습니다.";
      if (db.messages[targetIndex].userId !== userId)
        throw "사용자가 다릅니다.";

      db.messages.splice(targetIndex, 1);
      setMsgs(db.messages);
      return id;
    },
  },
};

export default messageResolver;
