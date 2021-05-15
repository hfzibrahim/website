// pages/api/post/index.ts

import { getSession } from "next-auth/client";
import prisma from "../../../lib/prisma";

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handle(req, res) {
  const { title, ser_value } = req.body;

  console.log("post");
  console.log(req.body);

  const session = await getSession({ req });
  const result = await prisma.post.create({
    data: {
      title: title,
      content: ser_value === undefined ? req.body.content : ser_value,
      author: { connect: { email: session?.user?.email } },
      // published: true,
    },
  });
  res.json(result);
}
