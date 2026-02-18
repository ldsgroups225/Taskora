import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  useEffect(() => {
    if (needRefresh) {
      toast('New content available, click to reload', {
        action: {
          label: 'Reload',
          onClick: () => {
            updateServiceWorker(true)
          },
        },
        duration: Infinity,
        onDismiss: () => setNeedRefresh(false),
      })
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh])

  return null
}
