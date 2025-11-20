import { Routes } from '@angular/router';
import { ChatWindow } from './features/chat-window/chat-window';
import { RecipePlan } from './features/recipe-plan/recipe-plan';

export const routes: Routes = [
    {
        path: '',
        component: ChatWindow
    },
    {
        path: 'chat',
        component: ChatWindow,
        title: 'Chat'
    },
    {
        path: 'recipe',
        component: RecipePlan,
        title: 'Recipe Plan'
    }
];
