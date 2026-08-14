import {
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  detectInstallDevice,
  getInstallOptionOrder
} from '../src/lib/installOptions';

declare function require(name: string): {
  existsSync?: (path: string) => boolean;
  readFileSync?: (path: string, encoding: string) => string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${String(expected)}\nActual: ${String(actual)}`);
  }
}

const { existsSync, readFileSync } = require('fs') as {
  existsSync: (path: string) => boolean;
  readFileSync: (path: string, encoding: string) => string;
};

assertEqual(APP_STORE_URL, 'https://apps.apple.com/app/spelio/id6783524504', 'Install page should use the live App Store URL.');
assertEqual(GOOGLE_PLAY_URL, 'https://play.google.com/store/apps/details?id=app.spelio.twa', 'Install page should use the public Google Play URL.');

assertEqual(detectInstallDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), 'ios', 'iPhone should get iOS install priority.');
assertEqual(detectInstallDevice('Mozilla/5.0 (Linux; Android 15; Pixel 9)'), 'android', 'Android should get Google Play install priority.');
assertEqual(detectInstallDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)', 4), 'ios', 'iPadOS desktop-mode Safari should get iOS install priority.');
assertEqual(detectInstallDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)', 0), 'desktop', 'Desktop should get desktop install priority.');
assertEqual(getInstallOptionOrder('ios').join(','), 'appStore,googlePlay', 'iPhone and iPad should show the App Store first.');
assertEqual(getInstallOptionOrder('android').join(','), 'googlePlay,appStore', 'Android should show Google Play first.');
assertEqual(getInstallOptionOrder('desktop').join(','), 'googlePlay,appStore', 'Desktop should show both public stores in a stable order.');

assert(existsSync('public/store-badges/app-store.svg'), 'App Store badge asset should exist locally.');
assert(existsSync('public/store-badges/google-play.svg'), 'Google Play badge asset should exist locally for the future live state.');

const appSource = readFileSync('src/App.tsx', 'utf8');
assert(appSource.includes("pathname === '/install'"), 'App route detection should include /install.');
assert(appSource.includes("openPublicPage('install', '/install')"), 'Homepage menu callback should navigate to /install.');
assert(appSource.includes('<InstallPage'), 'App should render InstallPage for the install screen.');

const homeSource = readFileSync('src/components/Home.tsx', 'utf8');
assert(homeSource.includes('onInstall'), 'Homepage should accept an install navigation callback.');
assert(homeSource.includes("t('home.installSpelio')"), 'Homepage menu should keep the Get Spelio navigation entry.');
assert(homeSource.includes('showInstallOptions &&'), 'Homepage menu should hide Get Spelio in installed app runtimes.');
assert(!homeSource.includes('promptInstall'), 'Homepage menu should not directly trigger the browser install prompt.');

const installPageSource = readFileSync('src/components/InstallPage.tsx', 'utf8');
assert(!installPageSource.includes('useInstallPrompt'), 'Install page should not offer PWA installation.');
assert(!installPageSource.includes('webApp'), 'Install page should contain only the two public mobile store options.');
assert(installPageSource.includes('href="/feedback"'), 'Install page should reuse the existing feedback form for ordinary support.');
assert(installPageSource.includes("t('install.supportLink')"), 'Install page should render the low-emphasis support link.');
assert(installPageSource.includes('GOOGLE_PLAY_URL'), 'Install page should render the configured Google Play URL.');
assert(installPageSource.includes('APP_STORE_URL'), 'Install page should render the configured App Store URL.');
assert(installPageSource.includes("primary={installDevice === 'ios'}"), 'App Store should be prominent on iPhone and iPad.');
assert(installPageSource.includes("primary={installDevice === 'android'}"), 'Google Play should be prominent on Android.');
assert(installPageSource.includes('alt={t(\'install.appStoreBadgeAlt\')}'), 'App Store badge link should have translated accessible text.');
assert(installPageSource.includes('alt={t(\'install.googlePlayBadgeAlt\')}'), 'Google Play badge link should have translated accessible text.');

const stylesSource = readFileSync('src/styles.css', 'utf8');
assert(stylesSource.includes('grid-template-columns:repeat(2,minmax(0,1fr))'), 'Desktop install options should use a two-column layout.');
assert(stylesSource.includes('grid-template-columns:1fr'), 'Mobile install options should collapse to one column.');

const pwaSource = readFileSync('src/lib/pwa/installPrompt.ts', 'utf8');
assert(pwaSource.includes('BeforeInstallPromptEvent'), 'PWA install-prompt infrastructure should remain in place.');
assert(existsSync('public/manifest.webmanifest'), 'PWA manifest should remain in place.');
assert(existsSync('public/sw.js'), 'PWA service worker should remain in place.');

const enSource = readFileSync('src/i18n/en.ts', 'utf8');
const cySource = readFileSync('src/i18n/cy.ts', 'utf8');
assert(enSource.includes("installSpelio: 'Get Spelio'"), 'English homepage navigation should say Get Spelio.');
assert(enSource.includes("title: 'Get Spelio'"), 'English install-page title should be translated.');
assert(enSource.includes('Download Spelio for Android, iPhone or iPad.'), 'English public-release intro should be concise.');
assert(enSource.includes('Download Spelio from Google Play.'), 'English Google Play copy should describe public download.');
assert(enSource.includes('Download Spelio from the App Store.'), 'English App Store copy should describe public download.');
assert(enSource.includes('Having a problem or suggestion?'), 'English support prompt should be translated.');
assert(!enSource.includes('Join the Android beta'), 'English install copy should not recruit beta testers.');
assert(!enSource.includes('before leaving a public App Store review'), 'English install copy should not steer reviews.');
assert(cySource.includes("installSpelio: 'Cael Spelio'"), 'Welsh homepage navigation should say Get Spelio.');
assert(cySource.includes("title: 'Cael Spelio'"), 'Welsh install-page title should be translated.');
assert(cySource.includes('Lawrlwythwch Spelio ar gyfer Android, iPhone neu iPad.'), 'Welsh public-release intro should be translated.');
assert(cySource.includes('Lawrlwythwch Spelio o Google Play.'), 'Welsh Google Play copy should describe public download.');
assert(cySource.includes('Lawrlwythwch Spelio o’r App Store.'), 'Welsh App Store copy should describe public download.');
assert(cySource.includes('Oes gennych broblem neu awgrym?'), 'Welsh support prompt should be translated.');
assert(!cySource.includes('Ymunwch â beta Android'), 'Welsh install copy should not recruit beta testers.');

console.log('install page tests passed');
