class EntriesController < ApplicationController

  def index
    render json: Entry.all
  end

end
