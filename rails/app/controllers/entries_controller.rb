class EntriesController < ApplicationController
  def create
    entry = Entry.new(entry_params)
    entry.save!
    render json: { entry: serialize_entry(entry) }
  end

  def update
    entry = Entry.find(params[:id])
    entry.update_attributes!(entry_params)
    render json: { entry: serialize_entry(entry) }
  end

  def index
    entries = Entry.all
    projects = entries_projects(entries)

    render json: {
      entries: serialize_entries(entries),
      projects: serialize_projects(projects)
    }.to_json
  end

  def destroy
    entry = Entry.find(params[:id])
    entry.destroy
    render nothing: true
  end

  private

  def entry_params
    params.require(:entry).permit(:title, :started_at, :finished_at, :project_id)
  end

  def entries_projects(entries)
    entries.each_with_object(Set.new) do |entry, set|
      set << entry.project if entry.project
    end
  end

  def serialize_entries(entries)
    entries.map { |entry| serialize_entry(entry) }
  end

  def serialize_entry(entry)
    {
      id: entry.id,
      title: entry.title,
      startedAt: entry.started_at,
      finishedAt: entry.finished_at,
      project: entry.project_id
    }
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
