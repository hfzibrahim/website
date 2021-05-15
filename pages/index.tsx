// @ts-nocheck
import React from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from "../lib/prisma";
import SocialButtonsContainer from "react-social-media-buttons";

const replacer = (key, value) => {
  if (typeof value === "Date") {
    return value.toString();
  }
  return value;
};
export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  let feedFix = JSON.stringify(feed, replacer);
  feedFix = JSON.parse(feedFix);
  return { props: { feedFix } };
};

type Props = {
  feedFix: PostProps[];
};

const Blog: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className=" pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="relative max-w-lg mx-auto lg:max-w-7xl">
          <div className="flex flex-row justify-between">
            <h2
              className="text-4xl tracking-tight font-extrabold  sm:text-5xl"
              style={{ color: "#7b502b" }}
            >
              Hafiza Ibrahim
            </h2>
          </div>
          <div className="flex flex-row justify-start mt-4">
            <SocialButtonsContainer
              links={[
                "https://www.facebook.com/hafiza.ibrahim.165",
                "https://www.youtube.com/channel/UCEy_agLvMeMi0128jXCcAVQ/videos",
                "https://instagram.com/hafiza.ibrahim.165?igshid=1iwh2r7sd91lx",
              ]}
              buttonStyle={{
                width: "35px",
                height: "35px",
                margin: "0px 10px",
                backgroundColor: "#7b502b",
                borderRadius: "30%",
              }}
              iconStyle={{ color: "#ffffff" }}
              openNewTab={true}
            />
          </div>

          <div className="mt-12 grid gap-16 pt-12 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12">
            {props.feedFix.map((post) => (
              <div key={post.id}>
                <Post post={post} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
