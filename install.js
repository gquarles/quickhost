const { exec } = require("child_process");

async function install() {
    console.log('Starting install of ssl...');
    getCert('files.qhost.io', 'griffq@hotmail.com');
}

async function getCert(domain, email) {
    console.log('Setting maintainer email...');
    exec(`npx greenlock init --config-dir ./greenlock.d --maintainer-email "${email}"`, (error, stdout, stderr) => {
        console.log('Asking for a certificate...');
        exec(`npx greenlock add --subject ${domain} --altnames ${domain}`, (error, stdout, stderr) => {
            console.log('Finished! Run "npm start" to launch the webserver');
        });
    });
}

install();
