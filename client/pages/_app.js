// next가 SSR을 하기위해 필요한 컴포넌트
import "./index.scss";

// 공식처럼 사용함.
// ctx : context의 줄임말.
const App = ({ Component, pageProps }) => <Component {...pageProps} />;

App.getInitialProps = async ({ ctx, Component }) => {
  const pageProps = await Component.getInitialProps?.(ctx);
  return { pageProps };
};

export default App;
