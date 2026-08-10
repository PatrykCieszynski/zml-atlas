import { AtlasPage } from '../pages/AtlasPage'
import { PairingPage } from '../pages/PairingPage'

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/pair') {
    return <PairingPage />
  }

  return <AtlasPage />
}
