const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');


const MAX_HISTORY_SIZE = 20;
let history = [];
const historyFilePath = 'history.json';

try {
  if (fs.existsSync(historyFilePath)) {
    const data = fs.readFileSync(historyFilePath, 'utf8');
    history = JSON.parse(data);
  }
} catch (err) {
  console.error('Error reading history from file:', err);
}

app.get('/', (req, res) => {
  // List all available endpoints
  const endpoints = [
    '/5/plus/3',
    '/3/minus/5',
    '/3/minus/5/plus/8',
    '/3/into/5/plus/8/into/6',
  ];
  res.send('<h1>Available Endpoints:</h1>' + endpoints.join('<br>'));
});

app.get('/history', (req, res) => {
  // Return the last 20 operations and their results
  res.json(history.slice(-MAX_HISTORY_SIZE));
});


app.get('/:oper1/:rest(*)', (req, res) => {

  const { oper1 } = req.params; // Get the value of 'oper1'
  const { rest } = req.params;  // Get the value of 'rest' (which can be multiple path segments)
  let parts= rest.split('/')         //[minus,1,plus,2]

  if (isNaN(oper1)) {  
    res.status(400).send('Invalid input2');
    return;
  }
  let result=parseFloat(oper1);
  let ques=oper1;
  for (let i = 0; i < parts.length; i += 2) {
    
    const operation = parts[i];
    const operand2 = parseFloat(parts[i + 1]);

    switch (operation) {
      case 'plus':
        result += operand2;
        break;
      case 'minus':
        result -= operand2;
        break;
      case 'multiply':  
        result *= operand2;
        break;
      case 'divide':
        if (operand2 !== 0) {
          result /= operand2;
        } else {
          res.status(400).send('Division by zero is not allowed.');
          return;
        }
        break;
      case 'log':
        result= Math.log10(result);
        break;
      case 'pow':
        result=Math.pow(result,operand2);
        break;
      case 'percent':
        result= (result/100)*operand2;
        break;
      default:
        // res.json(parts[i]);
        res.status(400).send('Invalid operation. Supported operations are plus, minus, multiply, and divide.');
        return;
    }
  }

  for(let j=0;j<parts.length;j++){
    if(isNaN(parts[j])==false){
      ques+=`${parts[j]}`;
    }
    else{
      switch(parts[j]){
        case 'plus':
          ques+='+';
          break;
        case 'minus':
          ques+='-';
          break;
        case 'multiply':
          ques+='*';
          break;
        case 'divide':
          ques+='/';
          break;
        case 'log':
          ques+='log base ';
          break;
        case 'pow':
          ques+='^';
          break;
        case 'percent':
          ques+='% of ';
          break;
        default:
          // res.json(parts[j]);
          res.status(400).send('Invalid operation. Supported operations are plus, minus, multiply, and divide.');
          return;
      }
    }
  }
  const response = { question:ques ,answer: result };
  history.push(response);


  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(history), 'utf8');
  } catch (err) {
    console.error('Error saving history to file:', err);
  }
   if (history.length > MAX_HISTORY_SIZE) {
     history.shift(); // Remove the oldest entry if history size exceeds 20
   }

  res.json(response);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
