const API='/api';
async function request(path, options={}){
 const token=sessionStorage.getItem('surgicare_admin_token');
 const res=await fetch(`${API}${path}`,{headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{   }),...(options.headers||{})},...options});
 if(res.status===401&&token){sessionStorage.removeItem('surgicare_admin_token');window.dispatchEvent(new Event('surgicare:unauthorised'))}
 if(!res.ok) throw new Error((await res.json().catch(()=>({}))).message||'The request could not be completed.');
 return res.status===204?null:res.json();
}
export default {
 get:path=>request(path),
 post:(path,data)=>request(path,{method:'POST',body:JSON.stringify(data)}),
 put:(path,data)=>request(path,{method:'PUT',body:JSON.stringify(data)}),
 patch:(path,data)=>request(path,{method:'PATCH',body:JSON.stringify(data)}),
 delete:path=>request(path,{method:'DELETE'})
};
