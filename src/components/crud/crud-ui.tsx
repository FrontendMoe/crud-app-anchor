'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudProgram, useCrudProgramAccount } from './crud-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '../cluster/cluster-data-access'

export function CrudCreate() {
  // const { initialize } = useCrudProgram()
  const [message, setMessage] = useState("")
  const cluster = useCluster()
  const [title, setTitle] = useState("")
  const { createEntry } = useCrudProgram()
  const { publicKey } = useWallet()
  const isFormValid = title.trim() !== "" && message.trim() !== "";
  
  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }
  useEffect(() => {
    console.log(cluster)
  },[cluster])
  return (
    <div className="flex flex-col items-center space-y-[5px]">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
      />
      <br></br>
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
      >
        Create Journal Entry {createEntry.isPending && "..."}
      </button>
    </div>
  )
}

export function CrudList() {
  const { accounts, getProgramAccount   } = useCrudProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CrudCard({ account }: { account: PublicKey }) {
  const { accountQuery ,deleteEntry , updateEntry } = useCrudProgramAccount({
    account,
  })
  const [newMessage, setNewMessage] = useState("")
  const title = accountQuery.data?.title;
    const { publicKey } = useWallet();

  useEffect(() => {
    console.log({
        accountQuery
      })
  } ,[accountQuery])

  useEffect(() => {
    console.log(newMessage)
  },[newMessage])
  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
      <div className='bg-white text-black rounded p-5 overflow-hidden'>
        <p>Title : {accountQuery.data?.title }</p>
        <input placeholder={`Message : ${accountQuery.data?.message}`} onChange={(e)=>{setNewMessage(e.target.value)}}/>
          
        <p>Owner : {accountQuery.data?.owner.toString()}</p>
        <div className='flex space-x-[10px]'>
          <button       
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?"
                  )
                ) {
                  return;
                }
                const title = accountQuery.data?.title;
                if (title) {
                  return deleteEntry.mutateAsync(title);
                }
              }}
              disabled={deleteEntry.isPending} className='bg-red-200 p-2 rounded'>Delete</button>
          <button onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to update this account?"
                  )
                ) {
                  return;
                } 
                              const title = accountQuery.data?.title;

                if (newMessage && newMessage.length> 0 && title && publicKey) {
                  return  updateEntry.mutateAsync({ title , message : newMessage, owner: publicKey });

                }
              }} className='bg-red-200 p-2 rounded'>Update</button>
        </div>
    </div>
  )
}
