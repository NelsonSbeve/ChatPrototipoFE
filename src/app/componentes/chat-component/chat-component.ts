import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChatService } from '../../services/chat';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.scss',
})
export class ChatComponent {
  username = '';
  room = 'geral';
  message = '';
  privateMessage = '';
  targetUser = '';

  constructor(public chat: ChatService) { }

  connect() {
    this.chat.connect(this.username, this.room);
  }

  send() {
    this.chat.sendMessage(this.message);
    this.message = '';
  }

  sendPm() {
    this.chat.sendPrivateMessage(this.targetUser, this.privateMessage);
    this.privateMessage = '';
  }

}
