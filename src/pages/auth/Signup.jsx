import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { saveToken } from '../../utils/auth'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    if(!email || !password || !name){ setError('Please fill all fields'); return }

    setLoading(true)
    try{
      // backend expected to accept role param (student | staff)
      const res = await api.post('/api/auth/register', { name, email, password, role })
      const { token } = res.data
      if(token){
        saveToken(token)
        // redirect based on role
        if(role === 'student') nav('/student')
        else if(role === 'staff') nav('/staff')
        else nav('/')
      }else{
        setError('No token returned from server')
      }
    }catch(err){
      setError(err?.response?.data?.message || 'Signup failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />

        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" />

        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="8+ characters" />

        <label>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
        </select>

        {error && <div className="error">{error}</div>}

        <button className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
      </form>
    </div>
  )
}