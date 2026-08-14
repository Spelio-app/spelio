import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  getCurrentInstallDevice,
  getInstallOptionOrder
} from '../lib/installOptions';
import type { InterfaceLanguage, Translate } from '../i18n';
import { PublicPageShell } from './PublicInfoPages';

type InstallPageProps = {
  interfaceLanguage: InterfaceLanguage;
  onBack: () => void;
  onHome: () => void;
  onInterfaceLanguageChange: (language: InterfaceLanguage) => void;
  t: Translate;
};

export function InstallPage({
  interfaceLanguage,
  onBack,
  onHome,
  onInterfaceLanguageChange,
  t
}: InstallPageProps) {
  const installDevice = useMemo(() => getCurrentInstallDevice(), []);
  const installOptionOrder = useMemo(() => getInstallOptionOrder(installDevice), [installDevice]);
  const installOptions = {
    appStore: (
      <InstallOption
        key="appStore"
        primary={installDevice === 'ios'}
        eyebrow={t('install.appStoreEyebrow')}
        title={t('install.appStoreTitle')}
        body={t('install.appStoreBody')}
        action={(
          <a className="install-badge-link" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
            <img src="/store-badges/app-store.svg" alt={t('install.appStoreBadgeAlt')} />
          </a>
        )}
      />
    ),
    googlePlay: (
      <InstallOption
        key="googlePlay"
        primary={installDevice === 'android'}
        eyebrow={t('install.googlePlayEyebrow')}
        title={t('install.googlePlayTitle')}
        body={t('install.googlePlayBody')}
        action={(
          <a className="install-badge-link" href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer">
            <img src="/store-badges/google-play.svg" alt={t('install.googlePlayBadgeAlt')} />
          </a>
        )}
      />
    )
  };

  return (
    <PublicPageShell
      contentClassName="install-page-content"
      interfaceLanguage={interfaceLanguage}
      onBack={onBack}
      onHome={onHome}
      onInterfaceLanguageChange={onInterfaceLanguageChange}
      titleId="install-page-title"
      t={t}
    >
      <h1 className="public-info-title" id="install-page-title">{t('install.title')}</h1>
      <div className="install-page-intro">
        <p>{t('install.intro')}</p>
      </div>

      <div className="install-options" aria-label={t('install.optionsLabel')}>
        {installOptionOrder.map(optionId => installOptions[optionId])}
      </div>

      <p className="install-support">
        {t('install.supportPrompt')} <a href="/feedback">{t('install.supportLink')}</a>
      </p>
    </PublicPageShell>
  );
}

function InstallOption({
  action,
  body,
  eyebrow,
  primary,
  title
}: {
  action?: ReactNode;
  body: ReactNode;
  eyebrow: string;
  primary?: boolean;
  title: string;
}) {
  return (
    <section className={['install-option', primary ? 'install-option-primary' : ''].filter(Boolean).join(' ')}>
      <div className="install-option-copy">
        <p className="install-option-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <div className="install-option-body">{typeof body === 'string' ? <p>{body}</p> : body}</div>
      </div>
      {action && <div className="install-option-action">{action}</div>}
    </section>
  );
}
