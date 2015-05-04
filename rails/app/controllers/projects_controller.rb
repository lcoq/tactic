class ProjectsController < ApplicationController
  def index
    projects = projects_params.present? ? filtered_projects : Project.all
    render json: projects
  end

  private

  def projects_params
    params.permit(:name)
  end

  def filtered_projects
    name = projects_params[:name]
    Project.where('name ILIKE ?', "%#{name}%")
  end
end
