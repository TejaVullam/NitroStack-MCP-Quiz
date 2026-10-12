'use client';
import { useState } from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';

type Question = { question:string; options:string[]; correctIndex:number; explanation:string; concept?:string };
type Quiz = { title:string; topic:string; difficulty:string; questions:Question[] };
export default function InteractiveQuiz() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = (isReady ? getToolOutput<Quiz>() : null) as Quiz | null;
  const [answers,setAnswers] = useState<Record<number,number>>({});
  const [index,setIndex] = useState(0);
  const [finished,setFinished] = useState(false);
  if (!isReady || !data?.questions?.length) return <main className="panel"><div className="card">Preparing your quiz…</div></main>;
  const questions = data.questions;
  const score = questions.reduce((n,q,i)=>n+(answers[i]===q.correctIndex?1:0),0);
  const q = questions[index];
  return <main className="panel">
    <div className="card"><p className="muted">{data.topic} · {data.difficulty} · {questions.length} questions</p><h1>{data.title}</h1>
      {!finished ? <>
        <p className="muted">Question {index+1} of {questions.length}</p><h2>{q.question}</h2>
        {q.options.map((option,i)=><button key={option+i} className={'option '+(answers[index]===i?'selected':'')} onClick={()=>setAnswers(a=>({...a,[index]:i}))}>{String.fromCharCode(65+i)}. {option}</button>)}
        {answers[index]!==undefined && <p className={answers[index]===q.correctIndex?'good':'bad'}>{answers[index]===q.correctIndex?'Correct!':'Not quite.'} {q.explanation}</p>}
        <div style={{display:'flex',gap:8,marginTop:18}}>
          <button className="button" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>Previous</button>
          {index<questions.length-1?<button className="button" disabled={answers[index]===undefined} onClick={()=>setIndex(i=>i+1)}>Next</button>:<button className="button" disabled={Object.keys(answers).length!==questions.length} onClick={()=>setFinished(true)}>View score</button>}
        </div>
      </>:<>
        <h2>Score: {score} / {questions.length}</h2><p>{Math.round(score/questions.length*100)}% correct</p>
        {questions.map((item,i)=><div key={i}><h3>{i+1}. {item.question}</h3><p className={answers[i]===item.correctIndex?'good':'bad'}>Your answer: {item.options[answers[i]] ?? 'Not answered'}</p><p>Correct answer: {item.options[item.correctIndex]}</p><p className="muted">{item.explanation}</p></div>)}
        <button className="button" onClick={()=>{setAnswers({});setIndex(0);setFinished(false)}}>Try again</button>
      </>}
    </div>
  </main>;
}
