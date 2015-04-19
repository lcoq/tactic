class EntriesController < ApplicationController
  def create
    entry = Entry.new(entry_params)
    entry.save!
    render json: entry
  end

  def update
    entry = Entry.find(params[:id])
    entry.update_attributes!(entry_params)
    render json: entry
  end

  def index
    render json: Entry.all
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
end
