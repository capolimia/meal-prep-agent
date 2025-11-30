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
import { environment } from '../../../environments/environment';


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
  private baseUrl = environment.apiUrl;
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

  //handles the sending of messages to the backend with streaming.
  async handleSendMessage() {
    if (!this.currentMessage.trim()) return;
    
    const userMessage = this.currentMessage;
    this.currentMessage = ''; // Clear input box immediately
    
    // Add user message to chat
    this.messages.push({ text: userMessage, isUser: true });
    
    // Add placeholder for AI response that will be updated via streaming
    const aiMessageIndex = this.messages.length;
    this.messages.push({ text: '', isUser: false });
    
    this.isLoading = true;
    this.aiResponse = '';
    this.loadingMessageIndex = 0;
    this.startLoadingMessageCycle();
    
    try {
      //try to send the message with streaming updates
      await this.sendMessageToApi(userMessage, (response) => {
        this.aiResponse = response;
        // Update the AI message in real-time as stream comes in
        this.messages[aiMessageIndex].text = response;
      });
      
      // Emit the final response to update the recipe plan component if it is a final plan
      if (this.aiResponse && this.aiResponse.includes('.com')) {
        this.recipePlanGenerated.emit(this.aiResponse);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`;
      this.messages[aiMessageIndex].text = errorMsg;
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

  //Handles sending the message to the backend using SSE streaming.
  private async sendMessageToApi(query: string, onResponse: (text: string) => void) {
    //if no session, create one.
    if (!this.sessionId) {
      console.log('No session, creating one...');
      this.userId = 'u_' + uuidv4().substring(0, 8);
      this.sessionId = 's_' + uuidv4().substring(0, 8);
      
      // Create session first
      const sessionUrl = `${this.baseUrl}/apps/app/users/${this.userId}/sessions/${this.sessionId}`;
      console.log('Creating session at:', sessionUrl);
      const sessionResponse = await fetch(sessionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!sessionResponse.ok) {
        throw new Error(`Failed to create session: ${sessionResponse.status}`);
      }
      console.log('Session created successfully');
    }

    console.log('Sending message with streaming:', {
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

    //send to the backend using ADK /run_sse endpoint for SSE
    const response = await fetch(`${this.baseUrl}/run_sse`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
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

    // Process SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    if (!reader) {
      throw new Error('No response body reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Stream complete');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          
          if (data === '[DONE]') {
            console.log('Received [DONE] signal');
            continue;
          }

          try {
            const event = JSON.parse(data);
            console.log('Received event:', event);

            // Extract text from event
            if (event.content?.parts) {
              for (const part of event.content.parts) {
                if (part.text) {
                  fullText = part.text;
                  onResponse(fullText);
                }
              }
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', data, e);
          }
        }
      }
    }

    if (!fullText) {
      throw new Error('No text content received from stream');
    }
  }
}
