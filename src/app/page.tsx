"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation, } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'

const Home = () => {
  const [value, setValue] = React.useState<string>('');
  const trpc = useTRPC()
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success('Background job has been started')
    },
    onError: () => {
      console.log('Something is wrong')
    }
  }))
  return (
    <div className='font-bold text-rose-500'>
      <Input value={value} onChange={(e)=> setValue(e.target.value)}/>
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ value })}>
        {invoke.isPending ? 'Loading...' : 'Click Me'}
      </Button>
    </div>
  )
}

export default Home