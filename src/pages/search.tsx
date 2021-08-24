import type { NextPage } from "next";
import Head from "next/head";
import Search from "../containers/Search";

const SearchPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Search</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Search />
    </div>
  );
};

export default SearchPage;
