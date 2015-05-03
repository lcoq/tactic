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
    entries = filter_params.present? ? filtered_entries : Entry.all
    render json: entries
  end

  def destroy
    entry = Entry.find(params[:id])
    entry.destroy
    render nothing: true
  end

  private

  def entry_params
    params.require(:entry).permit(:title, :started_at, :finished_at, :user_id, :project_id)
  end

  def filter_params
    params.permit(:user_id, date_range: [])
  end

  def filtered_entries
    filters = filter_params
    scope = Entry
    if filters[:user_id]
      scope = scope.where(user_id: filters[:user_id])
    end
    if filters[:date_range]
      minimum_date = Date.parse(filters[:date_range][0])
      maximum_date = Date.parse(filters[:date_range][1])
      scope = scope.where(started_at: minimum_date.beginning_of_day..maximum_date.end_of_day)
    end
    scope
  end

  def entries_projects(entries)
    entries.each_with_object(Set.new) do |entry, set|
      set << entry.project if entry.project
    end
  end
end
