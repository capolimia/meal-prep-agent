import { Component, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { FluidModule } from 'primeng/fluid';
import { v4 as uuidv4 } from 'uuid';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';


@Component({
  selector: 'app-chat-window',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToolbarModule,
    FluidModule,
    SkeletonModule,
    CardModule
  ],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow implements OnDestroy {
  @Output() recipePlanGenerated = new EventEmitter<string>();
  private baseUrl = 'http://localhost:8000';
  private userId: string | null = null;
  private sessionId: string | null = null;
  
  currentMessage = '';
  aiResponse = '';
  messages: Array<{ text: string; isUser: boolean }> = [];
  isLoading = false;
  loadingMessageIndex = 0;
  loadingMessages = [
    'Thinking... This can take up to 10 minutes. Thanks for your patience!',
    'Still working on it... We appreciate you waiting!',
    'Almost there... Your patience means a lot!',
    'Crafting the perfect meal plan... Thank you for being patient!'
  ];
  private loadingMessageInterval: any;

  async createSession() {
    const sessionId = uuidv4();
    const response = await fetch(
      `${this.baseUrl}/apps/app/users/u_999/sessions/${sessionId}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );
    const data = await response.json();
    this.userId = data.userId;
    this.sessionId = data.id;
    return data;
  }

  async handleSendMessage() {
    if (!this.currentMessage.trim()) return;
    
    const userMessage = this.currentMessage;
    this.currentMessage = ''; // Clear input immediately
    
    // Add user message to chat
    this.messages.push({ text: userMessage, isUser: true });
    
    this.isLoading = true;
    this.aiResponse = '';
    this.loadingMessageIndex = 0;
    this.startLoadingMessageCycle();
    
    try {
      await this.sendMessageToApi(userMessage, (chunk) => {
        this.aiResponse = chunk;
      });
      
      // Add complete AI response to chat
      if (this.aiResponse) {
        this.messages.push({ text: this.aiResponse, isUser: false });
        // Emit the response to update the recipe plan
        if (this.aiResponse.includes('.com')) {
          this.recipePlanGenerated.emit(this.aiResponse);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`;
      this.messages.push({ text: errorMsg, isUser: false });
    } finally {
      this.stopLoadingMessageCycle();
      this.isLoading = false;
      this.aiResponse = '';
    }
  }

  private startLoadingMessageCycle() {
    this.loadingMessageInterval = setInterval(() => {
      this.loadingMessageIndex = (this.loadingMessageIndex + 1) % this.loadingMessages.length;
    }, 7000); // Change message every 7 seconds
  }

  private stopLoadingMessageCycle() {
    if (this.loadingMessageInterval) {
      clearInterval(this.loadingMessageInterval);
      this.loadingMessageInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopLoadingMessageCycle();
  }

  private async sendMessageToApi(query: string, onChunk: (text: string) => void) {
    if (!this.sessionId) {
      console.log('No session, creating one...');
      await this.createSession();
    }

    console.log('Sending message:', {
      appName: 'app',
      userId: this.userId,
      sessionId: this.sessionId,
      message: query
    });

    const requestBody = {
      appName: 'app',
      userId: this.userId,
      sessionId: this.sessionId,
      newMessage: { 
        parts: [{ text: query }], 
        role: 'user' 
      },
      streaming: false
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${this.baseUrl}/run_sse`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.substring(5).trim();
            if (!jsonStr) continue;
            
            const data = JSON.parse(jsonStr);
            console.log('SSE event:', data);
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.content?.parts) {
              const text = data.content.parts
                .filter((p: any) => p.text)
                .map((p: any) => p.text)
                .join(' ');
              if (text) {
                onChunk(text);
              }
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError, line);
          }
        }
      }
    }
  }
}
