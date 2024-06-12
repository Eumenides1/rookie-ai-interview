"use client"
import React, { useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"  
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAiModal'
import { LoaderCircle } from 'lucide-react'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { useRouter } from 'next/navigation'


function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false)
    const [jobPosition, setJobPosition]= useState()
    const [jobDesc, setJobDesc]= useState()
    const [jobExperience, setJobExperience]= useState()
    const [loading, setLoading] = useState(false)
    const [jsonResponse, setJsonResponse] = useState([])
    const router = useRouter()
    const {user} = useUser()

    const onSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()
        console.log(jobDesc, jobPosition, jobExperience);

        const InputPrompt = "Job Position: "+jobPosition+", Job Description: "+jobDesc+", Years of Experience: "+jobExperience+
        ", 你是一个大型互联网公司的资深技术专家，以上是面试者提供的个人工作经历信息，请根据以上信息给我"+process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT +"道面试题以及面试题答案，请将 question 和 answer 作为 Json 字段，并使用 Json 格式返回；"

        const result = await chatSession.sendMessage(InputPrompt);
        

        const MockJsonResp =(result.response.text()).replace('```json', '').replace('```', '')

        setJsonResponse(MockJsonResp)
        if (MockJsonResp) {
            const resp= await db.insert(MockInterview).values({
                mockId: uuidv4(),
                jsonMockResp: MockJsonResp,
                jobPosition: jobPosition,
                jobDesc: jobDesc,
                jobExperience: jobExperience,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-yyyy')
            }).returning({mockId: MockInterview.mockId})
    
            console.log("Insert Id:", resp);
            if (resp) {
                setOpenDialog(false)
                router.push(`/dashboard/interview/${resp[0]?.mockId}`)
            }
        } else {
            setLoading(false)
        }
    }
    return (
        <div>
            <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
                onClick={()=>setOpenDialog(true)}
            >
                <h2 className='text-lg text-center'>
                    + Add New
                </h2>
            </div>
            <Dialog open={openDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Tell us more about your job interviewing</DialogTitle>
                        <DialogDescription>
                            <form onSubmit={onSubmit}>
                                <div>
                                    <h2>Add Details about your job position/role, Job description and years of experience </h2>
                                    <div className='mt-7 my-3'>
                                        <label>Job Role / Job Position</label>
                                        <Input placeholder="Ex. Full Stack Developer" required 
                                            onChange={(event)=>setJobPosition(event.target.value)}
                                        />
                                    </div>
                                    <div className='my-3'>
                                        <label>Job Description / Tech Stack (in Short) </label>
                                        <Textarea placeholder="Ex. Java , SpringBoot , Redis , JUC etc" required 
                                        onChange={(event)=>setJobDesc(event.target.value)}
                                        />
                                    </div>
                                    <div className='my-3'>
                                        <label>Years of experience</label>
                                        <Input placeholder="Ex.5" type="number" max="20" required 
                                        onChange={(event)=>setJobExperience(event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-5 justify-end'>
                                    <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <><LoaderCircle className='animate-spin'/>Generating from AI</>: 'Start Interview' }</Button>
                                </div>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview