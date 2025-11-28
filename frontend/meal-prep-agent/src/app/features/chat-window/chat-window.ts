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

//The chat window for communicating to the agent backend.
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

  //creates a session if one does not exist with a default user id. 
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

  //handles the sending of messages to the local backend.
  async handleSendMessage() {
    if (!this.currentMessage.trim()) return;
    
    const userMessage = this.currentMessage;
    this.currentMessage = ''; // Clear input box immediately
    
    // Add user message to chat
    this.messages.push({ text: userMessage, isUser: true });
    
    this.isLoading = true;
    this.aiResponse = '';
    this.loadingMessageIndex = 0;
    this.startLoadingMessageCycle();
    
    try {
      //try to send the message
      await this.sendMessageToApi(userMessage, (response) => {
        this.aiResponse = response;
      });
      
      // Add complete AI response to chat if present
      if (this.aiResponse) {
        this.messages.push({ text: this.aiResponse, isUser: false });
        // Emit the response to update the recipe plan component if it is a final plan (if any recipe links are present)
        if (this.aiResponse.includes('.com')) {
          this.recipePlanGenerated.emit(this.aiResponse);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`;
      this.messages.push({ text: errorMsg, isUser: false });
    } finally {
      //stop the loading messages at the end of the request to the backend
      this.stopLoadingMessageCycle();
      this.isLoading = false;
      this.aiResponse = '';
    }
  }

  //handles loading messages in the chat window while the response or plan is being generated
  private startLoadingMessageCycle() {
    this.loadingMessageInterval = setInterval(() => {
      this.loadingMessageIndex = (this.loadingMessageIndex + 1) % this.loadingMessages.length;
    }, 7000); // Change message every 7 seconds
  }

  //stop loading messages
  private stopLoadingMessageCycle() {
    if (this.loadingMessageInterval) {
      clearInterval(this.loadingMessageInterval);
      this.loadingMessageInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopLoadingMessageCycle();
  }

  //Handles sending the message to the backend.
  private async sendMessageToApi(query: string, onResponse: (text: string) => void) {
    //if no session, create one.
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
      }
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    //send to the backend and await response
    const response = await fetch(`${this.baseUrl}/run`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);

    //error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    //await and log the response
    const data = await response.json();
    console.log('Response data:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    const events = data;
    
    // Get only the last event
    const lastEvent = events[events.length - 1];
    let text = '';
    
    if (lastEvent?.content?.parts) {
      for (const part of lastEvent.content.parts) {
        // Check for direct text
        if (part.text) {
          text = part.text;
          break;
        }
        // Check for function response with result
        if (part.functionResponse?.response?.result) {
          text = part.functionResponse.response.result;
          break;
        }
      }
    }
    
    console.log('Extracted text from last event:', text);
    
    if (text) {
      onResponse(text);
    } else {
      console.warn('No text found in last event. Full response:', JSON.stringify(data, null, 2));
      throw new Error('No text content in response');
    }
  }
}
