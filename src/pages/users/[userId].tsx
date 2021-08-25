import type { NextPage } from "next";

import Head from "next/head";
import PostsBySpecifiedUser from "../../containers/PostsBySpecifiedUser";

const SpecifiedUserPosts: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PostsBySpecifiedUser />
    </>
  );
};

export default SpecifiedUserPosts;
