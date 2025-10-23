import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaInicial } from './tela-inicial';

describe('TelaInicial', () => {
  let component: TelaInicial;
  let fixture: ComponentFixture<TelaInicial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaInicial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelaInicial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
