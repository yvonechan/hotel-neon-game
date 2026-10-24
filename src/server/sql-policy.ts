/** A deliberately small, finite-work SELECT language. SQLite evaluates accepted SQL. */
export class SqlPolicyError extends Error {}
type Token={kind:'word'|'string'|'number'|'symbol';value:string};
const deny=():never=>{throw new SqlPolicyError('query_unsupported')};
const columns=new Set(['REF','ITEM','VISIBILITY','RECEIPT']);
function tokenize(sql:string):Token[]{
 const tokens:Token[]=[];let i=0;
 while(i<sql.length){
  const c=sql[i];if(/\s/.test(c)){i++;continue;}
  if(sql.startsWith('--',i)){const end=sql.indexOf('\n',i+2);i=end<0?sql.length:end+1;continue;}
  if(sql.startsWith('/*',i)){const end=sql.indexOf('*/',i+2);if(end<0)deny();i=end+2;continue;}
  if(c==="'"){const start=i++;let closed=false;while(i<sql.length){if(sql[i++]==="'"){if(sql[i]==="'"){i++;continue;}closed=true;break;}}if(!closed)deny();tokens.push({kind:'string',value:sql.slice(start,i)});}
  else{const word=/^[A-Za-z_][A-Za-z_0-9]*/.exec(sql.slice(i));const number=/^\d+(?:\.\d+)?/.exec(sql.slice(i));
   if(word){tokens.push({kind:'word',value:word[0].toUpperCase()});i+=word[0].length;}
   else if(number){if(Number(number[0])>1000000)deny();tokens.push({kind:'number',value:number[0]});i+=number[0].length;}
   else{const pair=sql.slice(i,i+2);const op=['<=','>=','<>','!=','==','||'].includes(pair)?pair:c;if(!['(',')',',','.','+','-','*','/','%','=','<','>','<=','>=','<>','!=','==','||'].includes(op))deny();tokens.push({kind:'symbol',value:op});i+=op.length;}
  }
  if(tokens.length>120)deny();
 }
 return tokens;
}
class SelectPolicy{
 private at=0;private selects=0;
 constructor(private tokens:Token[]){}
 peek(value:string){return this.tokens[this.at]?.value===value;}
 take(value:string){if(this.peek(value)){this.at++;return true;}return false;}
 need(value:string){if(!this.take(value))deny();}
 depth(value:number){if(value>10)deny();}
 select(depth=0){
  this.depth(depth);this.term(depth);
  while(this.take('UNION')){this.take('ALL');this.term(depth);}
  if(this.take('LIMIT')){const token=this.tokens[this.at++];if(token?.kind!=='number'||!/^\d+$/.test(token.value)||Number(token.value)>20)deny();}
 }
 term(depth:number){
  if(++this.selects>4)deny();this.need('SELECT');this.take('DISTINCT');let count=0;
  do{if(++count>3)deny();this.expr(0,depth+1);}while(this.take(','));
  if(this.take('FROM'))this.need('RESERVATIONS');
  if(this.take('WHERE'))this.expr(0,depth+1);
 }
 expr(min:number,depth:number){
  this.depth(depth);this.primary(depth);
  for(;;){
   let op=this.tokens[this.at]?.value;let negated=false;
   if(op==='NOT'&&['LIKE','IN'].includes(this.tokens[this.at+1]?.value)){op=this.tokens[this.at+1].value;negated=true;}
   const precedence=op==='OR'?10:op==='AND'?20:['=','==','!=','<>','<','>','<=','>=','LIKE','IS','IN'].includes(op)?30:op==='||'?40:['+','-'].includes(op)?50:['*','/','%'].includes(op)?60:0;
   if(!precedence||precedence<min)return;this.at+=negated?2:1;
   if(op==='IS')this.take('NOT');
   if(op==='IN'){
    this.need('(');if(this.peek('SELECT'))this.select(depth+1);else{let count=0;do{if(++count>8)deny();this.expr(0,depth+1);}while(this.take(','));}this.need(')');
   }else this.expr(precedence+1,depth+1);
  }
 }
 primary(depth:number){
  if(this.take('NOT')){this.expr(25,depth+1);return;}
  if(this.take('+')||this.take('-')){this.expr(70,depth+1);return;}
  if(this.take('EXISTS')){this.need('(');this.select(depth+1);this.need(')');return;}
  if(this.take('(')){if(this.peek('SELECT'))this.select(depth+1);else this.expr(0,depth+1);this.need(')');return;}
  const token=this.tokens[this.at++];if(!token)deny();
  if(token.kind==='number'||token.kind==='string')return;
  if(token.kind!=='word')deny();
  if(['NULL','TRUE','FALSE'].includes(token.value))return;
  if(this.take('(')){
   if(token.value==='COUNT'){this.need('*');this.need(')');return;}
   if(!['LOWER','UPPER','LENGTH','ABS'].includes(token.value))deny();this.expr(0,depth+1);this.need(')');return;
  }
  if(token.value==='RESERVATIONS'&&this.take('.')){const column=this.tokens[this.at++];if(column?.kind!=='word'||!columns.has(column.value))deny();return;}
  if(!columns.has(token.value))deny();
 }
 validate(){this.select();if(this.at!==this.tokens.length)deny();}
}
export function compileChallenge(input:string){
 if(typeof input!=='string'||input.length>200||new TextEncoder().encode(input).length>800||/[\u0000-\u001f\u007f]/.test(input))deny();
 const query=`SELECT ref,item,receipt FROM reservations WHERE item LIKE '%${input}%' AND visibility = 'guest'`;
 const tokens=tokenize(query);new SelectPolicy(tokens).validate();
 // Execute canonical accepted tokens, never the original untrusted SQL string.
 return{query,sql:tokens.map(token=>token.value).join(' ')};
}
