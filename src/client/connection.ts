type Clock={set:(fn:()=>void,ms:number)=>unknown;clear:(id:unknown)=>void};
const clock:Clock={set:(fn,ms)=>setTimeout(fn,ms),clear:id=>clearTimeout(id as ReturnType<typeof setTimeout>)};
// A socket can remain OPEN after Wi-Fi disappears. Require an application pong.
export function monitorSocket(socket:{send:(message:string)=>void},onTimeout:()=>void,timers:Clock=clock){
 let timer:unknown,stopped=false;
 const stop=()=>{stopped=true;timers.clear(timer)};
 const check=()=>{if(stopped)return;timers.clear(timer);timer=timers.set(()=>{if(stopped)return;stop();onTimeout()},10000);try{socket.send('ping')}catch{stop();onTimeout()}};
 const receive=(message:unknown)=>{if(stopped||message!=='pong')return;timers.clear(timer);timer=timers.set(check,20000)};
 check();return{receive,check,stop};
}
