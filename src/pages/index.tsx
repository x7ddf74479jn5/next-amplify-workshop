import type { NextPage } from "next";
import Head from "next/head";
import Timeline from "../containers/Timeline";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Timeline />
    </>
  );
};

export default Home;
