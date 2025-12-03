// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUserFromToken } from '../utils/auth'


export default function ProtectedRoute({ children, allowedRoles }){
if(!isAuthenticated()){
return <Navigate to="/login" replace />
}


if(Array.isArray(allowedRoles) && allowedRoles.length){
const user = getUserFromToken()
if(!user || !user.role || !allowedRoles.includes(user.role)){
// not authorized for this role
return <div style={{padding:20}}>403 — Not authorized</div>
}
}


return children
}