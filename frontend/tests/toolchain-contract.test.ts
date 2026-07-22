import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {describe,expect,it} from "vitest";

type PackageContract={
  packageManager?:string;
  engines?:{node?:string};
  scripts?:Record<string,string>;
  devDependencies?:Record<string,string>;
};

describe("toolchain contract",function(){
  it("pins the reviewed Node and npm baseline",function(){
    const nodeVersion=readFileSync(resolve(process.cwd(),".nvmrc"),"utf8").trim();
    const packageJson=JSON.parse(
      readFileSync(resolve(process.cwd(),"package.json"),"utf8")
    ) as PackageContract;

    expect(nodeVersion).toBe("24.18.0");
    expect(packageJson.engines?.node).toBe("24.x");
    expect(packageJson.packageManager).toBe("npm@11.16.0");
    expect(packageJson.devDependencies?.["@types/node"]).toBe("24.13.3");
    expect(packageJson.scripts?.["test:image-optimizer"]).toBe(
      "node tests/image-optimizer-fixture.mjs"
    );
  });
});
