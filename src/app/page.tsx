"use client"
import { useTRPC } from '@/trpc/client'
import { useQuery, } from '@tanstack/react-query'
import React from 'react'

const Home = () => {
  const trpc = useTRPC()
  const { data } = useQuery(trpc.hello.queryOptions({ text: 'world' }))
  return (
    <div className='font-bold text-rose-500'>{ JSON.stringify(data)}</div>
  )
}

export default Home