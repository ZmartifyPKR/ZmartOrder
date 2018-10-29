#!/bin/bash
cp platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ZmartOrder-unsigned.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore ZmartOrder-unsigned.apk alias_name
rm ZmartOrder.apk
~/Library/Android/sdk/build-tools/27.0.3/zipalign -v 4 ZmartOrder-unsigned.apk ZmartOrder.apk
