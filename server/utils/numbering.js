export function nextNumber(prefix,count){return `${prefix}-${new Date().getFullYear()}-${String(count+1).padStart(3,'0')}`}
