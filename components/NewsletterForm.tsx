'use client'

import React, { useEffect, useRef, useState } from 'react'

type ConfettiParams = {
  particleCount: number
  spread: number
}

export interface NewsletterFormProps {
  title?: string
  apiUrl?: string
}

const NewsletterForm = ({
  title = 'Subscribe to the newsletter',
  apiUrl = '/api/newsletter',
}: NewsletterFormProps) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [confetti, setConfetti] = useState<
    // eslint-disable-next-line no-unused-vars
    null | ((params: ConfettiParams) => void)
  >(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Dynamically import confetti to prevent SSR issues
    import('canvas-confetti').then((mod) => setConfetti(() => mod.default))

    // Load sound effect
    const sound = new Audio('/static/sounds/confetti.mp3')
    setAudio(sound)
  }, [])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value
    setIsValid(validateEmail(emailValue))
  }

  const subscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const res = await fetch(apiUrl, {
      body: JSON.stringify({
        email: inputEl.current!.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const { error } = await res.json()
    if (error) {
      setError(true)
      setMessage(
        'Your e-mail address is invalid or you are already subscribed!'
      )
      return
    }

    // Play sound effect
    if (audio) {
      audio.currentTime = 0 // Reset to start for consecutive clicks
      audio.play()
    }

    // Fire confetti
    if (confetti) {
      confetti({
        particleCount: 200,
        spread: 100,
      })
    }

    inputEl.current!.value = ''
    setError(false)
    setSubscribed(true)
  }

  return (
    <div>
      <div className="pb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </div>
      <form className="flex flex-col sm:flex-row" onSubmit={subscribe}>
        <div>
          <label htmlFor="email-input">
            <span className="sr-only">Email address</span>
            <input
              autoComplete="email"
              className="w-72 rounded-md px-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600 dark:bg-black"
              id="email-input"
              name="email"
              placeholder={
                subscribed ? "You're subscribed !  🎉" : 'Enter your email'
              }
              ref={inputEl}
              required
              type="email"
              disabled={subscribed}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="mt-2 flex w-full rounded-md shadow-sm sm:ml-3 sm:mt-0">
          <button
            className={`w-full rounded-md px-4 py-2 font-medium text-white sm:py-0 
    ${
      subscribed
        ? 'cursor-default bg-gray-400 dark:bg-gray-600'
        : 'bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-400'
    }
    ${!isValid || subscribed ? 'cursor-not-allowed bg-gray-400 opacity-50' : ''}
    focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:ring-offset-black`}
            type="submit"
            disabled={!isValid || subscribed}
          >
            {subscribed ? 'Thank you!' : 'Sign up'}
          </button>
        </div>
      </form>
      {error && (
        <div className="w-72 pt-2 text-sm text-red-500 dark:text-red-400 sm:w-96">
          {message}
        </div>
      )}
    </div>
  )
}

export default NewsletterForm
