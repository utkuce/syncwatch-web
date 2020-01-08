npx nodegui-packer --init Syncwatch  && ^
npx nodegui-packer --pack ./dist  && ^
copy mpv.exe deploy\win32\build\Syncwatch  && ^
copy youtube-dl.exe deploy\win32\build\Syncwatch

:: makensis Syncwatch.nsi
