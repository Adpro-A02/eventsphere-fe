'use client'

import { useState } from 'react'

export default function ReviewForm({ eventId, onSubmitSuccess }: { eventId: string, onSubmitSuccess: () => void }) {
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number>(5)

  const handleSubmit = async () => {
    const token = localStorage.getItem('token') 

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ eventId, comment, rating })
    })

    if (res.ok) {
      setComment('')
      setRating(5)
      onSubmitSuccess()
    }
  }

  return (
    <div className="mb-6">
      <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full p-2 border mb-2" placeholder="Tulis review..." />
      <input type="number" min={1} max={5} value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full p-2 border mb-2" />
      <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white">Kirim Review</button>
    </div>
  )
}
