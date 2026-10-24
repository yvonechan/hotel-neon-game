export const ABANDONED_ROOM_TTL_MS=7*24*60*60*1000;
export const COMPLETED_ROOM_TTL_MS=24*60*60*1000;

export function roomExpiryAt(room:{complete:boolean;lastActiveAt?:number},fallback=Date.now()){
 const lastActive=Number.isFinite(room.lastActiveAt)?Number(room.lastActiveAt):fallback;
 return lastActive+(room.complete?COMPLETED_ROOM_TTL_MS:ABANDONED_ROOM_TTL_MS);
}
