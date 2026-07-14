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
  const [userName, setUserName] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Look up the role (and optional display name) for a given uid in the
  // `users` collection. Expected doc shape:
  // users/{uid} => { role: 'admin' | 'staff', email, name? }
  async function fetchUserProfile(uid) {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        const data = userDocSnap.data()
        return { role: data.role ?? null, name: data.name ?? null }
      }
      return { role: null, name: null }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      return { role: null, name: null }
    }
  }

  function applyProfile(profile, fallbackEmail) {
    setRole(profile.role)
    setUserName(profile.name || fallbackEmail?.split('@')[0] || null)
  }

  async function login(email, password) {
    setAuthError(null)
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const profile = await fetchUserProfile(credential.user.uid)
    applyProfile(profile, credential.user.email)
    return profile.role
  }

  async function logout() {
    await signOut(auth)
    setRole(null)
    setUserName(null)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      if (user) {
        setCurrentUser(user)
        const profile = await fetchUserProfile(user.uid)
        applyProfile(profile, user.email)
      } else {
        setCurrentUser(null)
        setRole(null)
        setUserName(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    role,
    userName,
    loading,
    authError,
    login,
    logout,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
