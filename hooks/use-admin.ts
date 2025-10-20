import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

export function useAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setIsAdmin(false)
        setAdminLoading(false)
        return
      }

      try {
        setAdminLoading(true)
        const res = await fetch('/api/users/me', { credentials: 'include' })
        const json = await res.json()
        if (!res.ok || !json?.success) {
          console.error('Error checking admin role:', json?.error || res.statusText)
          setIsAdmin(false)
          return
        }
        setIsAdmin(json.isAdmin === true || json?.data?.role === 'admin')
      } catch (error) {
        console.error('Error checking admin role:', error)
        setIsAdmin(false)
      } finally {
        setAdminLoading(false)
      }
    }

    checkAdminRole()
  }, [user])

  return { isAdmin, adminLoading }
}