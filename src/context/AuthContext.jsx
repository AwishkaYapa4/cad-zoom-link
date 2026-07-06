// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Look up the role for a given uid in the `users` collection.
  // Expected doc shape: users/{uid} => { role: 'admin' | 'staff', email, name? }
  async function fetchUserRole(uid) {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        return userDocSnap.data().role ?? null
      }
      return null
    } catch (err) {
      console.error('Failed to fetch user role:', err)
      return null
    }
  }

  async function login(email, password) {
    setAuthError(null)
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const userRole = await fetchUserRole(credential.user.uid)
    setRole(userRole)
    return userRole
  }

  async function logout() {
    await signOut(auth)
    setRole(null)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      if (user) {
        setCurrentUser(user)
        const userRole = await fetchUserRole(user.uid)
        setRole(userRole)
      } else {
        setCurrentUser(null)
        setRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    role,
    loading,
    authError,
    login,
    logout,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
