"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

const Home = () => {
  const router = useRouter()
  const [value, setValue] = React.useState<string>('');
  const trpc = useTRPC()
  const {data: messages} = useQuery(trpc.messages.getMany.queryOptions())
  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onSuccess: (data) => {
      toast.success('Message created')
      router.push(`/projects/${data.id}`)
    },
    onError: () => {
      console.log('Something is wrong')
    }
  }))
  
  return (
    <div className='font-bold text-rose-500'>
      <Input value={value} onChange={(e)=> setValue(e.target.value)}/>
      <Button disabled={createProject.isPending} onClick={() => createProject.mutate({ value })}>
        {createProject.isPending ? 'Loading...' : 'Click Me'}
      </Button>
      {JSON.stringify(messages, null, 2)}
    </div>
  )
}

export default Home