import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pesquisa } from './pesquisa';

describe('Pesquisa', () => {
  let component: Pesquisa;
  let fixture: ComponentFixture<Pesquisa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pesquisa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pesquisa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
