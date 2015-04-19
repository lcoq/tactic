class ProjectsController < ApplicationController
  def index
    render json: projects_by_name(params[:name])
  end

  private

  def projects_by_name(name)
    Project.where('name ILIKE ?', "%#{name}%")
  end
end
