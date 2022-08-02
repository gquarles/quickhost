# Quick Host
A simple lightweight express.js fileserver.

## Setup
```
git clone https://github.com/gquarles/quickhost
cd quickhost
git checkout ssl
npm install
node install.js
npm start
```

### Docker
```
sudo docker build . -t qhost
sudo docker run -p 80:80 -p 443:443 -d -v $(PWD):/usr/src/app --restart unless-stopped qhost
```