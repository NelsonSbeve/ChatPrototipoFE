import { Injectable } from '@angular/core';

import * as signalR from '@microsoft/signalr';

@Injectable({

  providedIn: 'root'

})

export class ChatService {

  private hubConnection!: signalR.HubConnection;

  public messages: { user: string; text: string }[] = [];

  public privateMessages: { from: string; text: string }[] = [];

  public onlineUsers: string[] = [];

  public username = '';

  public room = '';

  connect(username: string, room: string) {

    this.username = username;

    this.room = room;

    this.hubConnection = new signalR.HubConnectionBuilder()

      .withUrl('http://localhost:5000/chat')  // your API

      .withAutomaticReconnect()

      .build();

    this.registerHandlers();

    this.hubConnection

      .start()

      .then(() => this.hubConnection.invoke('JoinChat', username, room))

      .catch(err => console.error(err));

  }

  private registerHandlers() {

    this.hubConnection.on('ReceiveMessage', (user, message) => {

      this.messages.push({ user, text: message });

    });

    this.hubConnection.on('ReceivePrivateMessage', (from, message) => {

      this.privateMessages.push({ from, text: message });

    });

    this.hubConnection.on('OnlineUsers', (users: string[]) => {

      this.onlineUsers = users;

    });

    this.hubConnection.on('UserJoined', (user: string) => {

      console.log(user + ' joined');

    });

    this.hubConnection.on('UserLeft', (user: string) => {

      console.log(user + ' left');

    });

  }

  sendMessage(message: string) {

    this.hubConnection.invoke('SendMessage', message);

  }

  sendPrivateMessage(to: string, message: string) {

    this.hubConnection.invoke('SendPrivateMessage', to, message);

  }

}

