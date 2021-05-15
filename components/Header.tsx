// Header.tsx
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/client";
import Image from "next/image";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const [session, loading] = useSession();

  let left = (
    <div className="left">
      <Link href="/">
        <a className="bold" data-active={isActive("/")}>
          Feed
        </a>
      </Link>
    </div>
  );

  let right = null;

  if (loading) {
    left = (
      <div className="left">
        <Link href="/">
          <a className="bold" data-active={isActive("/")}>
            Feed
          </a>
        </Link>
      </div>
    );
    right = (
      <div className="right">
        <p>Validating session ...</p>
      </div>
    );
  }

  if (!session) {
    right = (
      <div className="right">
        <Link href="/api/auth/signin">
          <a data-active={isActive("/signup")}>Log in</a>
        </Link>
      </div>
    );
  }

  if (session) {
    left = (
      <div className="left">
        <Link href="/">
          <a className="bold" data-active={isActive("/")}>
            Feed
          </a>
        </Link>
        <Link href="/drafts">
          <a data-active={isActive("/drafts")}>My drafts</a>
        </Link>
      </div>
    );
    right = (
      <div className="right">
        <p>
          {session.user.name} ({session.user.email})
        </p>
        <Link href="/create">
          <button>
            <a>New post</a>
          </button>
        </Link>
        <button onClick={() => signOut()}>
          <a>Log out</a>
        </button>
      </div>
    );
  }

  return (
    <nav className="flex flex-row justify-center pt-2">
      <Image alt="logo" src="/logo.png" width="91" height="128" />
    </nav>
  );
};

export default Header;
