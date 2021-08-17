
// 此哈希函数来源于提问的解答：
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript  
export const customHash = (str:string):number => {
  var hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

