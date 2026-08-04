import type { ProductConfigurationV2Dto } from "../../../types/product-configuration-v2";
import type { QuoteLineV2 } from "../../quote-contract/v2";
import { projectColorChoices, resolveStandardOption } from "./choices";

export type ProductConfigurationV2Field = "selection" | "customLength" | "color" | "basePackaging" | "logoPrinting" | "protectionArrangement" | "quantity";
export type ProductConfigurationV2FormValues = Readonly<{ lengthChoice: string; customLength?: string; colorCode: string; basePackaging: string; logoPrinting: boolean; protectionArrangement: string | null; quantity: string }>;
export type ProductConfigurationV2BuildResult = Readonly<{ok:true;line:QuoteLineV2}> | Readonly<{ok:false;errors:readonly Readonly<{field:ProductConfigurationV2Field;code:"invalid"}>[]}>;

function freeze<T>(value:T, seen=new WeakSet<object>()):T { if(!value||typeof value!=="object"||seen.has(value)) return value; seen.add(value); for(const child of Object.values(value)) freeze(child,seen); return Object.freeze(value); }
function parseCustomLength(value:unknown):number|undefined { if(typeof value!=="string"||!/^(?:[1-9]\d*)(?:\.\d)?$|^0\.[1-9]$/.test(value)) return; const [whole,fraction="0"]=value.split("."); const tenths=Number(`${whole}${fraction}`); if(!Number.isSafeInteger(tenths)||tenths<1) return; const result=tenths/10; return Number.isFinite(result)&&result*10===tenths?result:undefined; }

export function buildProductConfigurationV2QuoteLine(dto:ProductConfigurationV2Dto, values:ProductConfigurationV2FormValues):ProductConfigurationV2BuildResult {
  const errors: Array<Readonly<{field:ProductConfigurationV2Field;code:"invalid"}>>=[];
  const add=(field:ProductConfigurationV2Field)=>errors.push(Object.freeze({field,code:"invalid"}));
  const custom=values.lengthChoice==="custom";
  const match=/^standard:(\d+(?:\.\d)?)$/.exec(values.lengthChoice);
  const length=custom?parseCustomLength(values.customLength):match?Number(match[1]):undefined;
  if(!custom&&!match) add("selection");
  if(custom&&length===undefined) add("customLength");
  const colors=length===undefined?[]:projectColorChoices(dto,custom?{kind:"custom"}:{kind:"standard",lengthMeters:length});
  const color=colors.find((candidate)=>candidate.code===values.colorCode);
  if(!color) add("color");
  const option=!custom&&length!==undefined&&color?resolveStandardOption(dto,length,color.code):undefined;
  if(!custom&&match&&!option) add("selection");
  const base=dto.packaging.baseOptions.find((candidate)=>candidate===values.basePackaging);
  if(!base) add("basePackaging");
  const protection=values.protectionArrangement===null?null:dto.packaging.protectionOptions.find((candidate)=>candidate===values.protectionArrangement);
  if(protection===undefined) add("protectionArrangement");
  const quantity=/^[1-9]\d*$/.test(values.quantity)?Number(values.quantity):NaN;
  if(!Number.isSafeInteger(quantity)||quantity<1) add("quantity");
  if(errors.length||length===undefined||!color||!base||protection===undefined) return freeze({ok:false,errors});
  const selection:QuoteLineV2["selection"]=custom?{type:"custom_length",articleNumber:null,lengthMeters:length,color:{...color},resolution:"sales_follow_up"}:{type:"article_number",articleNumber:option!.articleNumber,lengthMeters:length,color:{...color}};
  return freeze({ok:true,line:{contractVersion:"2.0.0",product:{id:dto.product.id,model:dto.product.model,publicPath:dto.product.publicPath},selection,configuration:{packaging:{basePackaging:base,logoPrinting:values.logoPrinting,protectionArrangement:protection}},quantityUnit:"piece",quantity}});
}
