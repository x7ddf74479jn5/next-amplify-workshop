import React, { useState, useEffect } from "react";

import { Auth, API, graphqlOperation } from "aws-amplify";
import { useRouter } from "next/dist/client/router";
import { Button } from "@material-ui/core";

import { CognitoUserInterface } from "@aws-amplify/ui-components";
import {
  getFollowRelationship,
  listPostsBySpecificOwner,
} from "../graphql/queries";
import { onCreatePost } from "../graphql/subscriptions";
import {
  createFollowRelationship,
  deleteFollowRelationship,
} from "../graphql/mutations";
import PostList from "../components/PostList";
import Sidebar from "./Sidebar";

import {
  CreateFollowRelationshipMutation,
  CreateFollowRelationshipMutationVariables,
  DeleteFollowRelationshipMutation,
  DeleteFollowRelationshipMutationVariables,
  GetFollowRelationshipQuery,
  GetFollowRelationshipQueryVariables,
  ListPostsBySpecificOwnerQuery,
  OnCreatePostSubscription,
  ListPostsBySpecificOwnerQueryVariables,
} from "../API";
import { Observable } from "zen-observable-ts";
import { GraphQLResult } from "@aws-amplify/api-graphql";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { updateUser, selectUsername } from "../features/user/userSlice";
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

type ActionType = "INITIAL_QUERY" | "ADDITIONAL_QUERY" | "SUBSCRIPTION";

type PostSubscriptionEvent = { value: { data: OnCreatePostSubscription } };

// const INITIAL_QUERY = "INITIAL_QUERY";
// const ADDITIONAL_QUERY = "ADDITIONAL_QUERY";

const SUBSCRIPTION = "SUBSCRIPTION";
const INITIAL_QUERY = "INITIAL_QUERY";
const ADDITIONAL_QUERY = "ADDITIONAL_QUERY";

export default function PostsBySpecifiedUser() {
  // const { userId }: { userId: string } = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  // const userId = String(router.query.userId);

  const [isFollowing, setIsFollowing] = useState(false);

  const appDispatch = useAppDispatch();
  const currentUsername = useAppSelector(selectUsername);
  const posts = useAppSelector(selectPosts);
  const nextToken = useAppSelector(selectNextToken);
  const isLoading = useAppSelector(selectIsLoading);

  const getPosts = async (
    type: ActionType,
    nextToken: string | null = null
  ) => {
    const res = (await API.graphql(
      graphqlOperation(listPostsBySpecificOwner, {
        owner: userId,
        sortDirection: "DESC",
        limit: 20, //default = 10
        nextToken: nextToken,
      } as ListPostsBySpecificOwnerQueryVariables)
    )) as GraphQLResult<ListPostsBySpecificOwnerQuery>;
    console.log(res);
    if (res.data?.listPostsBySpecificOwner?.items) {
      // if (type === "INITIAL_QUERY") {
      //   appDispatch(initialQuery(res.data.listPostsBySpecificOwner.items));
      // } else {
      //   appDispatch(additionalQuery(res.data.listPostsBySpecificOwner.items));
      // }
      switch (type) {
        case "INITIAL_QUERY": {
          appDispatch(initialQuery(res.data.listPostsBySpecificOwner.items));
          break;
        }
        case "ADDITIONAL_QUERY": {
          appDispatch(additionalQuery(res.data.listPostsBySpecificOwner.items));
          break;
        }
        case "SUBSCRIPTION": {
          appDispatch(
            subscriptionPosts(res.data.listPostsBySpecificOwner.items)
          );
          break;
        }
        default:
          throw new Error("Invalid Action");
      }
    }

    if (res.data?.listPostsBySpecificOwner?.nextToken) {
      appDispatch(fetchNextToken(res.data.listPostsBySpecificOwner.nextToken));
    }

    appDispatch(changeLoadingStatus(false));
  };

  const getIsFollowing = async ({
    followerId,
    followeeId,
  }: {
    followerId: string;
    followeeId: string;
  }) => {
    const res = (await API.graphql(
      graphqlOperation(getFollowRelationship, {
        followeeId: followeeId,
        followerId: followerId,
      } as GetFollowRelationshipQueryVariables)
    )) as GraphQLResult<GetFollowRelationshipQuery>;
    console.log(res);
    if (res.data) {
      return res.data.getFollowRelationship !== null;
    }
    return false;
  };

  const getAdditionalPosts = () => {
    if (nextToken === null) return; //Reached the last page
    getPosts(ADDITIONAL_QUERY, nextToken);
  };

  const follow = async () => {
    console.log("follow");
    if (currentUsername) {
      const input = {
        followeeId: userId,
        followerId: currentUsername,
        timestamp: Math.floor(Date.now() / 1000),
      };
      const res = (await API.graphql(
        graphqlOperation(createFollowRelationship, {
          input: input,
        } as CreateFollowRelationshipMutationVariables)
      )) as GraphQLResult<CreateFollowRelationshipMutation>;
      if (res.data?.createFollowRelationship) setIsFollowing(true);
      console.log(res);
    }
  };

  const unfollow = async () => {
    console.log("unfollow");
    if (currentUsername) {
      const input = {
        followeeId: userId,
        followerId: currentUsername,
      };
      const res = (await API.graphql(
        graphqlOperation(deleteFollowRelationship, {
          input: input,
        } as DeleteFollowRelationshipMutationVariables)
      )) as GraphQLResult<DeleteFollowRelationshipMutation>;

      if (res.data?.deleteFollowRelationship) setIsFollowing(false);
      console.log(res);
    }
  };

  useEffect(() => {
    // idがqueryで利用可能になったら処理される
    if (router.asPath !== router.route) {
      setUserId(String(router.query.userId));
    }
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const init = async () => {
      const currentUser: CognitoUserInterface =
        await Auth.currentAuthenticatedUser();

      if (currentUser.username) {
        appDispatch(updateUser(currentUser.username));
        setIsFollowing(
          await getIsFollowing({
            followeeId: userId,
            followerId: currentUser.username,
          })
        );
      }

      getPosts(INITIAL_QUERY);
    };
    init();

    let unsubscribe;
    const subscription = API.graphql(graphqlOperation(onCreatePost));
    if (subscription instanceof Observable) {
      const client = subscription.subscribe({
        next: (msg: PostSubscriptionEvent) => {
          const post = msg.value.data.onCreatePost;
          if (post) {
            if (post.owner !== userId) return;
            appDispatch(subscriptionPosts(post));
          }
        },
      });
      unsubscribe = () => {
        client.unsubscribe();
      };
    }
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <React.Fragment>
      <Sidebar activeListItem="profile" />
      <PostList
        isLoading={isLoading}
        posts={posts}
        getAdditionalPosts={getAdditionalPosts}
        listHeaderTitle={userId}
        listHeaderTitleButton={
          currentUsername &&
          userId !== currentUsername &&
          (isFollowing ? (
            <Button variant="contained" color="primary" onClick={unfollow}>
              Following
            </Button>
          ) : (
            <Button variant="outlined" color="primary" onClick={follow}>
              Follow
            </Button>
          ))
        }
      />
    </React.Fragment>
  );
}
