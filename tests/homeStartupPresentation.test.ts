declare function require(name: string): {
  readFileSync?: (path: string, encoding: string) => string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const { readFileSync } = require('fs') as {
  readFileSync: (path: string, encoding: string) => string;
};

const appSource = readFileSync('src/App.tsx', 'utf8');
const homeSource = readFileSync('src/components/Home.tsx', 'utf8');
const stylesSource = readFileSync('src/styles.css', 'utf8');
const englishSource = readFileSync('src/i18n/en.ts', 'utf8');
const welshSource = readFileSync('src/i18n/cy.ts', 'utf8');
const publicContentSource = readFileSync('src/lib/content/publicContentRepository.ts', 'utf8');

assert(
  homeSource.includes("learnerContentState === 'ready' ?") &&
    homeSource.includes(": learnerContentState === 'failed' ?") &&
    homeSource.includes(': null}'),
  'The homepage should render learner content only when ready, an error only on failure, and no learner placeholder while loading.'
);
assert(
  homeSource.indexOf('<Logo animateCursor />') < homeSource.indexOf('className={`home-learner-region') &&
    homeSource.indexOf('<Footer className="home-footer"') > homeSource.indexOf('className={`home-learner-region'),
  'The stable logo and footer should remain outside the learner-dependent homepage region.'
);
assert(
  stylesSource.includes('.home-learner-region{') && stylesSource.includes('min-height:654px'),
  'The learner region should reserve desktop layout height while startup content resolves.'
);
assert(
  stylesSource.includes('animation:home-learner-startup-reveal .22s ease-out both'),
  'Initial learner content should use the restrained 220ms homepage-only reveal.'
);
assert(
  stylesSource.includes('@media (prefers-reduced-motion:reduce)') &&
    stylesSource.includes('.home-learner-region-startup-reveal{\n    animation:none;'),
  'Reduced motion should bypass the decorative startup reveal.'
);
assert(
  appSource.includes('initialPublicContentResolutionRef.current = false') &&
    homeSource.includes('startupRevealConsumedRef.current = true') &&
    homeSource.includes('onInitialLearnerContentReveal?.()'),
  'The startup reveal should be consumed once rather than replaying on ordinary homepage navigation.'
);
assert(
  homeSource.includes("t('home.loadFailureHeading')") &&
    homeSource.includes("t('home.loadFailureBody')") &&
    homeSource.includes("t('home.tryAgain')") &&
    homeSource.includes('onClick={onRetryContent}'),
  'A genuine content failure should provide a calm localized retry state in the learner region.'
);
assert(
  englishSource.includes("loadFailureHeading: 'Unable to load Spelio'") &&
    englishSource.includes("loadFailureBody: 'Please check your connection and try again.'") &&
    welshSource.includes("loadFailureHeading: 'Methu llwytho Spelio'") &&
    welshSource.includes("tryAgain: 'Rhowch gynnig arall arni'"),
  'The startup failure state should include English and Welsh interface copy.'
);
assert(
  appSource.includes('setPublicContentLoadAttempt(attempt => attempt + 1)') &&
    appSource.includes('}, [publicContentLoadAttempt]);'),
  'Retry should invoke the actual public-content loading path.'
);
assert(
  publicContentSource.includes('return loadStaticPublicContent();'),
  'The existing successful bundled-content fallback must remain intact.'
);
assert(
  homeSource.includes('<PrimaryButton className="home-primary" onClick={handlePrimary}') &&
    homeSource.includes('const handlePrimary = shouldPrioritiseReview ? onReview : shouldChooseAnotherList ? onSelectList : onStart;'),
  'The resolved primary CTA should keep its existing destination logic.'
);

console.log('homepage startup presentation tests passed');
