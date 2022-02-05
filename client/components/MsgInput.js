import { useRef } from "react";

const MsgInput = ({ mutate, text = "", id = undefined }) => {
  // mutate 메서드 : create,update를 구분시켜줌.
  const textRef = useRef(null);

  const onSubmit = (e) => {
    e.preventDefault(); // 내장된 기본 이벤트 삭제
    e.stopPropagation(); // 이벤트 캡처링 버블링 전파 방지
    const text = textRef.current.value;
    textRef.current.value = "";
    mutate(text, id);
  };

  return (
    <form className="messages__input" onSubmit={onSubmit}>
      <textarea
        ref={textRef}
        defaultValue={text}
        placeholder="내용을 입력하세요."
      />
      <button type="submit">완료</button>
    </form>
  );
};

export default MsgInput;
