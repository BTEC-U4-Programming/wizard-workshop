export function checkAnswer(question,response){
  if(question.type==='choice'){
    const option=question.options.find(item=>item.id===response);
    return {correct:!!option?.correct,feedback:option?.feedback??'Choose an answer first.'};
  }
  const given=String(response??'').trim();
  const normalise=value=>question.caseSensitive===false?value.toLowerCase():value;
  const correct=given!==''&&question.accept.some(answer=>normalise(answer)===normalise(given));
  return {correct,feedback:correct?question.explanation:question.hint};
}
