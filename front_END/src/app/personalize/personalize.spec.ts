import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalizeComponent } from './personalize';

describe('Personalize', () => {
  let component: PersonalizeComponent;
  let fixture: ComponentFixture<PersonalizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
