const pkg = require('pkg');
const cpy = require('cpy');

(async () => {

    try {

        console.log("Creating executable");
        await pkg.exec([ './dist/index.js', '--target', 'node12-win-x64', '--output', 'deploy/syncwatch.exe' ]);

        await copy("./node_modules/wrtc/build/Release/wrtc.node", "./deploy/");

        if (process.platform === "win32") {

            await copy("./mpv.exe", "./deploy/");
            await copy("./youtube-dl.exe", "./deploy/");
        }

    } catch (e) {
       console.log(e);
    }

})();

async function copy(source, destination) {
    console.log("Copying ", source, " to ", destination);
    (async () => {
        await cpy([source], destination);
        console.log('File copied!');
    })();
}

