import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrincipalComponent } from './principal';  // Assumindo que isso importa o componente corretamente
describe('Principal', () => {
  let component: PrincipalComponent;
  let fixture: ComponentFixture<PrincipalComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrincipalComponent]  // Mudei de 'imports' para 'declarations' aqui!
    })
    .compileComponents();  // Opcional: remova se for Angular 15+ e standalone, ou se der erro
    fixture = TestBed.createComponent(PrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 