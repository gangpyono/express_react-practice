// express 앱을 띄우기위한 기능들 정의

import express from "express";
import cors from "cors";
import messagesRoute from "./routes/messages.js";
import usersRoute from "./routes/users.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // josn을 사용하겠다.

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//app[method](route,handler) 형식
// app.get("/", (req, res) => {
//   res.send("ok"); // '/' 라우트에서 get메서드 요청시 실행됨.
// });

const routes = [...messagesRoute, ...usersRoute];
// 이벤트 핸들러와같이 감시자등록으로 생각.

routes.forEach(({ method, route, handler }) => {
  app[method](route, handler);
});

app.listen(8000, () => {
  console.log("server listening on 8000...");
});
