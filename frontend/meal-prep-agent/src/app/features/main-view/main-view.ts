import { Component, signal } from '@angular/core';
import { ChatWindow } from "../chat-window/chat-window";
import { RecipePlan } from "../recipe-plan/recipe-plan";
import { SplitterModule } from 'primeng/splitter';

//Component that holds the main view for the app.
@Component({
  selector: 'app-main-view',
  imports: [ChatWindow, RecipePlan, SplitterModule],
  template: `
    <p-splitter [style]="{ height: '100vh' }">
      <ng-template #panel>
        <div class="items-center justify-center h-full">
          <app-chat-window (recipePlanGenerated)="onRecipePlanUpdate($event)"></app-chat-window>
        </div>
      </ng-template>
      <ng-template #panel>
        <div class="items-center justify-center h-full">
          <app-recipe-plan [markdownContent]="recipePlanContent()"></app-recipe-plan>
        </div>
      </ng-template>
    </p-splitter>
  `
})
export class MainView {
  recipePlanContent = signal('');

  //checks for a recipe plan event emitted from the chat component.
  onRecipePlanUpdate(content: string) {
    this.recipePlanContent.set(content);
  }
}
