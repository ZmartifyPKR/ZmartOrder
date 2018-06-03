#!/bin/bash

CONFIG='config.xml'
NEW_VERSION=$1
version_file=src/app/app.version.ts
> $version_file
echo "// This file was generated on $(date)
export const appVersion = '$1';" >> $version_file
git add $version_file


if [ -e $CONFIG ]; then
    # sed to replace version in config.xml
    sed -i '' "s/\(widget.*version=\"\)\([0-9,.]*\)\"/\1$NEW_VERSION\"/" $CONFIG
    git add $CONFIG
    echo "Updated $CONFIG with version $NEW_VERSION"
else
    echo 'Could not find config.xml'
    exit 1
fi
