import { useMemo } from 'react';
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
      <InstallStoreOption
        key="appStore"
        badgeClassName="install-badge-link-app-store"
        badgeSrc="/store-badges/app-store.svg"
        badgeAlt={t('install.appStoreBadgeAlt')}
        href={APP_STORE_URL}
        label={t('install.appStoreEyebrow')}
      />
    ),
    googlePlay: (
      <InstallStoreOption
        key="googlePlay"
        badgeClassName="install-badge-link-google-play"
        badgeSrc="/store-badges/google-play.svg"
        badgeAlt={t('install.googlePlayBadgeAlt')}
        href={GOOGLE_PLAY_URL}
        label={t('install.googlePlayEyebrow')}
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

function InstallStoreOption({
  badgeAlt,
  badgeClassName,
  badgeSrc,
  href,
  label
}: {
  badgeAlt: string;
  badgeClassName: string;
  badgeSrc: string;
  href: string;
  label: string;
}) {
  return (
    <div className="install-store-option">
      <p className="install-store-label">{label}</p>
      <a
        className={`install-badge-link ${badgeClassName}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={badgeSrc} alt={badgeAlt} />
      </a>
    </div>
  );
}
