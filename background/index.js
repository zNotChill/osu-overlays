let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");

socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};
socket.onerror = error => console.log("Socket Error: ", error);

// configuration here
const config = {
  showOnlyWhenInMap: true, // the background will ONLY show when you're playing a map if this is true, else it will always show
  opacity: 0.2, // the opacity of the background (0-1, 0 being invisible, 1 being solid)
}

let backgroundImage = "";

socket.onmessage = event => {
  let data = JSON.parse(event.data)

  let shouldBackgroundShow = config.showOnlyWhenInMap ? data.menu.state === 2 : true;

  // only set it when necessary (upon a map change or when the background is not set)
  if(!shouldBackgroundShow) {
    document.querySelector(".background").style.opacity = 0;
    backgroundImage = "";
    return;
  }

  if (backgroundImage !== data.menu.bm.path.full) {
    console.log("Background changed to", data.menu.bm.path.full);
    backgroundImage = data.menu.bm.path.full;
    document.querySelector(".background").style.opacity = config.opacity;
    document.querySelector(".background").src = `http://127.0.0.1:24050/Songs/${data.menu.bm.path.full}?a=${Math.random(10000)}`
  }
}