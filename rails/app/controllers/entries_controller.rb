class EntriesController < ApplicationController

  def index
    entries = Entry.all
    projects = entries_projects(entries)

    render json: {
      entries: serialize_entries(entries),
      projects: serialize_projects(projects)
    }.to_json
  end

  private

  def entries_projects(entries)
    entries.each_with_object(Set.new) do |entry, set|
      set << entry.project if entry.project
    end
  end

  def serialize_entries(entries)
    entries.map do |entry|
      {
        id: entry.id,
        title: entry.title,
        startedAt: entry.started_at,
        finishedAt: entry.finished_at,
        project: entry.project_id
      }
    end
  end

  def serialize_projects(projects)
    projects.map do |project|
      {
        id: project.id,
        name: project.name
      }
    end
  end
end
