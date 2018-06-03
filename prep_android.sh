#!/bin/bash
cp platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ZmartLak-unsigned.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore ZmartLak-unsigned.apk alias_name
rm ZmartLak.apk
~/Library/Android/sdk/build-tools/27.0.3/zipalign -v 4 ZmartLak-unsigned.apk ZmartLak.apk
