// pages/p/[id].tsx
// @ts-nocheck

import React from "react";
import { GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import Router from "next/router";
import { PostProps } from "../../components/Post";
import { useSession } from "next-auth/client";
import prisma from "../../lib/prisma";
import ReactHtmlParser from "react-html-parser";
import YouTube from "react-youtube";

const replacer = (key, value) => {
  if (typeof value === "Date") {
    return value.toString();
  }
  return value;
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(params?.id) || -1,
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
  let postFix = JSON.stringify(post, replacer);
  postFix = JSON.parse(postFix);
  return {
    props: postFix,
  };
};

async function publishPost(id: number): Promise<void> {
  await fetch(`/api/publish/${id}`, {
    method: "PUT",
  });
  await Router.push("/");
}

async function deletePost(id: number): Promise<void> {
  await fetch(`/api/post/${id}`, {
    method: "DELETE",
  });
  Router.push("/");
}

const Post: React.FC<PostProps> = (props) => {
  const [session, loading] = useSession();
  if (loading) {
    return <div>Authenticating ...</div>;
  }
  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === props.author?.email;
  let title = props.title;
  if (!props.published) {
    title = `${title} (Draft)`;
  }

  let html = props.content;

  const TagHere = () => {
    if (html.substring(0, 23) === "https://www.youtube.com") {
      return <>Video</>;
    } else {
      return <>Poem</>;
    }
  };

  const ContentHere = () => {
    if (html.substring(0, 23) === "https://www.youtube.com") {
      html = html.split("v=")[1];

      return (
        <>
          <YouTube
            videoId={html} // defaults -> null
            id={html} // defaults -> null
          />
        </>
      );
    } else {
      return <>{ReactHtmlParser(html)}</>;
    }
  };

  return (
    <Layout>
      {/* <div>
        <h2>{title}</h2>
        <p>By {props?.author?.name || "Unknown author"}</p>
        <ReactMarkdown source={props.content} />
        {!props.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => publishPost(props.id)}>Publish</button>
        )}
        {userHasValidSession && postBelongsToUser && (
          <button onClick={() => deletePost(props.id)}>Delete</button>
        )}
      </div> */}
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            <h1>
              <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
                <TagHere />
              </span>
              <span className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {title}
              </span>
            </h1>
          </div>
          <div
            dir="auto"
            className="mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto"
          >
            <ContentHere />
            {!props.published && userHasValidSession && postBelongsToUser && (
              <>
                <br />
                <br />
                <br />
                <br />
                <button
                  className="bg-green-500 float-left hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full"
                  onClick={() => publishPost(props.id)}
                >
                  Publish
                </button>
              </>
            )}
            {userHasValidSession && postBelongsToUser && (
              <>
                <button
                  className="bg-red-500 float-right hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full"
                  onClick={() => deletePost(props.id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Post;
