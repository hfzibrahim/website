// @ts-nocheck
import React from "react";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import { useSession, getSession } from "next-auth/client";
import Link from "next/link";
import Router from "next/router";

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

    return { props: { admin: [] } };
  }

  const userData = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  let userFix = JSON.stringify(userData, replacer);
  userFix = JSON.parse(userFix);
  return {
    props: { user: userFix },
  };
};

type Props = {
  admin: {
    object: string;
  };
};

const Admin: React.FC<any> = (props) => {
  const [session] = useSession();

  if (!session) {
    return (
      <Layout>
        <h1>Admin</h1>
        <Link href="/api/auth/signin">
          <button className="bg-blue-500 mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            Click here to login
          </button>
        </Link>
      </Layout>
    );
  }

  if (props.user.isAdmin) {
    return (
      <Layout>
        <div className="page">
          <h1 className="mb-4">Admin Panel</h1>
          <main>
            <Link href="drafts">
              <button className="bg-blue-500 mb-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                See Draft Poems
              </button>
            </Link>

            <br />
            <Link href="create">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                Create new Poem
              </button>
            </Link>
          </main>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout>
        <div className="page">
          <h1>Admin only</h1>
          <main></main>
        </div>
      </Layout>
    );
  }
};

export default Admin;
