# Social Media App with Comment Classification

A fully-featured social media web application built with the MERN stack, featuring real-time comment toxicity classification.

## Features
- Create, read, update and delete posts
- **Advanced comment classification** using trained ML model
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
- Uses a custom-trained model for Tamil and English
- Provides immediate visual feedback on comment toxicity
- Helps maintain a positive community environment

## Installation and usage
1) Clone this repository  
```
git clone https://github.com/elahari16/mini-social-media-app.git
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
### Explore view
![image](https://user-images.githubusercontent.com/76620777/170822044-44c5f2e6-879f-4b16-8059-f9e331ba57de.png)

### Post view with Comment Classification
![image](https://user-images.githubusercontent.com/76620777/170822055-ac686a28-7d5b-4d44-b8d3-a028521534d8.png)

### Nested comments with Toxicity Detection
![image](https://user-images.githubusercontent.com/76620777/170822065-64622f43-5f70-48c2-9503-0e1b80575fd2.png)

### Profile view
![image](https://user-images.githubusercontent.com/76620777/170822076-18741eef-ba2b-4750-b468-e7e9561a6a71.png)

### Real-time private messenger
![image](https://user-images.githubusercontent.com/76620777/170822084-89a9d3ac-22ed-4a92-ab58-9b0af878e03e.png)