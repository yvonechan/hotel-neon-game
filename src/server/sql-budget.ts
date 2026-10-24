export type SqlBudget={window:number;count:number;day:number;daily:number};
export function chargeSqlBudget(old:SqlBudget|undefined,now:number):{budget:SqlBudget}|{code:'lab_busy'|'lab_quota'}{
 const day=Math.floor(now/86400000),sameWindow=!!old&&now>=old.window&&now-old.window<10000;
 const budget:SqlBudget={window:sameWindow?old!.window:now,count:sameWindow?old!.count:0,day,daily:old?.day===day?old.daily:0};
 if(budget.daily>=500)return{code:'lab_quota'};
 if(budget.count>=14)return{code:'lab_busy'};
 budget.count++;budget.daily++;return{budget};
}
