/**
 * The Android wrapper's identity, kept here rather than only in the Android
 * project: the site has to name it in /.well-known/assetlinks.json, and the
 * two saying different things is the failure where the app quietly opens with
 * a browser URL bar across the top and nothing reports an error.
 *
 * The fingerprints are of the certificates that may sign a build somebody
 * installs. The first is the release key held outside every repository
 * (~/.keys/dovego-android). A second one belongs here the day the app goes
 * through Play App Signing, because Google re-signs the upload with a key of
 * its own and the installed app then presents that certificate, not this one.
 */
export const ANDROID_APP = {
  packageName: 'it.dovego.twa',
  fingerprints: [
    '1F:D1:C0:26:34:4D:21:7C:03:CC:63:9C:39:A9:27:17:E3:5C:B7:1E:AE:AB:94:BA:B2:1C:19:7C:4F:A3:EA:55',
  ],
} as const;
