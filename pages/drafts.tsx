// @ts-nocheck

import React from "react";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import { useSession, getSession } from "next-auth/client";
import prisma from "../lib/prisma";

const replacer = (key, value) => {
  if (typeof value === "Date") {
    return value.toString();
  }
  return value;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return { props: { drafts: [] } };
  }

  const userData = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  console.log(userData);

  const drafts = await prisma.post.findMany({
    where: {
      author: { email: session.user.email },
      published: false,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });

  let draftFix = JSON.stringify(drafts, replacer);
  draftFix = JSON.parse(draftFix);

  let userFix = JSON.stringify(userData, replacer);
  userFix = JSON.parse(userFix);
  return {
    props: { draft: draftFix, user: userFix },
  };
};

type Props = {
  drafts: PostProps[];
};

const Drafts: React.FC<Props> = (props) => {
  const [session] = useSession();

  if (!session) {
    return (
      <Layout>
        <div>You need to be authenticated to view this page.</div>
      </Layout>
    );
  }

  if (props.user.isAdmin) {
    return (
      <Layout>
        <div className="page">
          <h1>My Drafts</h1>

          <main>
            {props.draft.map((post) => (
              <div key={post.id} className="post">
                <Post post={post} />
              </div>
            ))}
          </main>
        </div>
        <style jsx>{`
          .post {
            background: white;
            transition: box-shadow 0.1s ease-in;
          }

          .post:hover {
            box-shadow: 1px 1px 3px #aaa;
          }

          .post + .post {
            margin-top: 2rem;
          }
        `}</style>
      </Layout>
    );
  } else {
    return (
      <Layout>
        <div>
          <h1>Admin only</h1>
        </div>
      </Layout>
    );
  }
};

export default Drafts;
