import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;

  public messages: { [room: string]: { user: string; text: string }[] } = {};
  public privateMessages: { [user: string]: { from: string; text: string }[] } = {};
  public onlineUsers: string[] = [];

  public username = '';
  public currentRoom = '';


  connect(username: string) {
    this.username = username;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5154/chat')
      .withAutomaticReconnect()
      .build();

    this.registerHandlers();

    this.hubConnection.start()
      .catch(err => console.error(err));
  }



  private registerHandlers() {
    this.hubConnection.on('ReceiveMessage', (user, message) => {
      if (!this.messages[this.currentRoom]) this.messages[this.currentRoom] = [];
      this.messages[this.currentRoom].push({ user, text: message });
    });

    this.hubConnection.on('ReceivePrivateMessage', (from, message) => {
      if (!this.privateMessages[from]) this.privateMessages[from] = [];
      this.privateMessages[from].push({ from, text: message });
    });

    this.hubConnection.on('UpdateOnlineUsers', (users: string[]) => {
      this.onlineUsers = users;
    });
  }

  joinRoom(room: string) {
    this.currentRoom = room;
    if (!this.messages[room]) this.messages[room] = [];

    this.hubConnection.invoke('JoinChat', this.username, room)
      .catch(err => console.error(err));
  }

  sendMessage(message: string) {
    if (!this.currentRoom) return;
    this.hubConnection.invoke('SendMessage', message);
  }

  sendPrivateMessage(to: string, message: string) {
    this.hubConnection.invoke('SendPrivateMessage', to, message);
    if (!this.privateMessages[to]) this.privateMessages[to] = [];
    this.privateMessages[to].push({ from: this.username, text: message });
  }
}
