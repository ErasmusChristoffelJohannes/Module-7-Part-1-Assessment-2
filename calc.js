const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const buttons = document.querySelector('.buttons');

let current = '0';
let previous = null;
let operator = null;
let startNewNumber = false;
let hasError = false;
let lastExpression = '';

const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function updateDisplay() {
  currentEl.textContent = current;

  if (operator && previous !== null) {
    historyEl.textContent = previous + ' ' + symbols[operator];
  } else {
    historyEl.textContent = lastExpression;
  }

  document.querySelectorAll('button.op').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.value === operator && startNewNumber);
  });
}

function reset() {
  lastExpression = '';
  current = '0';
  previous = null;
  operator = null;
  startNewNumber = false;
  hasError = false;
}

function inputNumber(digit) {
  if (hasError) reset();

  if (startNewNumber || current === '0') {
    current = digit;
    startNewNumber = false;
  } else if (current.length < 15) {
    current += digit;
  }
}

function inputDecimal() {
  if (hasError) reset();

  if (startNewNumber) {
    current = '0.';
    startNewNumber = false;
    return;
  }

  if (!current.includes('.')) {
    current += '.';
  }
}

function calculate(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);

  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') {
    if (b === 0) return null;
    return a / b;
  }
}

function formatResult(num) {
  // round off floating point noise like 0.1 + 0.2
  const rounded = parseFloat(num.toPrecision(12));
  return String(rounded);
}

function showError(message) {
  lastExpression = '';
  current = message;
  previous = null;
  operator = null;
  startNewNumber = true;
  hasError = true;
}

function chooseOperator(op) {
  if (hasError) return;

  // chain calculations like 2 + 3 + 4
  if (operator && !startNewNumber) {
    const result = calculate(previous, current, operator);
    if (result === null) {
      showError('Cannot divide by 0');
      return;
    }
    current = formatResult(result);
  }

  previous = current;
  operator = op;
  startNewNumber = true;
}

function equals() {
  if (hasError || !operator) return;

  const result = calculate(previous, current, operator);
  if (result === null) {
    showError('Cannot divide by 0');
    return;
  }

  lastExpression = previous + ' ' + symbols[operator] + ' ' + current + ' =';
  current = formatResult(result);
  previous = null;
  operator = null;
  startNewNumber = true;
}

function percent() {
  if (hasError) return;
  current = formatResult(parseFloat(current) / 100);
}

function negate() {
  if (hasError || current === '0') return;

  if (current.startsWith('-')) {
    current = current.slice(1);
  } else {
    current = '-' + current;
  }
}

function backspace() {
  if (hasError) {
    reset();
    return;
  }
  if (startNewNumber) return;

  current = current.slice(0, -1);
  if (current === '' || current === '-') {
    current = '0';
  }
}

function handleAction(action, value) {
  if (action === 'number') inputNumber(value);
  else if (action === 'decimal') inputDecimal();
  else if (action === 'operator') chooseOperator(value);
  else if (action === 'equals') equals();
  else if (action === 'clear') reset();
  else if (action === 'backspace') backspace();
  else if (action === 'percent') percent();
  else if (action === 'negate') negate();

  updateDisplay();
}

buttons.addEventListener('click', function (e) {
  const btn = e.target.closest('button');
  if (!btn) return;

  handleAction(btn.dataset.action, btn.dataset.value);
});

document.addEventListener('keydown', function (e) {
  const key = e.key;

  if (key >= '0' && key <= '9') handleAction('number', key);
  else if (key === '.') handleAction('decimal');
  else if (key === '+' || key === '-' || key === '*' || key === '/') {
    e.preventDefault();
    handleAction('operator', key);
  }
  else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    handleAction('equals');
  }
  else if (key === 'Backspace') handleAction('backspace');
  else if (key === 'Escape') handleAction('clear');
  else if (key === '%') handleAction('percent');
});

updateDisplay();
