import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useQueryClient, useMutation, useQuery } from "react-query";
import MsgItem from "./MsgItem";
import MsgInput from "./MsgInput";
import { fetcher, QueryKeys } from "../queryClient";
import {
  GET_MESSAGES,
  CREATE_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
} from "../graphql/message";

// import useInfiniteScroll from "../hooks/useInfiniteScroll";

const MsgList = ({ smsgs, users }) => {
  const client = useQueryClient();
  const { query } = useRouter();
  const userId = query.userId || query.userid || ""; // url을 무조건 소문자로 치환해 버리는 경우에대한 대응.
  // const { userId } = query;
  const [msgs, setMsgs] = useState(smsgs);
  const [editingId, setEditingId] = useState(null);
  // const [hasNext, setHasNext] = useState(true); // 무한스크롤시 모든 데이터를 불러왔을때 반복요청을 막기위함
  // const fetchMoreEl = useRef(null); // 무한스크롤시 판변기준
  // const intersecting = useInfiniteScroll(fetchMoreEl); // fecthMoreEl가 화면에노출되면 true, 아니면 false

  const { mutate: onCreate } = useMutation(
    ({ text }) => fetcher(CREATE_MESSAGE, { text, userId }),
    {
      onSuccess: ({ createMessage }) => {
        client.setQueryData(QueryKeys.MESSAGES, (old) => {
          return {
            // messages -> 서버의 schema에서 작성된 변수
            messages: [createMessage, ...old.messages],
          };
        });
      },
    }
  );

  const { mutate: onUpdate } = useMutation(
    ({ text, id }) => fetcher(UPDATE_MESSAGE, { text, id, userId }),
    {
      onSuccess: ({ updateMessage }) => {
        client.setQueryData(QueryKeys.MESSAGES, (old) => {
          const targetIndex = old.messages.findIndex(
            (msg) => msg.id === updateMessage.id
          );
          if (targetIndex < 0) return old;
          const newMsgs = [...old.messages];
          newMsgs.splice(targetIndex, 1, updateMessage);
          return { messages: newMsgs };
        });
        doneEdit();
      },
    }
  );

  const { mutate: onDelete } = useMutation(
    (id) => fetcher(DELETE_MESSAGE, { id, userId }),
    {
      onSuccess: ({ deleteMessage: deletedId }) => {
        client.setQueryData(QueryKeys.MESSAGES, (old) => {
          const targetIndex = old.messages.findIndex(
            (msg) => msg.id === deletedId
          );
          if (targetIndex < 0) return old;
          const newMsgs = [...old.messages];
          newMsgs.splice(targetIndex, 1);
          return { messages: newMsgs };
        });
      },
    }
  );

  const doneEdit = () => setEditingId(null);

  // useQuery 정의로 들어가서 제공하는 여러 값들을 확인 할 수 있다.
  // query를 날리는 방식 3가지.(정의에서 확인)
  // graphql방식에선 query key가 있어야 한다.
  // query key가 같은 쿼리는 값을 공유할 수 있다.

  const { data, error, isError } = useQuery(QueryKeys.MESSAGES, () =>
    //stale를 먼저 사용한다(cache데이터). 그후 서버로부터 받은 데이터와 비교하여 값이 다르다면 데이터를 덮어씌운다.  //stale : 옛것 . 미리 받아놓은 정보.(클라이언트에있는 데이터)
    fetcher(GET_MESSAGES)
  );

  useEffect(() => {
    if (!data?.messages) return;
    console.log("msg changed");
    setMsgs(data?.messages);
  }, [data?.messages]);

  if (isError) {
    console.log(error);
    return null;
  }

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

  // useEffect(() => {
  //   if (intersecting && hasNext) getMessages(); // 최초에는 데이터가 없는상태이기떄문에 무조건 true가 될것이다. 따라서 바로 윗줄의 useEffect와 중복된 요청을 보내게된다.
  // }, [intersecting]);

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
            user={users.find((x) => x.userId === x.userId)}
          />
        ))}
      </ul>
      {/* <div ref={fetchMoreEl} /> */}
    </>
  );
};

export default MsgList;
