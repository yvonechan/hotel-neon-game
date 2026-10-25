// HTTP errors can arrive after a teammate's WebSocket success.
export function findingResolved(type:string,submittedStage:number|undefined,current:{stage:number;pending:boolean;complete:boolean}|null){
 if(!current)return false;
 if(type==='finale')return current.complete;
 return type==='submit'&&(current.complete||current.pending||submittedStage!==current.stage);
}
