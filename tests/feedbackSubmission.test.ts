import feedbackHandler from '../api/feedback';

declare function require(name: string): { readFileSync(path: string, encoding: string): string };

type ResponseBody = { ok: boolean; error?: string };

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`${message}\nExpected: ${String(expected)}\nActual: ${String(actual)}`);
}

async function submit(body: unknown) {
  let statusCode = 200;
  let responseBody: ResponseBody | undefined;
  const response = {
    status(code: number) { statusCode = code; return response; },
    json(body: ResponseBody) { responseBody = body; },
    setHeader() {}
  };

  await feedbackHandler({ method: 'POST', body }, response);
  return { statusCode, responseBody };
}

async function run() {
  const emptyEmail = await submit({ email: '   ', message: 'Helpful feedback' });
  assertEqual(emptyEmail.statusCode, 400, 'The API must reject an empty feedback email.');
  assertEqual(emptyEmail.responseBody?.error, 'Email address is required', 'The API should explain that email is required.');

  const invalidEmail = await submit({ email: 'not-an-email', message: 'Helpful feedback' });
  assertEqual(invalidEmail.statusCode, 400, 'The API must retain email-format validation.');
  assertEqual(invalidEmail.responseBody?.error, 'Invalid email address', 'The API should explain invalid email format.');

  const missingMessage = await submit({ email: 'learner@example.com', message: '   ' });
  assertEqual(missingMessage.statusCode, 400, 'The existing required feedback message must remain required.');
  assertEqual(missingMessage.responseBody?.error, 'Message is required', 'The API should retain the required-message error.');

  const validSubmission = await submit({ email: ' learner@example.com ', message: ' Helpful feedback ' });
  assertEqual(validSubmission.statusCode, 500, 'Valid input should pass validation and reach email configuration.');
  assertEqual(validSubmission.responseBody?.error, 'Feedback email is not configured', 'Valid input should reach the mail delivery boundary in tests.');

  const { readFileSync } = require('fs');
  const formSource = readFileSync('src/components/Footer.tsx', 'utf8');
  assert(formSource.includes("if (!trimmedEmail) nextErrors.email = t('footer.emailRequired')"), 'The client must reject an empty email with the existing inline error pattern.');
  assert(formSource.includes('type="email"'), 'The email input must retain browser email-format semantics.');
  assert(formSource.includes('maxLength={maxFeedbackEmailLength}\n                required'), 'The email input must be marked as required.');
  assert(!formSource.includes("t('footer.emailAddress')} <span className=\"feedback-optional\""), 'The email label must no longer say optional.');
  assert(!formSource.includes('name:'), 'The feedback payload must not introduce or require a name field.');

  console.log('feedback submission tests passed');
}

void run();
