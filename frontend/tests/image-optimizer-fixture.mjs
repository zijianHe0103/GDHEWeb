import {spawn} from "node:child_process";
import {existsSync,readFileSync} from "node:fs";
import {mkdir,rm,rmdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import sharp from "sharp";

const host="127.0.0.1";
const port=Number(process.env.IMAGE_OPTIMIZER_FIXTURE_PORT ?? "3104");
const origin=`http://${host}:${port}`;
const publicDirectory=resolve("public");
const fixtureName="__gdhe-image-optimizer-fixture.png";
const fixturePath=resolve(publicDirectory,fixtureName);
const imageCacheDirectory=resolve(".next","cache","images");
const createdPublicDirectory=!existsSync(publicDirectory);
const png=await sharp({
  create:{
    width:64,
    height:64,
    channels:4,
    background:{r:32,g:96,b:160,alpha:1}
  }
}).png().toBuffer();

let output="";
let server;

function packageVersion(name){
  const packagePath=resolve("node_modules",name,"package.json");
  return JSON.parse(readFileSync(packagePath,"utf8")).version;
}

async function waitForReady(){
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){
    if(server.exitCode!==null){
      throw new Error(`Next server exited before ready.\n${output}`);
    }
    try{
      const response=await fetch(origin);
      if(response.ok){
        return;
      }
    }catch{}
    await new Promise(function(resolveWait){setTimeout(resolveWait,100);});
  }
  throw new Error(`Timed out waiting for Next server.\n${output}`);
}

async function stopServer(){
  if(!server || server.exitCode!==null){
    return;
  }
  server.kill("SIGTERM");
  await Promise.race([
    new Promise(function(resolveExit){server.once("exit",resolveExit);}),
    new Promise(function(resolveTimeout){setTimeout(resolveTimeout,3000);})
  ]);
  if(server.exitCode===null){
    server.kill("SIGKILL");
  }
}

try{
  await rm(imageCacheDirectory,{recursive:true,force:true});
  await mkdir(publicDirectory,{recursive:true});
  await writeFile(fixturePath,png);

  server=spawn(
    process.execPath,
    [resolve("node_modules/next/dist/bin/next"),"start","--hostname",host,"--port",String(port)],
    {env:{...process.env,NODE_ENV:"production"},stdio:["ignore","pipe","pipe"]}
  );
  server.stdout.on("data",function(chunk){output+=chunk;});
  server.stderr.on("data",function(chunk){output+=chunk;});

  await waitForReady();
  const response=await fetch(
    `${origin}/_next/image?url=%2F${fixtureName}&w=32&q=75`,
    {headers:{accept:"image/webp"}}
  );
  const contentType=response.headers.get("content-type") ?? "";
  const cache=response.headers.get("x-nextjs-cache") ?? "";
  const body=Buffer.from(await response.arrayBuffer());
  const metadata=await sharp(body).metadata();

  if(response.status!==200){
    throw new Error(`Image optimizer returned HTTP ${response.status}.\n${output}`);
  }
  if(!contentType.startsWith("image/")){
    throw new Error(`Expected an image content type, received ${contentType}.`);
  }
  if(body.length===0 || body.equals(png)){
    throw new Error("Image optimizer did not return a transformed image body.");
  }
  if(metadata.width!==32 || metadata.height!==32){
    throw new Error(
      `Expected a 32x32 optimized image, received ${metadata.width}x${metadata.height}.`
    );
  }

  console.log(JSON.stringify({
    result:"PASS",
    platform:process.platform,
    arch:process.arch,
    node:process.version,
    next:packageVersion("next"),
    sharp:packageVersion("sharp"),
    status:response.status,
    contentType,
    format:metadata.format,
    width:metadata.width,
    height:metadata.height,
    cache,
    bytes:body.length
  }));
}finally{
  await stopServer();
  await rm(fixturePath,{force:true});
  await rm(imageCacheDirectory,{recursive:true,force:true});
  if(createdPublicDirectory){
    await rmdir(publicDirectory).catch(function(){});
  }
}
