import { Component, OnInit, OnDestroy, effect, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-chat-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesList') messagesList?: ElementRef;

  usernameInput = '';
  message = '';
  privateMessage = '';
  activePrivateUser = '';
  rooms = ['geral', 'dev', 'product'];

  constructor(public chat: ChatService) {
    // Auto-scroll quando novas mensagens chegam
    effect(() => {
      const messages = this.chat.messages();
      const currentRoom = this.chat.currentRoom();

      if (messages[currentRoom]) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  ngOnInit() {
    this.chat.requestNotificationPermission();
  }

  ngOnDestroy() {
    this.chat.disconnect();
  }

  login() {
    const trimmed = this.usernameInput.trim();
    if (!trimmed || trimmed.length < 2) return;
    this.chat.connect(trimmed);
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
    if (user === this.chat.username()) return;
    this.activePrivateUser = user;
    this.chat.markPrivateMessagesAsRead(user);
  }

  closePrivateChat() {
    this.activePrivateUser = '';
    this.privateMessage = '';
  }

  sendPm() {
    if (!this.activePrivateUser || !this.privateMessage.trim()) return;
    this.chat.sendPrivateMessage(this.activePrivateUser, this.privateMessage);
    this.privateMessage = '';
  }

  getUnreadCount(user: string): number {
    return this.chat.unreadPrivateMessages()[user] || 0;
  }

  getCurrentRoomMessages() {
    const room = this.chat.currentRoom();
    return this.chat.messages()[room] || [];
  }

  getPrivateMessagesForUser(user: string) {
    return this.chat.privateMessages()[user] || [];
  }

  private scrollToBottom() {
    if (this.messagesList) {
      const element = this.messagesList.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
