// pages/api/auth/[...nextauth].ts

import { NextApiHandler } from "next";
import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";
import prisma from "../../../lib/prisma";

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const options = {
  providers: [
    Providers.Google({
      clientId:
        "523952187411-gqqccct3drai83e6889s9j8jqjfvgodn.apps.googleusercontent.com",
      clientSecret: "Ze8nsARtC1_v5bt5Gl-ieLdu",
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: process.env.SECRET,
  // pages: {
  //   signIn: "/auth/signin",
  // },
};
