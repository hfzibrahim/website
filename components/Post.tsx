import React from "react";
import Router from "next/router";
import ReactHtmlParser from "react-html-parser";
import YouTube from "react-youtube";

export type PostProps = {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  published: boolean;
  createdAt: string;
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const authorName = post.author ? post.author.name : "Unknown author";
  const date = new Date(post.createdAt);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const [isVideo, setIsVideo] = React.useState(false);

  let html = post.content;

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
      const opts = {
        width: "240",
        height: "200",
      };
      return (
        <>
          <YouTube
            videoId={html} // defaults -> null
            id={html} // defaults -> null
            opts={opts}
          />
        </>
      );
    } else {
      return <>{ReactHtmlParser(html)}</>;
    }
  };

  return (
    // <div onClick={() => Router.push("/p/[id]", `/p/${post.id}`)}>
    //   <h2>{post.title}</h2>
    //   <small>By {authorName}</small>
    //   <ReactMarkdown source={post.content} />
    //   <style jsx>{`
    //     div {
    //       color: inherit;
    //       padding: 2rem;
    //     }
    //   `}</style>
    // </div>
    <div
      className="bg-white p-3 rounded-xl border-2 hover:shadow-xl"
      style={{ borderColor: "#7b502b" }}
    >
      <div>
        <a href="#" className="inline-block">
          <span
            className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium  text-white"
            style={{ background: "#7b502b" }}
          >
            <TagHere />
          </span>
        </a>
      </div>
      <a
        onClick={() => Router.push("/p/[id]", `/p/${post.id}`)}
        className="block mt-4"
      >
        <p className="text-xl font-semibold text-gray-900">{post.title}</p>
        <p
          className="mt-3 text-base text-gray-500 "
          style={{ maxHeight: 300, overflow: "hidden" }}
          dir="auto"
        >
          <ContentHere />
        </p>
        <p className="cursor-pointer font-bold" style={{ color: "#7b502b" }}>
          Read more...
        </p>
      </a>
      <div className="mt-6 flex items-center">
        <div className="flex-shrink-0">
          <a href="#">
            <img
              className="h-10 w-10 rounded-full"
              src="https://scontent-lhr8-1.xx.fbcdn.net/v/t1.6435-9/30261300_127825294734116_8144475204127555584_n.jpg?_nc_cat=100&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=Gny4E5ACRfIAX-KdI8J&_nc_ht=scontent-lhr8-1.xx&oh=096378e7eef6a6a05db97b6e9635465b&oe=60AD2375"
              alt=""
            />
          </a>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            <a href="#">{authorName}</a>
          </p>
          <div className="flex space-x-1 text-sm text-gray-500">
            <time dateTime="2020-03-16">{day + " " + month + ", " + year}</time>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
