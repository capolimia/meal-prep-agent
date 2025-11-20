import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { FluidModule } from 'primeng/fluid';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ChatWindow } from "./features/chat-window/chat-window";
import { RecipePlan } from "./features/recipe-plan/recipe-plan";
import { SplitterModule } from 'primeng/splitter';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    ButtonModule,
    InputTextModule,
    ToolbarModule,
    FluidModule,
    ChatWindow,
    RecipePlan,
    SplitterModule
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('meal-prep-agent');
}
