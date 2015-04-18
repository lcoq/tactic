class EntriesController < ApplicationController

  def index
    serialized_entries = Entry.all.map do |entry|
      {
        id: entry.id,
        title: entry.title,
        startedAt: entry.started_at,
        finishedAt: entry.finished_at,
        project: nil
      }
    end
    render json: { entries: serialized_entries }.to_json
  end

end
