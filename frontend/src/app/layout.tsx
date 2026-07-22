import type {Metadata} from "next";
import {createElement,type ReactNode} from "react";
import "./globals.css";

export const metadata:Metadata={
  title:"GDHE frontend foundation",
  description:"A minimal runtime placeholder for the GDHE frontend foundation."
};

export default function RootLayout(props:{children:ReactNode}){
  return createElement("html",{lang:"en"},createElement("body",null,props.children));
}
