import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ChatService } from '../services/chat.service';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit {
  @ViewChild('chatContent') private chatContent: IonContent;
  @ViewChild('messageInput') messageInput: ElementRef;

  messages: Message[] = [];
  newMessage: string = '';
  isTyping: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Add initial greeting message
    this.messages.push({
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      type: 'assistant',
      timestamp: new Date()
    });

    // Subscribe to new messages
    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
    });
  }

  async sendMessage() {
    if (!this.newMessage?.trim()) return;

    // Add user message
    const userMessage: Message = {
      content: this.newMessage.trim(),
      type: 'user',
      timestamp: new Date()
    };
    this.chatService.addMessage(userMessage);

    // Clear input and scroll to bottom
    this.newMessage = '';
    await this.scrollToBottom();

    // Show typing indicator
    this.isTyping = true;

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        content: 'I understand your message. This is a simulated response that would be replaced with an actual API call to process your request.',
        type: 'assistant',
        timestamp: new Date()
      };
      this.isTyping = false;
      this.chatService.addMessage(assistantMessage);
    }, 1500);
  }

  private async scrollToBottom() {
    try {
      await this.chatContent.scrollToBottom(300);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
