import {createElement} from "react";

export default function Home(){
  return createElement(
    "main",
    null,
    createElement(
      "section",
      {"aria-labelledby":"foundation-title"},
      createElement("p",{className:"eyebrow"},"GDHE"),
      createElement("h1",{id:"foundation-title"},"Frontend foundation is running."),
      createElement(
        "p",
        null,
        "Foundation only — this is a runtime check, not the production homepage."
      )
    )
  );
}
