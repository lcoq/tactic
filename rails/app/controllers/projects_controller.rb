class ProjectsController < ApplicationController
  def index
    projects = projects_by_name(params[:name])
    render json: { projects: serialize_projects(projects) }
  end

  private

  def projects_by_name(name)
    Project.where('name ILIKE ?', "%#{name}%")
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
