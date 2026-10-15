import { useEffect, useState } from 'react'
import { getHealth, type HealthResponse } from './api'

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Runs once after the component first appears on screen.
  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <main className="min-h-screen bg-yellow-300 flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8 max-w-md w-full">
        <h1 className="text-4xl font-black mb-4">NSUT Bazaar</h1>

        {error && (
          <p className="bg-red-400 border-2 border-black p-3 font-bold">
            Could not reach backend: {error}
          </p>
        )}

        {!error && !health && <p className="font-bold">Checking backend...</p>}

        {health && (
          <p className="bg-green-400 border-2 border-black p-3 font-bold">
            Backend says: {health.status} ({health.app})
          </p>
        )}
      </div>
    </main>
  )
}

export default App
