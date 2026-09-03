import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { Title, Meta } from '@angular/platform-browser';

const TITLE = 'TreeNote | Graph your ideas!';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal(TITLE);

  constructor(
    private authService: AuthService,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit() {
    this.authService.initializeAuth();

    // Set Title
    this.titleService.setTitle(TITLE);

    // Set Meta Tags
    this.metaService.updateTag({
      name: 'description',
      content: 'This is the best graphical concept map app made in angular'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'angular, seo, meta tags, web development, treenote, graph, graphic, concept map, ideas, workspace, canvas, topic, render'
    });

    // Open Graph Tags (for social media)
    this.metaService.updateTag({
      property: 'og:title',
      content: TITLE
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Learn Angular best practices'
    });

    this.metaService.updateTag({
      property: 'og:image',
      content: 'https://example.com/og-image.jpg'
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://treenote-1.onrender.com'
    });
  }
}
