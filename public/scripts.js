document.querySelector('#user-loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.querySelector('#username').value;
    if (!checkempty(username)) {
        alert("Please enter username to chat");
    } else {
        connectToServer(username);
    }

})
function checkempty(username) {
    if (username == null ||
        username == undefined ||
        username.length == 0) {
        return false;
    } else {
        return true;
    }
}
function toggleBlock(isTrue) {
    if (isTrue) {
        document.getElementById("loginWindow").classList.remove('showBlock');
        document.getElementById("loginWindow").classList.add("hideBlock")
        document.querySelector('#chatWindow').classList.remove('hideBlock');
        document.querySelector('#chatWindow').classList.add('showBlock');
    } else {
        document.getElementById("loginWindow").classList.remove('hideBlock');
        document.getElementById("loginWindow").classList.add("showBlock")
        document.querySelector('#chatWindow').classList.remove('showBlock');
        document.querySelector('#chatWindow').classList.add('hideBlock');
    }

}

function connectToServer(usr) {
    let mySocketID;
    //let chatserverURL = "http://localhost:3665";
    let chatserverURL = "https://simplechatappinterview.herokuapp.com";
    //host:port
    //please change the server url based on host and port;
    const socket = io(chatserverURL, {
        query: {
            username: usr
        }
    });

    socket.on('connect', () => {
        mySocketID = socket.id;
        console.log('My Socket ID is: =>' + socket.id)
    });

    socket.on('loginFailed', (msg) => {
        console.log(msg)
        document.getElementById("loginAlert").classList.remove('hideBlock');
        document.getElementById("loginAlert").innerHTML = msg.text;
    });

    socket.on('connectionConfirmation', (msg) => {
        toggleBlock(true);
        document.getElementById("loginAlert").classList.add('hideBlock');
        document.getElementById("loginAlert").innerHTML = "";
        console.log(msg)
    })

    socket.on('newMessageToClients', (msg) => {
        const newMsg = buildHTML(msg);
        document.querySelector('#messages').innerHTML += newMsg
    });

    socket.on('leaveChatResponseFromClient', (msg) => {
        console.log(msg)
        document.getElementById("loginAlert").classList.remove('hideBlock');
        document.getElementById("loginAlert").innerHTML = msg.text;
    });

    document.querySelector('#user-inputForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const newMessage = document.querySelector('#user-message').value;
        document.querySelector('#user-message').value = "";
        if (newMessage.charAt(0) == "/") {
            cmdStr = newMessage.substring(1, newMessage.length).toUpperCase();
            switch (cmdStr) {
                case 'END':
                    toggleBlock(false);
                    mySocketID
                    socket.emit('leaveChatRequestFromClient', { mySocketID });
                    break;
                case 'FAQ':
                    openFaq();
                    break;
                case 'HELP':
                    openFaq();
                    break;
                case 'default':
                    socket.emit('newMessageToServer', { text: newMessage });
                    break;
            }
        } else {
            socket.emit('newMessageToServer', { text: newMessage });
        }
    });
}



function buildHTML(msg) {
    const convertedDate = new Date(msg.time).toLocaleString();
    const newHTML = `
    <li>
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>    
    `
    return newHTML;
}

function openFaq() {
    document.getElementById("faqWindow").classList.remove("hideBlock");
    document.getElementById("closeFaq").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("faqWindow").classList.add("hideBlock");
    });
}
// socket.on('ping',()=>{
//     console.log('Ping was recieved from the server.');
//     console.log(io.protocol)
// })

// socket.on('pong',(latency)=>{
//     console.log(latency);
//     console.log("Pong was sent to the server.")
// })
