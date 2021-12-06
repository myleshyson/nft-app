import { Fragment } from 'react'
import Head from 'next/head'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <Fragment>
      <div className="background">
        <div className="stars"></div>
        <div className="david"></div>
      </div>
      <Head>
        <title>【ＮＦＴ　Ｃｉｔｙ】</title>
        <meta
          name="description"
          content="Welcome to NFT City! Looks like you came here to compare some
                NFT options. Fill out some information below so we can help you
                pick the best NFT possible."
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </Fragment>
  )
}

export default MyApp
