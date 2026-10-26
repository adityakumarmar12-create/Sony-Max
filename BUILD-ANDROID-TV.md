# Build the Android TV APK in the cloud (Chromebook, no Android Studio)

Not yet built or tested by the author; the first cloud build is the first real test.

1. Create a free GitHub account, then a new empty repository (private is fine).
2. Unzip this project on your Chromebook (right-click the ZIP, Extract all).
3. In the repo click Add file, then Upload files. Drag in the contents of the extracted `iptv-live` folder (not the folder itself).
4. Hidden folders can be skipped by the browser. Check that `.github/workflows/build-apk.yml` exists in the repo. If not, click Add file, Create new file, type `.github/workflows/build-apk.yml` as the name, paste the file contents, and commit.
5. Open the Actions tab, pick "Build Android TV APK", press Run workflow. Or just commit to main.
6. When it turns green (about 5 to 10 minutes), open the run and download the `livetv-debug-apk` artifact (a ZIP containing app-debug.apk). If a step is red, open it and send me the log.
7. Change `com.example.livetv` (capacitor.config.json, android/app/build.gradle, MainActivity package and folder, AndroidManifest) only if you want your own app id.

## Install on the TV
- Easiest: copy app-debug.apk to a USB stick, plug into the TV, open it with a file manager app (e.g. "Files by Google" or "X-plore") and allow install from unknown sources when asked.
- Or install the "Send Files to TV" app on both devices, send the APK, open it on the TV.
- Or, with the TV's Developer options and network debugging on, `adb connect <TV_IP>:5555` then `adb install app-debug.apk`.

## Remote controls
- Playing: Up/Down change channel, Left reconnect, OK or Right opens the channel list, Menu toggles the list.
- List: arrows move focus, OK selects, Back closes. Back twice on the player exits.

## Add Link (v0.3.0)
Press "＋ Add link" in the channel list. Paste a stream link (.m3u8) and press "Play this stream", or paste a playlist (.m3u) and press "Import as playlist". Saved items appear under "My Links".
Typing long links with a remote is slow: use the Google TV / Android TV phone app as a keyboard, or paste into the field from a connected Bluetooth keyboard.
Updating: upload the new files over your GitHub repo (same names overwrite), then run the workflow again.
