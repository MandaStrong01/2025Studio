import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Project {
  id: string;
  user_id: string;
  project_name: string;
  description: string;
  timeline_data: any;
  render_status: string;
  output_url: string | null;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

interface MediaFile {
  id: string;
  user_id: string;
  project_id: string | null;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number;
  duration: number;
  metadata: any;
  created_at: string;
}

interface TimelineClip {
  id: string;
  project_id: string;
  media_file_id: string | null;
  track_number: number;
  track_type: string;
  start_time: number;
  end_time: number;
  trim_start: number;
  trim_end: number;
  properties: any;
  created_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  mediaFiles: MediaFile[];
  timelineClips: TimelineClip[];
  movieDuration: number;
  setMovieDuration: (duration: number) => void;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  loadProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  loadProjects: () => Promise<void>;
  loadMediaFiles: () => Promise<void>;
  addMediaFile: (file: Omit<MediaFile, 'id' | 'created_at'>) => Promise<MediaFile | null>;
  addMediaFiles: (files: Omit<MediaFile, 'id' | 'created_at'>[]) => Promise<MediaFile[]>;
  deleteMediaFile: (fileId: string, fileUrl: string) => Promise<void>;
  addTimelineClip: (clip: Omit<TimelineClip, 'id' | 'created_at'>) => Promise<TimelineClip | null>;
  updateTimelineClip: (clipId: string, updates: Partial<TimelineClip>) => Promise<void>;
  deleteTimelineClip: (clipId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [movieDuration, setMovieDuration] = useState(60);

  const loadProjects = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  }, [user]);

  const createProject = async (name: string, description = '') => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        project_name: name,
        description,
        timeline_data: {},
        render_status: 'draft',
        duration_seconds: movieDuration * 60
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setProjects([data, ...projects]);
      setCurrentProject(data);
      return data;
    }

    return null;
  };

  const loadProject = async (projectId: string) => {
    if (!user) return;

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!projectError && projectData) {
      setCurrentProject(projectData);

      const { data: mediaData } = await supabase
        .from('media_files')
        .select('*')
        .eq('project_id', projectId);

      if (mediaData) {
        setMediaFiles(mediaData);
      }

      const { data: clipsData } = await supabase
        .from('timeline_clips')
        .select('*')
        .eq('project_id', projectId)
        .order('track_number', { ascending: true })
        .order('start_time', { ascending: true });

      if (clipsData) {
        setTimelineClips(clipsData);
      }
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!user) return;

    const { error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (!error) {
      if (currentProject?.id === projectId) {
        setCurrentProject({ ...currentProject, ...updates } as Project);
      }
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } as Project : p));
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (!error) {
      setProjects(projects.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    }
  };

  const addMediaFile = async (file: Omit<MediaFile, 'id' | 'created_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('media_files')
      .insert(file)
      .select()
      .maybeSingle();

    if (!error && data) {
      setMediaFiles([...mediaFiles, data]);
      return data;
    }

    return null;
  };

  const addMediaFiles = async (files: Omit<MediaFile, 'id' | 'created_at'>[]) => {
    if (!user || files.length === 0) return [];

    const { data, error } = await supabase
      .from('media_files')
      .insert(files)
      .select();

    if (!error && data) {
      setMediaFiles([...data, ...mediaFiles]);
      return data;
    }

    return [];
  };

  const deleteMediaFile = async (fileId: string, fileUrl: string) => {
    if (!user) return;

    const filePath = fileUrl.split('/').slice(-2).join('/');

    await supabase.storage
      .from('media')
      .remove([filePath]);

    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id);

    if (!error) {
      setMediaFiles(mediaFiles.filter(f => f.id !== fileId));
    }
  };

  const addTimelineClip = async (clip: Omit<TimelineClip, 'id' | 'created_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('timeline_clips')
      .insert(clip)
      .select()
      .maybeSingle();

    if (!error && data) {
      setTimelineClips([...timelineClips, data]);
      return data;
    }

    return null;
  };

  const updateTimelineClip = async (clipId: string, updates: Partial<TimelineClip>) => {
    if (!user) return;

    const { error } = await supabase
      .from('timeline_clips')
      .update(updates)
      .eq('id', clipId);

    if (!error) {
      setTimelineClips(timelineClips.map(c => c.id === clipId ? { ...c, ...updates } as TimelineClip : c));
    }
  };

  const deleteTimelineClip = async (clipId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('timeline_clips')
      .delete()
      .eq('id', clipId);

    if (!error) {
      setTimelineClips(timelineClips.filter(c => c.id !== clipId));
    }
  };

  const loadMediaFiles = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setMediaFiles(data);
    }
  }, [user]);

  useEffect(() => {
    const initializeUserData = async () => {
      if (user) {
        await loadProjects();
        await loadMediaFiles();

        const { data: existingProjects } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (!existingProjects || existingProjects.length === 0) {
          const newProject = await createProject('My Movie', 'Default movie');
          if (newProject) {
            setCurrentProject(newProject);
          }
        } else {
          setCurrentProject(existingProjects[0]);
        }
      } else {
        setProjects([]);
        setMediaFiles([]);
        setTimelineClips([]);
        setCurrentProject(null);
      }
    };

    initializeUserData();
  }, [user]);

  const contextValue = useMemo(() => ({
    currentProject,
    projects,
    mediaFiles,
    timelineClips,
    movieDuration,
    setMovieDuration,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    loadProjects,
    loadMediaFiles,
    addMediaFile,
    addMediaFiles,
    deleteMediaFile,
    addTimelineClip,
    updateTimelineClip,
    deleteTimelineClip
  }), [
    currentProject,
    projects,
    mediaFiles,
    timelineClips,
    movieDuration,
    loadProjects,
    loadMediaFiles
  ]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
