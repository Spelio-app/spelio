import { KEYBOARD_REVEAL_HOLD_DELAY_MS, handleRevealShortcutKeyDown, handleRevealShortcutKeyUp, type RevealShortcutAction } from '../src/lib/practice/revealShortcut';

declare function require(name: string): {
  readFileSync?: (path: string, encoding: string) => string;
};

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${String(expected)}\nActual: ${String(actual)}`);
  }
}

function assertActions(actual: RevealShortcutAction[], expected: RevealShortcutAction[], message: string) {
  assertEqual(actual.join('|'), expected.join('|'), message);
}

const { readFileSync } = require('fs') as {
  readFileSync: (path: string, encoding: string) => string;
};
const practiceSource = readFileSync('src/components/Practice.tsx', 'utf8');
const revealClickHandler = practiceSource.slice(
  practiceSource.indexOf('function handleRevealLetter'),
  practiceSource.indexOf('function handleRevealPointerDown')
);
const revealPointerDownHandler = practiceSource.slice(
  practiceSource.indexOf('function handleRevealPointerDown'),
  practiceSource.indexOf('function handleRevealPointerUp')
);
const revealPointerUpHandler = practiceSource.slice(
  practiceSource.indexOf('function handleRevealPointerUp'),
  practiceSource.indexOf('function showLocalStatus')
);

assertEqual(
  /if \(revealHandledByPointerRef\.current\) \{[\s\S]*?revealHandledByPointerRef\.current = false;[\s\S]*?event\?\.currentTarget\.blur\(\);[\s\S]*?restorePracticeInputFocus\(\);[\s\S]*?return;[\s\S]*?\}/.test(revealClickHandler),
  true,
  'The click following a touch Reveal must restore the native practice input instead of leaving focus on the button.'
);
assertEqual(
  revealPointerDownHandler.indexOf('event.preventDefault();') < revealPointerDownHandler.indexOf('focusMobileInput();'),
  true,
  'Touch Reveal must prevent the button focus default before preserving the native input focus.'
);
assertEqual(
  revealPointerUpHandler.includes('revealHandledByPointerRef.current = true;') &&
    (revealPointerUpHandler.match(/revealNext\(\)/g) ?? []).length === 1 &&
    revealClickHandler.indexOf('if (revealHandledByPointerRef.current)') < revealClickHandler.indexOf('revealNext();'),
  true,
  'A pointer Reveal must run the existing reveal logic once and consume its following click without a duplicate reveal.'
);
assertEqual(
  revealClickHandler.includes('if (peekActivatedRef.current)') &&
    revealClickHandler.indexOf('if (peekActivatedRef.current)') < revealClickHandler.indexOf('revealNext();') &&
    revealPointerUpHandler.includes('if (!didPeek) {'),
  true,
  'A completed hold-to-peek must restore focus without also revealing another letter.'
);

assertEqual(
  KEYBOARD_REVEAL_HOLD_DELAY_MS >= 450 && KEYBOARD_REVEAL_HOLD_DELAY_MS <= 550,
  true,
  'Keyboard reveal hold delay should stay in the requested calm peek window.'
);

{
  let held = false;
  const down = handleRevealShortcutKeyDown({ code: 'ArrowRight', repeat: false, held });
  held = down.held;
  assertEqual(down.handled, true, 'ArrowRight keydown should be handled.');
  assertActions(down.actions, ['reveal-next', 'begin-peek-hold'], 'Quick press should reveal one letter immediately and arm shared peek hold.');

  const up = handleRevealShortcutKeyUp({ code: 'ArrowRight', held });
  held = up.held;
  assertEqual(up.handled, true, 'ArrowRight keyup after keydown should be handled.');
  assertActions(up.actions, ['end-peek-hold'], 'Quick release should exit/cancel the shared peek hold path.');
  assertEqual(held, false, 'Quick release should clear held state and preserve the revealed progress underneath.');
}

{
  let held = false;
  const down = handleRevealShortcutKeyDown({ code: 'ArrowRight', repeat: false, held });
  held = down.held;
  assertActions(down.actions, ['reveal-next', 'begin-peek-hold'], 'Hold should still start with one immediate reveal.');

  const repeat = handleRevealShortcutKeyDown({ code: 'ArrowRight', repeat: true, held });
  held = repeat.held;
  assertEqual(repeat.handled, true, 'ArrowRight auto-repeat should be handled.');
  assertActions(repeat.actions, [], 'Holding ArrowRight must not repeatedly reveal more letters.');
  assertEqual(held, true, 'Repeat events should keep the held state until keyup.');

  const heldAgain = handleRevealShortcutKeyDown({ code: 'ArrowRight', repeat: false, held });
  assertActions(heldAgain.actions, [], 'A second keydown while held should not reveal another letter.');

  const up = handleRevealShortcutKeyUp({ code: 'ArrowRight', held });
  assertActions(up.actions, ['end-peek-hold'], 'Release after hold should exit the shared peek mode.');
  assertEqual(up.held, false, 'Release after hold should restore normal keyboard flow.');
}

{
  const down = handleRevealShortcutKeyDown({ code: 'ArrowLeft', repeat: false, held: false });
  assertEqual(down.handled, false, 'Other arrow shortcuts should remain outside reveal shortcut handling.');
  assertActions(down.actions, [], 'Non-reveal shortcuts should not reveal or peek.');

  const up = handleRevealShortcutKeyUp({ code: 'ArrowRight', held: false });
  assertEqual(up.handled, false, 'ArrowRight keyup without a held reveal shortcut should be ignored.');
  assertActions(up.actions, [], 'Stray keyup should not exit peek or change focus state.');
}

console.log('reveal shortcut tests passed');
