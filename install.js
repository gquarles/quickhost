const prompt = require('prompt-sync')();
const publicIp = require('public-ip');
const dns = require('dns')
const { exec } = require("child_process");
var validator = require("email-validator");

async function install() {
    console.log('Starting install of ssl...');

    let email = await getEmail();

    const ip = await publicIp.v4();
    console.log(`Detected ip: ${ip}`)

    const domain = prompt('Enter domain for ssl: ');

    dns.lookup(domain, function (err, result) {
        if (result != ip) {
            console.log('WARN | Detected public ip differs from resolved ip!')
            const override = prompt('Override (could cause errors) (y/n): ');
            if (override.toLowerCase() == 'y') {
                getCert(domain, email)
            } else {
                console.log('Exiting...');
            }
        } else {
            console.log('Detected ip matches resolved ip');
            getCert(domain, email);
        }
    })
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

async function getEmail() {
    const email = prompt('Enter maintainer email: ');
    
    while (validator.validate(email) == false) {
        console.log('Error! Please input a correct email (required for certificate)');
        email = prompt('Enter maintainer email: ');
    }

    return email;
}

install();