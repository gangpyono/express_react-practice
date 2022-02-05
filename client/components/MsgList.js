import { useEffect, useState, useRef } from "react";

import { useRouter } from "next/router";

import MsgItem from "./MsgItem";
import MsgInput from "./MsgInput";
import fetcher from "../fetcher";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const MsgList = ({ smsgs, users }) => {
  const { query } = useRouter();
  const userId = query.userId || query.userid || ""; // url을 무조건 소문자로 치환해 버리는 경우에대한 대응.
  // const { userId } = query;
  const [msgs, setMsgs] = useState(smsgs);
  const [editingId, setEditingId] = useState(null);
  const [hasNext, setHasNext] = useState(true); // 무한스크롤시 모든 데이터를 불러왔을때 반복요청을 막기위함
  const fetchMoreEl = useRef(null); // 무한스크롤시 판변기준
  const intersecting = useInfiniteScroll(fetchMoreEl); // fecthMoreEl가 화면에노출되면 true, 아니면 false

  const onCreate = async (text) => {
    const newMsg = await fetcher("post", "/messages", { text, userId });
    if (!newMsg) throw Error("something wrong");
    setMsgs((msgs) => [newMsg, ...msgs]);
  };

  const onUpdate = async (text, id) => {
    const newMsg = await fetcher("put", `/messages/${id}`, { text, userId });

    if (!newMsg) throw Error("something wrong");

    setMsgs((msgs) => {
      const targetIndex = msgs.findIndex((msg) => msg.id === id);
      if (targetIndex < 0) return msgs;
      const newMsgs = [...msgs];
      newMsgs.splice(targetIndex, 1, newMsg);
      return newMsgs;
    });

    doneEdit();
  };

  const onDelete = async (id) => {
    const receviedId = await fetcher("delete", `/messages/${id}`, {
      params: { userId },
    });

    if (!receviedId) throw Error("something wrong");

    setMsgs((msgs) => {
      const targetIndex = msgs.findIndex((msg) => msg.id === receviedId + ""); // 기존에 있던 숫자형으로 작성된 id를 타입떄문에 처리해주지 못함.
      if (targetIndex < 0) return msgs;
      const newMsgs = [...msgs];
      newMsgs.splice(targetIndex, 1);
      return newMsgs;
    });
  };

  const doneEdit = () => setEditingId(null);

  const getMessages = async () => {
    const newMsgs = await fetcher("get", "/messages", {
      params: { cursor: msgs[msgs.length - 1]?.id || "" }, // 최초엔 데이터가 없기떄문에 옵셔널 체이닝.
    });

    if (newMsgs.length === 0) {
      setHasNext(false);
      return;
    }

    setMsgs((msgs) => [...msgs, ...newMsgs]);
  };

  //useEffect에선 async 직접호출 불가.
  // useEffect(() => {
  //   getMessages();
  // }, []);

  useEffect(() => {
    if (intersecting && hasNext) getMessages(); // 최초에는 데이터가 없는상태이기떄문에 무조건 true가 될것이다. 따라서 바로 윗줄의 useEffect와 중복된 요청을 보내게된다.
  }, [intersecting]);

  return (
    <>
      {/* 로그인 하지 않았을경우 input창 숨기기 */}
      {userId && <MsgInput mutate={onCreate} />}
      <ul className="messages">
        {msgs.map((x) => (
          <MsgItem
            key={x.id}
            {...x}
            onUpdate={onUpdate}
            onDelete={() => onDelete(x.id)}
            startEdit={() => setEditingId(x.id)}
            isEditing={editingId === x.id}
            myId={userId}
            user={users[x.userId]}
          />
        ))}
      </ul>
      <div ref={fetchMoreEl} />
    </>
  );
};

export default MsgList;
