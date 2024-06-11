const progressPath = document.getElementById('progress-path');
const progressBackground = document.getElementById('progress-background');

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
  };
}

let currentProgress = 0;

function describeArc(x, y, radius, startAngle, endAngle){
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);
  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  var d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "L", start.x, start.y
  ].join(" ");
  return d;       
}
let animationFrameId = null;

function setProgress(progress) {
  if (progress > 100) progress = 100;
  if (progress < 0) progress = 0;
  currentProgress = progress;
  const path = document.getElementById('progress-path');
  const text = document.getElementById('progress-text');
  const endAngle = progress / 100 * 360;
  path.setAttribute("d", describeArc(50, 50, 45, 0, endAngle));
}

function animateProgress(targetProgress, duration) {
  const start = performance.now();

  const startProgress = currentProgress;

  function animate(time) {
    const elapsed = time - start;
    const progress = Math.min(startProgress + (targetProgress - startProgress) * (elapsed / duration), targetProgress);
    setProgress(progress);
    if (elapsed < duration) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(animate);
}

// Websocket

let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");

socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};
socket.onerror = error => console.log("Socket Error: ", error);

socket.onmessage = event => {
  let data = JSON.parse(event.data);
  let bm = data.menu.bm;

  // hide progress circle when not in map
  if (data.menu.state !== 2) {
    animateProgress(0, 1000);
    document.querySelector(".progress-container").style.display = "none";
    return;
  } else {
    document.querySelector(".progress-container").style.display = "flex";
  }

  if (bm && bm.time.current > 0 && bm.time.firstObj > 0 && (bm.time.current > bm.time.firstObj)) {
    progressBackground.style.fill = "rgba(0, 0, 0, .5)";
    progressPath.style.fill = "rgba(255, 255, 255, .5)";
    animateProgress((bm.time.firstObj - bm.time.current) / (bm.time.full - bm.time.firstObj) * 100 * -1, 1000);
  } else {
    animateProgress(0, 1000);
  }

  // skippable section (start of map)
  // turn circle to green
  if (bm && bm.time.current < bm.time.firstObj) {
    console.log(bm.time.current, bm.time.firstObj, bm.time.current / bm.time.firstObj * 100);
    animateProgress((bm.time.current / bm.time.firstObj * 100), bm.time.firstObj / 100);
    progressBackground.style.fill = "rgb(154, 186, 61, .75)";
    progressPath.style.fill = "#000";
  }
}