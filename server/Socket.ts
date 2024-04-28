import { Server } from "socket.io";
import http from "http";
type Server_type = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
export default function Socket(server:Server_type): Server{
  const io = new Server(server);
  const ClientCache:any = {};
  io.on("connection", (socket) => {
    ClientCache[socket.id]=ClientCache[socket.id]??{};
    socket.on("join", async (room, ...args) => {
      ClientCache[socket.id].room=ClientCache[socket.id].room??room;
      await socket.join(room);
      io.to(room).emit("join", String(socket.id));
    });
    socket.on("message", async (event=null, data=null, addressee=null) => {
      ClientCache[socket.id]=ClientCache[socket.id]??{};
      ClientCache[socket.id].data=ClientCache[socket.id].data??data;
      const roomClient = ClientCache[socket.id].room; 
      const EmtSocket = roomClient?
            socket.to(roomClient):
            socket.broadcast;
      EmtSocket.emit(
        event??"message", 
        data??[], 
        socket.id, //sender 
        addressee //addressee
      );
    });

  });
  return io;
}