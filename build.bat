:: pkg@4.4.0
pkg index.js --output dist\syncwatch.exe --target node12-win-x64
::copy .\node_modules\wrtc\build\Release\wrtc.node dist
makensis Syncwatch.nsi

::curl -L https://sourceforge.net/projects/mpv-player-windows/files/64bit/mpv-x86_64-20191215-git-2dbe33c.7z/download --output mpv.7z
::tar -zxvf mpv.7z mpv.exe

::curl -L https://yt-dl.org/downloads/2019.11.28/youtube-dl.exe --output .\dist\youtube-dl.exe
