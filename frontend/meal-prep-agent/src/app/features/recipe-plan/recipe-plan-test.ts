import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RecipePlan } from './recipe-plan';

@Component({
  selector: 'app-recipe-plan-test',
  imports: [CommonModule, ButtonModule, RecipePlan],
  templateUrl: './recipe-plan-test.html',
  styleUrl: './recipe-plan-test.css',
})
export class RecipePlanTest {
  testMarkdown = '';

  loadSampleData() {
    this.testMarkdown = `# Weekly Meal Plan

Starting from **Wednesday, November 26, 2025**

## Wednesday

### Breakfast
**Avocado Toast with Poached Eggs**
- [Recipe Link](https://www.allrecipes.com/recipe/272508/avocado-toast-with-egg/)
- Prep time: 10 minutes
- Calories: 320

### Lunch
**Mediterranean Quinoa Bowl**
- [Recipe Link](https://www.loveandlemons.com/quinoa-bowl/)
- Prep time: 25 minutes
- Calories: 450

### Dinner
**Grilled Salmon with Roasted Vegetables**
- [Recipe Link](https://www.foodnetwork.com/recipes/food-network-kitchen/grilled-salmon-3362888)
- Prep time: 30 minutes
- Calories: 520

---

## Thursday

### Breakfast
**Greek Yogurt Parfait with Berries**
- [Recipe Link](https://www.eatingwell.com/recipe/252184/greek-yogurt-parfait/)
- Prep time: 5 minutes
- Calories: 280

### Lunch
**Chicken Caesar Salad**
- [Recipe Link](https://www.bonappetit.com/recipe/classic-caesar-salad)
- Prep time: 20 minutes
- Calories: 410

### Dinner
**Vegetarian Stir-Fry with Tofu**
- [Recipe Link](https://minimalistbaker.com/easy-tofu-stir-fry/)
- Prep time: 25 minutes
- Calories: 380

---

## Friday

### Breakfast
**Overnight Oats with Banana**
- [Recipe Link](https://www.thekitchn.com/how-to-make-overnight-oats-233941)
- Prep time: 5 minutes (+ overnight)
- Calories: 310

### Lunch
**Turkey and Avocado Wrap**
- [Recipe Link](https://www.tasteofhome.com/recipes/turkey-avocado-wraps/)
- Prep time: 15 minutes
- Calories: 390

### Dinner
**Spaghetti Carbonara**
- [Recipe Link](https://www.seriouseats.com/pasta-carbonara-sauce-recipe)
- Prep time: 20 minutes
- Calories: 580

---

## Saturday

### Breakfast
**Blueberry Pancakes**
- [Recipe Link](https://www.simplyrecipes.com/recipes/blueberry_pancakes/)
- Prep time: 20 minutes
- Calories: 420

### Lunch
**Caprese Sandwich**
- [Recipe Link](https://www.foodnetwork.com/recipes/giada-de-laurentiis/caprese-panini-recipe-1916689)
- Prep time: 10 minutes
- Calories: 360

### Dinner
**Beef Tacos with Fresh Salsa**
- [Recipe Link](https://www.delish.com/cooking/recipe-ideas/recipes/a58717/best-ground-beef-tacos-recipe/)
- Prep time: 25 minutes
- Calories: 490

---

## Sunday

### Breakfast
**Scrambled Eggs with Spinach**
- [Recipe Link](https://www.bbcgoodfood.com/recipes/scrambled-eggs-spinach)
- Prep time: 10 minutes
- Calories: 250

### Lunch
**Tomato Basil Soup with Grilled Cheese**
- [Recipe Link](https://www.allrecipes.com/recipe/39544/garden-fresh-tomato-soup/)
- Prep time: 30 minutes
- Calories: 480

### Dinner
**Roasted Chicken with Herbs**
- [Recipe Link](https://www.thekitchn.com/how-to-roast-chicken-5089)
- Prep time: 1 hour 15 minutes
- Calories: 550

---

## Monday

### Breakfast
**Smoothie Bowl with Granola**
- [Recipe Link](https://minimalistbaker.com/5-ingredient-acai-bowl/)
- Prep time: 10 minutes
- Calories: 340

### Lunch
**Asian Noodle Salad**
- [Recipe Link](https://www.bonappetit.com/recipe/cold-sesame-noodles)
- Prep time: 20 minutes
- Calories: 420

### Dinner
**Baked Cod with Lemon Butter**
- [Recipe Link](https://www.delish.com/cooking/recipe-ideas/a25638151/baked-cod-recipe/)
- Prep time: 25 minutes
- Calories: 380

---

## Tuesday

### Breakfast
**Breakfast Burrito**
- [Recipe Link](https://www.allrecipes.com/recipe/70935/easy-breakfast-burritos/)
- Prep time: 15 minutes
- Calories: 450

### Lunch
**Lentil Soup**
- [Recipe Link](https://www.loveandlemons.com/lentil-soup/)
- Prep time: 35 minutes
- Calories: 320

### Dinner
**Margherita Pizza**
- [Recipe Link](https://www.seriouseats.com/neapolitan-pizza-dough-recipe)
- Prep time: 45 minutes
- Calories: 620

---

## Shopping List

### Proteins
- Eggs (2 dozen)
- Salmon fillets (2)
- Chicken breast (3 lbs)
- Tofu (1 block)
- Turkey slices (1 lb)
- Ground beef (1 lb)
- Whole chicken (1)
- Cod fillets (2)

### Vegetables & Fruits
- Avocados (4)
- Spinach (2 bunches)
- Mixed berries (2 cups)
- Bananas (6)
- Tomatoes (8)
- Bell peppers (4)
- Onions (3)
- Garlic (2 bulbs)
- Lemons (4)

### Pantry
- Quinoa (2 cups)
- Pasta (2 boxes)
- Rice noodles (1 package)
- Bread (2 loaves)
- Tortillas (1 package)
- Pizza dough (1 lb)

> **Note:** This meal plan provides approximately 1,200-1,500 calories per day. Adjust portions based on your dietary needs.

*Enjoy your week of delicious, balanced meals!*
`;
  }

  clearData() {
    this.testMarkdown = '';
  }
}
