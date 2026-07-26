import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {describe,expect,it} from "vitest";

describe("environment example",function(){
  it("contains only safe foundation variables",function(){
    const content=readFileSync(resolve(process.cwd(),".env.example"),"utf8");
    const lines=content.trim().split("\n");

    expect(lines).toEqual([
      "NEXT_PUBLIC_SITE_URL=https://www.example.com",
      "WORDPRESS_API_URL=https://cms.example.com/wp-json",
      "GDHE_ENABLE_CMS_INTEGRATION_PAGE=0",
      "GDHE_CMS_INTEGRATION_PATH=/",
    ]);
    expect(content).not.toMatch(/PASSWORD|SECRET|TOKEN|PRIVATE_KEY/);
  });
});
