import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipePlan } from './recipe-plan';

describe('RecipePlan', () => {
  let component: RecipePlan;
  let fixture: ComponentFixture<RecipePlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipePlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipePlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
