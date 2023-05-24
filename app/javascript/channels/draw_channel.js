import consumer from "channels/consumer";

consumer.subscriptions.create("DrawChannel", {
  connected() {
    this.listenToCanvas();
  },

  listenToCanvas() {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    this.remoteContext = this.canvas.getContext("2d");

    this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
    this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));
    this.canvas.addEventListener("mousemove", this.draw.bind(this));
  },

  startDrawing(event) {
    this.isDrawing = true;
    this.lastX = event.offsetX;
    this.lastY = event.offsetY;
    this.lastSent = Date.now();

    this.perform("draw", {
      x: event.offsetX,
      y: event.offsetY,
      state: "start",
    });
  },

  stopDrawing(event) {
    this.isDrawing = false;
    this.lastX = event.offsetX;
    this.lastY = event.offsetY;
    this.lastSent = Date.now();

    this.perform("draw", {
      x: event.offsetX,
      y: event.offsetY,
      state: "stop",
    });
  },

  draw(event) {
    if (!this.isDrawing) return;
    if (Date.now() - this.lastSent > 10) {
      this.perform("draw", {
        x: event.offsetX,
        y: event.offsetY,
        state: "drawing",
      });
      this.lastSent = Date.now();
    }
    this.drawData(event.offsetX, event.offsetY);
  },

  drawData(x, y) {
    this.context.lineJoin = "round";
    this.context.lineCap = "round";

    this.context.beginPath();

    this.context.moveTo(this.lastX, this.lastY);
    this.context.lineTo(x, y);
    this.context.stroke();

    this.lastX = x;
    this.lastY = y;
  },

  drawRemoteData(x, y) {
    this.remoteContext.lineJoin = "round";
    this.remoteContext.lineCap = "round";
    this.remoteContext.beginPath();
    this.remoteContext.moveTo(this.remoteLastX, this.remoteLastY);
    this.remoteContext.lineTo(x, y);
    this.remoteContext.stroke();

    this.remoteLastX = x;
    this.remoteLastY = y;
  },

  disconnected() {
  },

  received(data) {
    if (data.state === "start") {
      this.remoteLastX = data.x;
      this.remoteLastY = data.y;
      return;
    }

    if (data.state === "stop") {
      this.remoteLastX = data.x;
      this.remoteLastY = data.y;
      return;
    }

    this.drawRemoteData(data.x, data.y);
  },
});