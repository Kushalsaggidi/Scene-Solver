WEEK 1
MAVEN PROJECT BUILDING

Open gitbash

mkdir selab
cd selab


(A folder will be created at C drive/users/name)

Open eclipse

File -> import -> Git -> Projects from git
-> at clone url, paste the url
-> click next
-> browse the selab folder
-> click next and finish


In project explorer cloned project will be visible

Correct the pom.xml code in project

Right click on project:

-> run as maven clean (BUILD SUCCESS SHOULD DISPLAY)
-> run as maven install
-> run as maven test
-> run as maven build
   in goals give: clean install test
-> next (BUILD SUCCESS)


In project folder:

/target/.war will be generated


Right click on project folder:

-> run as
-> run on server
select apache
-> select tomcat v9
-> browse the location where tomcat was installed


Server will start running

Go to edge and give:

localhost:8080


A web page like "WELCOME" will be visible

PUSH THIS PROJECT TO GITHUB

Delete .git file in project folder

Open gitbash

git init
git add .
git commit -m "msg"


Give all the commands in gitbash present under created repo in GitHub

DOCKER IMAGE BUILDING

Open powershell

cd selab
cd foldername that has pom.xml
mvn clean package


A war file will be generated

Create a folder in selab name it as docker

Keep the generated war file and existed dockerfile in the docker folder

Open dockerfile in notepad
You will see:

target/*.war


Remove that and give the generated war file name

Under tomcat give:

EXPOSE 8080


Go to powershell:

docker build -t csimage:latest .
(use dot when actual command dont work)
docker images


Here csimage should be visible

Run container:

docker run -d --name library_app -p 7007:8080 csimage:latest


Open chrome

type hub.docker.com and sign in
open repositories section present at left side in docker hub


Go to powershell again:

docker login
docker tag csimage:latest username/csimage:2.0
docker push username/csimage:2.0
docker pull username/csimage:2.0


(Output should be like image created UpToDate...)

Open chrome:

type localhost:7007


(Entire web page should be visible)

(Can use any number instead of 2.0)

✅ WEEK 8 – Jenkins
STEP 1
localhost:8080
username = admin
c folder -> prgm data -> Jenkins -> .Jenkins -> sectret -> initialadmin password

STEP 2
new item -> mavenjava_build -> freestyle project
description = java build demo
source code mgmt. = tick git
branches to build */main


Add build step:

Invoke top-level Maven targets
Maven version: MAVEN_HOME
Goals: clean


Add build step:

Invoke top-level Maven targets
Maven version: MAVEN_HOME
Goals: install


Add post build action:

Archive the artifacts
Files to archive: */
Build other projects
Projects to build: MavenJava_Test
Trigger: Only if build is stable


Apply and Save

STEP 3
new item -> mavenjava_test -> freestyle project
description = test demo
Build env: delete workspace before build starts


Add build step:

Copy artifacts from another project
Project name: MavenJava_Build
Build: tick Stable build only
Artifacts to copy: */


Add build step:

Invoke top-level Maven targets
Maven version: MAVEN_HOME
Goals: test


Add post build action:

Archive the artifacts
Files to archive: */


Apply and Save

STEP 4 – Create Pipeline View for Maven Java project
Click "+" beside "All" on the dashboard
Enter name: MavenJava_Pipeline
Select "Build pipeline view" // tick here


Create Pipeline Flow:

Layout: Based on upstream/downstream relationship
Initial job: MavenJava_Build


Apply and Save
Run the Pipeline and Check Output

✅ II. Maven Web Automation Steps
STEP 1
localhost:8080

STEP 2 – MavenWeb_Build
new item -> MavenWeb_build -> freestyle project
description = web build demo
source code mgmt. = tick git
branches to build */main


Add build steps:

Invoke top-level Maven targets
Maven version: MAVEN_HOME
Goals: clean

Invoke top-level Maven targets
Maven version: MAVEN_HOME
Goals: install


Post build action:

Archive the artifacts, Files to archive: */
Build other projects, Projects to build: MavenWeb_Test
Trigger: Only if build is stable


Apply and Save

STEP 3 – MavenWeb_Test
new item -> MavenWeb_test -> freestyle project
description = test demo
Build env: delete workspace before build starts


Add build step:

Copy artifacts from another project
Project name: MavenWeb_Build
Build: tick Stable build only
Artifacts to copy: */


