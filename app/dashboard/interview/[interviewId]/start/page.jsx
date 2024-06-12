"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

function StartInterview({params}) {

    const [interviewData, setInterviewData] = useState(null)
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]) 
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

    useEffect(() => {
        GetInterviewDetails();
    }, []);

    const GetInterviewDetails = async () => {
        try {
            const result = await db.select().from(MockInterview).where(eq(MockInterview.mockId, params.interviewId));
            if (result && result.length > 0) {
                const jsonMockResp = JSON.parse(result[0].jsonMockResp);
                setMockInterviewQuestion(jsonMockResp.questions);
                setInterviewData(result[0]);
            } else {
                console.error("No results found for the given interview ID.");
            }
        } catch (error) {
            console.error("Error fetching interview details:", error);
        }
    };
    useEffect(() => {
        console.log("mockInterviewQuestion updated:", mockInterviewQuestion);
    }, [mockInterviewQuestion]);

    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                {mockInterviewQuestion && mockInterviewQuestion.length > 0 ? (
                    <QuestionsSection 
                        mockInterviewQuestion={mockInterviewQuestion} 
                        activeQuestionIndex={activeQuestionIndex}  
                    />
                ) : (
                    <div>Loading questions...</div>
                )}

                <RecordAnswerSection 
                    mockInterviewQuestion={mockInterviewQuestion} 
                    activeQuestionIndex={activeQuestionIndex} 
                    interviewData={interviewData}
                />
            </div>
            <div className='flex justify-end gap-6'>
                {activeQuestionIndex>0&&<Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)}>上一题</Button>}
                {activeQuestionIndex!=mockInterviewQuestion?.length -1 && <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}>下一题</Button>}
                {activeQuestionIndex==mockInterviewQuestion?.length -1 && 
                    <Link href={'/dashboard/interview/'+interviewData?.mockId+"/feedback"}>
                        <Button>结束面试</Button>
                    </Link>
                }
            </div>
        </div>
    )
}

export default StartInterview