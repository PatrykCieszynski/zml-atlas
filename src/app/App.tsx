import { AtlasPage } from '../pages/AtlasPage'
import { PairingPage } from '../pages/PairingPage'
import { ResourcesPage } from '../pages/ResourcesPage'

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/pair') {
    return <PairingPage />
  }

  if (path === '/resources') {
    return <ResourcesPage />
  }

  return <AtlasPage />
}
