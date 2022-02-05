import { v4 } from "uuid"; //유니크 아이디 만들기
import { readDB, writeDB } from "../dbController.js";

const getMsgs = () => readDB("messages");
const setMsgs = (data) => writeDB("messages", data);

const messagesRoute = [
  //why 배열?
  {
    // GET MESSAGES
    method: "get",
    route: "/messages",
    handler: ({ query: { cursor = "" } }, res) => {
      const msgs = getMsgs();
      const fromIndex = msgs.findIndex((msg) => msg.id === cursor) + 1;

      res.send(msgs.slice(fromIndex, fromIndex + 15));
    },
  },

  {
    // GET MESSAGE
    method: "get",
    route: "/messages/:id",
    handler: ({ params: { id } }, res) => {
      try {
        const msgs = getMsgs();
        const msg = msgs.find((m) => m.id === id);
        if (!msg) throw Error("not found");
        res.send(msg);
      } catch (err) {
        res.status(404).send({ error: err });
      }
    },
  },
  {
    // CREATE MESSAGE
    method: "post",
    route: "/messages",
    handler: ({ body }, res) => {
      try {
        if (!body.userId) throw Error("no userId"); // 유저 아이디가 없을경우 에러를 발생시킨다.
        const msgs = getMsgs();
        const newMsg = {
          // 임의 id 생성
          id: v4(),
          text: body.text,
          userId: body.userId,
          timestamp: Date.now(),
        };

        msgs.unshift(newMsg); // DB에 추가할 메세지를 포함한 전체 messages.
        setMsgs(msgs); // DB에 등록
        res.send(newMsg); // 새로 만들어진 message를 클라이언트에게 보내준다.
      } catch (error) {
        res.status(500).send({ error: err });
      }
    },
  },

  {
    // UPDATE MESSAGE
    method: "put",
    route: "/messages/:id",
    handler: ({ body, params: { id } }, res) => {
      try {
        const msgs = getMsgs();
        const targetIndex = msgs.findIndex((msg) => msg.id === id);
        if (targetIndex < 0) throw "메시지가 없습니다.";
        if (msgs[targetIndex].userId !== body.userId)
          throw "사용자가 다릅니다.";

        const newMsg = { ...msgs[targetIndex], text: body.text };
        msgs.splice(targetIndex, 1, newMsg); // DB에 저장될 새로운 messages.
        setMsgs(msgs); // DB에 등록
        res.send(newMsg); // 변경된 message를 클라이언트에게 보내준다.
      } catch (err) {
        res.status(500).send({ error: err });
      }
    },
  },
  {
    // DELETE MESSAGE
    method: "delete",
    route: "/messages/:id",
    handler: ({ params: { id }, query: { userId } }, res) => {
      //delete는 body가 없어 config로 전달된다. 따라서 params가 아닌 query로 전달된다.
      try {
        const msgs = getMsgs();
        const targetIndex = msgs.findIndex((msg) => msg.id === id);
        if (targetIndex < 0) throw "메시지가 없습니다.";
        if (msgs[targetIndex].userId !== userId) throw "사용자가 다릅니다.";

        msgs.splice(targetIndex, 1);
        setMsgs(msgs);
        res.send(id);
      } catch (err) {
        res.status(500).send({ error: err });
      }
    },
  },
];

export default messagesRoute;