Add build step:

Invoke top-level Maven targets
Maven version: MAVEN_HOME
Goals: test


Add post build action:

Archive the artifacts, Files to archive: */
Build other projects, Projects to build: MavenWeb_deploy
Trigger: Only if build is stable


Apply and Save

STEP 4 – MavenWeb_Deploy
new item -> MavenWeb_deploy -> freestyle project
description = web code deployment
Build env: delete workspace before build starts


Add build step:

Copy artifacts from another project
Project name: MavenWeb_test
Build: tick Stable build only
Artifacts to copy: /


Add build step:

Invoke top-level Maven targets
Maven version: MAVEN_HOME
Goals: test


Add post build action:

Deploy WAR/EAR to a container
WAR/EAR File: /.war
Context path: Webpath
Add container -> Tomcat 9.x remote
Credentials:
Username: admin/**,
Password: 1234
Tomcat URL: https://localhost:8085/


Apply and Save

STEP 5 – Maven Web Pipeline View
Click "+" beside "All" on the dashboard
Enter name: MavenWeb_Pipeline
Select "Build pipeline view"


Create Pipeline Flow:

Layout: Based on upstream/downstream relationship
Initial job: MavenJava_Build


Apply and Save
Run the Pipeline and Check Output

Open Tomcat homepage in another tab
Click on the "/webpath" option under the manager app

Note:

It ask for user credentials for login ,provide the credentials of tomcat.

It provide the page with out project name which is highlighted.

After clicking on our project we can see output.

✅ WEEK 9 – Jenkins Script
new item -> jenkins_script -> pipeline -> ok
Config:
Description = creating java pipeline project using script


Script:

pipeline {
 agent any

 tools {
     maven 'MAVEN_HOME'
 }

 stages {

     stage('Checkout from GitHub') {
         steps {
             echo "Cloning repository..."
             deleteDir()
             git url: 'https://github.com/NaveenCK-10/selab-internal.git', branch: 'main'
         }
     }

     stage('Clean') {
         steps {
             echo "Cleaning project..."
             bat "mvn clean"
         }
     }

     stage('Compile & Install') {
         steps {
             echo "Compiling and installing..."
             bat "mvn install"
         }
     }

     stage('Run Tests') {
         steps {
             echo "Running test cases..."
             bat "mvn test"
         }
     }

     stage('Package Application') {
         steps {
             echo "Packaging application..."
             bat "mvn package"
         }
     }

     stage('Final Output') {
         steps {
             echo "Build Pipeline Completed Successfully!"
         }
     }
 }
}


Triggers:

Build periodically -> schedule=* * * * *


Apply → Save → Build Now → Stages

✅ WEEK 10 – Kubernetes
🔹 1. Start Minikube with Docker Driver

(Open PowerShell as Administrator)

minikube delete
minikube start --driver=docker


✅ This creates a fresh Kubernetes cluster using Docker.

🔹 2. Verify Kubernetes Cluster
kubectl get nodes
kubectl get pods -A


✅ Confirms the cluster is running.

🔹 3. Create Nginx Deployment
kubectl create deployment mynginx --image=nginx


✅ Creates a deployment named mynginx using the Nginx image.

🔹 4. If Deployment Already Exists (Update Image)
kubectl set image deployment/mynginx nginx=nginx:latest

🔹 5. Check Deployment
kubectl get deployments

🔹 6. Expose Deployment as a Service
kubectl expose deployment mynginx --type=NodePort --port=80 --target-port=80


✅ Makes the application accessible outside the cluster.

🔹 7. Scale the Deployment to 4 Replicas
kubectl scale deployment mynginx --replicas=4


✅ Creates 4 running pods.

🔹 8. View Pods and Services
kubectl get pods
kubectl get svc

🔹 9. Access Application Using Port Forward
kubectl port-forward svc/mynginx 8081:80


Open in browser:

http://localhost:8081


✅ Nginx welcome page will be displayed.

🔹 10. If Port Forward Doesn’t Work
minikube tunnel
minikube service mynginx --url


Open the shown URL in browser.

🔹 11. (Optional) Describe Service for Debugging
kubectl describe svc mynginx

🔹 12. Stop and Delete Kubernetes Resources
kubectl delete deployment mynginx
kubectl delete service mynginx
minikube stop
minikube delete

✅ NAGIOS USING DOCKER
🔹 13. Pull Nagios Image
docker pull jasonrivers/nagios:latest

🔹 14. Run Nagios Container
docker run --name nagiosdemo -p 8888:80 jasonrivers/nagios:latest


Open in browser:

http://localhost:8888

✅ Login Credentials:
Username: nagiosadmin
Password: nagios

✅ WEEK 11

Open ngrok website
Your authtoken → command line → show authtoken → copy

Open ngrok app (opens in cmd) paste this copied one:

ngrok config add-authtoken 35sQ76wrMHQ50ajPdIH6keHHzEd_73RS45k9uo2HScnpWDhut
ngrok http 8080/1


You will get a url:

https://unpermeated-amada-uncloyed.ngrok-free.dev


Copy it and go to your GitHub repo:

settings -> webhooks -> add webhook
payload url = https://unpermeated-amada-uncloyed.ngrok-free.dev/github-webhook/
content type=application/json
Which events would you like to trigger this webhook?
= Just the push event
active , Add Webhook


Open Jenkins select the job (mavenjava_build):

-> configure
-> triggers = tick GitHub hook trigger for GITScm polling
-> Save


Git bash:

git clone https://github.com/SindhuSri19/selab-internal
cd selab-internal
nano README.md
-> make changes
-> ctrl o -> enter -> ctrl x
git add .
git commit -m "msg"
git push origin main


Jenkins:

build queue or mavenjava_build or pipeline view

✅ Gmail App Password Setup

Enable App Password (for 2-Step Verification)

i. Go to:

https://myaccount.google.com


ii. Enable 2-Step Verification
Navigate to:

Security → 2-Step Verification → Turn it ON


iii. Generate App Password for Jenkins
Go to:

Security → App passwords
Select App: Other (Custom name)
Name: Jenkins-Demo
Click Generate
Copy the 16-digit app password

✅ Jenkins Plugin Installation
Open Jenkins Dashboard
Manage Jenkins → Manage Plugins
Install Plugin:
Email Extension Plugin

✅ Configure Jenkins Global Email Settings

A. E-mail Notification Section

SMTP Server: smtp.gmail.com
Use SMTP Auth: Enabled
User Name: Your Gmail ID
Password: 16-digit App Password
Use SSL: Enabled
SMTP Port: 465
Reply-To Address: Your Gmail ID


Test Configuration
Send test mail and verify

✅ Extended E-mail Notification Section
SMTP Server: smtp.gmail.com
SMTP Port: 465
Use SSL: Enabled
Credentials: Add Gmail ID and App Password
Default Content Type: text/html
Default Recipients: Optional
Triggers: Select Failure/Success

✅ Configure Email Notifications for a Jenkins Job
Jenkins → Select a Job → Configure
Post-build Actions → Editable Email Notification
Project Recipient List: Add emails
Content Type: Default or text/html
Triggers: Failure, Success, etc.
Attachments: Optional
Save

✅ WEEK 12 – AWS

Modules → Launch AWS academy lab → I agree → Start lab orange to green → click in green AWS

Click EC2 → launch instance:

Name = MyExampleServer
Select ubuntu
Default ubuntu server 24.04
Architecture 64bitx85
Instance type = t2.micro


Create new key pair:

name = MyExampleKeyPair
RSA .pem
download


Create AWS folder on desktop and put .pem file in it

Network settings:

Create security group
Allow ssh, https, http
Storage 8gb
Click launch instance


Instances tab:

Select MyExampleServer
Click connect
Copy ssh command
Go to AWS folder
Open cmd
Paste ssh command
Type yes


Install:

sudo apt update
sudo apt-get install docker.io
sudo apt install git
sudo apt install nano


Create index.html in AWS folder

Git:

git init
git add .
git commit -m "msg"
Create new repo AWS
git branch -M main
git remote add origin gitlink
git push -u origin main


Refresh repo and copy https path:

git clone copiedgiturl
ls
cd AWS
ls


Create Dockerfile:

nano Dockerfile

FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

ctrl o
ctrl x


Build and Run:

sudo docker build –t mywebapp
sudo docker run –d –p 80:80 mywebapp


Click instance id

Click on link beside ipv4 address

Add http:// or https

Optional:

sudo docker ps
sudo docker stop


If your app is not running:

Go to security
Click on security groups
Edit inbound rules
Add rule
Port: 9090
0.0.0.0/0
Save
Refresh
