import { TestBed } from '@angular/core/testing';
import { AppShell } from './app';

describe('AppShell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppShell);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
