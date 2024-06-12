"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text'
import { Mic,StopCircle } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAiModal'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/db'
import moment from 'moment'

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex,interviewData }) {
    const [userAnswer, setUserAnswer] = useState('')
    const userAnswerRef = useRef('') // 使用 useRef 来持久化 userAnswer 的值
    const {user}=useUser();
    const [loading,setLoading]=useState(false);

    let speechToTextHook;
    if (typeof window !== 'undefined') {
        speechToTextHook = useSpeechToText({
            continuous: true,
            useLegacyResults: false,
        });
    }

    const { error, interimResult, isRecording, results, startSpeechToText, stopSpeechToText,setResults } = speechToTextHook || {};


    useEffect(() => {
        results.forEach((result) => {
            if (result.transcript) { // 确保转录结果非空
                const updatedAnswer = userAnswerRef.current + result.transcript;
                userAnswerRef.current = updatedAnswer; // 更新 useRef 的值
                setUserAnswer(updatedAnswer);
                console.log("Updated userAnswer:", updatedAnswer); // 调试信息
            }
        });
    }, [results]);

    const SaveUserAnswer = async () => {
        
        if (isRecording) {
            setLoading(true)
            stopSpeechToText();

            // 使用 setTimeout 确保状态更新完成
            setTimeout(async () => {
                
                const currentUserAnswer = userAnswerRef.current;
                console.log("Current User Answer on Save:", currentUserAnswer); // 调试信息
                if (currentUserAnswer.length < 10) {
                    console.log(currentUserAnswer.length);
                    toast('提交答案出错，请尝试重新录音并提交');
                    return;
                }

                const feedbackPrompt = "Question:" + mockInterviewQuestion[activeQuestionIndex]?.question +
                    ", User Answer:" + currentUserAnswer + "根据问题和用户的回答来提供面试问题，请为回答和反馈提供评分，评分请务必在 1-10 分之内打分，指出需要改进的地方（如果有的话），请在 3 到 5 行内以 JSON 格式提供改进意见，如果用户使用中文回答，请务必使用中文回复，其中包含rating字段和feedback字段，ranting 字段务必在 1-10 之内，并必须是一个数字";
                const result = await chatSession.sendMessage(feedbackPrompt);
                const mockJsonResp = (await result.response.text()).replace('```json', '').replace('```', '');
                const JsonFeedbackResp = JSON.parse(mockJsonResp);
                
                const resp=await db.insert(UserAnswer)
                .values({
                    mockIdRef:interviewData?.mockId,
                    question:mockInterviewQuestion[activeQuestionIndex]?.question,
                    correctAns:mockInterviewQuestion[activeQuestionIndex]?.answer,
                    userAns:currentUserAnswer,
                    feedback:JsonFeedbackResp?.feedback,
                    rating:JsonFeedbackResp?.rating,
                    userEmail:user?.primaryEmailAddress?.emailAddress,
                    createdAt:moment().format('DD-MM-yyyy')
                })

                if(resp){
                    toast('User Answer recorded successfully');
                    setUserAnswer('');
                    setResults([])
                }
                setResults([])
                setLoading(false);
                

            }, 1000); // 延迟 100 毫秒，确保状态更新完成
        } else {
            startSpeechToText();
        }
    };

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5'>
                <Image src={'/webcam.png'} width={200} height={200} className='absolute'/>
                {typeof window !== 'undefined' && (
                    <Webcam 
                        mirrored={true}
                        style={{
                            height: 300,
                            width: '100%',
                            index: 10
                        }}
                    />
                )}
            </div>
            <Button 
                disabled={loading}
                variant="outline" className="my-10"
                onClick={SaveUserAnswer}
            >
                {isRecording?
                <h2 className='text-red-600 animate-pulse flex gap-2 items-center'>
                    <StopCircle/>Stop Recording
                </h2>
                :
                
                <h2 className='text-primary flex gap-2 items-center'>
                    <Mic/>  Record Answer
                </h2> 
                }
            </Button>
        </div>
    )
}

export default RecordAnswerSection;
