import type {
  NextPage,
  InferGetStaticPropsType,
  GetStaticPropsContext,
  GetStaticPaths,
} from "next";

import Head from "next/head";
import PostsBySpecifiedUser from "../containers/PostsBySpecifiedUser";

// type PathParams = {};

// export const getStaticPaths: GetStaticPaths<PathParams> = async () => {
//   return {
//     paths: [],
//     fallback: true,
//   };
// };

// type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

// export const getStaticProps = async (context) => {
//   // ファイル名が [id].tsx なので id パラメーターを取り出すことができる
//   const { userId } = context.params as PathParams;

//   // 本来はここで getBook(id) のように API を呼び出してデータを取得する
//   // const props: PageProps = {
//   //   title: `Title-${id}`,
//   //   author: `Author-${id}`
//   // }

//   // ページコンポーネントに渡す PageProps オブジェクトを
//   // props プロパティに設定したオブジェクトを返す
//   return { props };
// };

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
