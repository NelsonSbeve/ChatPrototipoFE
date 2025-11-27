import { Injectable, signal, computed } from '@angular/core';
import * as signalR from '@microsoft/signalr';

export interface Message {
  user: string;
  text: string;
  timestamp: Date;
}

export interface PrivateMessage {
  from: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;

  // Usando signals do Angular 20
  public messages = signal<{ [room: string]: Message[] }>({});
  public privateMessages = signal<{ [user: string]: PrivateMessage[] }>({});
  public onlineUsers = signal<string[]>([]);
  public unreadPrivateMessages = signal<{ [user: string]: number }>({});
  public onlineUsersInCurrentRoom = signal<string[]>([]);

  public username = signal('');
  public currentRoom = signal('');
  public isConnected = signal(false);

  // Computed signals
  public totalUnreadMessages = computed(() => {
    const unread = this.unreadPrivateMessages();
    return Object.values(unread).reduce((sum, count) => sum + count, 0);
  });

  connect(username: string) {
    this.username.set(username);

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://chatprototipobe-production.up.railway.app/chat?username=${username}`)
      .withAutomaticReconnect()
      .build();

    this.registerHandlers();

    this.hubConnection.start()
      .then(() => {
        this.isConnected.set(true);
        console.log('✅ Connected');
      })
      .catch(err => {
        console.error('❌ Connection Error:', err);
        this.isConnected.set(false);
      });

    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      if (this.currentRoom()) {
        this.joinRoom(this.currentRoom());
      }
    });

    this.hubConnection.onreconnecting(() => {
      this.isConnected.set(false);
    });
  }

  private registerHandlers() {
    // Handler existente: ReceiveMessage
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      const room = this.currentRoom();
      if (!room) return;

      const currentMessages = this.messages();
      const roomMessages = currentMessages[room] || [];

      this.messages.set({
        ...currentMessages,
        [room]: [...roomMessages, { user, text: message, timestamp: new Date() }]
      });

      this.playNotificationSound();
    });

    // Handler existente: ReceivePrivateMessage
    this.hubConnection.on('ReceivePrivateMessage', (from: string, message: string) => {
      const currentPMs = this.privateMessages();
      const userMessages = currentPMs[from] || [];

      this.privateMessages.set({
        ...currentPMs,
        [from]: [...userMessages, { from, text: message, timestamp: new Date(), read: false }]
      });

      // Atualizar contador de não lidas
      const unread = this.unreadPrivateMessages();
      this.unreadPrivateMessages.set({
        ...unread,
        [from]: (unread[from] || 0) + 1
      });

      this.showNotification(`${from}`, message);
      this.playNotificationSound();
    });

    // Handler existente: UpdateOnlineUsers
    this.hubConnection.on('UpdateOnlineUsers', (users: string[]) => {
      this.onlineUsers.set(users);
    });

    this.hubConnection.on('UpdateOnlineUsersInRoom', (users: string[]) => {
      this.onlineUsersInCurrentRoom.set(users);
    });
  }

  joinRoom(room: string) {
    this.currentRoom.set(room);

    const currentMessages = this.messages();
    if (!currentMessages[room]) {
      this.messages.set({
        ...currentMessages,
        [room]: []
      });
    }

    this.hubConnection.invoke('JoinChat', this.username(), room)
      .catch(err => console.error('❌ Error joining room:', err));
  }

  sendMessage(message: string) {
    const room = this.currentRoom();
    if (!room || !message.trim()) return;

    this.hubConnection.invoke('SendMessage', message)
      .catch(err => console.error('❌ Error sending message:', err));
  }

  sendPrivateMessage(to: string, message: string) {
    if (!message.trim()) return;

    this.hubConnection.invoke('SendPrivateMessage', to, message)
      .then(() => {
        const currentPMs = this.privateMessages();
        const userMessages = currentPMs[to] || [];

        this.privateMessages.set({
          ...currentPMs,
          [to]: [...userMessages, {
            from: this.username(),
            text: message,
            timestamp: new Date(),
            read: true
          }]
        });
      })
      .catch(err => console.error('❌ Error sending private message:', err));
  }

  markPrivateMessagesAsRead(user: string) {
    const currentPMs = this.privateMessages();
    const userMessages = currentPMs[user] || [];

    const updatedMessages = userMessages.map(msg => ({
      ...msg,
      read: true
    }));

    this.privateMessages.set({
      ...currentPMs,
      [user]: updatedMessages
    });

    const unread = this.unreadPrivateMessages();
    this.unreadPrivateMessages.set({
      ...unread,
      [user]: 0
    });
  }

  private playNotificationSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyy3ksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2ok3CBlou+3nn00QDFCn4/C2YxwGOJLX8st5LAUkd8fw3ZBAChRetOvrqFUUCkaf4PK+bCEFK4LO8tqJNwgZaLvt559NEAxQ');
    audio.volume = 0.2;
    audio.play().catch(() => { });
  }

  private showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  isUserOnline(username: string): boolean {
    return this.onlineUsers().includes(username);
  }

  disconnect() {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => this.isConnected.set(false));
    }
  }
}
