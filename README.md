Google: gcloud compute firewall-rules create allow-http-3000 --allow tcp:3000 --source-ranges 0.0.0.0/0 --target-tags http-server-3000 --description "Allow port 3000 access to http-server"

Add: /etc/apt/source.list: deb http://security.ubuntu.com/ubuntu xenial-security main 

Install: sudp apt-get install mongodb
