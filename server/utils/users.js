//addUser(id, name, room), id:socket.id
//removeUser(id)
//getUser(id)
//getuserList(room)

class Users {
  constructor() {
    this.users = [];
    this.roomList = [];
  }
  addUser(id, name, room, color, roomowner){
    var user = {id, name, room, color, roomowner};
    this.users.push(user);
    return user;
  }
  removeUser(id) {
    var user = this.getUser(id);
    if(user){
      this.users = this.users.filter((user) => user.id !== id);
    }
    return user;
  }
  getUser(id) {
    return this.users.find((user) => user.id === id);
  }
  getUserList(room){
    var users = this.users.filter((user) => user.room === room);
    //users is an array of objects -> convert it to string
    var namesArray = users.map((user) => user.name);
    return namesArray;
  }

  addRoom(room){
    if(!this.roomList.includes(room)){
        this.roomList.push(room);
        return room;
    }
    return null;
  }
  removeRoom(room){
    var modifiedRoomList = this.roomList.filter((eachroom) => eachroom !== room);
    return this.roomList = modifiedRoomList;
  }
  getRoomList(){
    return this.roomList;
  }
}

module.exports = {Users};
