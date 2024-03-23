import { Toaster } from '@/components/ui/toaster'
import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <Component {...pageProps} />
    <Toaster />
  </>
}

export default MyApp
