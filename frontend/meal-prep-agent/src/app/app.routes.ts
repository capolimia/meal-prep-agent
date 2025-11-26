import { Routes } from '@angular/router';
import { MainView } from './features/main-view/main-view';
import { RecipePlanTest } from './features/recipe-plan/recipe-plan-test';

export const routes: Routes = [
    {
        path: '',
        component: MainView,
        title: 'Meal Prep Agent'
    },
    {
        path: 'test',
        component: RecipePlanTest,
        title: 'Recipe Plan Test'
    }
];
