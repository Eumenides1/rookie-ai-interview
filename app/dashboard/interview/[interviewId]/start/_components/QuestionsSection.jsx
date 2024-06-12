import { Lightbulb, Volume2 } from 'lucide-react'
import React, { useEffect } from 'react'

function QuestionsSection({mockInterviewQuestion,activeQuestionIndex}) {
    const textToSpeech = (text) => {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance(text)
            window.speechSynthesis.speak(speech)
        }else {
            alert('Sorry, Your browser dose not support')
        }
    }
    return mockInterviewQuestion&&(
        <div className='p-5 border rounded-lg my-10'>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                {Array.isArray(mockInterviewQuestion) && mockInterviewQuestion.map((question,index)=>(
                    <h2  key={index}  className={`p-2 rounded-full 
                    text-xs md:text-sm text-center cursor-pointer
                    ${activeQuestionIndex==index && 'bg-black text-white text-border'}
                    ${activeQuestionIndex!=index && ' bg-secondary'}
                    `}>
                        Question #{index + 1}
                    </h2>
                ))}
            </div>
            <h2 className='my-5 text-sm md:text-lg'>{mockInterviewQuestion[activeQuestionIndex]?.question}</h2>
            <Volume2 onClick={()=>textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)} />
            <div className='border rounded-lg p-5 bg-blue-100 mt-20'>
                <h2 className='flex gap-2 items-center text-primary'>
                    <Lightbulb />
                    <strong>Note:</strong>
                </h2>
                <h2 className='text-sm text-primary my-2'>在仔细阅读题目了解提问意图之后，请点击右侧按钮，开始作答；要求语音咬字清晰，普通话标准</h2>
            </div>
        </div>
    )
}

export default QuestionsSection