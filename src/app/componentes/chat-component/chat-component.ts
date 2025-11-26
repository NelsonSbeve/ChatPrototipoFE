import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.scss',
})
export class ChatComponent {
  usernameInput = '';
  message = '';
  privateMessage = '';
  activePrivateUser = '';
  rooms = ['geral', 'dev', 'product'];

  constructor(public chat: ChatService) { }

  login() {
    if (!this.usernameInput.trim()) return;
    this.chat.connect(this.usernameInput.trim());
  }

  switchRoom(room: string) {
    this.chat.joinRoom(room);
  }

  send() {
    if (!this.message.trim()) return;
    this.chat.sendMessage(this.message);
    this.message = '';
  }

  startPrivateChat(user: string) {
    this.activePrivateUser = user;
  }

  sendPm() {
    if (!this.activePrivateUser || !this.privateMessage.trim()) return;
    this.chat.sendPrivateMessage(this.activePrivateUser, this.privateMessage);
    this.privateMessage = '';
  }
}
