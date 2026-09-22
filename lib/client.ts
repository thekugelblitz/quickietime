import type {Brief,Entry} from './config';
export async function api<T>(path:string,body?:unknown,method?:string):Promise<T>{const r=await fetch('/api/'+path,{method:method||(body?'POST':'GET'),headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});const data=await r.json() as T&{error?:{code:string;message:string}};if(!r.ok)throw Object.assign(new Error(data.error?.message||'Something went sideways. Try again.'),{code:data.error?.code});return data}
export function local<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
export function persist(key:string,value:unknown){localStorage.setItem(key,JSON.stringify(value))}
export function stash(brief:Brief,entry:Entry|null){persist('qt-pending',{brief,entry,expires:Date.now()+86400000})}
export function downloadText(text:string,name='quickietime-draft.txt'){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
