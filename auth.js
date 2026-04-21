import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
getAuth, 
createUserWithEmailAndPassword, 
signInWithEmailAndPassword,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
getDatabase,
ref,
set,
onValue,
push,
onChildAdded
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyDYuw8POzVfhxNwmiQAXf86W6RqnUhuem4",
  authDomain: "pixlychat.firebaseapp.com",
  databaseURL: "https://pixlychat-default-rtdb.firebaseio.com",
  projectId: "pixlychat",
  storageBucket: "pixlychat.firebasestorage.app",
  messagingSenderId: "930502466662",
  appId: "1:930502466662:web:278d0de81840ef005521a7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* LOGIN UI */
const msg = document.getElementById("msg");

/* AUTH FUNCTIONS */
window.login = () => {
const email = emailInput.value;
const pass = passInput.value;

signInWithEmailAndPassword(auth,email,pass)
.then(()=> location.href="chat.html")
.catch(e=> msg.innerText=e.message);
};

window.signup = () => {
const email = emailInput.value;
const pass = passInput.value;

createUserWithEmailAndPassword(auth,email,pass)
.then(()=> location.href="chat.html")
.catch(e=> msg.innerText=e.message);
};

/* CHAT SYSTEM */
let user;
let chatId = null;
let listener = null;

/* AUTH CHECK */
onAuthStateChanged(auth,(u)=>{
if(!u){
if(location.pathname.includes("chat")){
location.href="login.html";
}
return;
}

user = u;

/* SAVE USER (IMPORTANT FOR USER LIST) */
set(ref(db,"users/"+u.uid),{
email:u.email,
uid:u.uid
});

/* LOAD USERS */
loadUsers();
});

/* USERS */
function loadUsers(){
onValue(ref(db,"users"),(snap)=>{
const data = snap.val() || {};
usersPanel.innerHTML = "";

Object.keys(data).forEach(uid=>{
if(uid === user.uid) return;

const div = document.createElement("div");
div.className = "user";
div.innerText = data[uid].email;

div.onclick = () => openChat(uid,data[uid].email);

usersPanel.appendChild(div);
});
});
}

/* CHAT ID */
function getChatId(a,b){
return [a,b].sort().join("_");
}

/* OPEN CHAT */
function openChat(uid,email){

chatId = getChatId(user.uid,uid);

chat.innerHTML = "";
title.innerText = email;

msg.disabled = false;

/* hide users */
usersPanel.classList.add("hide");

/* stop old listener */
if(listener){
listener();
listener = null;
}

/* new listener */
listener = onChildAdded(ref(db,"chats/"+chatId),(snap)=>{
const d = snap.val();

const div = document.createElement("div");
div.classList.add("msg");

div.classList.add(d.uid === user.uid ? "me" : "other");

div.innerText = d.text;
chat.appendChild(div);

chat.scrollTop = chat.scrollHeight;
});
}

/* SEND */
window.send = () => {
if(!msg.value.trim()) return;

push(ref(db,"chats/"+chatId),{
text:msg.value,
uid:user.uid,
time:Date.now()
});

msg.value = "";
};

/* TOGGLE USERS */
window.toggle = () => {
usersPanel.classList.toggle("hide");
};

/* BACK */
window.back = () => {
usersPanel.classList.remove("hide");
chat.innerHTML = "";
title.innerText = "Select User";
msg.disabled = true;

if(listener){
listener();
listener = null;
}
};
