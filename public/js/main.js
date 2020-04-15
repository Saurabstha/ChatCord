const chatForm = document.getElementById("chat-form");
const chatMesssages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log( username, room);

const socket = io();

//Join chat room
socket.emit('joinRoom', { username, room })

//get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

// grabing whatever from server in client
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //scrol down
    chatMesssages.scrollTop = chatMesssages.scrollHeight;
})

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get message text
    const msg = e.target.elements.msg.value;
    // console.log(msg);

    //Emmiting message to server
    socket.emit('chatMesssage', msg);

    //clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">
                    ${message.text}
                    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}