import "@/styles/globals.css";
import { CopilotKit } from "@copilotkit/react-core";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="facebook_publisher_agent"
    >
      <Component {...pageProps} />
    </CopilotKit>
  );
}
