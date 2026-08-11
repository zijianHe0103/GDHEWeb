"use client";

import { useState, type FormEvent } from "react";
import {
  buildPublicProductConfiguratorDraft,
  buildPublicProductConfiguratorDraftV3,
  projectPublicColorChoices,
  projectPublicTrackLengthChoices,
} from "../../lib/product-configuration/v2/build-public-draft";
import { useQuoteBasket } from "../../lib/quote-basket/use-quote-basket";
import type {
  PublicProductConfiguratorField,
  PublicProductConfiguratorFormValues,
  PublicProductConfiguratorViewModel,
  PublicQuoteDraft,
} from "../../types/product-configurator";
import type { PublicQuoteBasketProduct } from "../../types/quote-basket";
import type { ReadyConfiguredDraftV3 } from "../../types/quote-basket-v3";
import styles from "./product-configurator.module.css";

type Props = Readonly<{
  configuration: PublicProductConfiguratorViewModel;
  product: PublicQuoteBasketProduct;
}>;
export type ProductConfiguratorResultState = Readonly<{errors:readonly PublicProductConfiguratorField[];latestDraft:PublicQuoteDraft|null}>;
type FieldError = Readonly<{invalid:true;describedBy:string;id:string;message:string}>;
type BasketDraftResult =
  | Readonly<{
      ok: true;
      draft: PublicQuoteDraft;
      mutation: "added" | "merged";
    }>
  | Readonly<{
      ok: false;
      errors: readonly PublicProductConfiguratorField[];
    }>;
type BasketDraftResultV3 =
  | Readonly<{
      ok: true;
      draft: ReadyConfiguredDraftV3;
      mutation: "added" | "merged";
    }>
  | Readonly<{
      ok: false;
      errors: readonly PublicProductConfiguratorField[];
    }>;

const messages:Record<PublicProductConfiguratorField,string>={selection:"Choose a track length.",customLength:"Enter a positive length with at most one decimal place.",color:"Choose an available color.",basePackaging:"Choose a base packaging option.",logoPrinting:"Choose whether customer logo printing is required.",protectionArrangement:"Choose an available protection arrangement.",quantity:"Enter a positive whole-number quantity."};

export function createProductConfiguratorResultState():ProductConfiguratorResultState{return Object.freeze({errors:Object.freeze([]),latestDraft:null});}
export function applyProductConfiguratorSubmission(configuration:PublicProductConfiguratorViewModel,current:ProductConfiguratorResultState,values:PublicProductConfiguratorFormValues):ProductConfiguratorResultState{const result=buildPublicProductConfiguratorDraft(configuration,values);return result.ok?Object.freeze({errors:Object.freeze([]),latestDraft:result.draft}):Object.freeze({errors:Object.freeze(result.errors.map(({field})=>field)),latestDraft:current.latestDraft});}
export function submitPublicQuoteDraftToBasket(
  configuration: PublicProductConfiguratorViewModel,
  values: PublicProductConfiguratorFormValues,
  add: (draft: PublicQuoteDraft) => Readonly<{ mutation: "added" | "merged" }>,
): BasketDraftResult {
  const result = buildPublicProductConfiguratorDraft(configuration, values);
  if (!result.ok) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze(result.errors.map(({ field }) => field)),
    });
  }
  const mutation = add(result.draft).mutation;
  return Object.freeze({ ok: true, draft: result.draft, mutation });
}
export function submitPublicQuoteDraftToBasketV3(
  configuration: PublicProductConfiguratorViewModel,
  values: PublicProductConfiguratorFormValues,
  add: (draft: ReadyConfiguredDraftV3) => Readonly<{ mutation: "added" | "merged" }>,
): BasketDraftResultV3 {
  const result = buildPublicProductConfiguratorDraftV3(configuration, values);
  if (!result.ok) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze(result.errors.map(({ field }) => field)),
    });
  }
  const mutation = add(result.draft).mutation;
  return Object.freeze({ ok: true, draft: result.draft, mutation });
}
export function getProductConfiguratorFieldError(field:PublicProductConfiguratorField,errors:readonly PublicProductConfiguratorField[]):FieldError|null{if(!errors.includes(field))return null;const id=`${field}-error`;return Object.freeze({invalid:true,describedBy:id,id,message:messages[field]});}
function ErrorText({field,errors}:{field:PublicProductConfiguratorField;errors:readonly PublicProductConfiguratorField[]}){const error=getProductConfiguratorFieldError(field,errors);return error?<p id={error.id} className={styles.error}>{error.message}</p>:null;}

export function LatestPublicQuoteDraftSummary({draft}:{draft:PublicQuoteDraft}){const packaging=draft.packaging;return <div><p>Latest temporary quote item</p><dl>
  <div><dt>Model</dt><dd>{draft.product.model}</dd></div>
  <div><dt>Length Type</dt><dd>{draft.selection.type==="standard"?"Standard Length":"Custom Length"}</dd></div>
  <div><dt>Length</dt><dd>{draft.selection.lengthMeters} m</dd></div>
  <div><dt>Color</dt><dd>{draft.selection.color.label}</dd></div>
  <div><dt>Base Packaging</dt><dd>{packaging.basePackaging.label}</dd></div>
  <div><dt>Customer Logo Printing</dt><dd>{packaging.logoPrinting?"Yes":"No"}</dd></div>
  <div><dt>Protection Arrangement</dt><dd>{packaging.protectionArrangement===null?"None":packaging.protectionArrangement.label}</dd></div>
  <div><dt>Quantity</dt><dd>{draft.quantity} {draft.quantityUnit}</dd></div>
  </dl></div>;}

