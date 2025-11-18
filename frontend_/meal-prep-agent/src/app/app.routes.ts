import { Routes } from '@angular/router';
import { ChatWindow } from './features/chat-window/chat-window';

export const routes: Routes = [
    {
        path: '',
        component: ChatWindow
    },
    {
        path: 'chat',
        component: ChatWindow,
        title: 'Chat'
    }
];
