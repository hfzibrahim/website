// @ts-nocheck

import React, { useState, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import Router from "next/router";
import { Button, Icon, Toolbar } from "../components/EditorComponents";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import isHotkey from "is-hotkey";
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from "slate";
import { withHistory } from "slate-history";
import { Node } from "slate";
import { useSession, getSession } from "next-auth/client";

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

  let userFix = JSON.stringify(userData, replacer);
  userFix = JSON.parse(userFix);
  return {
    props: { user: userFix },
  };
};

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n: any) =>
      LIST_TYPES.includes(
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type
      ),
    split: true,
  });
  const newProperties: Partial<SlateElement> = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};
const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const Draft: React.FC<any> = (props) => {
  const [session] = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tab, setTab] = useState("Poem");

  const [value, setValue] = useState<Descendant[]>(initialValue);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const serialize = (nodes) => {
      return nodes.map((n) => Node.string(n)).join("<br>");
    };

    try {
      const ser_value = serialize(value);
      let body = {};
      if (tab === "Video") {
        body = { title, content };
      } else {
        body = { title, ser_value };
      }

      console.log(tab);
      console.log(body);

      console.log(ser_value);
      console.log(title);
      await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.push("/drafts");
    } catch (error) {
      console.error(error);
    }
  };

  if (!session) {
    return (
      <Layout>
        <h1>Create</h1>
        <div>You need to be authenticated to view this page.</div>
      </Layout>
    );
  }

  if (props.user.isAdmin) {
    if (tab === "Video") {
      return (
        <Layout>
          <div>
            <button
              onClick={() => {
                setTab("Poem");
              }}
              className="bg-white pt-1 pb-1 pl-2 pr-2 mr-3 rounded-full "
            >
              Create Poem
            </button>
            <button
              onClick={() => {
                setTab("Video");
              }}
              disabled
              className="bg-white pt-1 pb-1 pl-2 pr-2 mr-3 rounded-full disabled:opacity-50"
            >
              Post Video
            </button>
            <form onSubmit={submitData}>
              <h1 className="text-2xl font-bold">New Video</h1>

              <input
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title here..."
                type="text"
                value={title}
                className="mt-2 block w-full h-16 p-3 text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
              />
              <input
                className="mt-4 w-full h-16 p-3 text-3xl"
                cols={50}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter Youtube link here..."
                rows={8}
                value={content}
              />

              <div className={"mt-5 "}>
                <input
                  disabled={!content || !title}
                  type="submit"
                  value="Create"
                  className={
                    "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }
                />
                <a
                  className="inline-flex ml-5 items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  href="#"
                  onClick={() => Router.push("/")}
                >
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </Layout>
      );
    }

    if (tab === "Poem") {
      return (
        <Layout>
          <div>
            <button
              onClick={() => {
                setTab("Poem");
              }}
              disabled
              className="bg-white pt-1 pb-1 pl-2 pr-2 mr-3 rounded-full disabled:opacity-50"
            >
              Create Poem
            </button>
            <button
              onClick={() => {
                setTab("Video");
              }}
              className="bg-white pt-1 pb-1 pl-2 pr-2 mr-3 rounded-full"
            >
              Post Video
            </button>
            <form onSubmit={submitData}>
              <h1 className="text-2xl font-bold">New Draft</h1>

              <input
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title here..."
                type="text"
                value={title}
                className="mt-2 block w-full h-16 p-3 text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
              />
              {/* <textarea
              cols={50}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              rows={8}
              value={content}
            /> */}

              <Slate
                editor={editor}
                value={value}
                onChange={(value) => setValue(value)}
              >
                <div
                  className={
                    "bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 z-20 "
                  }
                >
                  <div className={"px-4 py-5 sm:px-6"}>
                    <Toolbar>
                      <MarkButton format="bold" icon="format_bold" />
                      <MarkButton format="italic" icon="format_italic" />
                      <MarkButton format="underline" icon="format_underlined" />
                      {/* <MarkButton format="code" icon="code" />
                <BlockButton format="heading-one" icon="looks_one" />
                <BlockButton format="heading-two" icon="looks_two" />
                <BlockButton format="block-quote" icon="format_quote" />
                <BlockButton format="numbered-list" icon="format_list_numbered" />
                <BlockButton format="bulleted-list" icon="format_list_bulleted" /> */}
                    </Toolbar>
                  </div>
                  <div
                    className={
                      "mt-6 p-2 prose prose-indigo prose-lg text-gray-500 mx-auto "
                    }
                  >
                    <Editable
                      renderElement={renderElement}
                      renderLeaf={renderLeaf}
                      placeholder="Enter some rich text…"
                      spellCheck
                      autoFocus
                      onKeyDown={(event) => {
                        for (const hotkey in HOTKEYS) {
                          if (isHotkey(hotkey, event as any)) {
                            event.preventDefault();
                            const mark = HOTKEYS[hotkey];
                            toggleMark(editor, mark);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </Slate>
              <div className={"mt-5 "}>
                <input
                  disabled={!value || !title}
                  type="submit"
                  value="Create"
                  className={
                    "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }
                />
                <a
                  className="inline-flex ml-5 items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  href="#"
                  onClick={() => Router.push("/")}
                >
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </Layout>
      );
    }
  } else {
    return (
      <Layout>
        <div>Admin Only</div>
      </Layout>
    );
  }
};

export default Draft;
