import { jwtDecode } from 'jwt-decode'


export function saveToken(token){
localStorage.setItem('token', token)
}
export function clearToken(){
localStorage.removeItem('token')
}
export function getToken(){
return localStorage.getItem('token')
}


export function isAuthenticated(){
const token = getToken()
if(!token) return false
try{
const { exp } = jwtDecode(token)
if(exp && Date.now() >= exp * 1000){
clearToken()
return false
}
return true
}catch(e){
clearToken()
return false
}
}


export function getUserFromToken(){
const token = getToken()
if(!token) return null
try{ return jwtDecode(token) }catch(e){ return null }
}