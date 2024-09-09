import { Server } from "socket.io";

const io = new Server(8000,{
    cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map()


io.on('connection', (socket) => {
    console.log("Connection Done!");
    socket.on('room:join', data => {
        console.log('data: ',data)
        const {email, room} = data
        console.log(email, room,  "Room Join")

        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
      

        io.to(room).emit('user:joined', {email, socketId: socket.id});
        socket.join(room);

        io.to(socket.id).emit('room:join', data)
    });

    socket.on('outgoing:call', data => {
        const {to, offer} = data;
        io.to(to).emit('incoming:call', {from: socket.id, offer})
    })

    socket.on('call:accepted', data => {
        const {to, answer} = data;
        io.to(to).emit('call:accepted', {from: socket.id, answer})
    });

    socket.on('peer:negotiation:needed', data => {
        const {to, offer} = data;
        io.to(to).emit('peer:negotiation:needed', {from: socket.id, offer})
    });

    socket.on('peer:negotiation:done', data => {
        const {to, answer} = data;
        io.to(to).emit('peer:negotiation:final', {from: socket.id, answer})
    })
})