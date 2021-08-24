import type { NextPage } from "next";
import Head from "next/head";
import AllPosts from "../containers/AllPosts";

const GlobalTimeline: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Global Timeline</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AllPosts />
    </div>
  );
};

export default GlobalTimeline;
