/**
 * The Android wrapper's identity, kept here rather than only in the Android
 * project: the site has to name it in /.well-known/assetlinks.json, and the
 * two saying different things is the failure where the app quietly opens with
 * a browser URL bar across the top and nothing reports an error.
 *
 * The fingerprints are of the certificates that may sign a build somebody
 * installs. The first is the upload key held outside every repository
 * (~/.keys/dovego-android), which signs a build installed by hand. The second
 * is the key Play App Signing re-signs the upload with: an app installed from
 * the store presents THAT certificate, and without it here the wrapper opens
 * with a browser URL bar across the top and nothing reports an error.
 */
export const ANDROID_APP = {
  packageName: 'it.dovego.twa',
  fingerprints: [
    '1F:D1:C0:26:34:4D:21:7C:03:CC:63:9C:39:A9:27:17:E3:5C:B7:1E:AE:AB:94:BA:B2:1C:19:7C:4F:A3:EA:55',
    '15:F1:1A:91:5F:7E:E5:39:7B:26:4A:47:B0:58:BA:C4:9A:8D:37:DB:B2:03:1D:48:A4:56:59:E3:17:E7:11:CB',
  ],
} as const;
