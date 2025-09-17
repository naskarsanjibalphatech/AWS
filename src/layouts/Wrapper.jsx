import { ConfigProvider, theme } from "antd";
import { LIGHT_MODE_TOKEN } from "src/utils";
import { Home } from "src/pages";
import { Toaster } from "react-hot-toast";
export const Wrapper = () => {
  const { defaultAlgorithm } = theme;
  return (
    <ConfigProvider
      theme={{
        token: LIGHT_MODE_TOKEN,
        algorithm: defaultAlgorithm,
      }}
    >
      <Home />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: "",
          duration: 5000,
        }}
      />
    </ConfigProvider>
  );
};
