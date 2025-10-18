import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { createClient } from '@/lib/supabase/client'

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
        const supabase = createClient()
        
        // Query the database using Supabase client to check user role
        const { data: userRecord, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error checking admin role:', error)
          setIsAdmin(false)
          return
        }

        const hasAdminRole = userRecord && userRecord.role === 'admin'
        setIsAdmin(hasAdminRole)
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