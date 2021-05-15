import React, { ReactNode } from "react";
import Header from "./Header";
import Image from "next/image";

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => (
  <div className={"container mx-auto px-4 sm:px-6 lg:px-8 z-50"}>
    <Header />
    {props.children}
  </div>
);

export default Layout;
