import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { GenerationDetailComponent } from './generation-detail.component';
import { ApiService, MetadataItem } from '../../../services/api.service';
import { GenerationProgressComponent } from '../../../components/core/generation-progress/generation-progress.component';
import { VideoResultComponent } from '../../../components/core/video-result/video-result.component';

describe('GenerationDetailComponent', () => {
  let fixture: ComponentFixture<GenerationDetailComponent>;
  let component: GenerationDetailComponent;
  let api: any;
  let router: any;
  let route: any;
  let getMetadataItemCalls: any[] = [];
  let generateVideoCalls: any[] = [];
  let navigateCalls: any[][] = [];

  const mockMetadata: MetadataItem = {
    id: 'meta-1',
    title: 'Test Video',
    description: 'A test description',
    tags: ['tag1', 'tag2'],
    file_name: 'test.mp4',
    category_id: 'cat-1',
    default_language: 'en',
    privacy_status: 'public',
    publish_at: '2025-01-01T00:00:00.000Z',
    self_declared_made_for_kids: false,
    output_video_path: '/output/test.mp4',
    channelId: 'ch-1',
    status: 'generated',
    youtubeVideoId: null,
    youtubeUrl: null,
    thumbnailPath: '/thumb.jpg',
    contentId: 'content-1',
    userId: 'user-1',
    visibility: 'public',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    getMetadataItemCalls = [];
    generateVideoCalls = [];
    navigateCalls = [];

    api = {
      getMetadataItem: (...args: any[]) => {
        getMetadataItemCalls.push(args);
        return of(mockMetadata);
      },
      generateVideo: (...args: any[]) => {
        generateVideoCalls.push(args);
        return of({ videoPath: '/output/new.mp4' });
      },
      toVideoUrl: (_path: string) => 'http://localhost:3000/output/test.mp4',
    };
    router = {
      navigate: (...args: any[]) => {
        navigateCalls.push(args);
      },
    };
    route = {
      snapshot: {
        paramMap: {
          get: () => 'meta-1',
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [GenerationDetailComponent, GenerationProgressComponent, VideoResultComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerationDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading initially', () => {
    expect(component.loading()).toBe(true);
    expect(component.view()).toBe('progress');
  });

  it('should fetch metadata and show result when video path exists', (done: any) => {
    component.ngOnInit();

    setTimeout(() => {
      expect(getMetadataItemCalls).toEqual([['meta-1']]);
      expect(component.loading()).toBe(false);
      expect(component.videoUrl()).toBe('http://localhost:3000/output/test.mp4');
      expect(component.metadata()).toEqual(mockMetadata);
      done();
    }, 600);
  });

  it('should start generation when no output path', (done: any) => {
    api.getMetadataItem = () => of({ ...mockMetadata, output_video_path: '' });

    component.ngOnInit();

    setTimeout(() => {
      expect(generateVideoCalls).toEqual([['meta-1', { channelId: 'ch-1', publishedDate: '2025-01-01T00:00:00.000Z' }]]);
      done();
    }, 100);
  });

  it('should navigate back to content', () => {
    component.goBack();
    expect(navigateCalls.length).toBe(1);
    expect(navigateCalls[0][0]).toEqual(['/content']);
  });

  it('should navigate to dashboard', () => {
    component.goDashboard();
    expect(navigateCalls.length).toBe(1);
    expect(navigateCalls[0][0]).toEqual(['/dashboard']);
  });

  it('should handle missing generation ID', () => {
    route.snapshot.paramMap.get = () => null;
    component.ngOnInit();
    expect(component.error()).toBe('No generation ID provided');
  });
});
