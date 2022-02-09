// next가 SSR을 하기위해 필요한 컴포넌트
import "./index.scss";
import { QueryClient, QueryClientProvider } from "react-query";
import { useRef } from "react";
import { Hydrate } from "react-query/hydration";
//Hydrate : 서버사이드에서 받아온 프로퍼티를 html만 완성된 클라이언트단에 데이터를 부어주는(?) 역할을함. (데이터를 부어준다 : hydrate)

// 공식처럼 사용함.
// 페이지가 전환될때마다 App컴포넌트 호출.
const App = ({ Component, pageProps }) => {
  const clientRef = useRef(null);
  const getClient = () => {
    if (!clientRef.current)
      clientRef.current = new QueryClient({
        defaultOptions: {
          queries: {
            // refetchInterval: 10000, //  1초에 한번 다시 부른다.
            // refetchOnMount,
            refetchOnWindowFocus: false, // 포커싱 될떄마다 요청. ( default 가 true)
            // refetchOnReconnect, // 서버와 연결 끊겼다 재연결 됬을떄
            // staleTime,
          },
        },
      });
    return clientRef.current;
  };

  return (
    // client로 QueryClient가 전송된이후로, 자식 컴포넌트들은 useQueryClient훅으로 QueryClient에 접근할 수 있게된다.
    <QueryClientProvider client={getClient()}>
      <Hydrate state={pageProps.dehydratedState}>
        <Component {...pageProps} />
      </Hydrate>
    </QueryClientProvider>
  );
};
// ctx : context의 줄임말.
App.getInitialProps = async ({ ctx, Component }) => {
  const pageProps = await Component.getInitialProps?.(ctx);
  return { pageProps };
};

export default App;
