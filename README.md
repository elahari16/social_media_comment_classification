# Social Media App with Comment Classification 

A fully-featured social media web application built with the MERN stack, featuring real-time comment toxicity classification.

## Features
- Create, read, update and delete posts
- ***Advanced comment classification*** using trained ML model
- Real-time toxicity detection for harmful content
- Like and unlike posts
- Create, reply to, read, update and delete nested comments
- Markdown for posts and comments
- Sign up and login using JWT for authentication
- Private message users in real-time using socket.io
- View profiles of users and browse through their posts, liked posts and comments
- Infinite scrolling
- Sort posts by attributes such as like count, comment count and date created
- Update bio which can be viewed by other users
- Search for posts by their title
- View the users who liked a particular post
- Fully responsive layout

## Comment Classification
Our app features an advanced comment classification system that:
- Detects toxic content in real-time
- Uses a custom-trained model for **Tamil and English**
- Provides immediate visual feedback on comment toxicity
- Helps maintain a positive community environment

## Installation and usage
1) Clone this repository  
```
git clone https://github.com/elahari16/social_media_comment_classification
```
2) Install dependencies  
```
cd mini-social-media-app
npm install
cd client
npm install
```
3) Create .env in root directory
```
cd ..
touch .env
```
4) Configure environment variables in your .env file
```
MONGO_URI=<YOUR_MONGO_URI> 
TOKEN_KEY=<YOUR_TOKEN_KEY>
PORT=5001
CLIENT_URL=http://localhost:3000
```
5) Run the server
```
npm run server
```
6) Start React's development server
```
cd client
npm start
```

## Screenshots
### Login in view
![Screenshot 2025-06-06 183242](https://github.com/user-attachments/assets/8d491686-1b72-4d15-9ffc-8b486ff8ad7a)

### Post view with Comment Classification
![Screenshot 2025-06-06 181744](https://github.com/user-attachments/assets/2aafeeca-c4cb-4ce8-8f8c-ea78e485260a)


### Profile view
![Screenshot 2025-06-06 183714](https://github.com/user-attachments/assets/48f515f1-2b5c-4f03-9cfa-fe79ea62b30f)

### Project presentation 
https://docs.google.com/presentation/d/1b7eukQViM5KglocpUfRwh58t5ZuZp7ep/edit?usp=sharing&ouid=112558413164205700415&rtpof=true&sd=true
