import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000";

const fetcher = async (method, url, ...rest) => {
  const res = await axios[method](url, ...rest);
  return res.data;
};

// ...rest 왜받는가?
// get,delete 와달리 post,put은 데이터를 추가로 받아야하기떄문

export default fetcher;
