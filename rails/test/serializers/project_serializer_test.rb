require 'test_helper'

describe ProjectSerializer do
  let(:project) { build(:project) }
  subject { serialize(project) }

  it 'id' do
    project.save!
    subject['project'].wont_be_nil
    subject['project']['id'].must_equal project.id
  end
  it 'name' do
    subject['project']['name'].must_equal project.name
  end

  def serialize(project)
    JSON.parse(ProjectSerializer.new(project).to_json)
  end
end
