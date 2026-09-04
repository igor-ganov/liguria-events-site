import { ANDROID_APP } from './android-app.ts';

type AssetLink = Readonly<{
  relation: readonly string[];
  target: Readonly<{
    namespace: 'android_app';
    package_name: string;
    sha256_cert_fingerprints: readonly string[];
  }>;
}>;

/** What /.well-known/assetlinks.json says: this site vouches for that app, so
 *  Android may hand it every URL under the domain without a browser chrome. */
export const assetLinks = (): readonly AssetLink[] => [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: ANDROID_APP.packageName,
      sha256_cert_fingerprints: ANDROID_APP.fingerprints,
    },
  },
];
