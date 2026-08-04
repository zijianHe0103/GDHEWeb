import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "vitest";

// @ts-expect-error The Node-built verifier intentionally has no declaration.
import verifyProductConfigurationV2Contract from "../scripts/verify-product-configuration-v2-contract.mjs";

const repositoryRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const contractRoot="frontend/src/lib/cms/product-configuration-v2-contract";
const roots:string[]=[];
async function seed(){const root=await realpath(await mkdtemp(path.join(tmpdir(),"gdhe-v2-contract-")));roots.push(root);const manifest=JSON.parse(await readFile(path.join(repositoryRoot,contractRoot,"manifest.json"),"utf8"));const sources=[manifest.sourceAuthority.manifestPath,manifest.sourceAuthority.checksumsPath,...manifest.schemas.map((entry:{sourcePath:string})=>entry.sourcePath),...manifest.samples.success.map((entry:{sourcePath:string})=>entry.sourcePath),manifest.samples.errors.sourcePath];await mkdir(path.join(root,"frontend/src/lib/cms"),{recursive:true});await cp(path.join(repositoryRoot,contractRoot),path.join(root,contractRoot),{recursive:true});for(const relative of sources){await mkdir(path.dirname(path.join(root,relative)),{recursive:true});await cp(path.join(repositoryRoot,relative),path.join(root,relative));}return {root,manifest};}
afterEach(async()=>{await Promise.all(roots.splice(0).map((root)=>rm(root,{recursive:true,force:true})));});

describe("Product Configuration 2.0.0 contract snapshot verifier", () => {
  test("accepts the frozen TASK-021 Product Configuration authority", async () => {
    await expect(verifyProductConfigurationV2Contract()).resolves.toEqual({
      errorSamples: 6,
      schemas: 4,
      successSamples: 1,
    });
  });

  test.each(["missing", "extra", "tampered"])("rejects %s snapshot inventory or bytes",async(kind)=>{const {root,manifest}=await seed();const target=path.join(root,contractRoot,manifest.schemas[0].snapshotPath);if(kind==="missing")await rm(target);if(kind==="extra")await writeFile(path.join(root,contractRoot,"extra.json"),"{}\n");if(kind==="tampered")await writeFile(target,`${await readFile(target,"utf8")} `);await expect(verifyProductConfigurationV2Contract({repositoryRoot:root})).rejects.toThrow(/inventory|SHA-256/i);});

  test("rejects traversal, unknown refs and authority substitution",async()=>{
    const traversal=await seed();traversal.manifest.schemas[0].snapshotPath="../escape.json";await writeFile(path.join(traversal.root,contractRoot,"manifest.json"),JSON.stringify(traversal.manifest));await expect(verifyProductConfigurationV2Contract({repositoryRoot:traversal.root})).rejects.toThrow(/traversal|unsafe|identity|inventory/i);
    const unknown=await seed();const schemaPath=path.join(unknown.root,contractRoot,"schemas/product-configuration.v2.schema.json");const schema=JSON.parse(await readFile(schemaPath,"utf8"));schema.__test={$ref:"unknown.schema.json"};await writeFile(schemaPath,JSON.stringify(schema));await expect(verifyProductConfigurationV2Contract({repositoryRoot:unknown.root})).rejects.toThrow(/SHA-256|unknown/i);
    const substitution=await seed();const rogue=`${substitution.manifest.schemas[0].sourcePath}.rogue`;await cp(path.join(substitution.root,substitution.manifest.schemas[0].sourcePath),path.join(substitution.root,rogue));substitution.manifest.schemas[0].sourcePath=rogue;await writeFile(path.join(substitution.root,contractRoot,"manifest.json"),JSON.stringify(substitution.manifest));await expect(verifyProductConfigurationV2Contract({repositoryRoot:substitution.root})).rejects.toThrow(/authority substitution/i);
  });
});
