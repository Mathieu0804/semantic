'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [entrepriseName, setEntrepriseName] = useState('PME IA Assistant')

  useEffect(() => {
    const savedName = localStorage.getItem('entrepriseName')
    if (savedName) setEntrepriseName(savedName)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">{entrepriseName}</h1>
      <p className="mb-4">Bienvenue sur votre assistant IA PME/PMI.</p>
      <Link href="/entreprise">
        <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          Configurer l'entreprise
        </button>
      </Link>
    </div>
  )
}
