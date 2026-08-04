import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = "frontend/src/lib/quote-contract/v2";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

export default async function verifyQuoteLineV2Contract(options={}) {
  const repositoryRoot=options.repositoryRoot??path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
  const root=path.join(repositoryRoot,ROOT);
  const manifest=JSON.parse(await readFile(path.join(root,"manifest.json"),"utf8"));
  if(manifest.contractVersion!=="2.0.0") throw new Error("QuoteLine v2 version mismatch");
  const expected=["manifest.json",...Object.keys(manifest.files)].sort();
  async function files(directory,prefix=""){const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const relative=prefix?`${prefix}/${entry.name}`:entry.name;if(entry.isDirectory())result.push(...await files(path.join(directory,entry.name),relative));else result.push(relative);}return result;}
  if(JSON.stringify((await files(root)).sort())!==JSON.stringify(expected)) throw new Error("QuoteLine v2 inventory mismatch");
  for(const [relative,digest] of Object.entries(manifest.files)){if(hash(await readFile(path.join(root,relative)))!==digest)throw new Error("QuoteLine v2 SHA-256 mismatch");}
  return {files:Object.keys(manifest.files).length,version:"2.0.0"};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){await verifyQuoteLineV2Contract();console.log("QuoteLine 2.0.0 contract verified.");}
