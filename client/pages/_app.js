// next가 SSR을 하기위해 필요한 컴포넌트
import "./index.scss";
import { QueryClient, QueryClientProvider } from "react-query";
import { useRef } from "react";

// 공식처럼 사용함.
// ctx : context의 줄임말.
// 페이지가 전환될때마다 App컴포넌트 호출.
const App = ({ Component, pageProps }) => {
  const clientRef = useRef(null);
  const getClient = () => {
    if (!clientRef.current) clientRef.current = new QueryClient();
    return clientRef.current;
  };

  return (
    <QueryClientProvider client={getClient()}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
};

App.getInitialProps = async ({ ctx, Component }) => {
  const pageProps = await Component.getInitialProps?.(ctx);
  return { pageProps };
};

export default App;
