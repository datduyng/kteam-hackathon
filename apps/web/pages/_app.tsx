import { Toaster } from '@/components/ui/toaster'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-textarea/styles.css";
import "@copilotkit/react-ui/styles.css"
import { useMakeCopilotReadable } from "@copilotkit/react-core";

function MyApp({ Component, pageProps }: AppProps) {
  useMakeCopilotReadable("You are helping Dominique to learn faster.");
  return <>
    <CopilotKit url="/api/copilotkit/openai">
      <CopilotSidebar
        labels={{
          title: "You are a book recommender expert. Helping student learn things faster",
          initial: "Hi! 👋 How can I assist you today?",
        }}
      >
        <Component {...pageProps} />
      </CopilotSidebar>
    </CopilotKit>
    <Toaster />
  </>
}

export default MyApp