export function ProductConfigurator({configuration,product}:Props){
  const [lengthChoice,setLengthChoice]=useState("");const [customLength,setCustomLength]=useState("");const [colorCode,setColorCode]=useState("");const [basePackaging,setBasePackaging]=useState("");const [logoPrinting,setLogoPrinting]=useState(false);const [protectionArrangement,setProtectionArrangement]=useState("");const [quantity,setQuantity]=useState("");const [result,setResult]=useState(createProductConfiguratorResultState);
  const quoteBasket=useQuoteBasket();
  const lengths=projectPublicTrackLengthChoices(configuration);const selection=lengthChoice==="custom"?{kind:"custom" as const}:lengthChoice.startsWith("standard:")?{kind:"standard" as const,lengthMeters:Number(lengthChoice.slice(9))}:null;const colors=selection?projectPublicColorChoices(configuration,selection):[];
  const error=(field:PublicProductConfiguratorField)=>getProductConfiguratorFieldError(field,result.errors);
  function chooseLength(value:string){setLengthChoice(value);const next=value==="custom"?{kind:"custom" as const}:{kind:"standard" as const,lengthMeters:Number(value.slice(9))};if(!projectPublicColorChoices(configuration,next).some((color)=>color.code===colorCode))setColorCode("");}
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const submission=submitPublicQuoteDraftToBasketV3(configuration,{lengthChoice,customLength,colorCode,basePackaging,logoPrinting,protectionArrangement:protectionArrangement||null,quantity},(draft)=>({mutation:quoteBasket.add(product,draft)??"added"}));setResult((current)=>submission.ok?Object.freeze({errors:Object.freeze([]),latestDraft:current.latestDraft}):Object.freeze({errors:submission.errors,latestDraft:current.latestDraft}));}
  return <section id="configure-product" className={styles.section} aria-labelledby="configurator-title"><div className={styles.introduction}><p className={styles.eyebrow}>Local configuration test</p><h2 id="configurator-title">Configure Your Track</h2><p>Choose the published track specification and packaging details for your Quote Basket.</p></div><div className={styles.card}><form onSubmit={submit} noValidate>
    <fieldset aria-invalid={error("selection")?.invalid} aria-describedby={error("selection")?.describedBy}><legend>Track Length</legend>{lengths.map((choice)=>{const value=choice.kind==="custom"?"custom":`standard:${choice.lengthMeters}`;return <label key={value}><input type="radio" name="track-length" value={value} checked={lengthChoice===value} onChange={()=>chooseLength(value)}/> {choice.label}</label>;})}<ErrorText field="selection" errors={result.errors}/></fieldset>
    {lengthChoice==="custom"&&<div className={styles.field}><label htmlFor="custom-length">Custom length (m)</label><input id="custom-length" inputMode="decimal" value={customLength} onChange={(event)=>setCustomLength(event.target.value)} aria-invalid={error("customLength")?.invalid} aria-describedby={error("customLength")?.describedBy}/><ErrorText field="customLength" errors={result.errors}/></div>}
    <fieldset aria-invalid={error("color")?.invalid} aria-describedby={error("color")?.describedBy}><legend>Color</legend>{colors.length?colors.map((color)=><label key={color.code}><input type="radio" name="color" value={color.code} checked={colorCode===color.code} onChange={()=>setColorCode(color.code)}/> {color.label}</label>):<p>Choose a track length first.</p>}<ErrorText field="color" errors={result.errors}/></fieldset>
    <div className={styles.field}><label htmlFor="base-packaging">Base packaging</label><select id="base-packaging" value={basePackaging} onChange={(event)=>setBasePackaging(event.target.value)} aria-invalid={error("basePackaging")?.invalid} aria-describedby={error("basePackaging")?.describedBy}><option value="">Choose packaging</option>{configuration.packaging.baseOptions.map((option)=><option key={option.key} value={option.key}>{option.label}</option>)}</select><ErrorText field="basePackaging" errors={result.errors}/></div>
    <div className={styles.field}><label className={styles.checkbox}><input type="checkbox" checked={logoPrinting} disabled={!configuration.packaging.logoPrintingAvailable} onChange={(event)=>setLogoPrinting(event.target.checked)}/> Customer Logo Printing</label></div>
    <div className={styles.field}><label htmlFor="protection">Protection arrangement (optional)</label><select id="protection" value={protectionArrangement} onChange={(event)=>setProtectionArrangement(event.target.value)}><option value="">None</option>{configuration.packaging.protectionOptions.map((option)=><option key={option.key} value={option.key}>{option.label}</option>)}</select></div>
    <div className={styles.field}><label htmlFor="quantity">Quantity (piece)</label><input id="quantity" inputMode="numeric" value={quantity} onChange={(event)=>setQuantity(event.target.value)} aria-invalid={error("quantity")?.invalid} aria-describedby={error("quantity")?.describedBy}/><ErrorText field="quantity" errors={result.errors}/></div>
    <button type="submit" disabled={!quoteBasket.hydrated}>Add to Quote</button></form><p className={styles.notice}>Saved in this browser for 30 days. Quote Basket items have not been sent.</p><div className={styles.result} aria-live="polite">{quoteBasket.error??quoteBasket.announcement}{quoteBasket.hydrated&&<p>{quoteBasket.basket?.items.length??0} quote basket {(quoteBasket.basket?.items.length??0)===1?"line":"lines"}</p>}<a href="/request-a-quote/">View Quote Basket</a></div></div></section>;
}

export function ProductConfiguratorUnavailable(){return <section className={styles.fallback} aria-labelledby="configuration-unavailable-title"><h2 id="configuration-unavailable-title">Online configuration is temporarily unavailable</h2><p>You can still continue to the request form.</p><a href="/request-a-quote/">Request a Quote</a></section>;}
