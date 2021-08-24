import { API, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api-graphql";

import { listPostsSortedByTimestamp } from "../graphql/queries";
import { onCreatePost } from "../graphql/subscriptions";

import {
  ListPostsQueryVariables,
  ListPostsSortedByTimestampQuery,
  OnCreatePostSubscription,
} from "../API";

import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
  initialQuery,
  additionalQuery,
  subscriptionPosts,
  fetchNextToken,
  changeLoadingStatus,
  selectPosts,
  selectNextToken,
  selectIsLoading,
} from "../features/posts/postsSlice";

type ActionType = "INITIAL_QUERY" | "ADDITIONAL_QUERY";

const INITIAL_QUERY = "INITIAL_QUERY";
const ADDITIONAL_QUERY = "ADDITIONAL_QUERY";

export default function usePost() {
  const appDispatch = useAppDispatch();
  const posts = useAppSelector(selectPosts);
  const nextToken = useAppSelector(selectNextToken);
  const isLoading = useAppSelector(selectIsLoading);

  const getPosts = async (
    type: ActionType,
    nextToken: string | null = null
  ) => {
    const res = (await API.graphql(
      graphqlOperation(listPostsSortedByTimestamp, {
        type: "post",
        sortDirection: "DESC",
        limit: 20, //default = 10
        nextToken: nextToken,
      } as ListPostsQueryVariables)
    )) as GraphQLResult<ListPostsSortedByTimestampQuery>;
    console.log(res);
    if (res.data?.listPostsSortedByTimestamp?.items) {
      if (type === "INITIAL_QUERY") {
        appDispatch(initialQuery(res.data.listPostsSortedByTimestamp.items));
      } else {
        appDispatch(additionalQuery(res.data.listPostsSortedByTimestamp.items));
      }
    }

    if (res.data?.listPostsSortedByTimestamp?.nextToken) {
      appDispatch(
        fetchNextToken(res.data.listPostsSortedByTimestamp.nextToken)
      );
    }

    appDispatch(changeLoadingStatus(false));
  };

  const getAdditionalPosts = () => {
    if (nextToken === null) return; //Reached the last page
    getPosts(ADDITIONAL_QUERY, nextToken);
  };

  return { getPosts, getAdditionalPosts } as const;
}
